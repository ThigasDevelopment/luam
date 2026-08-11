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

## Aliases

`type` gives a name to a type. It is erased entirely.

```luam
type PlayerId = number
type Nullable<T> = T | nil

local id: PlayerId = 7
local pending: Nullable<string> = nil
```

Aliases may take type parameters, as `Nullable<T>` shows. Generic **classes** are
not supported — see [Limitations](/en/reference/limitations).

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

## A complete example

<<< @/snippets/language/src/shared/types.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `local n: number = 'text'` | `check-type-mismatch: Variable "n" expects "number" but received "string".` |
| `local x: number = tonumber(v) or 0` | `check-type-mismatch: ... received "number? \| number".` |
| `local p: Playr = source` | `parse-invalid-type` |
| `key + 1` where `key: string \| number` | `check-invalid-operand` |
