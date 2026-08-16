import type { SymbolDeclaration } from '@lsp/symbols/symbol';

function previousLine(text: string, end: number): { start: number; value: string } | null {
    if (end === 0) {
        return null;
    }

    const lineEnd = text[end - 1] === '\n' ? end - 1 : end;
    const contentEnd = text[lineEnd - 1] === '\r' ? lineEnd - 1 : lineEnd;
    const newline = text.lastIndexOf('\n', contentEnd - 1);
    const start = newline + 1;

    return { start, value: text.slice(start, contentEnd) };
}

export function declarationDocumentation(text: string, declaration: SymbolDeclaration): string {
    if ((declaration.kind !== 'function' && declaration.kind !== 'method') || declaration.isSynthetic) {
        return '';
    }

    const currentLine = text.lastIndexOf('\n', declaration.position.offset - 1) + 1;
    const lines: string[] = [];
    let end = currentLine;

    while (end > 0) {
        const line = previousLine(text, end);

        if (line === null) {
            break;
        }

        const match = /^\s*#(?![!*])\s?(.*)$/.exec(line.value);

        if (match === null) {
            break;
        }

        lines.unshift(match[1] ?? '');
        end = line.start;
    }

    return lines.join('\n').trim();
}
