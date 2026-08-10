import type { ApiDocumentationCatalog } from './api-documentation';
import { luaDoc, valueDoc } from './documentation-builder';

const MANUAL = 'https://www.lua.org/manual/5.1/manual.html';

export const LUA_DOCS: ApiDocumentationCatalog = {
    _G: valueDoc('The global environment table. Every global variable is a key in it, so `_G.health` and `health` name the same value.', `${MANUAL}#pdf-_G`),
    coroutine: valueDoc('The coroutine library. Holds `create`, `resume`, `yield`, `status` and `wrap` for cooperative multitasking.', `${MANUAL}#5.2`),
    math: valueDoc('The math library. Holds the numeric helpers — `floor`, `ceil`, `abs`, `random`, `min`, `max`, `sqrt`, `pi` — plus the Luam additions `clamp` and `round`.', `${MANUAL}#5.6`),
    os: valueDoc('The operating system library. Under MTA only the time helpers are available: `time`, `clock` and `date`.', `${MANUAL}#5.8`),
    string: valueDoc('The string library. Holds the Lua string functions — `format`, `find`, `gsub`, `sub`, `rep` — plus the Luam additions `split`, `trim`, `startsWith`, `endsWith` and `template`.', `${MANUAL}#5.4`),
    table: valueDoc('The table library. Holds `insert`, `remove`, `concat` and `sort`, plus the Luam additions `size`, `keys`, `values`, `copy`, `includes` and `isEmpty`.', `${MANUAL}#5.5`),
    assert: luaDoc(
        'assert',
        'Raises an error when `value` is `false` or `nil`, and returns every argument it was given otherwise. Use it to fail fast on a broken assumption.',
        [
            ['value', false, 'The value to test. Anything other than false or nil passes.'],
            ['message', true, 'The error message raised when the test fails. Defaults to "assertion failed!".'],
        ],
        'returns every argument unchanged when the test passes.',
    ),
    collectgarbage: luaDoc(
        'collectgarbage',
        'Drives the garbage collector. Calling it with no argument runs a full collection cycle.',
        [
            ['option', true, 'One of "collect", "stop", "restart", "count", "step", "setpause" or "setstepmul". Defaults to "collect".'],
            ['argument', true, 'The numeric argument for "step", "setpause" and "setstepmul".'],
        ],
        'returns the value the chosen option produces, or nothing for "collect".',
    ),
    error: luaDoc(
        'error',
        'Raises an error and unwinds to the nearest `pcall`. Execution of the current function stops at this call.',
        [
            ['message', false, 'The error value. A string is prefixed with the position where the error was raised.'],
            ['level', true, 'Which call frame the position points at. 1 is the caller of error, 2 is its caller. 0 adds no position.'],
        ],
        'never returns.',
    ),
    getmetatable: luaDoc(
        'getmetatable',
        'Reads the metatable of a value. When the metatable declares a `__metatable` field, that field is returned instead.',
        [['value', false, 'The value whose metatable is wanted.']],
        'returns the metatable, or nil when the value has none.',
    ),
    ipairs: luaDoc(
        'ipairs',
        'Iterates the array part of a table from index 1 upward, stopping at the first missing index. Use it in a generic `for` when order matters.',
        [['list', false, 'The table to walk. Only consecutive integer keys starting at 1 are visited.']],
        'returns an iterator, the table, and the starting index 0.',
    ),
    next: luaDoc(
        'next',
        'Steps to the next key/value pair of a table. This is the primitive that `pairs` is built on.',
        [
            ['target', false, 'The table to step through.'],
            ['key', true, 'The key to step past. Omit it or pass nil to get the first pair.'],
        ],
        'returns the next key and its value, or nil once the table is exhausted.',
    ),
    pairs: luaDoc(
        'pairs',
        'Iterates every key/value pair of a table in unspecified order. Use `ipairs` instead when the table is a list and order matters.',
        [['target', false, 'The table to walk.']],
        'returns an iterator, the table, and nil.',
    ),
    pcall: luaDoc(
        'pcall',
        'Calls a function in protected mode. An error inside the call is caught and reported instead of unwinding the script.',
        [
            ['target', false, 'The function to call.'],
            ['...arguments', false, 'The arguments forwarded to the function.'],
        ],
        'returns true followed by the results on success, or false and the error value on failure.',
    ),
    print: luaDoc(
        'print',
        'Writes its arguments to the server console or the client debug output, separated by tabs. In MTA prefer `outputChatBox` or `outputDebugString`, which reach the player.',
        [['...values', false, 'The values to write. Each one is passed through tostring.']],
        'returns nothing.',
    ),
    rawget: luaDoc(
        'rawget',
        'Reads a table field without consulting the `__index` metamethod.',
        [
            ['target', false, 'The table to read from.'],
            ['key', false, 'The key to read.'],
        ],
        'returns the stored value, or nil when the key is absent.',
    ),
    rawset: luaDoc(
        'rawset',
        'Writes a table field without consulting the `__newindex` metamethod.',
        [
            ['target', false, 'The table to write to.'],
            ['key', false, 'The key to write.'],
            ['value', false, 'The value to store.'],
        ],
        'returns the table.',
    ),
    select: luaDoc(
        'select',
        'Reads from a variadic argument list. Passing "#" counts the arguments, passing a number returns everything from that position on.',
        [
            ['index', false, 'The 1-based position to start from, or the string "#" to count instead.'],
            ['...values', false, 'The argument list to read, usually forwarded from "...".'],
        ],
        'returns the argument count for "#", or every argument from the given position.',
    ),
    setmetatable: luaDoc(
        'setmetatable',
        'Attaches a metatable to a table, which is how inheritance and operator overloading are expressed in Lua.',
        [
            ['target', false, 'The table to change.'],
            ['metatable', false, 'The metatable to attach, or nil to detach the current one.'],
        ],
        'returns the table it changed.',
    ),
    tonumber: luaDoc(
        'tonumber',
        'Converts a value to a number. A string that does not read as a number yields nil, so the result must be checked before use.',
        [
            ['value', false, 'The value to convert.'],
            ['base', true, 'The base to read the string in, from 2 to 36. Defaults to 10.'],
        ],
        'returns the number, or nil when the value does not convert.',
    ),
    tostring: luaDoc(
        'tostring',
        'Converts any value to a string, honouring the `__tostring` metamethod when the value declares one.',
        [['value', false, 'The value to convert.']],
        'returns the string form of the value.',
    ),
    type: luaDoc(
        'type',
        'Reports the primitive type of a value as a string. For MTA elements this reads "userdata" — use `getElementType` for the element kind.',
        [['value', false, 'The value to inspect.']],
        'returns one of "nil", "number", "string", "boolean", "table", "function", "thread" or "userdata".',
    ),
    unpack: luaDoc(
        'unpack',
        'Expands the array part of a table into separate values, so a table can be passed as an argument list.',
        [
            ['list', false, 'The table to expand.'],
            ['from', true, 'The first index to take. Defaults to 1.'],
            ['to', true, 'The last index to take. Defaults to the length of the table.'],
        ],
        'returns every element in the range as separate values.',
    ),
    xpcall: luaDoc(
        'xpcall',
        'Calls a function in protected mode with a handler that runs at the point of the error, so the handler can still read the stack trace.',
        [
            ['target', false, 'The function to call.'],
            ['handler', false, 'The function invoked with the error value before the stack unwinds.'],
        ],
        'returns true followed by the results on success, or false and the handler result on failure.',
    ),
};
