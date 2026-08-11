import type { SourcePosition } from '@compiler/diagnostics/diagnostic';

import type { DeclareStatement, Expression, Statement, TypeAliasStatement, VariableDeclarator } from './ast';
import { parseDoStatement, parseForStatement, parseIfStatement, parseRepeatStatement, parseWhileStatement } from './control-flow';
import { isDeclarationStart, parseDeclaration, parseDecorators } from './declarations';
import { isDirectiveStart, parseDirective } from './directives';
import { parseExpression, parseSuffixed } from './expression';
import { parseFunctionDeclaration } from './function-expression';
import { ASSIGNMENT_OPERATORS, INCREMENT_OPERATORS } from './precedence';
import { recoverInBlock } from './recovery';
import { ParserError, type TokenStream } from './token-stream';
import { parseNamedAnnotation, parseOptionalAnnotation, parseTypeAnnotation } from './type-annotation';

const BLOCK_END: ReadonlySet<string> = new Set(['end', 'else', 'elseif', 'until']);

export function parseExpressionList(stream: TokenStream): Expression[] {
    const values: Expression[] = [parseExpression(stream)];

    while (stream.match('punctuation', ',')) {
        values.push(parseExpression(stream));
    }

    return values;
}

export function parseDeclarator(stream: TokenStream): VariableDeclarator {
    const token = stream.expect('identifier');

    return { name: token.value, annotation: parseNamedAnnotation(stream, 'local'), position: token.position };
}

function parseLocalStatement(stream: TokenStream, position: SourcePosition): Statement {
    const declarations: VariableDeclarator[] = [parseDeclarator(stream)];

    while (stream.match('punctuation', ',')) {
        declarations.push(parseDeclarator(stream));
    }

    const values = stream.match('operator', '=') ? parseExpressionList(stream) : [];

    return { kind: 'local-statement', declarations, values, position };
}

function parseReturnStatement(stream: TokenStream): Statement {
    const position = stream.expect('keyword', 'return').position;
    const stop =
        stream.isEof() ||
        stream.check('punctuation', '}') ||
        (stream.current().kind === 'keyword' && BLOCK_END.has(stream.current().value));
    const values = stop || stream.check('punctuation', ';') ? [] : parseExpressionList(stream);

    return { kind: 'return-statement', values, position };
}

function parseTypeAlias(stream: TokenStream): TypeAliasStatement {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;
    const typeParameters: string[] = [];

    if (stream.match('operator', '<')) {
        do {
            typeParameters.push(stream.expect('identifier').value);
        } while (stream.match('punctuation', ','));

        stream.expect('operator', '>');
    }

    stream.expect('operator', '=');

    return { kind: 'type-alias-statement', name, typeParameters, annotation: parseTypeAnnotation(stream), position };
}

function isTypeAlias(stream: TokenStream): boolean {
    if (!stream.check('keyword', 'type') || !stream.checkAhead(1, 'identifier')) {
        return false;
    }

    return stream.checkAhead(2, 'operator', '=') || stream.checkAhead(2, 'operator', '<');
}

function parseDeclareStatement(stream: TokenStream): DeclareStatement {
    const position = stream.next().position;
    const name = stream.expect('identifier').value;

    stream.expect('punctuation', ':');

    return { kind: 'declare-statement', name, annotation: parseTypeAnnotation(stream), position };
}

function isDeclareStatement(stream: TokenStream): boolean {
    return stream.check('keyword', 'declare') && stream.checkAhead(1, 'identifier') && stream.checkAhead(2, 'punctuation', ':');
}

function isIncrementTarget(target: Expression | undefined): boolean {
    return target?.kind === 'identifier' || target?.kind === 'member-expression' || target?.kind === 'index-expression';
}

function parseIncrement(stream: TokenStream, targets: readonly Expression[], position: SourcePosition): Statement {
    const operator = stream.current().value;
    const target = targets[0];

    if (targets.length !== 1 || !isIncrementTarget(target) || target === undefined) {
        throw stream.error(`Operator "${operator}" takes a single variable as its target.`, 'parse-invalid-increment');
    }

    stream.next();

    return { kind: 'assignment-statement', operator, targets: [target], values: [], position };
}

