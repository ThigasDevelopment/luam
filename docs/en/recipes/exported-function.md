# Exported function

Two functions another resource can call, and the `meta.xml` entries that make
that possible.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- A second resource to call from, or the server console.

## File tree

```
luam-docs-exported-function/
├── luam.json
└── src/
    └── server/
        └── scores.luam
```

## Source

<<< @/snippets/exported-function/luam.json

<<< @/snippets/exported-function/src/server/scores.luam

## What to notice

- **`export` is erased from the Lua.** What it produces is an `<export>` entry
  in `meta.xml`. The generated function is an ordinary global.
- **`reset` has no `export`,** so it stays internal. Exporting is opt-in per
  function.
- **`scores[name] or 0` is annotated `any`,** because Luam does no narrowing and
  an `or` default produces a union.
- **The export type follows the environment.** These functions live in
  `src/server`, so they are exported to the server side.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/exported-function.check.txt{text}

`meta.xml` gains one entry per exported function:

```xml
<export function="getScore" type="server" />
<export function="addScore" type="server" />
```

## Calling it

From another resource, in plain Lua:

```lua
local score = exports['luam-docs-exported-function']:getScore(player)

exports['luam-docs-exported-function']:addScore(player, 10)
```

Both resources must be running, and MTA's ACL must permit the call.

## Common errors

| You wrote | Diagnostic |
| --- | --- |
| `export` inside a function or an `if` | `check-export-not-top-level` |
| `export function api.getScore()` | `check-export-member` |
| `export local function f()` | `parse-export-local` |
| `export` in a `.d.luam` file | `check-export-in-declaration-file` |
| The same export name in two files | `project-duplicate-export` |

## Limitations

An export is **named, never verified** against the calling side, and it cannot
carry an extra attribute such as `http="true"`. See
[Limitations](/en/reference/limitations).

## Security note

An export is a public entry point into your resource. Validate its arguments as
you would a client event — another resource, or a caller you did not write, may
pass anything.
