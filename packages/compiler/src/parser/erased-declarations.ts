import type { Statement } from './ast';
import type { TokenStream } from './token-stream';

const ERASED_KINDS: ReadonlySet<Statement['kind']> = new Set([
    'declare-statement',
    'event-declaration',
    'interface-declaration',
    'type-alias-statement',
]);

export function isErasedDeclaration(statement: Statement): boolean {
    return ERASED_KINDS.has(statement.kind);
}

export function absorbDeclarationTerminator(stream: TokenStream, statement: Statement): void {
    if (!isErasedDeclaration(statement) || !stream.check('punctuation', ';')) {
        return;
    }

    stream.extendDeclarationErasure(stream.current().end.offset);
}
