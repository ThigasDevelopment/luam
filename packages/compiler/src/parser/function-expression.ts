import type { Expression, FunctionDeclaration, FunctionExpression, Identifier, MemberExpression, Parameter } from './ast';
import { parseBlock } from './statement';
import type { TokenStream } from './token-stream';
import { parseNamedAnnotation, parseOptionalAnnotation } from './type-annotation';
import { parseTypeParameters } from './type-parameters';

function parseParameter(stream: TokenStream): Parameter {
    const token = stream.current();

    if (token.kind === 'operator' && token.value === '...') {
        stream.next();

        const checkpoint = stream.checkpoint();
        const name = stream.check('identifier') ? stream.next().value : '';
        const annotation = parseOptionalAnnotation(stream);

        if (name.length > 0) {
            stream.eraseFrom(checkpoint);
        }

        return { name, annotation, isVararg: true, position: token.position };
    }

    const name = stream.expect('identifier').value;

    return { name, annotation: parseNamedAnnotation(stream, 'parameter'), isVararg: false, position: token.position };
}

export function parseParameters(stream: TokenStream): Parameter[] {
    stream.expect('punctuation', '(');

    const parameters: Parameter[] = [];

    while (!stream.check('punctuation', ')') && !stream.isEof()) {
        parameters.push(parseParameter(stream));

        if (!stream.match('punctuation', ',')) {
            break;
        }
    }

    stream.expect('punctuation', ')');

    return parameters;
}

export function parseFunctionExpression(stream: TokenStream): FunctionExpression {
    const position = stream.expect('keyword', 'function').position;
    const typeParameters = parseTypeParameters(stream);
    const parameters = parseParameters(stream);
    const returnAnnotation = parseOptionalAnnotation(stream);
    const body = parseBlock(stream, ['end']);

    stream.expect('keyword', 'end');

    return {
        kind: 'function-expression',
        typeParameters: typeParameters.names,
        typeConstraints: typeParameters.constraints,
        parameters,
        returnAnnotation,
        body,
        position,
    };
}

function parseFunctionName(stream: TokenStream): { name: Identifier | MemberExpression; isMethod: boolean } {
    const token = stream.expect('identifier');

    let name: Identifier | MemberExpression = { kind: 'identifier', name: token.value, position: token.position };

    while (stream.match('punctuation', '.')) {
        const property = stream.expectName().value;

        name = { kind: 'member-expression', object: name as Expression, property, position: token.position };
    }

    if (!stream.match('punctuation', ':')) {
        return { name, isMethod: false };
    }

    const property = stream.expect('identifier').value;

    return { name: { kind: 'member-expression', object: name as Expression, property, position: token.position }, isMethod: true };
}

export function parseFunctionDeclaration(stream: TokenStream, isLocal: boolean, isExported = false, isHttpExport = false): FunctionDeclaration {
    const position = stream.expect('keyword', 'function').position;
    const { name, isMethod } = parseFunctionName(stream);
    const typeParameters = parseTypeParameters(stream);
    const parameters = parseParameters(stream);
    const returnAnnotation = parseOptionalAnnotation(stream);
    const body = parseBlock(stream, ['end']);

    stream.expect('keyword', 'end');

    return {
        kind: 'function-declaration',
        name,
        isLocal,
        isExported,
        isHttpExport,
        isMethod,
        typeParameters: typeParameters.names,
        typeConstraints: typeParameters.constraints,
        parameters,
        returnAnnotation,
        body,
        position,
    };
}
