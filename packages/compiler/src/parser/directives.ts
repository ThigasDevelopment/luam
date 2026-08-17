import type { Statement } from './ast';
import { parseFunctionDeclaration } from './function-expression';
import type { TokenStream } from './token-stream';

export const EXPORT_DIRECTIVE = 'export';

const EXPORT_LOCAL_MESSAGE =
    'An exported function must be a global because MTA resolves "call" against the resource globals. Remove "local" or remove "export".';

export function isDirectiveStart(stream: TokenStream): boolean {
    if (!stream.check('keyword', EXPORT_DIRECTIVE)) {
        return false;
    }

    const modifierOffset = stream.checkAhead(1, 'identifier', 'http') ? 1 : 0;

    return (
        stream.checkAhead(modifierOffset + 1, 'keyword', 'function') ||
        (stream.checkAhead(modifierOffset + 1, 'keyword', 'local') && stream.checkAhead(modifierOffset + 2, 'keyword', 'function'))
    );
}

export function parseDirective(stream: TokenStream): Statement {
    const checkpoint = stream.checkpoint();
    const token = stream.next();
    const isHttpExport = stream.match('identifier', 'http');

    if (!stream.match('keyword', 'local')) {
        stream.eraseToCurrent(checkpoint);

        return parseFunctionDeclaration(stream, false, true, isHttpExport);
    }

    stream.report('parse-export-local', EXPORT_LOCAL_MESSAGE, token.position);
    stream.eraseToCurrent(checkpoint);

    return parseFunctionDeclaration(stream, true);
}
