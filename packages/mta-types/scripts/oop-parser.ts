import ts from 'typescript';

import type { ApiEnvironment } from '#mta-types/api-declaration';
import { fn, named, type TypeDescriptor } from '#mta-types/type-descriptor';

import { type MapContext, mapTypeNode } from './type-mapper.ts';
import type { UpstreamFile } from './upstream-source.ts';

export interface ParsedOopMethod {
    name: string;
    procedural: string;
    type: TypeDescriptor;
    environment: ApiEnvironment;
}

export interface ParsedOopProperty {
    name: string;
    environment: ApiEnvironment;
}

export interface ParsedOopConstructor {
    type: TypeDescriptor;
    environment: ApiEnvironment;
    procedural: string | null;
}

export interface ParsedOopClass {
    name: string;
    methods: ParsedOopMethod[];
    staticMethods: ParsedOopMethod[];
    constructors: ParsedOopConstructor[];
    properties: ParsedOopProperty[];
}

const WIKI_LINK = /@see\s+https?:\/\/\S*\/wiki\/([A-Za-z0-9_]+)/;

function isStatic(member: ts.ClassElement): boolean {
    return (ts.getCombinedModifierFlags(member) & ts.ModifierFlags.Static) !== 0;
}

function proceduralOf(contents: string, member: ts.ClassElement): string | null {
    for (const range of ts.getLeadingCommentRanges(contents, member.pos) ?? []) {
        const matched = WIKI_LINK.exec(contents.slice(range.pos, range.end));

        if (matched?.[1] !== undefined) {
            return matched[1][0]?.toLowerCase() + matched[1].slice(1);
        }
    }

    return null;
}

function contextFor(context: MapContext, node: ts.MethodDeclaration): MapContext {
    const names = (node.typeParameters ?? []).map((parameter) => parameter.name.text);

    if (names.length === 0) {
        return context;
    }

    return { ...context, typeParameters: new Set([...context.typeParameters, ...names]) };
}

function signatureOf(node: ts.MethodDeclaration | ts.ConstructorDeclaration, context: MapContext, returnType?: TypeDescriptor): TypeDescriptor {
    const local = ts.isMethodDeclaration(node) ? contextFor(context, node) : context;
    const positional = node.parameters.filter((parameter) => parameter.dotDotDotToken === undefined);
    const isVariadic = node.parameters.length !== positional.length;
    const parameters = positional.map((parameter) => mapTypeNode(parameter.type, local));
    const minimumArguments = positional.filter((parameter) => parameter.questionToken === undefined).length;

    return fn(parameters, returnType ?? mapTypeNode(node.type, local), minimumArguments, isVariadic);
}

function readMembers(declaration: ts.ClassDeclaration, contents: string, context: MapContext, environment: ApiEnvironment): ParsedOopClass {
    const methods: ParsedOopMethod[] = [];
    const staticMethods: ParsedOopMethod[] = [];
    const constructors: ParsedOopConstructor[] = [];
    const properties: ParsedOopProperty[] = [];

    for (const member of declaration.members) {
        if (ts.isConstructorDeclaration(member)) {
            const own = declaration.name?.text ?? '';

            const type = signatureOf(member, context, named(context.aliases[own] ?? own));

            constructors.push({ type, environment, procedural: proceduralOf(contents, member) });

            continue;
        }

        if (member.name === undefined || !ts.isIdentifier(member.name)) {
            continue;
        }

        if (ts.isPropertyDeclaration(member)) {
            if (!isStatic(member)) {
                properties.push({ name: member.name.text, environment });
            }

            continue;
        }

        if (!ts.isMethodDeclaration(member)) {
            continue;
        }

        const procedural = proceduralOf(contents, member);

        if (procedural !== null) {
            const parsed = { name: member.name.text, procedural, type: signatureOf(member, context), environment };

            if (!isStatic(member)) {
                methods.push(parsed);
            } else {
                staticMethods.push(parsed);
            }
        }
    }

    return { name: declaration.name?.text ?? '', methods, staticMethods, constructors, properties };
}

export function parseOopClasses(file: UpstreamFile, context: MapContext, environment: ApiEnvironment): ParsedOopClass[] {
    const source = ts.createSourceFile(file.path, file.contents, ts.ScriptTarget.ES2022, false, ts.ScriptKind.TS);
    const classes: ParsedOopClass[] = [];

    for (const statement of source.statements) {
        if (ts.isClassDeclaration(statement) && statement.name !== undefined) {
            classes.push(readMembers(statement, file.contents, context, environment));
        }
    }

    return classes;
}
