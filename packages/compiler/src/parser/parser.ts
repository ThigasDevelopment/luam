import { createPosition, sortDiagnostics, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import { scan } from '@compiler/lexer/lexer';
import type { Comment } from '@compiler/lexer/comment-scanner';
import type { Token } from '@compiler/lexer/token';

import type { Program, Statement } from './ast';
import type { SourceSpan } from './source-metadata';
import { parseStatement } from './statement';
import { ParserError, TokenStream } from './token-stream';

export interface ParseResult {
    program: Program;
    tokens: Token[];
    diagnostics: Diagnostic[];
    directives: string[];
    erasures: SourceSpan[];
    hasComments: boolean;
    comments: Comment[];
    statementSpans: ReadonlyMap<Statement, SourceSpan>;
}

function synchronize(stream: TokenStream): void {
    const line = stream.current().position.line;

    stream.next();

    while (!stream.isEof() && stream.current().position.line === line) {
        stream.next();
    }
}

function parseProgram(stream: TokenStream, diagnostics: Diagnostic[], statementSpans: Map<Statement, SourceSpan>): Program {
    const body: Statement[] = [];

    while (!stream.isEof()) {
        if (stream.match('punctuation', ';')) {
            continue;
        }

        try {
            const checkpoint = stream.checkpoint();
            const statement = parseStatement(stream);

            stream.match('punctuation', ';');

            const span = stream.sourceSpanFrom(checkpoint);

            body.push(statement);

            if (span !== null) {
                statementSpans.set(statement, span);
            }
        } catch (error) {
            if (!(error instanceof ParserError)) {
                throw error;
            }

            diagnostics.push(error.diagnostic);
            synchronize(stream);
        }
    }

    return { kind: 'program', body, position: createPosition(1, 1, 0) };
}

export function parse(source: string): ParseResult {
    const lexed = scan(source);
    const diagnostics: Diagnostic[] = [...lexed.diagnostics];
    const stream = new TokenStream(lexed.tokens);
    const statementSpans = new Map<Statement, SourceSpan>();
    const program = parseProgram(stream, diagnostics, statementSpans);

    return {
        program,
        tokens: lexed.tokens,
        diagnostics: sortDiagnostics([...diagnostics, ...stream.diagnostics]),
        directives: lexed.directives,
        erasures: stream.erasures(),
        hasComments: lexed.hasComments,
        comments: lexed.comments,
        statementSpans,
    };
}
