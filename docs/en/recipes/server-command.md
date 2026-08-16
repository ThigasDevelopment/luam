# Server command

A chat command with an optional numeric argument, clamped and reported back to
the player.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).

## File tree

```
luam-docs-server-command/
├── .luam.manifest
└── src/
    └── server/
        └── heal-command.luam
```

## Source

<<< @/snippets/server-command/.luam.manifest{js}

<<< @/snippets/server-command/src/server/heal-command.luam

## What to notice

- **Command arguments arrive as strings.** MTA passes the command name as the
  second parameter and every argument after it as text, which is why `amount` is
  `string?`.
- **`tonumber(amount) or MAX_HEALTH` is a union.** Its type is
  `number? | number`, and Luam does no narrowing, so the local is annotated
  `any`. That is the idiom for an `or` default. See
  [Limitations](/en/reference/limitations).
- **`target.clamp(0, MAX_HEALTH)`** is a [number extension](/en/language/extensions)
  compiling to `math.clamp`, which pulls `lib/math.lua` into the build.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/server-command.check.txt{text}

The build writes the `math` helper because `clamp` is used:

```
build/luam-docs-server-command/
├── meta.xml
├── lib/math.lua
└── src/server/heal-command.lua
```

In game:

```
/heal 40
Healed from 60 to 100 HP.
```

## A common error

Writing the argument as `number` fails, because MTA hands the handler a string:

```
src/server/heal-command.luam:3:44 error check-type-mismatch: ...
```

Keep the parameter `string?` and convert inside the function.

## Security note

`addCommandHandler` gives the player control over the argument. Validate the
range on the **server**, as this recipe does with `clamp` — a client-side check
would be advisory only. Restrict who may run a command with MTA's ACL rather than
with a name comparison.
