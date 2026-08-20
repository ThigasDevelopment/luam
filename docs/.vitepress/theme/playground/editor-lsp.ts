import { type LspEdit, type LspRange } from './lsp-protocol';

export interface EditorBridge {
    complete: (offset: number) => Promise<{ label: string; kind: string; detail: string; insert: string }[]>;
    describe: (offset: number) => Promise<string | null>;
    signatureAt: (offset: number) => Promise<{ label: string; activeParameter: number } | null>;
    locate: (offset: number) => Promise<LspRange[]>;
    occurrences: (offset: number) => Promise<LspRange[]>;
    renameTo: (offset: number, name: string) => Promise<LspEdit[]>;
}

export function applyEdits(source: string, edits: readonly LspEdit[]): string {
    const lines = source.split('\n');
    const ordered = [...edits].sort((left, right) => right.range.line - left.range.line || right.range.column - left.range.column);

    for (const edit of ordered) {
        const index = edit.range.line - 1;
        const line = lines[index];

        if (line === undefined) {
            continue;
        }

        lines[index] = `${line.slice(0, edit.range.column - 1)}${edit.text}${line.slice(edit.range.endColumn - 1)}`;
    }

    return lines.join('\n');
}

export function rangeToOffset(source: string, range: LspRange): number {
    const lines = source.split('\n');

    let offset = 0;

    for (let index = 0; index < range.line - 1 && index < lines.length; index += 1) {
        offset += (lines[index] ?? '').length + 1;
    }

    return offset + range.column - 1;
}

export function highlightStyle(range: LspRange, width: number, height: number): Record<string, string> {
    return {
        left: `${(range.column - 1) * width}px`,
        top: `${(range.line - 1) * height}px`,
        width: `${Math.max(range.endColumn - range.column, 1) * width}px`,
        height: `${height}px`,
    };
}
