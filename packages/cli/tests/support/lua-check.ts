import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { scanLua } from '@cli/build/lua-tokens';

const CANDIDATES: readonly string[] = ['lua5.1', 'lua51', 'lua'];

function isLua51(command: string): boolean {
    const probe = spawnSync(command, ['-e', 'io.write(_VERSION)'], { encoding: 'utf8' });

    return probe.status === 0 && probe.stdout.trim() === 'Lua 5.1';
}

function findInterpreter(): string | null {
    for (const candidate of CANDIDATES) {
        try {
            if (isLua51(candidate)) {
                return candidate;
            }
        } catch {
            continue;
        }
    }

    return null;
}

export const LUA_51 = findInterpreter();

export function tokenTexts(source: string, file = 'fixture.lua'): string[] {
    return scanLua(source, file).map((token) => token.text);
}

export function parsesAsLua51(source: string): boolean {
    if (LUA_51 === null) {
        return true;
    }

    const directory = mkdtempSync(join(tmpdir(), 'luam-lua-'));
    const path = join(directory, 'chunk.lua');

    try {
        writeFileSync(path, source, 'utf8');

        return spawnSync(LUA_51, ['-e', `assert(loadfile(${JSON.stringify(path)}))`], { encoding: 'utf8' }).status === 0;
    } finally {
        rmSync(directory, { force: true, recursive: true });
    }
}

export function runLua51(source: string): string | null {
    if (LUA_51 === null) {
        return null;
    }

    const directory = mkdtempSync(join(tmpdir(), 'luam-lua-'));
    const path = join(directory, 'chunk.lua');

    try {
        writeFileSync(path, source, 'utf8');

        const result = spawnSync(LUA_51, [path], { encoding: 'utf8' });

        return result.status === 0 ? result.stdout : `exit ${String(result.status)}: ${result.stderr}`;
    } finally {
        rmSync(directory, { force: true, recursive: true });
    }
}
