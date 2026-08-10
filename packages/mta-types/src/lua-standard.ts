import type { ApiCatalog } from './api-declaration';
import { ANY, fn, NUMBER, optionalOf, STRING, TABLE, VOID } from './type-descriptor';

export const LUA_GLOBALS: ApiCatalog = {
    _G: TABLE,
    assert: fn([ANY], ANY, 1, true),
    collectgarbage: fn([], VOID, 0, true),
    coroutine: TABLE,
    error: fn([ANY], VOID, 1, true),
    getmetatable: fn([ANY], TABLE, 1),
    ipairs: fn([ANY], ANY, 1, true),
    math: TABLE,
    next: fn([ANY], ANY, 1, true),
    os: TABLE,
    pairs: fn([ANY], ANY, 1, true),
    pcall: fn([ANY], ANY, 1, true),
    print: fn([], VOID, 0, true),
    rawget: fn([ANY, ANY], ANY, 2),
    rawset: fn([ANY, ANY, ANY], ANY, 3),
    select: fn([ANY], ANY, 1, true),
    setmetatable: fn([ANY, ANY], ANY, 2),
    string: TABLE,
    table: TABLE,
    tonumber: fn([ANY], optionalOf(NUMBER), 1, true),
    tostring: fn([ANY], STRING, 1),
    type: fn([ANY], STRING, 1),
    unpack: fn([ANY], ANY, 1, true),
    xpcall: fn([ANY, ANY], ANY, 2, true),
};
