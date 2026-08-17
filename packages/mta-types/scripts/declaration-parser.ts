import ts from 'typescript';

import { fn, type TypeDescriptor } from '#mta-types/type-descriptor';

import { functionDocumentation, variableDocumentation } from './documentation-parser.ts';
import { GeneratorError, type ParsedDeclaration } from './generator-model.ts';
import { type MapContext, mapTypeNode, type TypeAliasDefinition } from './type-mapper.ts';
import type { UpstreamFile } from './upstream-source.ts';

export interface ParsedClass {
    name: string;
    parent: string | null;
}

function sourceFileOf(file: UpstreamFile): ts.SourceFile {
    return ts.createSourceFile(file.path, file.contents, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS);
}

function contextFor(context: MapContext, node: ts.FunctionDeclaration): MapContext {
    if (node.typeParameters === undefined || node.typeParameters.length === 0) {
        return context;
    }

    const typeParameters = new Set(context.typeParameters);
    const typeArguments = new Map(context.typeArguments);

    for (const parameter of node.typeParameters) {
        typeParameters.add(parameter.name.text);
        typeArguments.set(parameter.name.text, mapTypeNode(parameter.constraint ?? parameter.default, { ...context, typeParameters, typeArguments }));
    }

    return { ...context, typeParameters, typeArguments };
}

function signatureOf(node: ts.FunctionDeclaration, context: MapContext): TypeDescriptor {
    const local = contextFor(context, node);
    const positional = node.parameters.filter((parameter) => parameter.dotDotDotToken === undefined);
    const isVariadic = node.parameters.length !== positional.length;
    const parameters = positional.map((parameter) => mapTypeNode(parameter.type, local));
    const minimumArguments = positional.filter((parameter) => parameter.questionToken === undefined).length;

    return fn(parameters, mapTypeNode(node.type, local), minimumArguments, isVariadic);
}

function isMultiReturn(node: ts.FunctionDeclaration): boolean {
    if (node.type === undefined || !ts.isTypeReferenceNode(node.type) || !ts.isIdentifier(node.type.typeName)) {
        return false;
    }

    return node.type.typeName.text === 'LuaMultiReturn';
}

export function parseFunctions(file: UpstreamFile, context: MapContext, multiReturns: Set<string>): ParsedDeclaration[] {
    const declarations: ParsedDeclaration[] = [];
    const source = sourceFileOf(file);

    for (const statement of source.statements) {
        if (!ts.isFunctionDeclaration(statement)) {
            continue;
        }

        if (statement.name === undefined) {
            throw new GeneratorError(file.path, 'an exported function declaration carries no name');
        }

        if (isMultiReturn(statement)) {
            multiReturns.add(statement.name.text);
        }

        declarations.push({
            name: statement.name.text,
            category: file.category,
            type: signatureOf(statement, context),
            documentation: functionDocumentation(source, statement),
        });
    }

    return declarations;
}

export function parseTypeAliases(files: readonly UpstreamFile[]): ReadonlyMap<string, TypeAliasDefinition> {
    const aliases = new Map<string, TypeAliasDefinition>();

    for (const file of files) {
        for (const statement of sourceFileOf(file).statements) {
            if (!ts.isTypeAliasDeclaration(statement)) {
                continue;
            }

            aliases.set(statement.name.text, { typeParameters: statement.typeParameters ?? [], type: statement.type });
        }
    }

    return aliases;
}

export function parseVariables(file: UpstreamFile, context: MapContext): ParsedDeclaration[] {
    const declarations: ParsedDeclaration[] = [];
    const source = sourceFileOf(file);

    for (const statement of source.statements) {
        if (!ts.isVariableStatement(statement)) {
            continue;
        }

        for (const declaration of statement.declarationList.declarations) {
            if (!ts.isIdentifier(declaration.name)) {
                throw new GeneratorError(file.path, 'a variable declaration uses a binding pattern instead of a name');
            }

            declarations.push({
                name: declaration.name.text,
                category: file.category,
                type: mapTypeNode(declaration.type, context),
                documentation: variableDocumentation(source, statement),
            });
        }
    }

    return declarations;
}

export function parseClasses(file: UpstreamFile): ParsedClass[] {
    const classes: ParsedClass[] = [];

    for (const statement of sourceFileOf(file).statements) {
        if (!ts.isClassDeclaration(statement) || statement.name === undefined) {
            continue;
        }

        const heritage = statement.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword);
        const expression = heritage?.types[0]?.expression;
        const parent = expression !== undefined && ts.isIdentifier(expression) ? expression.text : null;

        classes.push({ name: statement.name.text, parent });
    }

    return classes;
}
