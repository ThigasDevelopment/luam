import type { ParserError, TokenStream } from './token-stream';

export const BRACE_TERMINATORS: ReadonlySet<string> = new Set(['}']);

function isTerminator(stream: TokenStream, terminators: ReadonlySet<string>): boolean {
    const token = stream.current();

    if (token.kind !== 'punctuation' && token.kind !== 'keyword') {
        return false;
    }

    return terminators.has(token.value);
}

export function recoverInBlock(stream: TokenStream, error: ParserError, terminators: ReadonlySet<string> = BRACE_TERMINATORS): void {
    stream.diagnostics.push(error.diagnostic);

    if (stream.isEof()) {
        return;
    }

    const start = stream.current();

    while (!stream.isEof() && !isTerminator(stream, terminators) && stream.current().position.line === start.position.line) {
        stream.next();
    }

    if (!stream.isEof() && !isTerminator(stream, terminators) && stream.current().position.offset === start.position.offset) {
        stream.next();
    }
}
