import type { Token, TokenKind } from '@compiler/lexer/token';
import type { Expression, TypeAnnotation } from '@compiler/parser/ast';

import type {
    ClassDeclaration,
    ClassMember,
    ClassMethodDeclaration,
    DeclarationStatement,
    Decorator,
    EnumDeclaration,
    EnumMember,
    InterfaceDeclaration,
    InterfaceMember,
} from './declaration-nodes';
import { parseExpression } from './expression';
import { ASYNC_MODIFIER, consumeAsyncModifier, isAsyncFunctionStart, parseFunctionExpression, parseParameters } from './function-expression';
import { recoverInBlock } from './recovery';
import { parseBraceBlock } from './statement';
import { ParserError, type TokenStream } from './token-stream';
import { parseNamedAnnotation, parseOptionalAnnotation, parseTypeAnnotation } from './type-annotation';
import { parseTypeArguments, parseTypeParameters } from './type-parameters';

const DECLARATION_NAMES: ReadonlySet<string> = new Set(['class', 'interface', 'enum']);

const CLASS_MODIFIERS: ReadonlySet<string> = new Set(['extends', 'implements']);

function skipTypeParameters(stream: TokenStream, offset: number): number {
    if (!stream.checkAhead(offset, 'operator', '<')) {
        return offset;
    }

    let depth = 0;
    let index = offset;

    do {
        const token = stream.peek(index);

        depth += token.kind === 'operator' && token.value === '<' ? 1 : 0;
        depth -= token.kind === 'operator' && token.value === '>' ? 1 : 0;
        index += 1;
    } while (depth > 0 && stream.peek(index).kind !== 'eof');

    return index;
}

function isClassHeader(stream: TokenStream, offset = 0): boolean {
    const after = skipTypeParameters(stream, offset + 2);

    return stream.checkAhead(after, 'punctuation', '{') || stream.checkAhead(after, 'keyword', 'extends') || stream.checkAhead(after, 'keyword', 'implements');
}

export function isDeclarationStart(stream: TokenStream): boolean {
    let offset = 0;

    while (stream.checkAhead(offset, 'punctuation', '@') && stream.checkAhead(offset + 1, 'identifier')) {
        offset += 2;

        if (stream.checkAhead(offset, 'punctuation', '(')) {
            let depth = 0;

            do {
                const token = stream.peek(offset);

                depth += token.kind === 'punctuation' && token.value === '(' ? 1 : 0;
                depth -= token.kind === 'punctuation' && token.value === ')' ? 1 : 0;
                offset += 1;
            } while (depth > 0 && stream.peek(offset).kind !== 'eof');
        }
    }

    const token = stream.peek(offset);

    if (token.kind !== 'keyword' || !DECLARATION_NAMES.has(token.value) || !stream.checkAhead(offset + 1, 'identifier')) {
        return false;
    }

    if (offset > 0 && token.value !== 'class') {
        return false;
    }

    if (token.value === 'class') {
        return isClassHeader(stream, offset);
    }

    if (token.value === 'interface') {
        const after = skipTypeParameters(stream, offset + 2);

        return stream.checkAhead(after, 'punctuation', '{') || stream.checkAhead(after, 'keyword', 'extends');
    }

    return stream.checkAhead(offset + 2, 'punctuation', '{');
}

function skipDecoratorArguments(stream: TokenStream): void {
    let depth = 0;

    do {
        const token = stream.next();

        depth += token.kind === 'punctuation' && token.value === '(' ? 1 : 0;
        depth -= token.kind === 'punctuation' && token.value === ')' ? 1 : 0;
    } while (depth > 0 && !stream.isEof());
}

