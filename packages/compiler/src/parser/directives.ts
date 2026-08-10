import type { Statement } from './ast';
import { parseFunctionDeclaration } from './function-expression';
import type { TokenStream } from './token-stream';

export const EXPORT_DIRECTIVE = 'export';

const EXPORT_LOCAL_MESSAGE =
    'An exported function must be a global because MTA resolves "call" against the resource globals. Remove "local" or remove "export".';

export function isDirectiveStart(stream: TokenStream): boolean {
    if (!stream.check('identifier', EXPORT_DIRECTIVE)) {
        return false;
    }

    return stream.checkAhead(1, 'keyword', 'function') || (stream.checkAhead(1, 'keyword', 'local') && stream.checkAhead(2, 'keyword', 'function'));
}

export function parseDirective(stream: TokenStream): Statement {
    const token = stream.next();

    if (!stream.match('keyword', 'local')) {
        return parseFunctionDeclaration(stream, false, true);
    }

    stream.report('parse-export-local', EXPORT_LOCAL_MESSAGE, token.position);

    return parseFunctionDeclaration(stream, true, false);
}
