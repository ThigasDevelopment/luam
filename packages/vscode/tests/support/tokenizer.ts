import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { loadWASM, OnigScanner, OnigString } from 'vscode-oniguruma';
import { INITIAL, Registry, parseRawGrammar, type IGrammar } from 'vscode-textmate';

import { resolve } from '@theme/resolve';
import type { Mode } from '@theme/palette';

import { winningRole } from './theme-scopes';

export interface TokenRecord {
    text: string;
    scopes: string[];
    role: string | null;
    colour: string | null;
    fontStyle: string | null;
}

const SOURCES: Readonly<Record<string, string>> = {
    'source.luam': 'luam.tmLanguage.json',
    'source.luam-manifest': 'luam-manifest.tmLanguage.json',
    'source.luam-formatter': 'luam-formatter.tmLanguage.json',
    'source.luam-server': 'luam-server.tmLanguage.json',
};

function wasmBinary(): ArrayBuffer {
    const path = fileURLToPath(new URL('../../node_modules/vscode-oniguruma/release/onig.wasm', import.meta.url));
    const contents = readFileSync(path);

    return contents.buffer.slice(contents.byteOffset, contents.byteOffset + contents.byteLength) as ArrayBuffer;
}

function createRegistry(): Registry {
    return new Registry({
        onigLib: loadWASM(wasmBinary()).then(() => ({
            createOnigScanner: (patterns: string[]) => new OnigScanner(patterns),
            createOnigString: (value: string) => new OnigString(value),
        })),
        loadGrammar: async (scopeName: string) => {
            const file = SOURCES[scopeName];

            if (file === undefined) {
                return null;
            }

            const path = fileURLToPath(new URL(`../../syntaxes/${file}`, import.meta.url));

            return parseRawGrammar(readFileSync(path, 'utf8'), path);
        },
    });
}

export async function loadGrammar(scopeName: string): Promise<IGrammar> {
    const grammar = await createRegistry().loadGrammar(scopeName);

    if (grammar === null) {
        throw new Error(`The registry could not load ${scopeName}.`);
    }

    return grammar;
}

export function tokenize(grammar: IGrammar, text: string, mode: Mode): TokenRecord[] {
    const records: TokenRecord[] = [];

    let state = INITIAL;

    for (const line of text.split('\n')) {
        const result = grammar.tokenizeLine(line, state);

        for (const token of result.tokens) {
            const slice = line.slice(token.startIndex, token.endIndex);

            if (slice.trim().length === 0) {
                continue;
            }

            const scopes = token.scopes.filter((scope) => !scope.startsWith('source.'));
            const role = scopes.length === 0 ? null : winningRole(scopes[scopes.length - 1] as string);
            const resolved = role === null ? null : resolve(role, mode);

            records.push({
                text: slice,
                scopes,
                role,
                colour: resolved?.foreground ?? null,
                fontStyle: resolved === null || resolved.fontStyle === 'none' ? null : resolved.fontStyle,
            });
        }

        state = result.ruleStack;
    }

    return records;
}

export function fixtureText(name: string): string {
    return readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), 'utf8').replace(/\r\n/g, '\n');
}
