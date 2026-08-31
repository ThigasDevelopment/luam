export interface CommentHit {
    line: number;
    column: number;
    kind: 'line' | 'block';
}

export interface StringHit {
    line: number;
    column: number;
    quote: '"' | "'" | '`';
    text: string;
}

export interface ScanResult {
    comments: CommentHit[];
    strings: StringHit[];
}

const REGEX_PRECEDERS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '~', '^', '<', '>']);

const REGEX_KEYWORDS = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'case', 'do', 'else', 'yield', 'await']);

function precedingWord(source: string, index: number): string {
    let end = index;

    while (end > 0 && /\s/.test(source[end - 1] ?? '')) {
        end -= 1;
    }

    let start = end;

    while (start > 0 && /[A-Za-z_$]/.test(source[start - 1] ?? '')) {
        start -= 1;
    }

    return source.slice(start, end);
}

function precedingSymbol(source: string, index: number): string {
    let at = index;

    while (at > 0 && /\s/.test(source[at - 1] ?? '')) {
        at -= 1;
    }

    return at === 0 ? '(' : (source[at - 1] ?? '(');
}

function startsRegex(source: string, index: number): boolean {
    const word = precedingWord(source, index);

    return word.length > 0 ? REGEX_KEYWORDS.has(word) : REGEX_PRECEDERS.has(precedingSymbol(source, index));
}

export function scanSource(source: string): ScanResult {
    const comments: CommentHit[] = [];
    const strings: StringHit[] = [];
    const templates: number[] = [];

    let line = 1;
    let lineStart = 0;
    let index = 0;

    const at = (position: number): CommentHit => ({ line, column: position - lineStart + 1, kind: 'line' });

    const advance = (): void => {
        if (source[index] === '\n') {
            line += 1;
            lineStart = index + 1;
        }

        index += 1;
    };

    while (index < source.length) {
        const character = source[index] ?? '';
        const next = source[index + 1] ?? '';

        if (character === '/' && next === '/') {
            comments.push({ ...at(index), kind: 'line' });

            while (index < source.length && source[index] !== '\n') {
                advance();
            }

            continue;
        }

        if (character === '/' && next === '*') {
            comments.push({ ...at(index), kind: 'block' });
            advance();
            advance();

            while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
                advance();
            }

            advance();
            advance();

            continue;
        }

        if (character === '/' && startsRegex(source, index)) {
            advance();

            let inClass = false;

            while (index < source.length && source[index] !== '\n') {
                const inner = source[index];

                if (inner === '\\') {
                    advance();
                    advance();

                    continue;
                }

                if (inner === '[') {
                    inClass = true;
                } else if (inner === ']') {
                    inClass = false;
                } else if (inner === '/' && !inClass) {
                    advance();

                    break;
                }

                advance();
            }

            continue;
        }

        if (character === '`' || character === '"' || character === "'") {
            const opened = { line, column: index - lineStart + 1 };
            const start = index;

            advance();

            while (index < source.length) {
                const inner = source[index];

                if (inner === '\\') {
                    advance();
                    advance();

                    continue;
                }

                if (character === '`' && inner === '$' && source[index + 1] === '{') {
                    templates.push(start);
                    advance();
                    advance();

                    let depth = 1;

                    while (index < source.length && depth > 0) {
                        if (source[index] === '{') {
                            depth += 1;
                        } else if (source[index] === '}') {
                            depth -= 1;
                        }

                        advance();
                    }

                    continue;
                }

                if (inner === character) {
                    advance();

                    break;
                }

                if (character !== '`' && inner === '\n') {
                    break;
                }

                advance();
            }

            strings.push({ ...opened, quote: character, text: source.slice(start, index) });

            continue;
        }

        advance();
    }

    return { comments, strings };
}
