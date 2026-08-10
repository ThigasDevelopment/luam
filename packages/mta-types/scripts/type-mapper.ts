import ts from 'typescript';

import { ANY, arrayOf, BOOLEAN, named, NUMBER, STRING, TABLE, tupleOf, type TypeDescriptor, VOID } from '#mta-types/type-descriptor';

export interface MapContext {
    elementTypes: ReadonlySet<string>;
    aliases: Readonly<Record<string, string>>;
    typeParameters: ReadonlySet<string>;
}

const TABLE_REFERENCES: ReadonlySet<string> = new Set(['LuaTable', 'LuaMap', 'LuaSet', 'Table', 'Matrix', 'Vector2', 'Vector3', 'Vector4']);

const KEYWORDS: ReadonlyMap<ts.SyntaxKind, TypeDescriptor> = new Map([
    [ts.SyntaxKind.NumberKeyword, NUMBER],
    [ts.SyntaxKind.StringKeyword, STRING],
    [ts.SyntaxKind.BooleanKeyword, BOOLEAN],
    [ts.SyntaxKind.VoidKeyword, VOID],
    [ts.SyntaxKind.ObjectKeyword, TABLE],
    [ts.SyntaxKind.AnyKeyword, ANY],
    [ts.SyntaxKind.UnknownKeyword, ANY],
    [ts.SyntaxKind.NeverKeyword, ANY],
    [ts.SyntaxKind.UndefinedKeyword, ANY],
    [ts.SyntaxKind.NullKeyword, ANY],
    [ts.SyntaxKind.SymbolKeyword, ANY],
]);

function referenceName(node: ts.TypeReferenceNode): string {
    return ts.isIdentifier(node.typeName) ? node.typeName.text : node.typeName.right.text;
}

function mapLiteral(node: ts.LiteralTypeNode): TypeDescriptor {
    if (ts.isStringLiteral(node.literal)) {
        return STRING;
    }

    if (ts.isNumericLiteral(node.literal)) {
        return NUMBER;
    }

    if (node.literal.kind === ts.SyntaxKind.TrueKeyword || node.literal.kind === ts.SyntaxKind.FalseKeyword) {
        return BOOLEAN;
    }

    return ANY;
}

function mapMultiReturn(node: ts.TypeReferenceNode, context: MapContext): TypeDescriptor {
    const argument = node.typeArguments?.[0];

    if (argument === undefined || !ts.isTupleTypeNode(argument)) {
        return ANY;
    }

    const isFixed = argument.elements.every((element) => !ts.isRestTypeNode(element) && !ts.isOptionalTypeNode(element));

    if (!isFixed || argument.elements.length < 2) {
        return ANY;
    }

    return tupleOf(argument.elements.map((element) => mapTypeNode(element, context)));
}

function mapReference(node: ts.TypeReferenceNode, context: MapContext): TypeDescriptor {
    const name = referenceName(node);
    const resolved = context.aliases[name] ?? name;

    if (name === 'LuaMultiReturn') {
        return mapMultiReturn(node, context);
    }

    if (name === 'Array' || name === 'ReadonlyArray') {
        const argument = node.typeArguments?.[0];

        return argument === undefined ? TABLE : arrayOf(mapTypeNode(argument, context));
    }

    if (TABLE_REFERENCES.has(name)) {
        return TABLE;
    }

    if (context.typeParameters.has(name)) {
        return ANY;
    }

    if (context.elementTypes.has(resolved)) {
        return named(resolved);
    }

    return ANY;
}

function mapUnion(node: ts.UnionTypeNode, context: MapContext): TypeDescriptor {
    const options = node.types.map((option) => mapTypeNode(option, context));
    const unique = new Map(options.map((option) => [JSON.stringify(option), option]));

    if (unique.size !== 1) {
        return ANY;
    }

    return [...unique.values()][0] ?? ANY;
}

export function mapTypeNode(node: ts.TypeNode | undefined, context: MapContext): TypeDescriptor {
    if (node === undefined) {
        return ANY;
    }

    const keyword = KEYWORDS.get(node.kind);

    if (keyword !== undefined) {
        return keyword;
    }

    if (ts.isParenthesizedTypeNode(node)) {
        return mapTypeNode(node.type, context);
    }

    if (ts.isArrayTypeNode(node)) {
        return arrayOf(mapTypeNode(node.elementType, context));
    }

    if (ts.isTupleTypeNode(node) || ts.isTypeLiteralNode(node)) {
        return TABLE;
    }

    if (ts.isLiteralTypeNode(node)) {
        return mapLiteral(node);
    }

    if (ts.isUnionTypeNode(node)) {
        return mapUnion(node, context);
    }

    if (ts.isTypeReferenceNode(node)) {
        return mapReference(node, context);
    }

    return ANY;
}