function parseExpressionStatement(stream: TokenStream): Statement {
    const position = stream.current().position;
    const targets: Expression[] = [parseSuffixed(stream)];

    while (stream.match('punctuation', ',')) {
        targets.push(parseSuffixed(stream));
    }

    const token = stream.current();

    if (token.kind === 'operator' && INCREMENT_OPERATORS.has(token.value)) {
        return parseIncrement(stream, targets, position);
    }

    if (token.kind === 'operator' && ASSIGNMENT_OPERATORS.has(token.value)) {
        stream.next();

        return { kind: 'assignment-statement', operator: token.value, targets, values: parseExpressionList(stream), position };
    }

    const first = targets[0];

    if (targets.length === 1 && first !== undefined && first.kind === 'call-expression') {
        return { kind: 'call-statement', expression: first, position };
    }

    throw stream.error('Expected a call or an assignment statement.', 'parse-invalid-statement');
}

function parseKeywordStatement(stream: TokenStream, value: string): Statement | null {
    const token = stream.current();

    if (value === 'local') {
        stream.next();

        return stream.check('keyword', 'function') ? parseFunctionDeclaration(stream, true) : parseLocalStatement(stream, token.position);
    }

    if (value === 'function') {
        return parseFunctionDeclaration(stream, false);
    }

    if (value === 'if') {
        return parseIfStatement(stream);
    }

    if (value === 'while') {
        return parseWhileStatement(stream);
    }

    if (value === 'for') {
        return parseForStatement(stream);
    }

    if (value === 'repeat') {
        return parseRepeatStatement(stream);
    }

    if (value === 'do') {
        return parseDoStatement(stream);
    }

    if (value === 'return') {
        return parseReturnStatement(stream);
    }

    if (value === 'break') {
        stream.next();

        return { kind: 'break-statement', position: token.position };
    }

    if (value === 'continue') {
        stream.next();

        return { kind: 'continue-statement', position: token.position };
    }

    return null;
}

export function parseStatement(stream: TokenStream): Statement {
    const token = stream.current();

    if (token.kind === 'keyword') {
        const statement = parseKeywordStatement(stream, token.value);

        if (statement !== null) {
            return statement;
        }
    }

    if (isTypeAlias(stream)) {
        return parseTypeAlias(stream);
    }

    if (isDeclareStatement(stream)) {
        return parseDeclareStatement(stream);
    }

    if (isDirectiveStart(stream)) {
        return parseDirective(stream);
    }

    if (isDeclarationStart(stream)) {
        return parseDeclaration(stream);
    }

    if (stream.check('punctuation', '@')) {
        const decorators = parseDecorators(stream);

        for (const decorator of decorators) {
            stream.report('parse-unexpected-decorator', `Decorator "@${decorator.name}" cannot be used here.`, decorator.position);
        }

        if (stream.isEof()) {
            throw stream.error('Expected a declaration after the decorator.', 'parse-unexpected-decorator');
        }

        return parseStatement(stream);
    }

    return parseExpressionStatement(stream);
}

function parseBlockStatement(stream: TokenStream): Statement | null {
    try {
        return parseStatement(stream);
    } catch (error) {
        if (!(error instanceof ParserError)) {
            throw error;
        }

        recoverInBlock(stream, error);

        return null;
    }
}

export function parseBraceBlock(stream: TokenStream): Statement[] {
    const body: Statement[] = [];

    stream.expect('punctuation', '{');

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        if (stream.match('punctuation', ';')) {
            continue;
        }

        const statement = parseBlockStatement(stream);

        if (statement === null) {
            continue;
        }

        body.push(statement);

        if (statement.kind === 'return-statement') {
            break;
        }
    }

    stream.expect('punctuation', '}');

    return body;
}

export function parseBlock(stream: TokenStream, terminators: readonly string[]): Statement[] {
    const body: Statement[] = [];
    const stop = new Set(terminators);

    while (!stream.isEof()) {
        if (stream.match('punctuation', ';')) {
            continue;
        }

        if (stream.current().kind === 'keyword' && stop.has(stream.current().value)) {
            return body;
        }

        const statement = parseStatement(stream);

        body.push(statement);

        if (statement.kind === 'return-statement') {
            return body;
        }
    }

    return body;
}
