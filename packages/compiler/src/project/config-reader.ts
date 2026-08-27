export interface ExtractProblem {
    line: number;
    column: number;
    message: string;
}

export class Reader {
    private readonly text: string;

    private index = 0;

    readonly problems: ExtractProblem[] = [];

    constructor(text: string) {
        this.text = text;
    }

    private position(): { line: number; column: number } {
        const before = this.text.slice(0, this.index);
        const lines = before.split('\n');

        return { line: lines.length, column: (lines[lines.length - 1]?.length ?? 0) + 1 };
    }

    fail(message: string): null {
        const { line, column } = this.position();

        this.problems.push({ line, column, message });

        return null;
    }

    private skipComment(): boolean {
        if (!this.text.startsWith('--', this.index)) {
            return false;
        }

        if (this.text.startsWith('--[[', this.index)) {
            const end = this.text.indexOf(']]', this.index + 4);

            this.index = end === -1 ? this.text.length : end + 2;

            return true;
        }

        const end = this.text.indexOf('\n', this.index);

        this.index = end === -1 ? this.text.length : end + 1;

        return true;
    }

    skip(): void {
        for (;;) {
            const before = this.index;

            while (this.index < this.text.length && /\s/.test(this.text[this.index] ?? '')) {
                this.index += 1;
            }

            this.skipComment();

            if (this.index === before) {
                return;
            }
        }
    }

    done(): boolean {
        this.skip();

        return this.index >= this.text.length;
    }

    peek(): string {
        this.skip();

        return this.text[this.index] ?? '';
    }

    take(value: string): boolean {
        this.skip();

        if (!this.text.startsWith(value, this.index)) {
            return false;
        }

        this.index += value.length;

        return true;
    }

    word(): string | null {
        this.skip();

        const match = /^[A-Za-z_][A-Za-z0-9_]*/.exec(this.text.slice(this.index));

        if (match === null) {
            return null;
        }

        this.index += match[0].length;

        return match[0];
    }

    literal(): string | null {
        this.skip();

        const rest = this.text.slice(this.index);
        const string = /^(\[\[[\s\S]*?\]\]|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*")/.exec(rest);

        if (string !== null) {
            this.index += string[0].length;

            return 'string';
        }

        const number = /^-?(?:0[xX][0-9a-fA-F]+|\d+\.?\d*(?:[eE][-+]?\d+)?|\.\d+)/.exec(rest);

        if (number !== null) {
            this.index += number[0].length;

            return 'number';
        }

        const word = /^(true|false|nil)\b/.exec(rest);

        if (word === null) {
            return null;
        }

        this.index += word[0].length;

        return word[0] === 'nil' ? 'nil' : 'boolean';
    }

    key(): string | null {
        this.skip();

        if (this.take('[')) {
            const rest = this.text.slice(this.index);
            const quoted = /^'([A-Za-z_][A-Za-z0-9_]*)'|^"([A-Za-z_][A-Za-z0-9_]*)"/.exec(rest);

            if (quoted === null) {
                return null;
            }

            this.index += quoted[0].length;

            return this.take(']') && this.take('=') ? (quoted[1] ?? quoted[2] ?? null) : null;
        }

        const start = this.index;
        const word = this.word();

        if (word === null || !this.take('=') || this.peek() === '=') {
            this.index = start;

            return null;
        }

        return word;
    }
}

