import { mtaMember } from '@compiler/checker/oop-classes';
import { KNOWN_DECORATORS } from '@compiler/checker/decorators';
import { isMtaElementName } from '@compiler/checker/oop-members';
import { typeToString } from '@compiler/checker/types';
import type { ClassDeclaration, ClassFieldDeclaration, Decorator } from '@compiler/parser/declaration-nodes';
import { findDeclaration } from '@mta-types/catalog';
import { memberDocumentation } from '@mta-types/documentation-lookup';
import { findLibraryMember, isLibrary, type LibraryName } from '@mta-types/library-members';
import type { Hover } from 'vscode-languageserver';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { descriptorText, namedDescriptorText } from '@lsp/features/api-text';
import { apiMarkdown, memberMarkdown } from '@lsp/features/documentation-text';
import { toWordRange } from '@lsp/support/lsp-position';
import { isIdentifierChar, wordAt } from '@lsp/support/source-text';
import type { SymbolDeclaration } from '@lsp/symbols/symbol';
import { annotationText } from '@lsp/symbols/signature-text';

function markdown(value: string): string {
    return ['```luam', value, '```'].join('\n');
}

function declarationText(declaration: SymbolDeclaration): string {
    if (declaration.detail.length > 0) {
        return declaration.detail;
    }

    return declaration.type === null ? declaration.name : `${declaration.name}: ${typeToString(declaration.type)}`;
}

function projectHover(analysis: DocumentAnalysis, name: string): Hover | null {
    const target = analysis.project.globals.find((global) => global.name === name);

    if (target === undefined) {
        return null;
    }

    const origin = target.type.kind === 'record' && target.type.origin !== null ? `"${target.type.origin}"` : 'the project';
    const scope = `declared in ${origin} (${target.environment})`;

    return { contents: { kind: 'markdown', value: `${markdown(descriptorText(name, target.type))}\n\n${scope}` } };
}

function recordMemberHover(analysis: DocumentAnalysis, name: string): Hover | null {
    for (const [expression, type] of analysis.types) {
        if (expression.kind !== 'member-expression' || expression.property !== name) {
            continue;
        }

        const owner = analysis.types.get(expression.object);

        if (owner !== undefined && owner.kind === 'record') {
            const signature = `${owner.name}.${name}: ${typeToString(type)}`;
            const value = memberMarkdown(owner.name, name, signature, '') ?? markdown(signature);

            return { contents: { kind: 'markdown', value } };
        }
    }

    return null;
}

function libraryReceiver(text: string, offset: number): LibraryName | null {
    let start = offset;

    while (start > 0 && isIdentifierChar(text[start - 1])) {
        start -= 1;
    }

    if (text[start - 1] !== '.') {
        return null;
    }

    let ownerStart = start - 1;

    while (ownerStart > 0 && isIdentifierChar(text[ownerStart - 1])) {
        ownerStart -= 1;
    }

    const owner = text.slice(ownerStart, start - 1);

    return isLibrary(owner) ? owner : null;
}

function libraryMemberHover(analysis: DocumentAnalysis, name: string, offset: number): Hover | null {
    const library = libraryReceiver(analysis.text, offset);

    if (library === null) {
        return null;
    }

    const descriptor = findLibraryMember(library, name);

    if (descriptor === null) {
        return null;
    }

    const signature = namedDescriptorText(`${library}.${name}`, descriptor, memberDocumentation(library, name));
    const value = memberMarkdown(library, name, signature, 'lua api (shared)') ?? markdown(signature);

    return { contents: { kind: 'markdown', value } };
}

function mtaReceiver(analysis: DocumentAnalysis, name: string): string | null {
    for (const [expression] of analysis.types) {
        const owner =
            expression.kind === 'member-expression' && expression.property === name
                ? analysis.types.get(expression.object)
                : expression.kind === 'call-expression' && expression.method === name
                  ? analysis.types.get(expression.callee)
                  : undefined;

        if (owner?.kind === 'named' && isMtaElementName(analysis.declarations, owner.name)) {
            return owner.name;
        }
    }

    return null;
}

