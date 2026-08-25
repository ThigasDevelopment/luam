import type { SymbolDeclaration } from '@lsp/symbols/symbol';

const DECLARATION_PREFIX = /^\s*(?!for\b)(?:[A-Za-z_]\w*\s+)*'?$/;

const DECORATOR_LINE = /^\s*@[A-Za-z_]\w*(?:\s*\(.*\))?\s*$/;

const COMMENT_LINE = /^\s*#(?![!*])\s?(.*)$/;

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

function startsItsOwnLine(text: string, declaration: SymbolDeclaration): boolean {
    const lineStart = text.lastIndexOf('\n', declaration.position.offset - 1) + 1;

    return DECLARATION_PREFIX.test(text.slice(lineStart, declaration.position.offset));
}

function skipDecorators(text: string, from: number): number {
    let end = from;

    while (end > 0) {
        const line = previousLine(text, end);

        if (line === null || !DECORATOR_LINE.test(line.value)) {
            return end;
        }

        end = line.start;
    }

    return end;
}

export function declarationDocumentation(text: string, declaration: SymbolDeclaration): string {
    if (declaration.isSynthetic || !startsItsOwnLine(text, declaration)) {
        return '';
    }

    const lines: string[] = [];
    let end = skipDecorators(text, text.lastIndexOf('\n', declaration.position.offset - 1) + 1);

    while (end > 0) {
        const line = previousLine(text, end);

        if (line === null) {
            break;
        }

        const match = COMMENT_LINE.exec(line.value);

        if (match === null) {
            break;
        }

        lines.unshift(match[1] ?? '');
        end = line.start;
    }

    return lines.join('\n').trim();
}
