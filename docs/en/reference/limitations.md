# Limitations

What Luam deliberately does not do, and what to write instead.

## No type narrowing

`if value ~= nil then` does **not** refine `string?` to `string` inside the
branch, and an `or` default produces a union:

```luam
local requested: number = tonumber(amount) or 100
# check-type-mismatch: ... received "number? | number".
```

Annotate the receiving local as `any` when you have established the value is
present:

```luam
local requested: any = tonumber(amount) or 100
local total: number = current + requested
```

The same applies to unions: an operation must be valid for the whole union,
because nothing narrows it.

## Declaration order matters for classes

`extends` and `new` resolve against classes declared **earlier in the same
file**. A child declared above its parent is `check-unknown-class`. Order the
declarations; there is no hoisting.

## No static members, metamethods or generic classes

- A class has no static fields or static methods.
- Metamethods cannot be declared on a class.
- Classes take no type parameters.

Generic **type aliases** do work:

```luam
type Nullable<T> = T | nil
```

## The MTA catalog can lag a release

The catalog is a pinned snapshot generated from the MTA wiki. A function added in
a newer MTA release stays `any` rather than erroring — the call compiles and you
lose completion and argument checking for it. That is deliberate: a newer MTA
function must never block a build.

## Exports are named, never verified

`export` writes an `<export>` entry into `meta.xml`. It does not verify the
calling side, and it cannot carry an extra attribute such as `http="true"`.

## The editor does not re-check on a cross-file change

The language server does not re-analyze an already open file when a **different**
file changes, so a cross-module violation can surface only in `luam check`. Run
**Luam: Restart Language Server** to force a rescan.

## `config.lua` is never parsed

It is copied verbatim, so the compiler knows nothing about its contents. Describe
it with a [declaration file](/en/language/declaration-files) to get types.

## Type annotations are erased

They are a **compile-time contract**, not a runtime guard. A handler for an event
a client can trigger receives whatever that client sent, regardless of the
annotations on its parameters. Validate anything that crosses the network. See
[Security boundaries](/en/mta/security).

## One environment per file

A file is `server`, `client` or `shared` as a whole. There is no per-block
environment; split the file instead.

## Scope of the development logs

`luam dev` reads the **local** MTA server log only. It does not collect remote
logs, evaluate expressions, or observe runtime values. Native lines for other
named resources are ignored, and unattributed engine lines can appear as plain
server output because their origin cannot be classified reliably.
