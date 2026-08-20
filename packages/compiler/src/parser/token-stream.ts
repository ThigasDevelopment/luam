import { createDiagnostic, type Diagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { isLuamKeyword, type Token, type TokenKind } from '@compiler/lexer/token';

import type { SourceSpan } from './source-metadata';

export class ParserError extends Error {
    readonly diagnostic: Diagnostic;

    constructor(diagnostic: Diagnostic) {
        super(diagnostic.message);

        this.name = 'ParserError';
        this.diagnostic = diagnostic;
    }
}

export class TokenStream {
    readonly diagnostics: Diagnostic[] = [];

    private readonly tokens: readonly Token[];

    private index = 0;

    private readonly erased: SourceSpan[] = [];

    constructor(tokens: readonly Token[]) {
        this.tokens = tokens;
    }

    peek(offset = 0): Token {
        const token = this.tokens[Math.min(this.index + offset, this.tokens.length - 1)];

        return token as Token;
    }

    current(): Token {
        return this.peek();
    }

    isEof(): boolean {
        return this.current().kind === 'eof';
    }

    next(): Token {
        const token = this.current();

        if (!this.isEof()) {
            this.index += 1;
        }

        return token;
    }

    checkpoint(): number {
        return this.index;
    }

    eraseFrom(checkpoint: number): void {
        const first = this.tokens[checkpoint];
        const last = this.tokens[this.index - 1];

        if (first !== undefined && last !== undefined && first.kind !== 'eof') {
            this.erased.push({ start: first.position.offset, end: last.end.offset });
        }
    }

    eraseToCurrent(checkpoint: number): void {
        const first = this.tokens[checkpoint];

        if (first !== undefined && first.kind !== 'eof') {
            this.erased.push({ start: first.position.offset, end: this.current().position.offset });
        }
    }

    erasures(): SourceSpan[] {
        return [...this.erased];
    }

    sourceSpanFrom(checkpoint: number): SourceSpan | null {
        const first = this.tokens[checkpoint];
        const last = this.tokens[this.index - 1];

        return first === undefined || last === undefined || first.kind === 'eof' ? null : { start: first.position.offset, end: last.end.offset };
    }

    check(kind: TokenKind, value?: string): boolean {
        const token = this.current();

        return token.kind === kind && (value === undefined || token.value === value);
    }

    checkAhead(offset: number, kind: TokenKind, value?: string): boolean {
        const token = this.peek(offset);

        return token.kind === kind && (value === undefined || token.value === value);
    }

    match(kind: TokenKind, value?: string): boolean {
        if (!this.check(kind, value)) {
            return false;
        }

        this.next();

        return true;
    }

    expect(kind: TokenKind, value?: string): Token {
        if (this.check(kind, value)) {
            return this.next();
        }

        const expected = value === undefined ? kind : `"${value}"`;

        throw this.error(`Expected ${expected} but found "${this.describeCurrent()}".`, 'parse-unexpected-token');
    }

    checkName(offset = 0): boolean {
        const token = this.peek(offset);

        return token.kind === 'identifier' || (token.kind === 'keyword' && isLuamKeyword(token.value));
    }

    expectName(): Token {
        if (this.checkName()) {
            return this.next();
        }

        throw this.error(`Expected a name but found "${this.describeCurrent()}".`, 'parse-unexpected-token');
    }

    describeCurrent(): string {
        const token = this.current();

        return token.kind === 'eof' ? '<end of file>' : token.value;
    }

    error(message: string, code = 'parse-error'): ParserError {
        const token = this.current();

        return new ParserError(createDiagnostic('parser', code, message, token.position, 'error', token.end));
    }

    report(code: string, message: string, position: SourcePosition): void {
        this.diagnostics.push(createDiagnostic('parser', code, message, position));
    }
}
