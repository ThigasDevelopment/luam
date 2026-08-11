export type LuaTokenKind = 'name' | 'number' | 'string' | 'operator';

export interface LuaToken {
    kind: LuaTokenKind;
    text: string;
}

const WHITESPACE: ReadonlySet<string> = new Set([' ', '\t', '\n', '\r', '\v', '\f']);

const OPERATORS_3: readonly string[] = ['...'];

const OPERATORS_2: readonly string[] = ['==', '~=', '<=', '>=', '..'];

const OPERATORS_1 = '+-*/%^#<>=(){}[];:,.';

function isDigit(char: string): boolean {
    return char >= '0' && char <= '9';
}

function isHexDigit(char: string): boolean {
    return isDigit(char) || (char >= 'a' && char <= 'f') || (char >= 'A' && char <= 'F');
}

function isNameStart(char: string): boolean {
    return char === '_' || (char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z');
}

function isNamePart(char: string): boolean {
    return isNameStart(char) || isDigit(char);
}

export class LuaScanError extends Error {
    readonly file: string;
    readonly line: number;

    constructor(file: string, line: number, detail: string) {
        super(`"${file}" is not valid Lua 5.1 at line ${line}: ${detail}`);
        this.name = 'LuaScanError';
        this.file = file;
        this.line = line;
    }
}

function lineAt(source: string, index: number): number {
    let line = 1;

    for (let position = 0; position < index && position < source.length; position += 1) {
        if (source[position] === '\n') {
            line += 1;
        }
    }

    return line;
}

function longBracketLevel(source: string, start: number): number | null {
    if (source[start] !== '[') {
        return null;
    }

    let index = start + 1;

    while (source[index] === '=') {
        index += 1;
    }

    return source[index] === '[' ? index - start - 1 : null;
}

function readLongBracket(source: string, start: number, level: number, file: string): number {
    const closing = `]${'='.repeat(level)}]`;
    const end = source.indexOf(closing, start + level + 2);

    if (end === -1) {
        throw new LuaScanError(file, lineAt(source, start), 'a long bracket is never closed');
    }

    return end + closing.length;
}

function readShortString(source: string, start: number, file: string): number {
    const quote = source[start];
    let index = start + 1;

    while (index < source.length) {
        const char = source[index];

        if (char === '\\') {
            index += 2;

            continue;
        }

        if (char === quote) {
            return index + 1;
        }

        if (char === '\n') {
            break;
        }

        index += 1;
    }

    throw new LuaScanError(file, lineAt(source, start), 'a string literal is never closed');
}

function readNumber(source: string, start: number): number {
    let index = start;

    if (source[index] === '0' && (source[index + 1] === 'x' || source[index + 1] === 'X')) {
        index += 2;

        while (index < source.length && isHexDigit(source[index] ?? '')) {
            index += 1;
        }

        return index;
    }

    while (index < source.length && (isDigit(source[index] ?? '') || source[index] === '.')) {
        index += 1;
    }

    if (source[index] !== 'e' && source[index] !== 'E') {
        return index;
    }

    const exponent = source[index + 1] === '+' || source[index + 1] === '-' ? index + 2 : index + 1;

    if (!isDigit(source[exponent] ?? '')) {
        return index;
    }

    index = exponent;

    while (index < source.length && isDigit(source[index] ?? '')) {
        index += 1;
    }

    return index;
}

function readOperator(source: string, start: number, file: string): number {
    for (const operator of OPERATORS_3) {
        if (source.startsWith(operator, start)) {
            return start + operator.length;
        }
    }

    for (const operator of OPERATORS_2) {
        if (source.startsWith(operator, start)) {
            return start + operator.length;
        }
    }

    const char = source[start] ?? '';

    if (!OPERATORS_1.includes(char)) {
        throw new LuaScanError(file, lineAt(source, start), `"${char}" cannot start a token`);
    }

    return start + 1;
}

export function scanLua(source: string, file: string): LuaToken[] {
    const tokens: LuaToken[] = [];
    let index = 0;

    while (index < source.length) {
        const char = source[index] ?? '';

        if (WHITESPACE.has(char)) {
            index += 1;

            continue;
        }

        if (source.startsWith('--', index)) {
            const level = longBracketLevel(source, index + 2);
            const end = level === null ? source.indexOf('\n', index + 2) : readLongBracket(source, index + 2, level, file);

            index = level === null && end === -1 ? source.length : end;

            continue;
        }

        if (char === '"' || char === "'") {
            const end = readShortString(source, index, file);

            tokens.push({ kind: 'string', text: source.slice(index, end) });
            index = end;

            continue;
        }

        const level = longBracketLevel(source, index);

        if (level !== null) {
            const end = readLongBracket(source, index, level, file);

            tokens.push({ kind: 'string', text: source.slice(index, end) });
            index = end;

            continue;
        }

        if (isDigit(char) || (char === '.' && isDigit(source[index + 1] ?? ''))) {
            const end = readNumber(source, index);

            tokens.push({ kind: 'number', text: source.slice(index, end) });
            index = end;

            continue;
        }

        if (isNameStart(char)) {
            let end = index + 1;

            while (end < source.length && isNamePart(source[end] ?? '')) {
                end += 1;
            }

            tokens.push({ kind: 'name', text: source.slice(index, end) });
            index = end;

            continue;
        }

        const end = readOperator(source, index, file);

        tokens.push({ kind: 'operator', text: source.slice(index, end) });
        index = end;
    }

    return tokens;
}
