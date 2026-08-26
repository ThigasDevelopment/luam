import type { Token } from '@compiler/lexer/token';

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
import { parseFunctionExpression, parseParameters } from './function-expression';
import { recoverInBlock } from './recovery';
import { parseBraceBlock } from './statement';
import { ParserError, type TokenStream } from './token-stream';
import { parseNamedAnnotation, parseOptionalAnnotation } from './type-annotation';

const DECLARATION_NAMES: ReadonlySet<string> = new Set(['class', 'interface', 'enum']);

const CLASS_MODIFIERS: ReadonlySet<string> = new Set(['extends', 'implements']);

function isClassHeader(stream: TokenStream, offset = 0): boolean {
    return (
        stream.checkAhead(offset + 2, 'punctuation', '{') ||
        stream.checkAhead(offset + 2, 'keyword', 'extends') ||
        stream.checkAhead(offset + 2, 'keyword', 'implements')
    );
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

    return token.value === 'interface'
        ? stream.checkAhead(offset + 2, 'punctuation', '{') || stream.checkAhead(offset + 2, 'keyword', 'extends')
        : stream.checkAhead(offset + 2, 'punctuation', '{');
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

function parseClassMethod(stream: TokenStream, token: Token, decorators: Decorator[]): ClassMethodDeclaration {
    stream.expect('operator', '=');

    const expression = parseFunctionExpression(stream);

    return {
        kind: 'class-method',
        name: token.value,
        isConstructor: token.value === 'constructor',
        isSynthetic: false,
        parameters: expression.parameters,
        returnAnnotation: expression.returnAnnotation,
        body: expression.body,
        decorators,
        position: token.position,
    };
}

function parseBraceClassMethod(stream: TokenStream, token: Token, decorators: Decorator[]): ClassMethodDeclaration {
    const parameters = parseParameters(stream);
    const returnAnnotation = parseOptionalAnnotation(stream);
    const body = parseBraceBlock(stream);

    return {
        kind: 'class-method',
        name: token.value,
        isConstructor: token.value === 'constructor',
        isSynthetic: false,
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

function expectClassFieldBoundary(stream: TokenStream, token: Token): void {
    const current = stream.current();
    const delimiter = current.kind === 'punctuation' && (current.value === '}' || current.value === ';' || current.value === ',');

    if (current.kind === 'eof' || delimiter || current.position.line > token.position.line) {
        return;
    }

    throw stream.error(`Expected a line break or separator after class member "${token.value}".`, 'parse-unexpected-token');
}

function parseClassMember(stream: TokenStream): ClassMember {
    const decorators = parseDecorators(stream);
    const token = stream.expectName();

    if (stream.check('punctuation', '(')) {
        stream.report('parse-class-method-form', `Write class member "${token.value}" as "${token.value} = function (...) ... end".`, token.position);

        return parseBraceClassMethod(stream, token, decorators);
    }

    if (stream.check('operator', '=') && stream.checkAhead(1, 'keyword', 'function')) {
        return parseClassMethod(stream, token, decorators);
    }

    const annotation = parseFieldAnnotation(stream);
    const value = stream.match('operator', '=') ? parseExpression(stream) : null;

    expectClassFieldBoundary(stream, token);

    return { kind: 'class-field', name: token.value, annotation, value, decorators, position: token.position };
}

function parseClassModifiers(stream: TokenStream, declaration: ClassDeclaration): void {
    while (stream.check('keyword') && CLASS_MODIFIERS.has(stream.current().value)) {
        if (stream.next().value === 'extends') {
            declaration.superClass = stream.expect('identifier').value;

            continue;
        }

        do {
            declaration.interfaces.push(stream.expect('identifier').value);
        } while (stream.match('punctuation', ','));
    }
}

function parseClassDeclaration(stream: TokenStream, decorators: Decorator[]): ClassDeclaration {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const declaration: ClassDeclaration = { kind: 'class-declaration', name, superClass: null, interfaces: [], members: [], decorators, position };

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
    const token = stream.expectName();

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

    const declaration: InterfaceDeclaration = { kind: 'interface-declaration', name, superInterfaces, members, position };

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
