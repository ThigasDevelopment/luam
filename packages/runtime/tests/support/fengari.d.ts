declare module 'fengari' {
    export interface LuaState {
        readonly stack?: unknown;
    }

    export const lua: {
        LUA_OK: number;
        lua_getglobal(state: LuaState, name: Uint8Array): number;
        lua_isstring(state: LuaState, index: number): boolean;
        lua_pop(state: LuaState, count: number): void;
        lua_tojsstring(state: LuaState, index: number): string;
    };

    export const lauxlib: {
        luaL_dostring(state: LuaState, source: Uint8Array): number;
        luaL_newstate(): LuaState;
    };

    export const lualib: {
        luaL_openlibs(state: LuaState): void;
    };

    export function to_luastring(value: string): Uint8Array;
}
