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

::: warning No narrowing
`if target ~= nil then` does **not** refine `Player?` to `Player` inside the
branch. Luam performs no type narrowing. When you have established a value is
present, annotate the receiving local as `any`.
:::

## Unions

```luam
local key: string | number = 1
```

A union accepts any of its members. Because there is no narrowing, an operation
must be valid for the whole union — `key + 1` on `string | number` is
`check-invalid-operand`.

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

::: warning No inference from a table literal
A table literal is typed `table`, not by its keys, so `spawn({ nmae = 'a' })` is
accepted — the argument carries no shape to compare against. A shape is known in
two places, and those are the two places it is checked: reading a key off an
annotated value, and passing one annotated value into another annotated
position.
:::

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
local reduce: fun(total: number, value: number): number = function(total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
local optional?: fun(string): void = nil
```

Parameter names inside `fun(...)` are optional and documentary. See
[Functions](/en/language/functions).

## Type guards

A condition narrows a name inside the block it guards:

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
- `value ~= nil` and a plain `if value then` drop `nil`.
- `value == nil` narrows to `nil`, and the `else` branch of that test drops it.
- `and` chains apply every fact they carry.

The narrowing ends with the block, and it is dropped as soon as the name is
assigned or shadowed. An assignment is always checked against the declared type,
so reassigning a narrowed name to its original type is accepted.

A guard clause narrows the rest of the block when it always exits:

```luam
function announce(name?: string): void
    if name == nil then
        return
    end

    outputChatBox(name)
end
```

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

::: warning Names only
A field like `self.connection` keeps its declared type. Copy it into a local
first when you need the guard.
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
