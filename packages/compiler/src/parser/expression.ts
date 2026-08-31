import { CALLABLE_KEYWORDS, type Token } from '@compiler/lexer/token';

import type { Expression, TableField, TypeAnnotation } from './ast';
import { parseFunctionExpression } from './function-expression';
import { binaryPrecedence, isRightAssociative, UNARY_OPERATORS, UNARY_PRECEDENCE } from './precedence';
import type { TokenStream } from './token-stream';
import { parseTypeAnnotation } from './type-annotation';
import { parseCallTypeArguments, parseTypeArguments } from './type-parameters';

const LITERAL_KEYWORDS: ReadonlySet<string> = new Set(['nil', 'true', 'false']);

function parseKeywordLiteral(token: Token): Expression {
    if (token.value === 'nil') {
        return { kind: 'nil-literal', position: token.position };
    }

    return { kind: 'boolean-literal', value: token.value === 'true', position: token.position };
}

function parseTable(stream: TokenStream): Expression {
    const position = stream.expect('punctuation', '{').position;
    const fields: TableField[] = [];

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        fields.push(parseTableField(stream));

        if (!stream.match('punctuation', ',') && !stream.match('punctuation', ';')) {
            break;
        }
    }

    stream.expect('punctuation', '}');

    return { kind: 'table-expression', fields, position };
}

function parseTableField(stream: TokenStream): TableField {
    const position = stream.current().position;

    if (stream.check('punctuation', '[')) {
        stream.next();

        const key = parseExpression(stream);

        stream.expect('punctuation', ']');
        stream.expect('operator', '=');

        return { key, name: null, value: parseExpression(stream), position };
    }

    if (stream.checkName() && stream.checkAhead(1, 'operator', '=')) {
        const name = stream.next().value;

        stream.next();

        return { key: null, name, value: parseExpression(stream), position };
    }

    return { key: null, name: null, value: parseExpression(stream), position };
}

function parsePrimary(stream: TokenStream): Expression {
    const token = stream.current();

    if (token.kind === 'number') {
        stream.next();

        return { kind: 'number-literal', raw: token.value, value: Number(token.value), position: token.position };
    }

    if (token.kind === 'string') {
        stream.next();

        return { kind: 'string-literal', value: token.value, position: token.position };
    }

    if (token.kind === 'template') {
        stream.next();

        return { kind: 'template-literal', segments: token.segments ?? [], position: token.position };
    }

    if (token.kind === 'keyword' && token.value === 'new' && stream.checkAhead(1, 'identifier')) {
        stream.next();

        const className = stream.next().value;
        const typeArguments = parseTypeArguments(stream);

        return { kind: 'new-expression', className, typeArguments, args: parseArguments(stream), position: token.position };
    }

    if (token.kind === 'keyword' && CALLABLE_KEYWORDS.has(token.value) && stream.checkAhead(1, 'punctuation', '(')) {
        stream.next();

        return { kind: 'identifier', name: token.value, position: token.position };
    }

    if (token.kind === 'identifier') {
        stream.next();

        return { kind: 'identifier', name: token.value, position: token.position };
    }

    if (token.kind === 'keyword' && LITERAL_KEYWORDS.has(token.value)) {
        stream.next();

        return parseKeywordLiteral(token);
    }

    if (token.kind === 'keyword' && token.value === 'function') {
        return parseFunctionExpression(stream);
    }

    if (token.kind === 'operator' && token.value === '...') {
        stream.next();

        return { kind: 'vararg-expression', position: token.position };
    }

    if (token.kind === 'punctuation' && token.value === '{') {
        return parseTable(stream);
    }

    if (token.kind === 'punctuation' && token.value === '(') {
        stream.next();

        const expression = parseExpression(stream);

        stream.expect('punctuation', ')');

        return { kind: 'group-expression', expression, position: token.position };
    }

    throw stream.error(`Unexpected "${stream.describeCurrent()}" in expression.`, 'parse-unexpected-token');
}

function parseArguments(stream: TokenStream): Expression[] {
    if (stream.check('string') || stream.check('template') || stream.check('punctuation', '{')) {
        return [parsePrimary(stream)];
    }

    stream.expect('punctuation', '(');

    const args: Expression[] = [];

    while (!stream.check('punctuation', ')') && !stream.isEof()) {
        args.push(parseExpression(stream));

        if (!stream.match('punctuation', ',')) {
            break;
        }
    }

    stream.expect('punctuation', ')');

    return args;
}

function isCallStart(stream: TokenStream): boolean {
    return stream.check('punctuation', '(') || stream.check('punctuation', '{') || stream.check('string') || stream.check('template');
}

export function parseSuffixed(stream: TokenStream): Expression {
    const checkpoint = stream.checkpoint();
    let expression = parsePrimary(stream);

    stream.recordSpan(expression, checkpoint);

    for (;;) {
        const token = stream.current();

        if (token.kind === 'punctuation' && token.value === '.') {
            stream.next();

            const property = stream.expectName().value;

            expression = { kind: 'member-expression', object: expression, property, position: token.position };

            stream.recordSpan(expression, checkpoint);

            continue;
        }

        if (token.kind === 'punctuation' && token.value === '[') {
            stream.next();

            const index = parseExpression(stream);

            stream.expect('punctuation', ']');

            expression = { kind: 'index-expression', object: expression, index, position: token.position };

            stream.recordSpan(expression, checkpoint);

            continue;
        }

        if (token.kind === 'punctuation' && token.value === ':' && stream.checkName(1)) {
            stream.next();

            const method = stream.next().value;

            const typeArguments = parseCallTypeArguments(stream);

            expression = { kind: 'call-expression', callee: expression, method, typeArguments, args: parseArguments(stream), position: token.position };

            stream.recordSpan(expression, checkpoint);

            continue;
        }

        const typeArguments = parseCallTypeArguments(stream);

        if (typeArguments.length > 0 || isCallStart(stream)) {
            expression = { kind: 'call-expression', callee: expression, method: null, typeArguments, args: parseArguments(stream), position: token.position };

            stream.recordSpan(expression, checkpoint);

            continue;
        }

        return expression;
    }
}

function parseUnary(stream: TokenStream): Expression {
    const token = stream.current();
    const isUnary = (token.kind === 'operator' || token.kind === 'keyword') && UNARY_OPERATORS.has(token.value);

    if (!isUnary) {
        return parseSuffixed(stream);
    }

    stream.next();

    return { kind: 'unary-expression', operator: token.value, operand: parseBinary(stream, UNARY_PRECEDENCE), position: token.position };
}

function parseBinary(stream: TokenStream, limit: number): Expression {
    let left = parseUnary(stream);

    for (;;) {
        const token = stream.current();
        const isBinary = token.kind === 'operator' || token.kind === 'keyword';
        const precedence = isBinary ? binaryPrecedence(token.value) : 0;

        if (precedence === 0 || precedence <= limit) {
            return left;
        }

        stream.next();

        const right = parseBinary(stream, isRightAssociative(token.value) ? precedence - 1 : precedence);

        left = { kind: 'binary-expression', operator: token.value, left, right, position: token.position };
    }
}

export function parseExpression(stream: TokenStream): Expression {
    return parseBinary(stream, 0);
}
