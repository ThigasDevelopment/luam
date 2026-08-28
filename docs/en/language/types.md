# Types

Annotations are checked at build time and erased from the generated Lua. They
never cost anything at runtime.

## Annotating a value

```luam
local name: string = 'Thigas'
local health: number = 100
local alive: boolean = true
local element: Player = source
local anything: any = nil
```

An annotated variable is checked on every assignment. A variable with no
annotation takes the type of its initializer.

## Primitive types

| Type | Values |
| --- | --- |
| `string` | Lua strings. |
| `number` | Lua numbers. There is no integer/float split. |
| `boolean` | `true` and `false`. |
| `nil` | Only `nil`. |
| `table` | Any table with no further shape. |
| `any` | Anything. Never reported. |
| `void` | Only valid as a return type: the function returns nothing useful. |

MTA element types — `Player`, `Vehicle`, `Element`, `Marker` and the rest of the
catalog — are types too. See [APIs and events](/en/mta/apis-and-events).

## Literal types

A literal value is a type of its own — one that accepts exactly that value:

```luam
local mode: 'auto' = 'auto'
local ready: true = true
local port: 3306 = 3306
local nothing: nil = nil
```

Strings, booleans, and numbers all work, and a number may be negative or
decimal (`-1`, `0.5`). Assigning anything else is `check-type-mismatch`:

```
error  check-type-mismatch  Variable "ready" expects "true" but received "false".
```

Every literal is assignable to its base type, so `local flag: boolean = true`
is fine. The reverse is not: a `boolean` does not fit a `true`.

A literal type only appears where you write one. A local with no annotation
widens, so `local flag = true` is `boolean` and can be reassigned:

```luam
local flag = true

flag = false
```

Literals are most useful in a union, which is how you write a closed set of
values:

```luam
local level: 1 | 2 | 3 = 2
local mode: 'auto' | 'manual' | false = 'auto'
```

