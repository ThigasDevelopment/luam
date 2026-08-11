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
- An enum that is never used is **erased**, so an unused enum costs nothing.

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

```luam
class Round implements Describable {
    label: string = 'round'

    describe(): string {
        return self.label
    }
}
```

A missing member is `check-unimplemented-interface`, and the message names it.
Referring to an interface that does not exist is `check-unknown-interface`;
declaring the same one twice is `check-duplicate-interface`.

An interface is also usable as a type:

```luam
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
