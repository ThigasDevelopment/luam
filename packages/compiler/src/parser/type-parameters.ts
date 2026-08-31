import type { TypeAnnotation } from './ast';
import { ParserError, type TokenStream } from './token-stream';
import { parseTypeAnnotation } from './type-annotation';

export interface TypeParameterList {
    names: string[];
    constraints: (TypeAnnotation | null)[];
}

export function emptyTypeParameters(): TypeParameterList {
    return { names: [], constraints: [] };
}

export function parseTypeParameters(stream: TokenStream): TypeParameterList {
    const list = emptyTypeParameters();

    if (!stream.check('operator', '<')) {
        return list;
    }

    const checkpoint = stream.checkpoint();

    stream.next();

    do {
        list.names.push(stream.expect('identifier').value);
        list.constraints.push(stream.match('keyword', 'extends') ? parseTypeAnnotation(stream) : null);
    } while (stream.match('punctuation', ','));

    stream.expect('operator', '>');
    stream.eraseFrom(checkpoint);

    return list;
}

export function parseTypeArguments(stream: TokenStream): TypeAnnotation[] {
    const args: TypeAnnotation[] = [];

    if (!stream.check('operator', '<')) {
        return args;
    }

    const checkpoint = stream.checkpoint();

    stream.next();

    do {
        args.push(parseTypeAnnotation(stream));
    } while (stream.match('punctuation', ','));

    stream.expect('operator', '>');
    stream.eraseFrom(checkpoint);

    return args;
}

export function parseCallTypeArguments(stream: TokenStream): TypeAnnotation[] {
    if (!stream.check('operator', '<')) {
        return [];
    }

    const point = stream.speculate();

    try {
        const args = parseTypeArguments(stream);

        if (args.length > 0 && stream.check('punctuation', '(')) {
            return args;
        }
    } catch (error) {
        if (!(error instanceof ParserError)) {
            throw error;
        }
    }

    stream.rewind(point);

    return [];
}
