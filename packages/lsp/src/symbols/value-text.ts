import { escapeStringLiteral } from '@compiler/emitter/escape';
import type { Expression } from '@compiler/parser/ast';

const INLINE_LIMIT = 48;

const NAMED_KINDS: ReadonlySet<Expression['kind']> = new Set<Expression['kind']>(['identifier', 'member-expression', 'call-expression', 'new-expression']);

function literalText(expression: Expression): string | null {
    if (expression.kind === 'number-literal') {
        return expression.raw;
    }

    if (expression.kind === 'string-literal') {
        return `'${escapeStringLiteral(expression.value)}'`;
    }

    if (expression.kind === 'boolean-literal') {
        return String(expression.value);
    }

    return expression.kind === 'nil-literal' ? 'nil' : null;
}

function startOffset(expression: Expression): number {
    if (expression.kind === 'call-expression') {
        return startOffset(expression.callee);
    }

    if (expression.kind === 'member-expression') {
        return startOffset(expression.object);
    }

    return expression.position.offset;
}

function lineSlice(text: string, start: number): string | null {
    if (start < 0 || start >= text.length) {
        return null;
    }

    const lineEnd = text.indexOf('\n', start);
    const raw = text.slice(start, lineEnd === -1 ? text.length : lineEnd);
    const comment = raw.search(/#(?=\s|!|\*|$)/);
    const slice = (comment === -1 ? raw : raw.slice(0, comment)).trim();

    return slice.length === 0 || slice.length > INLINE_LIMIT ? null : slice;
}

export function valueText(text: string, expression: Expression | undefined, allowSource: boolean): string | null {
    if (expression === undefined) {
        return null;
    }

    const literal = literalText(expression);

    if (literal !== null) {
        return literal;
    }

    return allowSource && NAMED_KINDS.has(expression.kind) ? lineSlice(text, startOffset(expression)) : null;
}

export function valueBytes(expression: Expression | undefined): number | null {
    return expression?.kind === 'string-literal' ? new TextEncoder().encode(expression.value).length : null;
}
