import { parse } from '@compiler/parser/parser';

import { indentOf } from './format-indent';
import { indentUnit, newlineOf, resolveFormatOptions, type FormatOptions } from './format-options';
import { linesOf, piecesOf, type Piece } from './format-pieces';
import { renderLine } from './format-spacing';

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

function render(source: string, options: FormatOptions): Formatted | null {
    const parsed = parse(source);

    if (parsed.diagnostics.length > 0) {
        return null;
    }

    const pieces = piecesOf(source, parsed.tokens, parsed.comments, parsed.erasures);
    const rendered: Rendered[] = [];
    const unit = indentUnit(options);

    let depth = 0;

    for (const line of linesOf(pieces)) {
        const { indent, next } = indentOf(depth, line.pieces);
        const first = line.pieces[0];
        const last = line.pieces[line.pieces.length - 1];
        const blanks = rendered.length === 0 ? 0 : Math.min(line.blankLines, options.maxBlankLines);

        for (let count = 0; count < blanks; count += 1) {
            rendered.push({ text: '', line: 0, endLine: 0 });
        }

        rendered.push({ text: `${unit.repeat(indent)}${renderLine(line.pieces, options)}`, line: first?.line ?? 0, endLine: last?.endLine ?? 0 });
        depth = next;
    }

    return { pieces, rendered, newline: newlineOf(source, options) };
}

function assemble(rendered: readonly Rendered[], newline: string): string {
    return rendered.length === 0 ? '' : `${rendered.map((entry) => entry.text).join(newline)}${newline}`;
}

function verified(formatted: Formatted, options: FormatOptions): string | null {
    const text = assemble(formatted.rendered, formatted.newline);
    const round = render(text, options);

    if (round === null || signature(round.pieces) !== signature(formatted.pieces)) {
        return null;
    }

    return text;
}

export function formatSource(source: string, options: Partial<FormatOptions> = {}): string | null {
    const resolved = resolveFormatOptions(options);
    const formatted = render(source, resolved);

    return formatted === null ? null : verified(formatted, resolved);
}

export function formatRange(source: string, startLine: number, endLine: number, options: Partial<FormatOptions> = {}): RangeEdit | null {
    const resolved = resolveFormatOptions(options);
    const formatted = render(source, resolved);

    if (formatted === null || verified(formatted, resolved) === null) {
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
