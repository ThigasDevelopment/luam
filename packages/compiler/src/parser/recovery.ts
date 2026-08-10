import type { ParserError, TokenStream } from './token-stream';

export function recoverInBlock(stream: TokenStream, error: ParserError): void {
    stream.diagnostics.push(error.diagnostic);

    if (stream.isEof()) {
        return;
    }

    const start = stream.current();

    while (!stream.isEof() && !stream.check('punctuation', '}') && stream.current().position.line === start.position.line) {
        stream.next();
    }

    if (!stream.isEof() && !stream.check('punctuation', '}') && stream.current().position.offset === start.position.offset) {
        stream.next();
    }
}
