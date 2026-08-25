# Limitations

What Luam does not do, and what to write instead. This page describes Luam
%LUAM_VERSION%.

Every entry opens with one label, so you can tell what will change from what
will not:

| Label | What it means |
| --- | --- |
| **Planned** | An implementation gap with an owner. It will move. |
| **Design boundary** | A decision Luam keeps. A later feature may let you opt in; the default stays. |
| **Upstream constraint** | Imposed by a source Luam reads instead of owning. |
| **Platform constraint** | Imposed by MTA or Lua 5.1. It does not move. |

## Narrowing reaches names, not fields

**Planned.** Path-sensitive flow analysis is what lifts it.

A [type guard](/en/language/types#type-guards) refines a **name** inside the
block it guards. A field keeps its declared type, however you test it:

<<< @/snippets/errors/field-narrowing/src/server/adapter.luam{luam}

<<< @/snippets/output/errors/field-narrowing.txt{text}

Copy the field into a local first:

```luam static
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

## A class is a type everywhere, a value from its declaration

**Platform constraint.** A declaration takes effect when it runs, which is what
Lua does with every other statement.

`extends` and `new` resolve in both directions: a child may sit above its parent,
and a function may instantiate a class declared further down. What does not move
is the runtime. A class declaration is a statement, so the class exists as a
value only after its line has run, and instantiating it earlier is
`check-class-before-declaration`:

```luam static
local early = new Player()

class Player {
    name: string = ''
}
```

Inside a function body — a method, a constructor, any handler — `new` on a class
declared further down is fine, because the body runs after the declaration.

A reference that appears before the declaration sees the class but not yet its
members: reading one gives `any`, and the constructor arity is not checked.
Move the reference below the declaration to have both checked.

## No static members, metamethods or generic classes

**Planned.** Static members and generic classes are gaps, and a reviewed subset
of metamethods follows them.

- A class has no static fields or static methods.
- Metamethods cannot be declared on a class.
- Classes take no type parameters.

Generic **type aliases** do work:

```luam
type Nullable<T> = T | nil
```

Not all of it is coming back. `__index`, `__newindex` and `__call` stay blocked
whatever else is exposed, because each of them can replace member lookup,
swallow a write, or make an instance callable — and the class helper builds
identity, inheritance and construction on all three.

## The MTA catalog can lag a release

**Upstream constraint.** The catalog describes the MTA wiki, which Luam reads
and does not own.

The catalog is a pinned snapshot generated from the MTA wiki. A function added in
a newer MTA release stays `any` rather than erroring — the call compiles and you
lose completion and argument checking for it. That is deliberate: a newer MTA
function must never block a build.

A scheduled job re-reads the wiki and proposes the refresh as a pull request. It
never merges one, so the MTA release a Luam release describes is always a
reviewed decision.

## Exports are named, never verified

**Planned.** A versioned export contract will check the calls a build can
identify.

`export` writes an `<export>` entry into `meta.xml`, and `export http` sets
`http="true"` on it. What it does not do is verify the calling side: a
`call(resource, 'name', ...)` from another resource is never checked against the
signature you exported.

A call whose resource or function name is computed at runtime stays unverified
even then. There is nothing for a compiler to resolve.

## The editor re-checks by declaration, not by edit

**Planned.** A dependency graph will narrow what a declaration change re-checks.

Editing a file re-analyzes the other files only when what that file **declares**
changes — a class, an interface, an enum, or a global, including the type of any
member. Editing a function body republishes diagnostics for that file alone,
which is what keeps typing cheap in a large project.

When a declaration does change, every file that can see it is re-analyzed, not
only the files that use it. In a large project that is more work than the change
requires.

Files do not have to be open for any of it. The server scans the workspace when
it starts, and the extension watches `**/*.luam`, `.luam.manifest` and `.env*`,
so a file created, moved or deleted outside the editor reaches it without a
restart. An LSP client that registers no file watchers sees only what you open —
that is the client's half of the protocol, not a Luam setting.

## `config.lua` is never parsed

**Design boundary.** A build never reads project Lua for meaning.

It is copied verbatim, so the compiler knows nothing about its contents. Describe
it with a [declaration file](/en/language/declaration-files) to get types.

Executing it to read its values would make a build run project code, which is
what the compiler refuses to do. A future extractor may write the declaration
file for you from literal data — as a command you run and a file you commit,
never as a step inside a build.

## Generated Lua is the source, not a rewrite

**Design boundary.** A readable build renders what you wrote; it does not
reconstruct what it erased.

A readable build keeps one line of Lua for every line of Luam, and copies through
everything Lua 5.1 already accepts. What it does not do is restore what it
erased: an `interface` becomes a comment, not a runtime table. Read
[the development output contract](/en/reference/output-layouts#the-development-output-contract)
for what is rewritten, and
[Resolving an MTA runtime position](/en/guide/troubleshooting#resolving-an-mta-runtime-position)
for turning a generated position back into an authored one.

## Type annotations are erased

**Design boundary.** They are a contract between you and the checker, and the
compiler adds no runtime guard for them.

They are a **compile-time contract**, not a runtime guard. A handler for an event
a client can trigger receives whatever that client sent, regardless of the
annotations on its parameters. Validate anything that crosses the network. See
[Security boundaries](/en/mta/security).

Nothing will start generating those checks for you by default. A later feature
may generate them where you mark a boundary, and an unmarked function will emit
exactly what it emits today.

## One environment per file

**Platform constraint.** MTA assigns a side to each `<script>` entry, so the file
is the unit that has one.

A file is `server`, `client` or `shared` as a whole. There is no per-block
environment; split the file instead.

A `client do ... end` block inside a server file cannot work: the two halves
would load as separate chunks in separate processes, so a `local` they share
would have to become a global, a closure over a surrounding local could not be
lifted at all, and the order of their top-level effects would stop existing.

## Scope of the development logs

**Planned.** An authenticated bridge will cover a remote development server.

`luam dev` reads the **local** MTA server log only. It does not collect remote
logs, evaluate expressions, or observe runtime values. Native lines for other
named resources are ignored, and unattributed engine lines can appear as plain
server output because their origin cannot be classified reliably.

Evaluating an expression on a running server stays outside that bridge. That is a
debugger, and it needs its own protocol and its own security decision.
