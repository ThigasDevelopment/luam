import { hybridSourceMappings, type HybridSourceEdit } from './hybrid-source-map';
import { containsJump } from './loops';
import { loopBody, nestedBlocks } from './preserve-blocks';
import { canonicalEdit } from './preserve-canonical';
import { blankSpan, commentReplacement, longComment } from './preserve-comments';
import { classEdits, enumEdits } from './preserve-declarations';
import { isPreservableStatement } from './preserve-guards';
import type { PreserveInput } from './preserve-input';
import { loopEdits } from './preserve-loops';

import type { SourceLineMapping } from '@compiler/emitter/source-map';
import type { Statement } from '@compiler/parser/ast';
import type { ErasureSpan } from '@compiler/parser/source-metadata';

interface Collector {
    input: PreserveInput;
    edits: HybridSourceEdit[];
    lowered: Set<Statement>;
    failed: boolean;
}

interface Surgery {
    edits: HybridSourceEdit[];
    wrapsBody: boolean;
}

function surgery(collector: Collector, statement: Statement): Surgery | null {
    const { input } = collector;
    const span = input.spans.get(statement);

    if (!input.development || span === undefined) {
        return null;
    }

    if (statement.kind === 'enum-declaration') {
        const edits = input.references.has(statement.name) ? enumEdits(input.source, statement) : null;

        return edits === null ? null : { edits, wrapsBody: false };
    }

    if (statement.kind === 'class-declaration') {
        const edits = classEdits(input, statement, { span, members: input.spans });

        return edits === null ? null : { edits, wrapsBody: false };
    }

    if (loopBody(statement) === null || !isPreservableStatement(statement, input.types)) {
        return null;
    }

    const edits = loopEdits(input, statement);

    return edits === null ? null : { edits, wrapsBody: true };
}

function keepsScaffolding(statement: Statement): boolean {
    const body = loopBody(statement);

    return body === null || !containsJump(body, 'continue-statement');
}

function descend(collector: Collector, statement: Statement, blockWrap: boolean, bodyWrap: boolean): void {
    for (const block of nestedBlocks(statement)) {
        walk(collector, block, blockWrap);
    }

    const body = loopBody(statement);

    if (body !== null) {
        walk(collector, body, bodyWrap);
    }
}

function visit(collector: Collector, statement: Statement, wrapped: boolean): void {
    if (wrapped && (statement.kind === 'continue-statement' || statement.kind === 'break-statement')) {
        return;
    }

    const surgical = surgery(collector, statement);

    if (surgical !== null) {
        collector.edits.push(...surgical.edits);
        descend(collector, statement, false, surgical.wrapsBody);

        return;
    }

    if (isPreservableStatement(statement, collector.input.types) && keepsScaffolding(statement)) {
        const inherited = statement.kind === 'do-statement' || statement.kind === 'if-statement' ? wrapped : false;

        descend(collector, statement, inherited, false);

        return;
    }

    const span = collector.input.spans.get(statement);
    const edit = span === undefined ? null : canonicalEdit(collector.input, statement, span);

    if (edit === null) {
        collector.failed = true;

        return;
    }

    collector.edits.push(edit);
    collector.lowered.add(statement);
}

function walk(collector: Collector, statements: readonly Statement[], wrapped: boolean): void {
    for (const statement of statements) {
        if (collector.failed) {
            return;
        }

        visit(collector, statement, wrapped);
    }
}

function erasureReplacement(input: PreserveInput, span: ErasureSpan): string {
    const text = input.source.slice(span.start, span.end);

    return input.development && span.kind === 'declaration' ? longComment(text) : blankSpan(text);
}

function byPosition(left: HybridSourceEdit, right: HybridSourceEdit): number {
    if (left.start !== right.start) {
        return left.start - right.start;
    }

    const empty = Number(left.end === left.start) - Number(right.end === right.start);

    return empty !== 0 ? -empty : right.end - left.end;
}

function sourceEdits(input: PreserveInput, lowered: readonly HybridSourceEdit[]): HybridSourceEdit[] | null {
    const edits: HybridSourceEdit[] = [
        ...input.erasures.map((span) => ({ start: span.start, end: span.end, replacement: erasureReplacement(input, span) })),
        ...input.comments.map((comment) => ({
            start: comment.position.offset,
            end: comment.end.offset,
            replacement: commentReplacement(input.source, comment),
        })),
        ...lowered,
    ].sort(byPosition);
    const normalized: HybridSourceEdit[] = [];

    for (const edit of edits) {
        const previous = normalized[normalized.length - 1];

        if (previous !== undefined && edit.start < previous.end) {
            if (edit.end <= previous.end) {
                continue;
            }

            return null;
        }

        normalized.push(edit);
    }

    return normalized;
}

function applySourceEdits(source: string, edits: readonly HybridSourceEdit[]): string {
    let output = '';
    let offset = 0;

    for (const edit of edits) {
        output += source.slice(offset, edit.start);
        output += edit.replacement;
        offset = edit.end;
    }

    return output + source.slice(offset);
}

function withoutTrailingBlankLines(code: string): string {
    const body = code.replace(/\s+$/, '');

    if (body === '') {
        return '';
    }

    const [ending] = /\r?\n$/.exec(code) ?? [''];

    return `${body}${ending}`;
}

export function emitPreservingSource(input: PreserveInput): { code: string; lines: SourceLineMapping[] } | null {
    const collector: Collector = { input, edits: [], lowered: new Set<Statement>(), failed: false };

    walk(collector, input.program.body, false);

    if (collector.failed) {
        return null;
    }

    const edits = sourceEdits(input, collector.edits);

    if (edits === null) {
        return null;
    }

    const code = withoutTrailingBlankLines(applySourceEdits(input.source, edits));

    return { code, lines: hybridSourceMappings(input.source, input.program, edits, collector.lowered) };
}
