export interface WikiParameter {
    type: string;
    name: string;
    isOptional: boolean;
    defaultValue: string | null;
}

export interface WikiSignature {
    returns: readonly string[];
    parameters: readonly WikiParameter[];
    minimumArguments: number;
    isVariadic: boolean;
}

const WIKI_LINK = /\[\[(?:[^\]|]*\|)?([^\]|]*)\]\]/g;

const VARIADIC = /\.\.\.$/;

const INLINE_SIGNATURE = /\s*\([^()]*\)\s*$/;

function stripMarkup(value: string): string {
    return value.replace(WIKI_LINK, '$1').replace(/'''?/g, '').trim();
}

function callOf(source: string, name: string): { head: string; body: string } | null {
    const anchor = new RegExp(`(?:^|[^\\w.:])(${name})\\s*\\(`).exec(source);

    if (anchor === null || anchor.index === undefined) {
        return null;
    }

    const open = source.indexOf('(', anchor.index + anchor[0].length - 1);
    let depth = 0;

    for (let index = open; index < source.length; index += 1) {
        const character = source[index];

        depth += character === '(' ? 1 : character === ')' ? -1 : 0;

        if (depth === 0) {
            return { head: source.slice(0, source.indexOf(name, anchor.index)), body: source.slice(open + 1, index) };
        }
    }

    return null;
}

interface RawParameter {
    text: string;
    isOptional: boolean;
}

function effectiveDepth(cell: string, entering: number): number {
    let depth = entering;

    for (const character of cell) {
        if (character === '[') {
            depth += 1;
        } else if (character === ']') {
            depth -= 1;
        } else if (!/\s/.test(character)) {
            return depth;
        }
    }

    return depth;
}

function splitParameters(body: string): RawParameter[] {
    const parameters: RawParameter[] = [];
    let depth = 0;
    let brackets = 0;
    let quote: string | null = null;
    let start = 0;
    let entering = 0;

    const push = (end: number, atStart: number): void => {
        const cell = body.slice(start, end);
        const text = cell.replace(/[[\]]/g, ' ').trim();

        if (text.length > 0) {
            parameters.push({ text, isOptional: effectiveDepth(cell, atStart) > 0 });
        }
    };

    for (let index = 0; index < body.length; index += 1) {
        const character = body[index] ?? '';

        if (quote !== null) {
            quote = character === quote ? null : quote;

            continue;
        }

        if (character === '"' || character === "'") {
            quote = character;
        } else if (character === '(' || character === ')') {
            depth += character === '(' ? 1 : -1;
        } else if (character === '[' || character === ']') {
            brackets += character === '[' ? 1 : -1;
        } else if (character === ',' && depth === 0) {
            push(index, entering);
            start = index + 1;
            entering = brackets;
        }
    }

    push(body.length, entering);

    return parameters;
}

interface ReadParameter extends WikiParameter {
    isVariadic: boolean;
}

function readParameter(raw: RawParameter): ReadParameter {
    const [declaration = '', ...rest] = raw.text.split('=');
    const defaultValue = rest.length === 0 ? null : rest.join('=').trim();
    const stripped = stripMarkup(declaration).replace(INLINE_SIGNATURE, '').trim();
    const isVariadic = VARIADIC.test(stripped);
    const tokens = stripped.replace(/\s*\.\.\.$/, '').split(/\s+/).filter((token) => token.length > 0);
    const only = tokens[0] ?? '';

    if (tokens.length === 0) {
        return { type: 'var', name: '', isOptional: raw.isOptional, defaultValue, isVariadic };
    }

    if (tokens.length === 1) {
        return { type: isVariadic ? 'var' : only, name: isVariadic ? only : '', isOptional: raw.isOptional, defaultValue, isVariadic };
    }

    return { type: tokens.slice(0, -1).join(' '), name: tokens[tokens.length - 1] ?? '', isOptional: raw.isOptional, defaultValue, isVariadic };
}

function stemOf(name: string): string {
    return name.replace(/\d+$/, '');
}

function withoutVariadicTail(parsed: readonly ReadParameter[]): { positional: WikiParameter[]; isVariadic: boolean } {
    const strip = (entries: readonly ReadParameter[]): WikiParameter[] => entries.map(({ isVariadic: _unused, ...rest }) => rest);
    const marker = parsed[parsed.length - 1];

    if (marker === undefined || !marker.isVariadic) {
        return { positional: strip(parsed), isVariadic: false };
    }

    const head = marker.name.length === 0 ? parsed.slice(0, -1) : parsed;
    const carrier = head[head.length - 1];

    if (carrier === undefined) {
        return { positional: [], isVariadic: true };
    }

    const stem = stemOf(carrier.name);
    const repeats = stem.length > 0 && head.slice(0, -1).some((entry) => stemOf(entry.name) === stem);

    return { positional: strip(repeats ? head : head.slice(0, -1)), isVariadic: true };
}

export function parseParameterList(body: string): WikiSignature {
    const { positional, isVariadic } = withoutVariadicTail(splitParameters(body).map(readParameter));

    return {
        returns: [],
        parameters: positional,
        minimumArguments: positional.filter((parameter) => !parameter.isOptional && parameter.defaultValue === null).length,
        isVariadic,
    };
}

export function parseSignature(source: string, name: string): WikiSignature | null {
    const call = callOf(source.replace(/\s+/g, ' '), name);

    if (call === null) {
        return null;
    }

    const list = parseParameterList(call.body);
    const returns = stripMarkup(call.head)
        .replace(/[[\]]/g, ' ')
        .replace(/\s*([/|])\s*/g, '$1')
        .split(/[,\s]+/)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);

    return { ...list, returns };
}
