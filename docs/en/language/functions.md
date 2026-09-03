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

A declared return type has to be produced on **every** path. A body that can
reach its closing `end` without returning is `check-missing-return`, because the
caller would receive `nil` where the annotation promised a value:

```luam static
function pick(flag: boolean): string
    if flag then
        return 'yes'
    end
end
```

There are two repairs, and the message names both. Return on every path, or
declare the annotation optional — `: string?` — which makes ending without a
value the truth. `void`, `nil`, `any` and any union containing `nil` already
tolerate it and are never reported.

A loop that cannot fall through is not reported: `while true do` and
`repeat ... until false` with no `break` end the path. A body that ends in
`error(...)` **is** reported, because a call is not a terminator — see
[Limitations](/en/reference/limitations).

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

## Generic functions

A function takes its own type parameters between the name and the parameter
list, the way a [type alias](/en/language/types#aliases) and a
[class](/en/language/classes#type-parameters) do:

```luam
function identity<T>(value: T): T
    return value
end

local text: string = identity('ready')
local total: number = identity(1)
```

The argument binds the parameter, so `identity('ready')` is `string` and
`identity(1)` is `number`. One declaration, checked at both call sites.

Write the arguments explicitly when inference has nothing to work from, or to
pin a wider type than the argument would give:

```luam static
local text = identity<string>('ready')
```

The wrong count is `check-generic-arity`, and an argument that does not match
the explicit type is `check-type-mismatch`. A parameter that no argument binds
becomes `any` rather than an error — including one that appears only in the
return type, which single-pass inference cannot reach. See
[Limitations](/en/reference/limitations).

A parameter can carry a constraint, which every argument must satisfy. Anything
else is `check-generic-constraint`, the same diagnostic a class constraint
produces:

```luam static
function label<T extends Named>(value: T): string
    return value.name
end
```

A function expression takes them after the `function` keyword, which is also how
a class method declares its own:

```luam static
class Box<T> {
    value: T

    convert = function <U>(change: fun(T): U): U
        return change(self.value)
    end
}
```

Both sets are in scope inside `convert`, and a method parameter named the same
as a class parameter shadows it.

None of it reaches the output. The parameters and the arguments are erased with
every other annotation, in both output layouts, so the generated Lua is the same
as the non-generic form.

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

## Async functions

An `async function` runs its body as a coroutine and returns a promise, so
`await` reads a value that arrives later without blocking the server:

```luam
async function loadProfile(id: number): number
    local record = await readRecord(id)

    sleep(200)

    return record
end

async function greet(id: number): void
    local record = await loadProfile(id)

    outputChatBox(tostring(record))
end
```

The return annotation is the **inner** type. `loadProfile` above has the
signature `loadProfile(id: number): Promise<number>`, and `await` gives the
`number` back. Annotating `Promise` yourself is `check-async-return-annotation`.

A rejection is **raised** at the `await` site, and that error rejects the promise
of the function containing it, so it reaches `:catch()` at the end of the chain
instead of disappearing. To branch on the outcome instead of raising, use
`Promise.settle`, which returns `true` and the value, or `false` and the reason:

```luam
async function tryLoad(id: number): string
    local ok, reason = Promise.settle(loadProfile(id))

    if ok then
        return 'loaded'
    end

    return tostring(reason)
end
```

Callers that are not async functions can chain instead:

```luam
loadProfile(1):next(function (record)
    outputChatBox(tostring(record))
end):catch(function (reason)
    outputDebugString(tostring(reason))
end)
```

### Two boundaries

**Lua 5.1 cannot yield across a C boundary.** No `await` inside `pcall`,
`xpcall`, a `table.sort` comparator or a metamethod — the runtime raises
*attempt to yield across a C-call boundary*. Calling an async function **from**
an MTA event handler is fine: only Lua frames sit between the resume and the
yield.

**MTA never fires a timer sooner than 50ms.** `delay(0)` and `sleep(0)` inside
an async function resume on the next tick, not the next frame. Inside a
`Threads` job `sleep` still yields to the pool pulse, which is what keeps the
frame budget worth having. See
[Runtime helpers](/en/mta/resources#runtime-helpers).

## A complete example

<<< @/snippets/language/src/shared/functions.luam

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `greet()` for `greet(name: string)` | `check-argument-count` |
| `return 1` from a `: string` function | `check-return-mismatch` |
| a `: string` function that can end without returning | `check-missing-return` |
| `identity<string, number>(x)` for `identity<T>` | `check-generic-arity` |
| `greet(1)` for `greet(name: string)` | `check-type-mismatch` |
