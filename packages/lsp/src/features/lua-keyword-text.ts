const IF_HOVER = [
    '```luam',
    'if condition then ... end',
    '```',
    '',
    "`if` starts a conditional. Only `nil` and `false` are false — `0` and `''` are true.",
    '',
    '**Narrowing**',
    '',
    "- `value ~= nil` and a plain `if value then` drop `nil` inside the branch; `type(value) == '...'` narrows to that type.",
    '- The narrowing ends with the block, and a guard clause that always exits narrows the rest of the enclosing block.',
].join('\n');

const THEN_HOVER = [
    '```luam',
    'if condition then ... end',
    '```',
    '',
    '`then` opens the body of an `if` or `elseif` condition. The body runs until the next `elseif`, `else` or `end`.',
].join('\n');

const ELSE_HOVER = [
    '```luam',
    'if condition then ... else ... end',
    '```',
    '',
    '`else` is the branch taken when every condition above it failed. After a `value == nil` test, the `else` branch drops `nil` from the value.',
].join('\n');

const ELSEIF_HOVER = [
    '```luam',
    'if a then ... elseif b then ... end',
    '```',
    '',
    '`elseif` chains another condition onto an `if` without nesting; the whole chain shares one `end`.',
].join('\n');

const DO_HOVER = [
    '```luam',
    'do ... end',
    '```',
    '',
    '`do` opens a block with its own local scope. It also closes the header of a `for` or `while` loop before the body starts.',
].join('\n');

const END_HOVER = [
    '```luam',
    'end',
    '```',
    '',
    '`end` closes a `function`, `if`, `for`, `while` or `do` block. A `repeat` loop closes with `until` instead, and a class body closes with `}`.',
].join('\n');

const FOR_HOVER = [
    '```luam',
    'for index = start, limit, step do ... end',
    'for key, value in pairs(items) do ... end',
    '```',
    '',
    '`for` loops in two forms: numeric, counting from `start` to `limit` with an optional `step`, and generic, driven by an iterator such as `pairs` or `ipairs`.',
    '',
    '- Tables are 1-based, so a numeric loop over an array runs `1, #items`.',
    '- `continue` skips to the next iteration and `break` leaves the loop.',
].join('\n');

const IN_HOVER = [
    '```luam',
    'for key, value in pairs(items) do ... end',
    '```',
    '',
    '`in` separates the loop names from the iterator in a generic `for`. The iterator is usually `pairs` for maps or `ipairs` for arrays.',
].join('\n');

const WHILE_HOVER = [
    '```luam',
    'while condition do ... end',
    '```',
    '',
    '`while` runs its body as long as the condition holds, testing before each turn. `continue` skips to the next test and `break` leaves the loop.',
].join('\n');

const REPEAT_HOVER = [
    '```luam',
    'repeat ... until condition',
    '```',
    '',
    '`repeat` runs its body at least once, testing the `until` condition after each turn. The condition still sees the locals declared in the body.',
    '',
    '- `continue` cannot jump over a local the `until` condition reads — that is `check-invalid-continue`; declare the local above the loop, or use `while`.',
].join('\n');

const UNTIL_HOVER = [
    '```luam',
    'repeat ... until condition',
    '```',
    '',
    '`until` closes a `repeat` loop, leaving it once the condition holds. It runs after each turn and still sees the locals declared in the body.',
].join('\n');

const BREAK_HOVER = [
    '```luam',
    'break',
    '```',
    '',
    '`break` leaves the innermost `for`, `while` or `repeat` loop.',
    '',
    '- It must be the last statement of its block — the Lua 5.1 rule; otherwise `check-invalid-break`.',
    '- When `continue` shares the same loop, the compiler keeps them apart with a flag, so `break` still leaves the loop and `continue` still skips one turn.',
].join('\n');

const RETURN_HOVER = [
    '```luam',
    'return value',
    '```',
    '',
    '`return` leaves the enclosing function, optionally carrying one or more values.',
    '',
    '- It must be the last statement of its block — the Lua 5.1 rule.',
    '- The values are checked against the declared return type; without an annotation, the return type is inferred from every `return` in the body.',
].join('\n');

export const LUA_KEYWORD_TEXT: ReadonlyMap<string, string> = new Map([
    ['if', IF_HOVER],
    ['then', THEN_HOVER],
    ['else', ELSE_HOVER],
    ['elseif', ELSEIF_HOVER],
    ['do', DO_HOVER],
    ['end', END_HOVER],
    ['for', FOR_HOVER],
    ['in', IN_HOVER],
    ['while', WHILE_HOVER],
    ['repeat', REPEAT_HOVER],
    ['until', UNTIL_HOVER],
    ['break', BREAK_HOVER],
    ['return', RETURN_HOVER],
]);
