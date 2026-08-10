import type { IfClause, Statement, VariableDeclarator } from './ast';
import { parseExpression } from './expression';
import { parseBlock, parseDeclarator, parseExpressionList } from './statement';
import type { TokenStream } from './token-stream';

export function parseIfStatement(stream: TokenStream): Statement {
    const position = stream.expect('keyword', 'if').position;
    const clauses: IfClause[] = [];

    let clausePosition = position;

    for (;;) {
        const condition = parseExpression(stream);

        stream.expect('keyword', 'then');
        clauses.push({ condition, body: parseBlock(stream, ['end', 'else', 'elseif']), position: clausePosition });

        if (!stream.check('keyword', 'elseif')) {
            break;
        }

        clausePosition = stream.next().position;
    }

    const alternate = stream.match('keyword', 'else') ? parseBlock(stream, ['end']) : null;

    stream.expect('keyword', 'end');

    return { kind: 'if-statement', clauses, alternate, position };
}

export function parseWhileStatement(stream: TokenStream): Statement {
    const position = stream.expect('keyword', 'while').position;
    const condition = parseExpression(stream);

    stream.expect('keyword', 'do');

    const body = parseBlock(stream, ['end']);

    stream.expect('keyword', 'end');

    return { kind: 'while-statement', condition, body, position };
}

export function parseRepeatStatement(stream: TokenStream): Statement {
    const position = stream.expect('keyword', 'repeat').position;
    const body = parseBlock(stream, ['until']);

    stream.expect('keyword', 'until');

    return { kind: 'repeat-statement', body, condition: parseExpression(stream), position };
}

export function parseDoStatement(stream: TokenStream): Statement {
    const position = stream.expect('keyword', 'do').position;
    const body = parseBlock(stream, ['end']);

    stream.expect('keyword', 'end');

    return { kind: 'do-statement', body, position };
}

export function parseForStatement(stream: TokenStream): Statement {
    const position = stream.expect('keyword', 'for').position;
    const first = parseDeclarator(stream);

    if (stream.match('operator', '=')) {
        const start = parseExpression(stream);

        stream.expect('punctuation', ',');

        const limit = parseExpression(stream);
        const step = stream.match('punctuation', ',') ? parseExpression(stream) : null;

        stream.expect('keyword', 'do');

        const body = parseBlock(stream, ['end']);

        stream.expect('keyword', 'end');

        return { kind: 'numeric-for-statement', variable: first, start, limit, step, body, position };
    }

    const variables: VariableDeclarator[] = [first];

    while (stream.match('punctuation', ',')) {
        variables.push(parseDeclarator(stream));
    }

    stream.expect('keyword', 'in');

    const iterators = parseExpressionList(stream);

    stream.expect('keyword', 'do');

    const body = parseBlock(stream, ['end']);

    stream.expect('keyword', 'end');

    return { kind: 'generic-for-statement', variables, iterators, body, position };
}
