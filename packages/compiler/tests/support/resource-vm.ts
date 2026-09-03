import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { lauxlib, lua, lualib, to_luastring, type LuaState } from 'fengari';

import { resolveHelperUrl, type RuntimeHelperName } from '@runtime/helpers';

import type { ProjectResult } from '@compiler/project/module';

export interface ResourceOutcome {
    result: string | null;
    error: string | null;
}

const LUA_51_COMPATIBILITY = 'unpack = unpack or table.unpack';

const MTA_STUBS = `
local now, timers, handlers = 0, {}, {}

root = { 'root' }

function getTickCount()
    return now
end

function setTimer(callback, interval, times)
    local timer = { callback = callback, interval = interval, times = times, at = now + interval }

    timers[#timers + 1] = timer

    return timer
end

function killTimer(timer)
    for index = #timers, 1, -1 do
        if timers[index] == timer then
            table.remove(timers, index)
        end
    end
end

function isTimer(timer)
    for index = 1, #timers do
        if timers[index] == timer then
            return true
        end
    end

    return false
end

function addEventHandler(name, element, callback)
    handlers[name] = handlers[name] or {}
    handlers[name][#handlers[name] + 1] = callback

    return true
end

function triggerEvent(name, element, ...)
    for _, callback in ipairs(handlers[name] or {}) do
        callback(...)
    end

    return true
end

function outputDebugString(message)
    return message
end
`;

function helperSource(name: RuntimeHelperName): string {
    return readFileSync(fileURLToPath(resolveHelperUrl(name)), 'utf8');
}

function failure(state: LuaState): ResourceOutcome {
    return { result: null, error: lua.lua_tojsstring(state, -1) };
}

function globalResult(state: LuaState): ResourceOutcome {
    lua.lua_getglobal(state, to_luastring('result'));

    const result = lua.lua_isstring(state, -1) ? lua.lua_tojsstring(state, -1) : null;

    lua.lua_pop(state, 1);

    return { result, error: null };
}

function chunks(project: ProjectResult): string[] {
    const helpers = [...new Set(project.modules.flatMap((module) => module.requiredHelpers))] as RuntimeHelperName[];
    const sources = project.modules.map((module) => module.code ?? '');

    return [LUA_51_COMPATIBILITY, MTA_STUBS, ...helpers.map((helper) => helperSource(helper)), ...sources];
}

export function runResource(project: ProjectResult, source: string): ResourceOutcome {
    const state = lauxlib.luaL_newstate();

    lualib.luaL_openlibs(state);

    for (const chunk of chunks(project)) {
        if (lauxlib.luaL_dostring(state, to_luastring(chunk)) !== lua.LUA_OK) {
            return failure(state);
        }
    }

    return lauxlib.luaL_dostring(state, to_luastring(source)) === lua.LUA_OK ? globalResult(state) : failure(state);
}
