# Luam compared

Luam is a typed language that compiles to Lua 5.1 for Multi Theft Auto. If you
already write Lua, Luau or TypeScript, most of this page is about the handful of
decisions that differ — what to expect, and what not to expect.

## At a glance

| | Luam | Lua 5.1 | Luau | TypeScript |
| --- | --- | --- | --- | --- |
| Runs on | MTA's Lua 5.1 | any Lua 5.1 host | the Luau VM | a JavaScript runtime |
| What ships | Lua 5.1 you can read and debug | the source itself | the source itself | JavaScript |
| Types | checked at build, erased | none | checked, gradual | checked at build, erased |
| Blocks | `end` | `end` | `end` | braces |
| Inequality | `~=` | `~=` | `~=` | `!==` |
| Line comment | `#` | `--` | `--` | `//` |
| Optional value | `name?: T` | — | `T?` | `name?: T` |
| Classes | `class`, lowered to metatables | metatables by hand | metatables by hand | `class` |
| Reuse across files | environment scope and load order | `require` | `require` | `import` |
| Platform API knowledge | the pinned MTA catalog, scoped per environment | none | Roblox types | DOM and library declarations |

## Coming from Lua

The foundations do not move. Blocks close with `end`, inequality is `~=`, tables
are 1-based, `nil` and `false` are the only false values, and the standard
library behaves as it does on your server today. See [Lua
foundations](/en/language/syntax).

Three things changed, and each one bought something:

- **Comments are `#`.** Luam adds `--` as a decrement statement, so the two
  would have collided. `#items` is still the length operator.
- **A `:` after a name introduces a type.** `local health: number = 100` is
  checked at build time and emitted as `local health = 100`.
- **The folder decides the environment.** `src/server`, `src/client` and
  `src/shared` are read by the compiler, not just by you, which is what lets a
  client-only API be an error in a server file.

What you gain over plain Lua in an MTA resource is a build that refuses to ship
a misspelled native, a wrong-side call, or an argument of the wrong type, plus a
generated `meta.xml` that follows the files you actually wrote.

## Coming from Luau

Both languages add gradual types to Lua and erase them before anything runs, and
both keep `end`, `~=` and the Lua standard library. The differences are about
the target:

- Luam emits **Lua 5.1 source** for a host it does not control — an MTA server
  running an unmodified interpreter. Luau is a language and a VM of its own.
- Luam writes its optional marker on the name — `name?: string` — rather than on
  the type.
- Luam comments are `#`; Luau keeps Lua's `--`.
- Luam has `class` with inheritance, interfaces and accessors, lowered to
  metatables at build time. Luau has no class syntax.
- Luam has no `require`. Files reach each other through the environment scope
  and the load order the manifest declares, which is how MTA loads a resource.

`continue`, compound assignment and string interpolation exist in both, with
Luam's interpolation written `` `text ${name}` ``. See [Template
strings](/en/language/template-strings).

## Coming from TypeScript

The type system will feel familiar: annotations, unions, intersections, literal
types, interfaces, aliases that take type parameters, narrowing, and erasure at
build time. Generic classes are not supported — see
[Limitations](/en/reference/limitations). The syntax underneath is Lua, not
JavaScript:

- Blocks close with `end`, not `}`, and inequality is `~=`, not `!==`.
- There is no `import` or `export` of names between files. `export` in Luam
  means something else entirely: it publishes a function to **other MTA
  resources** through `meta.xml`. See [Exports](/en/language/exports).
- Truthiness is Lua's: `0` and `''` are true, and only `nil` and `false` are
  false.
- Arrays are tables and start at index 1.
- There is no structural `undefined`. An absent value is `nil`, and an optional
  is written `name?: T`.

The compiler's job is also narrower than `tsc`'s: there is one target, Lua 5.1,
and no configuration that changes the emitted dialect.

## What Luam deliberately does not do

- It does not check types at run time. An annotation generates no guard, so data
  crossing a network event still needs a validation you write. See
  [Security boundaries](/en/mta/security).
- It does not replace MTA's model. A resource is still `meta.xml`, scripts per
  side, and the MTA API — Luam generates the first and checks the third.
- It does not add a package manager, a bundler for third-party code, or a
  runtime framework.

## References

- [Lua 5.1 reference manual](https://www.lua.org/manual/5.1/)
- [Luau documentation](https://luau.org/)
- [TypeScript handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Multi Theft Auto scripting wiki](https://wiki.multitheftauto.com/wiki/Scripting_Introduction)
