import { parse } from '@compiler/parser/parser';

import { indentOf } from './format-indent';
import { linesOf, piecesOf, type Piece } from './format-pieces';
import { renderLine } from './format-spacing';

export const INDENT = '    ';

export interface RangeEdit {
    text: string;
    from: number;
    to: number;
}

interface Rendered {
    text: string;
    line: number;
    endLine: number;
}

interface Formatted {
    pieces: Piece[];
    rendered: Rendered[];
    newline: string;
}

function signature(pieces: readonly Piece[]): string {
    return JSON.stringify(pieces.map((piece) => [piece.kind, piece.value]));
}

function newlineOf(source: string): string {
    return source.includes('\r\n') ? '\r\n' : '\n';
}

function render(source: string): Formatted | null {
    const parsed = parse(source);

    if (parsed.diagnostics.length > 0) {
        return null;
    }

    const pieces = piecesOf(source, parsed.tokens, parsed.comments, parsed.erasures);
    const rendered: Rendered[] = [];

    let depth = 0;

    for (const line of linesOf(pieces)) {
        const { indent, next } = indentOf(depth, line.pieces);
        const first = line.pieces[0];
        const last = line.pieces[line.pieces.length - 1];

        if (line.blankBefore && rendered.length > 0) {
            rendered.push({ text: '', line: 0, endLine: 0 });
        }

        rendered.push({ text: `${INDENT.repeat(indent)}${renderLine(line.pieces)}`, line: first?.line ?? 0, endLine: last?.endLine ?? 0 });
        depth = next;
    }

    return { pieces, rendered, newline: newlineOf(source) };
}

function assemble(rendered: readonly Rendered[], newline: string): string {
    return rendered.length === 0 ? '' : `${rendered.map((entry) => entry.text).join(newline)}${newline}`;
}

function verified(formatted: Formatted): string | null {
    const text = assemble(formatted.rendered, formatted.newline);
    const round = render(text);

    if (round === null || signature(round.pieces) !== signature(formatted.pieces)) {
        return null;
    }

    return text;
}

export function formatSource(source: string): string | null {
    const formatted = render(source);

    return formatted === null ? null : verified(formatted);
}

export function formatRange(source: string, startLine: number, endLine: number): RangeEdit | null {
    const formatted = render(source);

    if (formatted === null || verified(formatted) === null) {
        return null;
    }

    const selected = [...formatted.rendered.entries()].filter(([, entry]) => entry.line > 0 && entry.endLine >= startLine && entry.line <= endLine);
    const first = selected[0];
    const last = selected[selected.length - 1];

    if (first === undefined || last === undefined) {
        return null;
    }

    const slice = formatted.rendered.slice(first[0], last[0] + 1);

    return { text: `${slice.map((entry) => entry.text).join(formatted.newline)}${formatted.newline}`, from: first[1].line, to: last[1].endLine };
}
