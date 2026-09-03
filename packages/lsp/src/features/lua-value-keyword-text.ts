const FUNCTION_HOVER = [
    '```luam',
    'function name(parameter: Type): ReturnType ... end',
    '```',
    '',
    '`function` declares a function. Parameter and return annotations are checked and then erased — the emitted Lua carries none of them.',
    '',
    '**Forms**',
    '',
    '- `function Name:method()` receives the typed `self` implicitly; the dot form `function Name.method()` does not.',
    '- `local function name()` scopes the function like any other local.',
    '- `export function name()` makes a top-level function callable by other MTA resources.',
    '- `async function name(): Inner` runs the body as a coroutine and returns `Promise<Inner>`, so `await` and `sleep` work anywhere inside it.',
    '- Without a return annotation, the return type is inferred from the body.',
].join('\n');

const LOCAL_HOVER = [
    '```luam',
    'local name: Type = value',
    '```',
    '',
    '`local` declares a block-scoped name, shadowing any global with the same name.',
    '',
    '**Forms**',
    '',
    '- `local name = value` infers the type from the value; an annotation pins it.',
    '- `local function name()` scopes a function the same way.',
    '- `local enum Name { ... }` scopes an enum to the declaring file — no other file sees it.',
    '',
    '**Rules**',
    '',
    '- Under `noUnusedLocals`, a local nothing reads is `check-unused-local`.',
].join('\n');

const AND_HOVER = [
    '```luam',
    'a and b',
    '```',
    '',
    '`and` is the boolean conjunction: the result is `a` when `a` is false, otherwise `b`. Only `nil` and `false` are false.',
    '',
    '- The result is typed as `b`, plus `nil` when `a` itself can be missing.',
    '- In a condition, an `and` chain applies every fact it carries: `value ~= nil and value.ready` narrows with both tests.',
    "- `ok and 'yes' or 'no'` is the usual one-liner, and the checker types it.",
].join('\n');

const OR_HOVER = [
    '```luam',
    'a or b',
    '```',
    '',
    '`or` is the boolean disjunction: the result is `a` when `a` is true, otherwise `b`.',
    '',
    '- The result drops `nil` from the left side — `tonumber(amount) or 100` is `number`, not `number?`.',
    '- In a condition, an `or` keeps only what both sides agree on, and unions the two types.',
].join('\n');

const NOT_HOVER = [
    '```luam',
    'not value',
    '```',
    '',
    '`not` negates a value: the result is `true` exactly when the value is `nil` or `false`, and `false` for everything else — including `0` and `\'\'`.',
].join('\n');

const NIL_HOVER = [
    '```luam',
    'nil',
    '```',
    '',
    '`nil` is the absent value. Together with `false`, it is the only false value in a condition.',
    '',
    '- An optional type `Type?` admits `nil`; `value ~= nil` and a plain `if value then` narrow it away.',
    '- A field with neither a default nor an assignment in the constructor starts as `nil`.',
].join('\n');

const TRUE_HOVER = [
    '```luam',
    'true',
    '```',
    '',
    '`true` is the boolean truth literal, typed `boolean`. It is also usable as a literal type: `type Enabled = true`.',
].join('\n');

const FALSE_HOVER = [
    '```luam',
    'false',
    '```',
    '',
    '`false` is the boolean falsehood literal, typed `boolean`. Together with `nil`, it is the only false value — `0` and `\'\'` are true.',
].join('\n');

export const HTTP_HOVER = [
    '```luam',
    'export http function name(...) ... end',
    '```',
    '',
    '`http` is a contextual modifier on an `export`: it emits `http="true"` in the `meta.xml` entry, letting MTA\'s HTTP server call the function.',
    '',
    '- Without it, the compiler always emits `http="false"`.',
    '- Remote access also depends on the `resource.<name>.http` ACL right and the server\'s authentication configuration.',
    '- Outside an `export` directive, `http` remains an ordinary identifier.',
].join('\n');

export const LUA_VALUE_KEYWORD_TEXT: ReadonlyMap<string, string> = new Map([
    ['function', FUNCTION_HOVER],
    ['local', LOCAL_HOVER],
    ['and', AND_HOVER],
    ['or', OR_HOVER],
    ['not', NOT_HOVER],
    ['nil', NIL_HOVER],
    ['true', TRUE_HOVER],
    ['false', FALSE_HOVER],
]);
