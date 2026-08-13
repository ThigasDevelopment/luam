export interface ManifestScope {
    path: string[];
    assigned: ReadonlySet<string>;
    pending: string | null;
    inString: boolean;
    inComment: boolean;
    stringStart: number | null;
}

interface Frame {
    field: string | null;
    assigned: Set<string>;
}

const IDENTIFIER_START = /[A-Za-z_]/;

const IDENTIFIER_PART = /[A-Za-z0-9_]/;

const QUOTES: readonly string[] = ["'", '"', '`'];

function readIdentifier(text: string, start: number): number {
    let index = start;

    while (index < text.length && IDENTIFIER_PART.test(text[index] ?? '')) {
        index += 1;
    }

    return index;
}

function skipString(text: string, start: number, quote: string): number {
    let index = start + 1;

    while (index < text.length) {
        const character = text[index];

        if (character === '\\') {
            index += 2;

            continue;
        }

        if (character === quote || character === '\n') {
            return index + 1;
        }

        index += 1;
    }

    return text.length;
}

function isCommentStart(text: string, index: number): boolean {
    const next = text[index + 1] ?? '';

    return text[index] === '#' && (next === '*' || next === '!' || next === '' || /\s/.test(next));
}

function skipComment(text: string, start: number): number {
    if (text[start + 1] === '*') {
        const close = text.indexOf('*#', start + 2);

        return close === -1 ? text.length : close + 2;
    }

    const end = text.indexOf('\n', start);

    return end === -1 ? text.length : end;
}

export function manifestScopeAt(text: string, offset: number): ManifestScope {
    const stack: Frame[] = [{ field: null, assigned: new Set() }];
    let lastName: string | null = null;
    let pending: string | null = null;
    let opener: string | null = null;
    let index = 0;

    while (index < offset) {
        const character = text[index] ?? '';

        if (isCommentStart(text, index)) {
            const end = skipComment(text, index);

            if (end >= offset) {
                return { path: framePath(stack), assigned: current(stack).assigned, pending, inString: false, inComment: true, stringStart: null };
            }

            index = end;

            continue;
        }

        if (QUOTES.includes(character)) {
            const end = skipString(text, index, character);

            if (end > offset) {
                return { path: framePath(stack), assigned: current(stack).assigned, pending, inString: true, inComment: false, stringStart: index };
            }

            lastName = null;
            index = end;

            continue;
        }

        if (IDENTIFIER_START.test(character)) {
            const end = readIdentifier(text, index);

            lastName = text.slice(index, end);
            index = end;

            continue;
        }

        if (character === '=' && text[index + 1] !== '=' && !['=', '~', '<', '>'].includes(text[index - 1] ?? '')) {
            if (lastName !== null) {
                current(stack).assigned.add(lastName);
                pending = lastName;
                opener = lastName;
                lastName = null;
            }

            index += 1;

            continue;
        }

        if (character === '{') {
            stack.push({ field: opener, assigned: new Set() });
            pending = null;
            opener = null;
            lastName = null;
        }

        if (character === '}' && stack.length > 1) {
            stack.pop();
            pending = null;
            opener = null;
            lastName = null;
        }

        if (character === ',') {
            pending = null;
            opener = null;
            lastName = null;
        }

        if (character === '\n') {
            pending = null;
            lastName = null;
        }

        index += 1;
    }

    return { path: framePath(stack), assigned: current(stack).assigned, pending, inString: false, inComment: false, stringStart: null };
}

function current(stack: readonly Frame[]): Frame {
    return stack[stack.length - 1] ?? { field: null, assigned: new Set() };
}

function framePath(stack: readonly Frame[]): string[] {
    return stack.slice(1).map((frame) => frame.field ?? '');
}
