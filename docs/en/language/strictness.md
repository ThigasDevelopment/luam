# Strictness

A directive on the first lines of a file decides how much the checker enforces.
The default is `#!strict` — you never have to write it.

| Directive | Effect |
| --- | --- |
| `#!strict` | Default. Every type rule is enforced. |
| `#!nonstrict` | Unannotated values are treated as `any`; annotated ones are still checked. |
| `#!nocheck` | The file is parsed and compiled, but not type checked. |

```luam
#!nonstrict

function readLegacyGreeting(): string
    local greeting = Config.greeting

    return greeting
end
```

## Per file, not per project

Strictness is a property of one file. A `#!nocheck` module next to a `#!strict`
module is normal and expected — it is how a project migrates a file at a time.

The directive must appear before the first statement. Environment directives
(`#!server`, `#!client`, `#!shared`) may sit beside it, in any order:

```luam
#!client
#!nonstrict
```

## What each level still does

Even with `#!nocheck`, the file is still **lexed and parsed**. Syntax errors
remain errors, the file is still compiled to Lua, and it still contributes its
scripts to `meta.xml`. What stops is type checking.

`#!nonstrict` sits in between: annotations you wrote are honoured, but a value
with no annotation is `any` instead of being inferred and enforced. It is the
level to reach for when a module reads a lot of untyped data.

::: tip Environment checks are not strictness
The `server` / `client` / `shared` rule is **not** part of strictness. A
`#!nocheck` file still may not call a client-only API from `src/server`, because
the environment decides which API exists at all. See
[Environments](/en/mta/environments).
:::

## Porting existing Lua

1. Rename `main.lua` to `main.luam`.
2. Put `#!nocheck` on the first line. The build passes.
3. Replace `--` comments with `#`, and `!=` with `~=`, if the file has any.
4. Move to `#!nonstrict`, then annotate the exported surface.
5. Delete the directive when the file is clean under `#!strict`.

Steps 2 through 5 can be spread over as many commits as you like; each one is a
file that keeps building.

## A complete example

<<< @/snippets/language/src/shared/strictness.luam
