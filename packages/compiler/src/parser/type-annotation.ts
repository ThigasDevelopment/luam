import type { TypeAnnotation, TypeObjectMember } from './ast';
import type { TokenStream } from './token-stream';

const TYPE_KEYWORDS: ReadonlySet<string> = new Set(['nil', 'true', 'false']);

export const FUNCTION_TYPE = 'fun';

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
    const position = stream.expect('punctuation', '(').position;

    const inner = parseTypeAnnotation(stream);

    if (!stream.match('punctuation', ',')) {
        stream.expect('punctuation', ')');

        return inner;
    }

    const elements = [inner];

    do {
        elements.push(parseTypeAnnotation(stream));
    } while (stream.match('punctuation', ','));

    stream.expect('punctuation', ')');

    return { kind: 'type-tuple', elements, position };
}

function parseObjectMember(stream: TokenStream): TypeObjectMember {
    const token = stream.expectName();
    const annotation = parseNamedAnnotation(stream, 'field');

    if (annotation === null) {
        throw stream.error(`Key "${token.value}" of an object type requires a type annotation.`, 'parse-invalid-type');
    }

    return { name: token.value, annotation, position: token.position };
}

function parseObjectType(stream: TokenStream): TypeAnnotation {
    const position = stream.expect('punctuation', '{').position;
    const members: TypeObjectMember[] = [];
    const declared = new Set<string>();

    while (!stream.check('punctuation', '}') && !stream.isEof()) {
        if (stream.match('punctuation', ';') || stream.match('punctuation', ',')) {
            continue;
        }

        const member = parseObjectMember(stream);

        if (declared.has(member.name)) {
            stream.report('parse-duplicate-key', `Object type key "${member.name}" is declared more than once.`, member.position);

            continue;
        }

        declared.add(member.name);
        members.push(member);
    }

    stream.expect('punctuation', '}');

    return { kind: 'type-object', members, position };
}

function parsePrimaryType(stream: TokenStream): TypeAnnotation {
    if (stream.check('string')) {
        const token = stream.next();

        return { kind: 'type-string-literal', value: token.value, position: token.position };
    }

    if (stream.check('keyword', 'function')) {
        throw stream.error(`Use "${FUNCTION_TYPE}" for function types. "function" is a keyword and cannot name a type.`, 'parse-invalid-type');
    }

    if (stream.check('identifier', FUNCTION_TYPE)) {
        return parseFunctionType(stream);
    }

    if (stream.check('punctuation', '{')) {
        return parseObjectType(stream);
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

export type NamedDeclaration = 'field' | 'local' | 'parameter';

export const OPTIONAL_MARKER = '?';

const DECLARATION_LABEL: Readonly<Record<NamedDeclaration, string>> = { field: 'fields', local: 'locals', parameter: 'parameters' };

export function parseNamedAnnotation(stream: TokenStream, declaration: NamedDeclaration): TypeAnnotation | null {
    const optional = stream.check('operator', '?') ? stream.next() : null;
    const annotation = parseOptionalAnnotation(stream);
    const label = DECLARATION_LABEL[declaration];

    if (optional !== null && annotation === null) {
        throw stream.error(`An optional marker on a ${declaration} must be followed by a type annotation.`, 'parse-invalid-optional');
    }

    if (optional === null && annotation?.kind === 'type-optional') {
        stream.report('parse-optional-position', `Write optional ${label} as "name?: Type", not "name: Type?".`, annotation.position);
    }

    return optional === null || annotation === null ? annotation : { kind: 'type-optional', element: annotation, position: optional.position };
}
