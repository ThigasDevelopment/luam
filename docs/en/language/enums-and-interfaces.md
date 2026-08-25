# Enums and interfaces

Both give a name to a shape. An enum reaches the generated Lua as a table; an
interface never does.

## Enums

```luam
enum MatchState {
    LOBBY,
    PLAYING,
    FINISHED,
}
```

- Members are **zero-based**: `MatchState.LOBBY` is `0`, `PLAYING` is `1`.
- A trailing comma is allowed.
- Members are checked. `MatchState.PAUSED` is `check-unknown-enum-member`, and
  the message lists the members that exist.
- An enum no file in the resource reads is **erased**, so an unused enum costs
  nothing. An enum declared in a shared file and read from a server or client
  file is kept, because the build looks at the whole resource.

### What reachability sees, and what it does not

Erasure is **silent**. No diagnostic reports it and no compiler option asks for
one, because an enum declares a module global and unused reporting covers locals
and parameters only.

Reachability is matched by **identifier name** across the resource sources. An
enum reached only dynamically, through `_G['MatchState']` or from a hand-written
`config.lua`, or from another resource entirely, is not seen by the build and
disappears. Read it once from a compiled source when something outside the build
depends on it.

A surviving enum is a **global**, not a local, so declaration order across files
matters at load time. Put it in a shared file and pin that file with `loadOrder`
when a server or client file reads it while loading.

Member names stay quoted in the generated Lua:

```lua
MatchState = enum { 'LOBBY', 'PLAYING', 'FINISHED' }
```

The runtime helper uses each element as a table key. An unquoted `LOBBY` would be
an undeclared global evaluating to `nil`, which makes the table empty and
produces an enum with no members that fails silently at every read.

A [development build](/en/reference/output-layouts#the-development-output-contract)
keeps the enum on the lines you wrote it on; a minified build puts it on one.

```luam
local state: number = MatchState.PLAYING

if state == MatchState.LOBBY then
    outputDebugString('waiting for players')
end
```

A member's type is `number`, which is what makes an enum value usable anywhere a
number is expected — including as an MTA argument.

Declaring the same enum name twice in one file is `check-duplicate-enum`.

## Interfaces

An interface is a **compile-only contract**. It is verified by the checker and
never reaches the generated Lua.

```luam
interface Describable {
    label: string
    describe(): string
}
```

An interface may declare fields and methods. A class states that it satisfies one
with `implements`:

```luam expect-error
class Round implements Describable {
    label: string = 'round'

    describe = function (): string
        return self.label
    end
}
```

An interface can extend one or more interfaces. The child inherits every field
and method, and classes implementing it must satisfy the complete contract:

```luam
interface Named {
    name: string
}

interface Identified {
    id: number
}

interface Entity extends Named, Identified {
    describe(): string
}
```

Compatible inherited declarations are merged. Incompatible declarations report
`check-conflicting-interface-member`; repeated parents and inheritance cycles are
also rejected.

A missing member is `check-unimplemented-interface`, and the message names it.
An optional member, written `name?: Type`, is not required: a class may omit it,
but a member it does declare still has to match the declared type.
Referring to an interface that does not exist in `implements` or `extends` is `check-unknown-interface`;
declaring the same one twice is `check-duplicate-interface`.

An interface is also usable as a type:

```luam static
local target: Describable = new Round()
```

## Which one do I want?

| You want | Use |
| --- | --- |
| A fixed set of named numbers | `enum` |
| A contract several classes must satisfy | `interface` |
| A name for an existing type | [`type` alias](/en/language/types) |
| Runtime behaviour | [`class`](/en/language/classes) |

## A complete example

<<< @/snippets/language/src/shared/enums-and-interfaces.luam
