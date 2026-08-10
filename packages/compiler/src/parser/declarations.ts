import type { Token } from '@compiler/lexer/token';

import type {
    ClassDeclaration,
    ClassMember,
    ClassMethodDeclaration,
    DeclarationStatement,
    EnumDeclaration,
    EnumMember,
    InterfaceDeclaration,
    InterfaceMember,
} from './declaration-nodes';
import { parseExpression } from './expression';
import { parseParameters } from './function-expression';
import { recoverInBlock } from './recovery';
import { parseBraceBlock } from './statement';
import { ParserError, type TokenStream } from './token-stream';
import { parseOptionalAnnotation, parseTypeAnnotation } from './type-annotation';

const DECLARATION_NAMES: ReadonlySet<string> = new Set(['class', 'interface', 'enum']);

const CLASS_MODIFIERS: ReadonlySet<string> = new Set(['extends', 'implements']);

function isClassHeader(stream: TokenStream): boolean {
    return (
        stream.checkAhead(2, 'punctuation', '{') ||
        stream.checkAhead(2, 'identifier', 'extends') ||
        stream.checkAhead(2, 'identifier', 'implements')
    );
}

export function isDeclarationStart(stream: TokenStream): boolean {
    const token = stream.current();

    if (token.kind !== 'identifier' || !DECLARATION_NAMES.has(token.value) || !stream.checkAhead(1, 'identifier')) {
        return false;
    }

    return token.value === 'class' ? isClassHeader(stream) : stream.checkAhead(2, 'punctuation', '{');
}

function parseClassMethod(stream: TokenStream, token: Token): ClassMethodDeclaration {
    const parameters = parseParameters(stream);
    const returnAnnotation = parseOptionalAnnotation(stream);
    const body = parseBraceBlock(stream);

    return {
        kind: 'class-method',
        name: token.value,
        isConstructor: token.value === 'constructor',
        parameters,
        returnAnnotation,
        body,
        position: token.position,
    };
}

function parseClassMember(stream: TokenStream): ClassMember {
    const token = stream.expect('identifier');

    if (stream.check('punctuation', '(')) {
        return parseClassMethod(stream, token);
    }

    const annotation = parseOptionalAnnotation(stream);
    const value = stream.match('operator', '=') ? parseExpression(stream) : null;

    return { kind: 'class-field', name: token.value, annotation, value, position: token.position };
}

function parseClassModifiers(stream: TokenStream, declaration: ClassDeclaration): void {
    while (stream.check('identifier') && CLASS_MODIFIERS.has(stream.current().value)) {
        if (stream.next().value === 'extends') {
            declaration.superClass = stream.expect('identifier').value;

            continue;
        }

        do {
            declaration.interfaces.push(stream.expect('identifier').value);
        } while (stream.match('punctuation', ','));
    }
}

function parseClassDeclaration(stream: TokenStream): ClassDeclaration {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const declaration: ClassDeclaration = { kind: 'class-declaration', name, superClass: null, interfaces: [], members: [], position };

    parseClassModifiers(stream, declaration);
    stream.expect('punctuation', '{');

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        if (stream.match('punctuation', ';') || stream.match('punctuation', ',')) {
            continue;
        }

        try {
            declaration.members.push(parseClassMember(stream));
        } catch (error) {
            if (!(error instanceof ParserError)) {
                throw error;
            }

            recoverInBlock(stream, error);
        }
    }

    stream.expect('punctuation', '}');

    return declaration;
}

function parseInterfaceMember(stream: TokenStream): InterfaceMember {
    const token = stream.expect('identifier');

    if (stream.check('punctuation', '(')) {
        const parameters = parseParameters(stream);
        const returnAnnotation = parseOptionalAnnotation(stream);

        return { kind: 'interface-method', name: token.value, parameters, returnAnnotation, position: token.position };
    }

    stream.expect('punctuation', ':');

    return { kind: 'interface-field', name: token.value, annotation: parseTypeAnnotation(stream), position: token.position };
}

function parseInterfaceDeclaration(stream: TokenStream): InterfaceDeclaration {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const members: InterfaceMember[] = [];

    stream.expect('punctuation', '{');

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        if (stream.match('punctuation', ';') || stream.match('punctuation', ',')) {
            continue;
        }

        try {
            members.push(parseInterfaceMember(stream));
        } catch (error) {
            if (!(error instanceof ParserError)) {
                throw error;
            }

            recoverInBlock(stream, error);
        }
    }

    stream.expect('punctuation', '}');

    return { kind: 'interface-declaration', name, members, position };
}

function parseEnumDeclaration(stream: TokenStream): EnumDeclaration {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const members: EnumMember[] = [];

    stream.expect('punctuation', '{');

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        const token = stream.expect('identifier');

        members.push({ name: token.value, position: token.position });

        if (!stream.match('punctuation', ',') && !stream.match('punctuation', ';')) {
            break;
        }
    }

    stream.expect('punctuation', '}');

    return { kind: 'enum-declaration', name, members, position };
}

export function parseDeclaration(stream: TokenStream): DeclarationStatement {
    const value = stream.current().value;

    if (value === 'class') {
        return parseClassDeclaration(stream);
    }

    return value === 'interface' ? parseInterfaceDeclaration(stream) : parseEnumDeclaration(stream);
}
