import { createPosition, type SourcePosition } from '@compiler/diagnostics/diagnostic';

export class Cursor {
    private readonly source: string;

    private index = 0;

    private line = 1;

    private column = 1;

    constructor(source: string) {
        this.source = source;
    }

    peek(offset = 0): string {
        return this.source[this.index + offset] ?? '';
    }

    matches(text: string): boolean {
        return this.source.startsWith(text, this.index);
    }

    isEof(): boolean {
        return this.index >= this.source.length;
    }

    position(): SourcePosition {
        return createPosition(this.line, this.column, this.index);
    }

    slice(start: number, end: number): string {
        return this.source.slice(start, end);
    }

    offset(): number {
        return this.index;
    }

    advance(count = 1): string {
        let consumed = '';

        for (let step = 0; step < count && !this.isEof(); step += 1) {
            const character = this.source[this.index] as string;

            this.index += 1;
            consumed += character;

            if (character === '\n') {
                this.line += 1;
                this.column = 1;
            } else if (character !== '\r') {
                this.column += 1;
            }
        }

        return consumed;
    }
}
