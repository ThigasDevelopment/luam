# Limitations

What Luam deliberately does not do, and what to write instead.

## Narrowing reaches names, not fields

A [type guard](/en/language/types#type-guards) refines a **name** inside the
block it guards. A field keeps its declared type, however you test it:

<<< @/snippets/errors/field-narrowing/src/server/adapter.luam{luam}

<<< @/snippets/output/errors/field-narrowing.txt{text}

Copy the field into a local first:

```luam
local connection = self.connection

if connection ~= nil then
    local handle: userdata = connection
end
```

A guard clause does carry: when the block always exits with `return` or `break`,
the negated condition narrows the rest of the enclosing block. What does not
carry is anything subtler — a `while` that only sometimes breaks, a flag set in
one branch and read in another. There is no flow analysis beyond the guard.

An operation must still be valid for the whole union: `key + 1` on
`string | number` is `check-invalid-operand`, because one of the members cannot
be added. Concatenation is the exception, since every member of
`string | number` concatenates.

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

`export` writes an `<export>` entry into `meta.xml`, and `export http` sets
`http="true"` on it. What it does not do is verify the calling side: a
`call(resource, 'name', ...)` from another resource is never checked against the
signature you exported.

## The editor re-checks by declaration, not by edit

Editing a file re-analyzes the other files only when what that file **declares**
changes — a class, an interface, an enum, or a global, including the type of any
member. Editing a function body republishes diagnostics for that file alone,
which is what keeps typing cheap in a large project.

A file the workspace never scanned is still invisible until it is saved or
opened. Run **Luam: Restart Language Server** after moving files around outside
the editor.

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