They are also what makes a [discriminated union](#discriminated-unions) narrow.

## Optionals

A trailing `?` allows `nil`:

```luam
local target?: Player = nil
local tag?: string = nil
```

### Where the `?` goes

**The marker attaches to the name, never to the type.** One rule, everywhere a
declaration has a name:

```luam
local title?: string = nil

function greet(name: string, tag?: string): string
    return name
end

interface Session {
    tag?: string
}
```

Writing it on the type is caught in all three positions, with a message that
names the fix:

<<< @/snippets/output/errors/optional-position.txt{text}

### Where there is no name

A type can still be optional in a position that has no name to carry the marker,
because there is nowhere else to put it:

| Position | Form |
| --- | --- |
| Return type | `function find(id: number): Player?` |
| Nested in another type | `local handlers: (fun(string): void)[] = {}` |
| Type alias | `type Maybe<T> = T?` |

So `?` on a type is still part of the grammar; what the rule forbids is using it
where a name is available.

`if target ~= nil then` refines `Player?` to `Player` inside the branch. See
[type guards](#type-guards).

## Unions

```luam
local key: string | number = 1
```

A union accepts any of its members. For a union of primitives an operation must
be valid for every member — `key + 1` on `string | number` is
`check-invalid-operand`.

When every member is an object type, an interface, or a class, reading a key is
checked. A key that all members declare gives the union of its types; a key that
only some declare is `check-unknown-union-key`:

```luam expect-error
type Circle = {
    kind: 'circle',
    radius: number
}

type Square = {
    kind: 'square',
    side: number
}

type Shape = Circle | Square

function area(shape: Shape): number
    return shape.radius
end
```

```
error  check-unknown-union-key  "radius" is not a key of every member of
       "Circle | Square". It is missing from "Square".
```

Unions of anything else stay unchecked, so a `string | number` receiver keeps
accepting any key.

## Names that are not declared

A type name the file cannot reach is `check-unknown-type`, a **warning**. The
build still succeeds and the name still behaves as it always did — assignable in
both directions, with no members checked — so existing sources keep compiling:

```
warning  check-unknown-type  Type "Databse" is not defined.
```

A name counts as declared when it is a primitive, a type alias, an interface, a
class, an enum, an MTA element type, or the type parameter of a generic alias. It
does not have to appear before its use: the check runs once the file is fully
read, so a type declared at the bottom, a recursive alias, and a
self-referencing interface all stay silent. Declarations from a `.d.luam` file
count when that file's environment reaches the one using it.

## Intersections

`&` merges object types into one:

```luam
type Base = {
    id: string
}

type SQLite = Base & {
    kind: 'sqlite',
    sender: string
}
```

`SQLite` declares `id`, `kind`, and `sender`. Each part must be an object type,
an interface, or a class — `string & { id: string }` is
`check-invalid-intersection`. Two parts may repeat a key only when they declare
it with the same type; otherwise the merge is
`check-conflicting-intersection-member`.

`&` binds tighter than `|`, so `A & B | C` reads as `(A & B) | C`.

An intersection is compiler-only. It merges the shape and emits nothing, so the
generated Lua is the same table it would have been.

## Discriminated unions

A union whose members share a key typed as a literal narrows on that key.
Comparing it against a literal keeps only the members that can match:

```luam expect-error
type SQLite = Base & {
    kind: 'sqlite',
    sender: string
}

type MySQL = Base & {
    kind: 'mysql',
    host: string,
    port: number
}

type Config = SQLite | MySQL

function connect(config: Config): void
    if config.kind == 'mysql' then
        outputChatBox(config.host .. ':' .. config.port)
    else
        outputChatBox(config.sender)
    end
end
```

Inside the first branch `config` is `MySQL`, so `host` and `port` resolve and
`sender` is `check-unknown-record-key`. The `else` branch gets the remaining
member. `~=` narrows the other way, which makes the early-return form work too:

```luam static
function connect(config: Config): void
    if config.kind ~= 'mysql' then
        return
    end

    outputChatBox(config.host)
end
```

The receiver must be a stable access path — a name, or a name followed by
literal fields — so `config.kind` narrows `config` and `state.config.kind`
narrows `state.config`. A call or a dynamic index in the receiver narrows
nothing. Narrowing ends with the block that established it.

A string is the usual discriminant, but any [literal type](#literal-types) works,
which makes the two-case result a natural shape:

```luam
type Ok = {
    ok: true,
    value: string
}

type Err = {
    ok: false,
    reason: string
}

function report(result: Ok | Err): string
    if result.ok == false then
        return result.reason
    end

    return result.value
end
```

## Arrays

```luam
local scores: number[] = { 10, 20 }
local grid: number[][] = {}
local players: Player[] = {}
```

`T[]` is a Lua table used as a sequence. It carries the
[object extensions](/en/language/extensions) for tables, so `scores.count` and
`scores.isEmpty` work.

## Maps

`table` alone is any table. With two type arguments it is a map — the first is
the key, the second is the value:

```luam
local ages: table<string, number> = {}

ages['thigas'] = 27

local age: number = ages['thigas']

for name, value in pairs(ages) do
    outputChatBox(name .. ' is ' .. value)
end
```

Reading a key gives the value type, with `ages.thigas` and `ages['thigas']`
treated the same. A key of another type is `check-type-mismatch`, and `pairs`
types both loop variables (`ipairs` types the first one as `number`).

A map is assignable to `table`, and `table` is assignable to a map, so code that
still uses plain tables keeps working. Between two maps the key and the value
must both be assignable.

| You wrote | Diagnostic |
| --- | --- |
| `ages[1]` on `table<string, number>` | `check-type-mismatch: Key expects "string" but received "number".` |
| `table<string>` | `check-generic-arity: Type "table" expects a key type and a value type but received 1.` |

## Object types

`{ key: Type }` describes a table by the keys it declares. It is written inline,
wherever a type is accepted:

```luam
local point: { x: number, y: number } = { x = 0, y = 0 }

function spawn(args: { name: string, team?: string }): void
    outputChatBox(args.name)
end
```

Keys are separated by a comma, a semicolon, or a line break, and the optional
marker goes on the key — `team?: string`, never `team: string?`. Reading a key
that the type does not declare is `check-unknown-record-key`:

| You wrote | Diagnostic |
| --- | --- |
| `args.nmae` on `{ name: string }` | `check-unknown-record-key: "nmae" is not a key of "{ name: string }". Declared keys: "name".` |
| `{ name: string, name: number }` | `parse-duplicate-key` |
| `{ name }` | `parse-invalid-type` |

One object type is accepted where another is expected when it declares every key
the target requires, with a compatible type. A key the target marks optional may
be missing.

A table literal written with keys is typed by those keys, so it is checked
against the shape it is assigned to. A missing required key is
`check-type-mismatch`, which is what catches a misspelling — `spawn({ nmae = 'a' })`
is reported because `name` is missing, not because `nmae` is unexpected:

```
error  check-type-mismatch  Argument 1 expects "Args" but received "{ nmae: 'a' }".
                            Key "name" is missing from "Args".
```

When the target is a union, the literal keys that are typed as literals pick the
member to report against, so you are told what the branch you meant is missing:

```
error  check-type-mismatch  Variable "conn" expects "SQLite | MySQL" but received
                            "{ id: 'a', type: 'sqlite' }".
                            Key "path" is missing from "SQLite".
```

Two literals keep their old meaning. `{}` carries no shape, so it still fits an
array, a map, or `table`, and only fails a shape that requires a key. A literal
with positional entries is an array, and a literal that mixes the two is
`table`.

Without an annotation the literal keeps its shape, so `local config = { name = 'a' }`
types `config.name` and reports `config.tag`. The exception is `{}`, which
widens to `table` — that is what keeps `local items = {}` working with the
[object extensions](/en/language/extensions).

A key whose type is a function is a method when it is called with `:`. The call
is checked against the declared signature — argument count and argument types —
and it produces the declared return type:

```luam
type Counter = { bump: fun(step: number): number }

local counter: Counter = { bump = function (step: number): number return step end }

local total: number = counter:bump(1)
```

```
error  check-argument-count  This call expects at most 1 argument but received 2.
error  check-type-mismatch   Argument 1 expects "number" but received "string".
```

A first parameter named `self` is the receiver, so it is not counted as an
argument of a `:` call. `bump: fun(self: Counter, step: number): number` and
`bump: fun(step: number): number` report the same arity for `counter:bump(1)`.
A `.` call passes every parameter, `self` included.

An object type is a shape, not a contract a class can implement. Use an
[interface](/en/language/enums-and-interfaces) for that.

## Aliases

`type` gives a name to a type. It is erased entirely.

```luam
type PlayerId = number
type Nullable<T> = T | nil
type SpawnArgs = { name: string, team?: string }

local id: PlayerId = 7
local pending: Nullable<string> = nil
local args: SpawnArgs = { name = 'Thigas' }
```

Aliases may take type parameters, as `Nullable<T>` shows. Generic **classes** are
not supported — see [Limitations](/en/reference/limitations).

An alias of an object type carries its name into the diagnostics: reading
`args.nmae` above reports `"nmae" is not a key of "SpawnArgs"`. An alias must be
declared before the code that uses it.

## Function types

`fun(...)` describes a callable:

```luam
local log: fun(string): void = print
local reduce: fun(total: number, value: number): number = function (total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
local optional?: fun(string): void = nil
```

Parameter names inside `fun(...)` are optional and documentary. See
[Functions](/en/language/functions).

## Type guards

A condition narrows a stable access path inside the block it guards. A path is
a name, or a name followed by literal fields:

```luam
function announce(name?: string, handler?: fun(text: string): void): void
    if name ~= nil then
        outputChatBox(name)
    end

    if type(handler) == 'function' then
        handler('ready')
    end
end
```

- `type(value) == '...'` narrows to that type, for every name `type` returns.
- A field is a path, so `self.connection ~= nil` refines `self.connection`, and
  so does a nested `self.socket.handle`.
- `value ~= nil` and a plain `if value then` drop `nil`.
- `value == nil` narrows to `nil`, and the `else` branch of that test drops it.
- `value.key == '...'` picks the members of a union that declare `key` with that
  literal, and `~=` picks the rest. See
  [discriminated unions](#discriminated-unions).
- `and` chains apply every fact they carry.

A fact is dropped as soon as the path, a prefix of it, or its root is assigned
or shadowed — including a write inside a loop body or inside a function declared
in the same block. A call or a dynamic index in the path produces no narrowing
at all. An assignment is always checked against the declared type, so
reassigning a narrowed path to its original type is accepted. What a guard
cannot follow is a second reference to the same table; see
[Limitations](/en/reference/limitations).

### What a fact survives

A fact outlives the block that established it when every path into the code
after it agrees. Where the branches disagree, the path goes back to its declared
type.

An assignment refines a union or an optional to the member it wrote, so a
branch that fills a missing value counts as agreement:

```luam
function label(name?: string): string
    if name == nil then
        name = 'anonymous'
    end

    return name
end
```

A branch that exits carries the other side to the rest of the block, whether it
`return`s, `break`s, or `continue`s:

```luam
function announce(name?: string): void
    if name == nil then
        return
    end

    outputChatBox(name)
end
```

A loop is analyzed as if its body may run again, so every path the body writes
loses its fact for the whole loop. What survives the loop is the negation of its
condition:

```luam
function fill(name?: string): string
    while name == nil do
        name = 'anonymous'
    end

    return name
end
```

What does not carry is a condition stored in a variable: the variable is not the
test. Write the test where the value is used, or narrow into a local.

An `or` keeps only what both sides agree on, and unions the two types:

```luam
if type(value) == 'string' or type(value) == 'number' then
    outputChatBox(value .. '')
end
```

### `and` and `or` results

`a or b` is `b` whenever `a` is missing, so the result drops `nil` from the left
side — `tonumber(amount) or 100` is `number`, not `number?`. `a and b` is `b`,
plus `nil` when `a` itself can be missing. Together they type the usual
one-liner:

```luam
local label: string = ok and 'yes' or 'no'
```

::: warning One table, two names
A guard follows the path it tested, not the table behind it. If a second name
reaches the same table and clears the field, the fact stays and the program
fails at runtime. See [Limitations](/en/reference/limitations).
:::

## A complete example

<<< @/snippets/language/src/shared/types.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `local n: number = 'text'` | `check-type-mismatch: Variable "n" expects "number" but received "string".` |
| `local x: number = v and 1` where `v?: string` | `check-type-mismatch: ... received "number?".` |
| `local p: Playr = source` | `parse-invalid-type` |
| `key + 1` where `key: string \| number` | `check-invalid-operand` |
