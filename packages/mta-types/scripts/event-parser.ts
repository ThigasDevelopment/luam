import ts from 'typescript';

import { GeneratorError, type ParsedEventHandler } from './generator-model.ts';
import { type MapContext, mapTypeNode } from './type-mapper.ts';
import type { UpstreamFile } from './upstream-source.ts';

function sourceFileOf(file: UpstreamFile): ts.SourceFile {
    return ts.createSourceFile(file.path, file.contents, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS);
}

function propertyOf(node: ts.InterfaceDeclaration, name: string): ts.PropertySignature | undefined {
    return node.members.find((member): member is ts.PropertySignature => {
        return ts.isPropertySignature(member) && ts.isIdentifier(member.name) && member.name.text === name;
    });
}

function eventKey(node: ts.TypeNode | undefined, file: UpstreamFile): string {
    if (
        node === undefined
        || !ts.isTypeReferenceNode(node)
        || !ts.isQualifiedName(node.typeName)
        || !ts.isIdentifier(node.typeName.left)
        || node.typeName.left.text !== 'EventNames'
    ) {
        throw new GeneratorError(file.path, 'an event interface carries no EventNames member type');
    }

    return node.typeName.right.text;
}

function extendsGenericEventHandler(node: ts.InterfaceDeclaration): boolean {
    return node.heritageClauses?.some((clause) => {
        return clause.token === ts.SyntaxKind.ExtendsKeyword
            && clause.types.some((type) => ts.isIdentifier(type.expression) && type.expression.text === 'GenericEventHandler');
    }) ?? false;
}

function parseEventNames(files: readonly UpstreamFile[]): Map<string, string> {
    const names = new Map<string, string>();
    const runtimeNames = new Set<string>();

    for (const file of files) {
        for (const statement of sourceFileOf(file).statements) {
            if (!ts.isEnumDeclaration(statement) || statement.name.text !== 'EventNames') {
                continue;
            }

            for (const member of statement.members) {
                if (!ts.isIdentifier(member.name) || member.initializer === undefined || !ts.isStringLiteral(member.initializer)) {
                    throw new GeneratorError(file.path, 'an event member carries no string value');
                }

                if (names.has(member.name.text) || runtimeNames.has(member.initializer.text)) {
                    throw new GeneratorError(file.path, `event "${member.initializer.text}" is declared more than once`);
                }

                names.set(member.name.text, member.initializer.text);
                runtimeNames.add(member.initializer.text);
            }
        }
    }

    if (names.size === 0) {
        throw new GeneratorError(files[0]?.path ?? 'events', 'the event catalog declares no events');
    }

    return names;
}

export function parseEvents(files: readonly UpstreamFile[], context: MapContext): ParsedEventHandler[] {
    const names = parseEventNames(files);
    const handlers = new Map<string, ParsedEventHandler>();

    for (const file of files) {
        for (const statement of sourceFileOf(file).statements) {
            if (!ts.isInterfaceDeclaration(statement) || !extendsGenericEventHandler(statement)) {
                continue;
            }

            const key = eventKey(propertyOf(statement, 'name')?.type, file);
            const name = names.get(key);
            const functionType = propertyOf(statement, 'function')?.type;

            if (name === undefined) {
                throw new GeneratorError(file.path, `event interface "${statement.name.text}" references unknown EventNames.${key}`);
            }

            if (functionType === undefined || !ts.isFunctionTypeNode(functionType)) {
                throw new GeneratorError(file.path, `event interface "${statement.name.text}" carries no function type`);
            }

            const type = mapTypeNode(functionType, context);

            if (type.kind !== 'function') {
                throw new GeneratorError(file.path, `event interface "${statement.name.text}" did not map to a function`);
            }

            if (handlers.has(key)) {
                throw new GeneratorError(file.path, `event interface for EventNames.${key} is declared more than once`);
            }

            handlers.set(key, { name, type });
        }
    }

    const missing = [...names.keys()].filter((key) => !handlers.has(key));

    if (missing.length > 0) {
        throw new GeneratorError('events', `event names carry no interface: ${missing.join(', ')}`);
    }

    return [...handlers.values()].sort((left, right) => left.name.localeCompare(right.name, 'en'));
}
