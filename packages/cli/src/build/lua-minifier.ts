import { scanLua } from '@cli/build/lua-tokens';

import type { LuaToken } from '@cli/build/lua-tokens';

const MERGING_PAIRS: ReadonlySet<string> = new Set(['--', '..', '==', '~=', '<=', '>=', '[[', '[=']);

function isWord(token: LuaToken): boolean {
    return token.kind === 'name' || token.kind === 'number';
}

export function needsSeparator(previous: LuaToken, next: LuaToken): boolean {
    if (isWord(previous) && isWord(next)) {
        return true;
    }

    if (previous.kind === 'number' && next.text.startsWith('.')) {
        return true;
    }

    return MERGING_PAIRS.has(`${previous.text.slice(-1)}${next.text.slice(0, 1)}`);
}

export function minifyLua(source: string, file: string): string {
    const tokens = scanLua(source, file);
    const parts: string[] = [];
    let previous: LuaToken | null = null;

    for (const token of tokens) {
        if (previous !== null && needsSeparator(previous, token)) {
            parts.push(' ');
        }

        parts.push(token.text);
        previous = token;
    }

    return parts.join('');
}

export function minifyLuaFiles(files: ReadonlyMap<string, string>): Map<string, string> {
    const minified = new Map<string, string>();

    for (const [path, content] of files) {
        minified.set(path, path.endsWith('.lua') ? minifyLua(content, path) : content);
    }

    return minified;
}
