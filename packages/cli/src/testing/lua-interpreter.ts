import { spawnSync } from 'node:child_process';

export const REQUIRED_LUA_VERSION = 'Lua 5.1';

export const LUA_CANDIDATES: readonly string[] = ['lua5.1', 'lua51', 'lua', 'luajit'];

export const LUA_ENV_VARIABLE = 'LUAM_LUA';

export interface LuaProbe {
    (executable: string): string | null;
}

export interface LuaInterpreter {
    executable: string;
    version: string;
}

export interface InterpreterRequest {
    explicit?: string | null;
    env?: string | null;
    probe?: LuaProbe;
}

export const INSTALL_HINT =
    'Install a Lua 5.1 interpreter and put it on PATH, or point "--lua" or the LUAM_LUA variable at one. LuaJIT reports "Lua 5.1" and is accepted.';

export function probeInterpreter(executable: string): string | null {
    const result = spawnSync(executable, ['-e', 'io.write(_VERSION)'], { encoding: 'utf8', shell: false, windowsHide: true });

    if (result.error !== undefined || result.status !== 0) {
        return null;
    }

    return result.stdout.trim();
}

export function findLuaInterpreter(request: InterpreterRequest = {}): LuaInterpreter | null {
    const probe = request.probe ?? probeInterpreter;
    const pinned = request.explicit ?? request.env ?? null;
    const candidates = pinned === null ? LUA_CANDIDATES : [pinned];

    for (const executable of candidates) {
        const version = probe(executable);

        if (version === REQUIRED_LUA_VERSION) {
            return { executable, version };
        }
    }

    return null;
}

export function describeMissingInterpreter(request: InterpreterRequest = {}): string {
    const pinned = request.explicit ?? request.env ?? null;

    if (pinned !== null) {
        return `"${pinned}" is not a ${REQUIRED_LUA_VERSION} interpreter.`;
    }

    return `No ${REQUIRED_LUA_VERSION} interpreter was found on PATH (tried ${LUA_CANDIDATES.map((name) => `"${name}"`).join(', ')}).`;
}
