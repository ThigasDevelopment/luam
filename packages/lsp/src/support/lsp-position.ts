import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Position, Range } from 'vscode-languageserver';

export function toLspPosition(position: SourcePosition): Position {
    return { line: Math.max(position.line - 1, 0), character: Math.max(position.column - 1, 0) };
}

export function toRange(position: SourcePosition, length: number): Range {
    const start = toLspPosition(position);

    return { start, end: { line: start.line, character: start.character + length } };
}

export function toWordRange(position: SourcePosition, name: string): Range {
    return toRange(position, name.length);
}
