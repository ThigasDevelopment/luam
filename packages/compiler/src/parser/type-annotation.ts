import type { TypeAnnotation } from './ast';
import type { TokenStream } from './token-stream';

const TYPE_KEYWORDS: ReadonlySet<string> = new Set(['nil', 'true', 'false']);

const FUNCTION_TYPE = 'fun';

function parseTypeName(stream: TokenStream): TypeAnnotation {
    const token = stream.current();

    if (token.kind !== 'identifier' && !(token.kind === 'keyword' && TYPE_KEYWORDS.has(token.value))) {
        throw stream.error(`Expected a type but found "${stream.describeCurrent()}".`, 'parse-invalid-type');
    }

    stream.next();

    const typeArguments: TypeAnnotation[] = [];

    if (stream.match('operator', '<')) {
        do {
            typeArguments.push(parseTypeAnnotation(stream));
        } while (stream.match('punctuation', ','));

        stream.expect('operator', '>');
    }

    return { kind: 'type-name', name: token.value, typeArguments, position: token.position };
}

function parseParameterType(stream: TokenStream): TypeAnnotation {
    if (stream.check('identifier') && stream.checkAhead(1, 'punctuation', ':')) {
        stream.next();
        stream.next();
    }

    return parseTypeAnnotation(stream);
}

function parseFunctionType(stream: TokenStream): TypeAnnotation {
    const position = stream.expect('identifier', FUNCTION_TYPE).position;

    if (!stream.check('punctuation', '(')) {
        return { kind: 'type-function', parameters: [], isVariadic: true, returnType: null, position };
    }

    stream.next();

    const parameters: TypeAnnotation[] = [];

    let isVariadic = false;

    while (!stream.check('punctuation', ')') && !stream.isEof()) {
        if (stream.match('operator', '...')) {
            isVariadic = true;

            if (stream.match('punctuation', ':')) {
                parseTypeAnnotation(stream);
            }
        } else {
            parameters.push(parseParameterType(stream));
        }

        if (!stream.match('punctuation', ',')) {
            break;
        }
    }

    stream.expect('punctuation', ')');

    const returnType = stream.match('punctuation', ':') ? parseTypeAnnotation(stream) : null;

    return { kind: 'type-function', parameters, isVariadic, returnType, position };
}

function parseGroupedType(stream: TokenStream): TypeAnnotation {
    stream.expect('punctuation', '(');

    const inner = parseTypeAnnotation(stream);

    if (stream.check('punctuation', ',')) {
        throw stream.error('A parenthesized type must contain a single type.', 'parse-invalid-type');
    }

    stream.expect('punctuation', ')');

    return inner;
}

function parsePrimaryType(stream: TokenStream): TypeAnnotation {
    if (stream.check('keyword', 'function')) {
        throw stream.error(`Use "${FUNCTION_TYPE}" for function types. "function" is a keyword and cannot name a type.`, 'parse-invalid-type');
    }

    if (stream.check('identifier', FUNCTION_TYPE)) {
        return parseFunctionType(stream);
    }

    return stream.check('punctuation', '(') ? parseGroupedType(stream) : parseTypeName(stream);
}

function parsePostfixType(stream: TokenStream): TypeAnnotation {
    let annotation = parsePrimaryType(stream);

    for (;;) {
        if (stream.check('punctuation', '[') && stream.checkAhead(1, 'punctuation', ']')) {
            const position = stream.current().position;

            stream.next();
            stream.next();

            annotation = { kind: 'type-array', element: annotation, position };

            continue;
        }

        if (stream.check('operator', '?')) {
            const position = stream.next().position;

            annotation = { kind: 'type-optional', element: annotation, position };

            continue;
        }

        return annotation;
    }
}

export function parseTypeAnnotation(stream: TokenStream): TypeAnnotation {
    const first = parsePostfixType(stream);

    if (!stream.check('operator', '|')) {
        return first;
    }

    const options: TypeAnnotation[] = [first];

    while (stream.match('operator', '|')) {
        options.push(parsePostfixType(stream));
    }

    return { kind: 'type-union', options, position: first.position };
}

export function parseOptionalAnnotation(stream: TokenStream): TypeAnnotation | null {
    if (!stream.match('punctuation', ':')) {
        return null;
    }

    return parseTypeAnnotation(stream);
}
