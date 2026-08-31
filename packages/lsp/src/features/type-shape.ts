import { createUnion, typeToString, type RecordType, type Type, type UnionType } from '@compiler/checker/types';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';

export function aliasType(analysis: DocumentAnalysis, name: string): Type | null {
    if (analysis.declarations.lookupClass(name) !== null || analysis.declarations.lookupInterface(name) !== null) {
        return null;
    }

    const resolved = analysis.aliases.get(name);

    if (resolved !== undefined) {
        return resolved;
    }

    return analysis.index.declarations.find((declaration) => declaration.kind === 'type-alias' && declaration.name === name)?.type ?? null;
}

function namedMembers(analysis: DocumentAnalysis, name: string): ReadonlyMap<string, Type> | null {
    if (analysis.declarations.lookupClass(name) === null && analysis.declarations.lookupInterface(name) === null) {
        return null;
    }

    return new Map(analysis.declarations.collectMembers(name).map((member) => [member.name, member.type]));
}

export function shapeMembers(analysis: DocumentAnalysis, type: Type, seen: Set<string> = new Set()): ReadonlyMap<string, Type> | null {
    if (type.kind === 'record') {
        return type.members;
    }

    if (type.kind === 'union') {
        return sharedRecord(analysis, type)?.members ?? null;
    }

    if (type.kind !== 'named' || seen.has(type.name)) {
        return null;
    }

    seen.add(type.name);

    const named = namedMembers(analysis, type.name);

    if (named !== null) {
        return named;
    }

    const alias = aliasType(analysis, type.name);

    return alias === null ? null : shapeMembers(analysis, alias, seen);
}

function resolveNamed(analysis: DocumentAnalysis, type: Type, seen: Set<string> = new Set()): Type {
    if (type.kind !== 'named' || seen.has(type.name)) {
        return type;
    }

    seen.add(type.name);

    const alias = aliasType(analysis, type.name);

    return alias === null ? type : resolveNamed(analysis, alias, seen);
}

function optionShapes(analysis: DocumentAnalysis, type: Type): ReadonlyMap<string, Type>[] | null {
    const target = resolveNamed(analysis, type);
    const options = target.kind === 'union' ? target.options : [target];
    const shapes: ReadonlyMap<string, Type>[] = [];

    for (const option of options) {
        const members = shapeMembers(analysis, option);

        if (members === null) {
            return null;
        }

        shapes.push(members);
    }

    return shapes;
}

function matchesWritten(shape: ReadonlyMap<string, Type>, written: ReadonlyMap<string, string | null>): boolean {
    for (const [key, value] of written) {
        const member = shape.get(key);

        if (member === undefined) {
            return false;
        }

        if (value !== null && member.kind === 'string-literal' && member.value !== value) {
            return false;
        }
    }

    return true;
}

export function constructionMembers(analysis: DocumentAnalysis, type: Type, written: ReadonlyMap<string, string | null>): ReadonlyMap<string, Type> | null {
    const shapes = optionShapes(analysis, type);

    if (shapes === null) {
        return null;
    }

    const matching = shapes.filter((shape) => matchesWritten(shape, written));
    const chosen = matching.length === 0 ? shapes : matching;
    const collected = new Map<string, Type[]>();

    for (const shape of chosen) {
        for (const [name, member] of shape) {
            collected.set(name, [...(collected.get(name) ?? []), member]);
        }
    }

    const members = new Map<string, Type>([...collected].map(([name, types]) => [name, createUnion(types)]));

    return members.size === 0 ? null : members;
}

export function sharedRecord(analysis: DocumentAnalysis, type: UnionType): RecordType | null {
    const collected: ReadonlyMap<string, Type>[] = [];

    for (const option of type.options) {
        const members = shapeMembers(analysis, option);

        if (members === null) {
            return null;
        }

        collected.push(members);
    }

    const [first, ...rest] = collected;

    if (first === undefined) {
        return null;
    }

    const members = new Map<string, Type>();

    for (const [name, member] of first) {
        const others = rest.flatMap((entry) => {
            const other = entry.get(name);

            return other === undefined ? [] : [other];
        });

        if (others.length === rest.length) {
            members.set(name, createUnion([member, ...others]));
        }
    }

    return members.size === 0 ? null : { kind: 'record', name: typeToString(type), origin: null, members };
}
