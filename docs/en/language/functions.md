# Functions

## Declaring

```luam
function greet(name: string, tag?: string): string
    if tag ~= nil then
        return name .. ' (' .. tostring(tag) .. ')'
    end

    return name
end

local function double(value: number): number
    return value * 2
end

local anonymous = function (...)
    print(...)
end
```

A global `function` is visible to every other file in the same environment group;
a `local function` is visible inside its file. See
[Environments](/en/mta/environments) for which files see which globals.

## Return types

The return type follows the parameter list. `void` means the function returns
nothing useful:

```luam
function log(message: string): void
    outputDebugString(message)
end
```

A `return` that does not match is `check-return-mismatch`. A function with no
declared return type is not checked against one.

## Optional parameters

A `?` on the parameter type allows the argument to be omitted:

```luam static
function formatLabel(name: string, tag?: string): string
```

Calling with too few arguments is `check-argument-count`. Passing an argument of
the wrong type is `check-type-mismatch`.

## Methods on tables

Both Lua forms are supported and keep their meaning:

```luam
local player: table = {}

function player.describe(): void
    print('player')
end

function player:rename(name: string): void
    print(name)
end
```

## Function types

`fun(...)` is the type of a callable. Use it for callbacks and stored handlers:

```luam
local log: fun(string): void = print
local reduce: fun(total: number, value: number): number = function (total: number, value: number): number
    return total + value
end
local variadic: fun(...): void = print
local loose: fun = print
```

Parameter names inside `fun(...)` are documentary — `fun(string): void` and
`fun(message: string): void` are the same type.

## Multi-return

Declare multiple return types as a tuple. Lua still returns separate values; the
tuple exists only for static checking:

```luam
function describe(): (string, boolean)
    return 'ready', true
end

local label, enabled = describe()
```

The checker validates the number and type of each returned value. MTA functions
that return several values are also typed from the catalog, so each target gets
its own type:

```luam
local x, y, z = getElementPosition(element)
```

`x`, `y` and `z` are `number` here, not `any`. Requesting more values than the
function returns leaves the extra targets `nil`, as in Lua.

## Variadics

`...` is a parameter list of unknown length, exactly as in Lua:

```luam
local function trace(...): void
    outputDebugString(table.concat({ ... }, ' '))
end
```

## A complete example

<<< @/snippets/language/src/shared/functions.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `greet()` for `greet(name: string)` | `check-argument-count` |
| `return 1` from a `: string` function | `check-return-mismatch` |
| `greet(1)` for `greet(name: string)` | `check-type-mismatch` |
