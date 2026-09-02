# Porting a Lua resource

This page is the ordered list of decisions converting an existing MTA resource
forces. It describes Luam %LUAM_VERSION%.

Most of a resource translates mechanically. A smaller part has to be
restructured, because Lua expresses something Luam expresses differently. A
short list is refused outright, and this page says what to write instead.

## The order to work in

Port in this order, running `luam check` after each step:

1. **The manifest and the declaration files.** Write `.luam.manifest`, then a
   `.d.luam` for every `config.lua` and vendored script the resource reads.
2. **`src/shared`.** Types, interfaces, aliases and enums live here, and every
   later step reads them.
3. **`src/server`.**
4. **`src/client`.**

The order matters because a type the checker has not seen yet **warns instead of
resolving**: a name that resolves to nothing is `check-unknown-type`, a warning,
and the annotation goes on looking like it is doing work while it is not. Porting
the shared declarations first means every later file is checked against real
types rather than against `any`.

## What translates mechanically

| Lua | Luam |
| --- | --- |
| `-- comment` | `# comment` |
| `--[[ block ]]` | `#* block *#` |
| `---@param x T` | `x: T` in the parameter list |
| `---@return T` | `): T` after the parameter list |
| `---@class X` with only fields | `interface X { ... }` |
| `---@field f fun(self: X, a: T)` | a class method, with no explicit `self` |
| `---@alias X 'a' \| 'b'` | `type X = 'a' \| 'b'` |
| `class "X" { }` | `class X { }` |
| `class "X" : extends "Y" { }` | `class X extends Y { }` |
| `self:super(...)` | `super(...)` |
| `X = new "X"` at the bottom of a file | nothing; every call site becomes `new X(...)` |

Optional markers move to the **name**, everywhere a name is declared:
`name?: string`, never `name: string?`. `Type?` stays correct in a position that
declares no name — a return type, an alias body, a type argument.

```luam
class Account {
    owner: string
    note?: string

    constructor = function (owner: string)
        self.owner = owner
    end

    find = function (id: number): Account?
        return nil
    end
}
```

## What has to be restructured

**A module that decides its side at runtime.** A `shared` file sees the shared
MTA surface plus both sides, and reports nothing for a side-restricted name — the
author owns the runtime branch. Keep the module in `src/shared` and leave the
branch as it is; see [Environments](/en/mta/environments).

**A class and its singleton sharing one global name.** `Adapter = new "Adapter"`
gives the class and its only instance the same name. In Luam a class name is a
type, and calling an instance member through it is `check-class-receiver`. Give
the instance its own name:

```luam
class RedisAdapter {
    connect = function (): boolean
        return true
    end
}

redis?: RedisAdapter = nil

redis = new RedisAdapter()
```

That second line is the other half of this shape: a global the source assigns
later carries its type on the declaration, and the optional marker is how you say
it starts empty.

**A table keyed by a name the code computes.** A key an identifier cannot spell
is written quoted, so the key set, the completion list and the misspelling check
survive:

```luam
interface ClientFonts {
    ['medium:20']: string
    ['bold:15']: string
}
```

Read it through the index form — `fonts['medium:20']` — because `.` takes an
identifier.

**A function returning several values.** Declare the return as a parenthesised
list, and every caller destructures with all three names typed:

```luam
local function positions(): (number, number, number)
    return 1, 2, 3
end

local x, y, z = positions()

print(x, y, z)
```

**A reserved word used as a parameter name.** `type`, `class`, `new`, `enum`,
`export` and the rest cannot name a parameter or a local. Rename the parameter; a
**property** of the same name is still legal, so `marker.type` on the next line
keeps working.

## What Luam refuses

**Instantiating a class the code names at runtime.** There is no value that
stands for a class and no `new` over a computed name. Write a registry — a table
listing the classes, each entry created with `new` — and iterate that; the
constructor arity, the argument types and the registry's value type are then all
checked. `getClass(name)` and `getClasses()` remain as the untyped escape hatch,
and everything they produce is `any`. The decision, the rejected options and the
boundary are recorded in
[ADR-045](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/045-runtime-named-instantiation.md).

**Auto-loading by walking `_G`.** The same decision covers it. The registry is
the loading order, written down.

## What the port finds

The port that produced this page surfaced **seventeen genuine defects** in a
resource that had been running in production: an optional field returned where a
caller expected a required one, a config key that never existed, a handler that
validated every argument and then did nothing with the result, an arithmetic on a
value that could be `nil`.

None of them were visible to the Lua language server, because none of them are
syntax. They are the return on the port, and they arrive as diagnostics on the
first `luam check`.

## Where the shapes are kept

Every shape on this page is checked in as a compiler corpus, so a regression in
any of them fails the suite rather than the next port. See
[Limitations](/en/reference/limitations) for what still has no equivalent.