export function parseDecorators(stream: TokenStream): Decorator[] {
    const decorators: Decorator[] = [];

    while (stream.check('punctuation', '@')) {
        const position = stream.next().position;

        if (!stream.check('identifier') || stream.current().position.line !== position.line) {
            stream.report('parse-unexpected-decorator', 'Expected a decorator name after "@".', position);

            break;
        }

        decorators.push({ kind: 'decorator', name: stream.next().value, position });

        if (stream.check('punctuation', '(')) {
            stream.report('parse-decorator-arguments', 'Decorators do not take arguments.', position);
            skipDecoratorArguments(stream);
        }
    }

    const last = decorators[decorators.length - 1];

    if (last !== undefined && !stream.isEof() && stream.current().position.line === last.position.line) {
        stream.report('parse-decorator-line', `Expected a line break after "@${last.name}".`, stream.current().position);
    }

    return decorators;
}

function parseClassMethod(stream: TokenStream, token: Token, decorators: Decorator[], isStatic: boolean, isAsync: boolean): ClassMethodDeclaration {
    stream.expect('operator', '=');

    const modified = consumeAsyncModifier(stream) || isAsync;
    const expression = parseFunctionExpression(stream, modified);

    return {
        kind: 'class-method',
        name: token.value,
        isAsync: modified,
        isConstructor: token.value === 'constructor',
        isSynthetic: false,
        isStatic,
        typeParameters: expression.typeParameters,
        typeConstraints: expression.typeConstraints,
        parameters: expression.parameters,
        returnAnnotation: expression.returnAnnotation,
        body: expression.body,
        decorators,
        position: token.position,
    };
}

function parseBraceClassMethod(stream: TokenStream, token: Token, decorators: Decorator[], isStatic: boolean, isAsync: boolean): ClassMethodDeclaration {
    const parameters = parseParameters(stream);
    const returnAnnotation = parseOptionalAnnotation(stream);
    const body = parseBraceBlock(stream);

    return {
        kind: 'class-method',
        name: token.value,
        isAsync,
        isConstructor: token.value === 'constructor',
        isSynthetic: false,
        isStatic,
        typeParameters: [],
        typeConstraints: [],
        parameters,
        returnAnnotation,
        body,
        decorators,
        position: token.position,
    };
}

function parseFieldAnnotation(stream: TokenStream): ReturnType<typeof parseOptionalAnnotation> {
    return parseNamedAnnotation(stream, 'field');
}

function parseFieldValue(stream: TokenStream): Expression {
    stream.stopIndexAtNewline(true);

    try {
        return parseExpression(stream);
    } finally {
        stream.stopIndexAtNewline(false);
    }
}

function expectClassFieldBoundary(stream: TokenStream, token: Token): void {
    const current = stream.current();
    const delimiter = current.kind === 'punctuation' && (current.value === '}' || current.value === ';' || current.value === ',');

    if (current.kind === 'eof' || delimiter || current.position.line > token.position.line) {
        return;
    }

    throw stream.error(`Expected a line break or separator after class member "${token.value}".`, 'parse-unexpected-token');
}

const STATIC_MODIFIER = 'static';

function parseMemberModifier(stream: TokenStream, modifier: string, kind: TokenKind = 'identifier'): boolean {
    if (!stream.check(kind, modifier)) {
        return false;
    }

    const token = stream.current();

    if (!stream.checkName(1) || stream.peek(1).position.line !== token.position.line) {
        return false;
    }

    const checkpoint = stream.checkpoint();

    stream.next();
    stream.eraseToCurrent(checkpoint);

    return true;
}

function parseClassMember(stream: TokenStream): ClassMember {
    const decorators = parseDecorators(stream);
    const isStatic = parseMemberModifier(stream, STATIC_MODIFIER);
    const isAsync = parseMemberModifier(stream, ASYNC_MODIFIER, 'keyword');
    const token = stream.expectMemberKey();

    if (stream.check('punctuation', '(')) {
        stream.report('parse-class-method-form', `Write class member "${token.value}" as "${token.value} = function (...) ... end".`, token.position);

        return parseBraceClassMethod(stream, token, decorators, isStatic, isAsync);
    }

    if (stream.check('operator', '=') && (stream.checkAhead(1, 'keyword', 'function') || isAsyncFunctionStart(stream, 1))) {
        return parseClassMethod(stream, token, decorators, isStatic, isAsync);
    }

    const annotation = parseFieldAnnotation(stream);
    const value = stream.match('operator', '=') ? parseFieldValue(stream) : null;

    expectClassFieldBoundary(stream, token);

    return { kind: 'class-field', name: token.value, annotation, value, decorators, isStatic, position: token.position };
}

