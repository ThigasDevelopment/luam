import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { lauxlib, lua, lualib, to_luastring, type LuaState } from 'fengari';

import { resolveHelperUrl, type RuntimeHelperName } from '@runtime/helpers';

export interface LuaOutcome {
    result: string | null;
    error: string | null;
}

const LUA_51_COMPATIBILITY = 'unpack = unpack or table.unpack';

function helperSource(name: RuntimeHelperName): string {
    return readFileSync(fileURLToPath(resolveHelperUrl(name)), 'utf8');
}

function failure(state: LuaState): LuaOutcome {
    return { result: null, error: lua.lua_tojsstring(state, -1) };
}

function globalResult(state: LuaState): LuaOutcome {
    lua.lua_getglobal(state, to_luastring('result'));

    const result = lua.lua_isstring(state, -1) ? lua.lua_tojsstring(state, -1) : null;

    lua.lua_pop(state, 1);

    return { result, error: null };
}

export function runWithHelpers(helpers: readonly RuntimeHelperName[], source: string): LuaOutcome {
    const state = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(state);

    lauxlib.luaL_dostring(state, to_luastring(LUA_51_COMPATIBILITY));

    for (const helper of helpers) {
        if (lauxlib.luaL_dostring(state, to_luastring(helperSource(helper))) !== lua.LUA_OK) {
            return failure(state);
        }
    }

    return lauxlib.luaL_dostring(state, to_luastring(source)) === lua.LUA_OK ? globalResult(state) : failure(state);
}

export function runClasses(source: string): LuaOutcome {
    return runWithHelpers(['class'], source);
}