function mtaMemberHover(analysis: DocumentAnalysis, name: string): Hover | null {
    const receiver = analysis.oop ? mtaReceiver(analysis, name) : null;
    const member = receiver === null ? null : mtaMember(receiver, name);

    if (receiver === null || member === null) {
        return null;
    }

    const signature = `${receiver}.${name}: ${typeToString(member.type)}`;
    const note = `wraps \`${member.procedural ?? ''}\` (${member.environment ?? ''})`;

    return { contents: { kind: 'markdown', value: `${markdown(signature)}\n\n${note}` } };
}

function apiHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    const name = wordAt(analysis.text, offset);

    if (name === null) {
        return null;
    }

    const library = libraryMemberHover(analysis, name, offset);

    if (library !== null) {
        return library;
    }

    const declaration = findDeclaration(name);

    if (declaration === null) {
        return mtaMemberHover(analysis, name) ?? projectHover(analysis, name) ?? recordMemberHover(analysis, name);
    }

    return { contents: { kind: 'markdown', value: apiMarkdown(declaration) } };
}

function exportNote(analysis: DocumentAnalysis, declaration: SymbolDeclaration): string {
    if (declaration.kind !== 'function' || !analysis.directives.exports.some((entry) => entry.name === declaration.name)) {
        return '';
    }

    const sides = analysis.environment === 'shared' ? 'server and client' : analysis.environment;

    return `\n\nexported to other resources (${sides})`;
}

function containsDecorator(decorator: Decorator, offset: number): boolean {
    return offset >= decorator.position.offset && offset <= decorator.position.offset + decorator.name.length + 1;
}

function decoratedField(statement: ClassDeclaration, offset: number): { decorator: Decorator; field: ClassFieldDeclaration } | null {
    for (const member of statement.members) {
        if (member.kind !== 'class-field') {
            continue;
        }

        const decorator = member.decorators.find((candidate) => containsDecorator(candidate, offset));

        if (decorator !== undefined) {
            return { decorator, field: member };
        }
    }

    return null;
}

function decoratorHover(analysis: DocumentAnalysis, offset: number): Hover | null {
    for (const statement of analysis.program.body) {
        if (statement.kind !== 'class-declaration') {
            continue;
        }

        const classDecorator = statement.decorators.find((decorator) => containsDecorator(decorator, offset));

        if (classDecorator !== undefined) {
            const definition = KNOWN_DECORATORS.get(classDecorator.name);

            return definition === undefined ? null : { contents: { kind: 'markdown', value: definition.documentation } };
        }

        const target = decoratedField(statement, offset);

        if (target === null) {
            continue;
        }

        const generated = (analysis.generatedMembers.get(statement) ?? []).find((member) => {
            const expectedParameters = target.decorator.name === 'Getter' ? 0 : 1;

            return member.position.offset === target.field.position.offset && member.parameters.length === expectedParameters;
        });

        if (generated === undefined) {
            return null;
        }

        const registered = analysis.declarations.lookupMember(statement.name, generated.name);
        const inferred = registered?.type.kind === 'function' ? registered.type.returnType : { kind: 'any' as const };
        const returnType = generated.returnAnnotation === null ? typeToString(inferred) : annotationText(generated.returnAnnotation);
        const parameters = generated.parameters.map((parameter) => `${parameter.name}: ${annotationText(parameter.annotation)}`).join(', ');
        const signature = `${generated.name}(${parameters}): ${returnType}`;
        const position = { ...target.decorator.position, column: target.decorator.position.column + 1, offset: target.decorator.position.offset + 1 };

        return { contents: { kind: 'markdown', value: `Generates \`${signature}\`.` }, range: toWordRange(position, target.decorator.name) };
    }

    return null;
}

export function hoverAt(analysis: DocumentAnalysis, offset: number): Hover | null {
    const decorator = decoratorHover(analysis, offset);

    if (decorator !== null) {
        return decorator;
    }

    const declaration = analysis.index.declarationFor(offset);

    if (declaration === null) {
        return apiHover(analysis, offset);
    }

    const anchor = analysis.index.findReferenceAt(offset) ?? declaration;

    return {
        contents: { kind: 'markdown', value: `${markdown(declarationText(declaration))}${exportNote(analysis, declaration)}` },
        range: toWordRange(anchor.position, anchor.name),
    };
}