function parseClassModifiers(stream: TokenStream, declaration: ClassDeclaration): void {
    while (stream.check('keyword') && CLASS_MODIFIERS.has(stream.current().value)) {
        if (stream.next().value === 'extends') {
            declaration.superClass = stream.expect('identifier').value;
            declaration.superClassArguments = parseTypeArguments(stream);

            continue;
        }

        do {
            declaration.interfaces.push(stream.expect('identifier').value);
            declaration.interfaceArguments.push(parseTypeArguments(stream));
        } while (stream.match('punctuation', ','));
    }
}

function parseClassDeclaration(stream: TokenStream, decorators: Decorator[]): ClassDeclaration {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const typeParameters = parseTypeParameters(stream);
    const declaration: ClassDeclaration = {
        kind: 'class-declaration',
        name,
        typeParameters: typeParameters.names,
        typeConstraints: typeParameters.constraints,
        superClass: null,
        superClassArguments: [],
        interfaces: [],
        interfaceArguments: [],
        members: [],
        decorators,
        position,
    };

    parseClassModifiers(stream, declaration);
    stream.expect('punctuation', '{');

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        if (stream.match('punctuation', ';') || stream.match('punctuation', ',')) {
            continue;
        }

        try {
            const checkpoint = stream.checkpoint();
            const member = parseClassMember(stream);

            declaration.members.push(member);
            stream.recordSpan(member, checkpoint);
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
    const token = stream.expectMemberKey();

    if (stream.check('punctuation', '(')) {
        const parameters = parseParameters(stream);
        const returnAnnotation = parseOptionalAnnotation(stream);

        return { kind: 'interface-method', name: token.value, parameters, returnAnnotation, position: token.position };
    }

    const annotation = parseFieldAnnotation(stream);

    if (annotation === null) {
        throw stream.error('Interface fields require a type annotation.', 'parse-unexpected-token');
    }

    return { kind: 'interface-field', name: token.value, annotation, position: token.position };
}

function parseInterfaceDeclaration(stream: TokenStream): InterfaceDeclaration {
    const checkpoint = stream.checkpoint();
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const typeParameters = parseTypeParameters(stream);
    const superInterfaces: string[] = [];
    const members: InterfaceMember[] = [];

    if (stream.match('keyword', 'extends')) {
        do {
            superInterfaces.push(stream.expect('identifier').value);
        } while (stream.match('punctuation', ','));
    }

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

    const declaration: InterfaceDeclaration = {
        kind: 'interface-declaration',
        name,
        typeParameters: typeParameters.names,
        typeConstraints: typeParameters.constraints,
        superInterfaces,
        members,
        position,
    };

    stream.eraseFrom(checkpoint, 'declaration');

    return declaration;
}

export function parseEnumDeclaration(stream: TokenStream, isLocal = false): EnumDeclaration {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const members: EnumMember[] = [];

    stream.expect('punctuation', '{');

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        const token = stream.expectName();

        members.push({ name: token.value, position: token.position });

        if (!stream.match('punctuation', ',') && !stream.match('punctuation', ';')) {
            break;
        }
    }

    stream.expect('punctuation', '}');

    return { kind: 'enum-declaration', name, isLocal, members, position };
}

export function parseDeclaration(stream: TokenStream): DeclarationStatement {
    const decorators = parseDecorators(stream);
    const value = stream.current().value;

    if (value === 'class') {
        return parseClassDeclaration(stream, decorators);
    }

    return value === 'interface' ? parseInterfaceDeclaration(stream) : parseEnumDeclaration(stream);
}
