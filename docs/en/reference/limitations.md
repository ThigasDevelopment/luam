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

## Narrowing follows a path, not an alias

**Design boundary.** Recorded in
[ADR-025](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/025-access-path-narrowing.md).

A [type guard](/en/language/types#type-guards) refines a **stable access path**:
a name, or a name followed by literal fields. `if self.connection ~= nil then`
refines the field inside the block it guards, and so does a nested path such as
`self.socket.handle`. A [discriminant](/en/language/types#discriminated-unions)
works on a path too, so `self.state.kind == 'ready'` picks the union member.

The fact is dropped as soon as the checker sees a write that can reach it: an
assignment to the path, to a prefix of it, to a path below it, to its root, one
inside a loop body, or one inside a function declared in the same block. A path
also has to be nameable end to end, so a call or a dynamic index produces no
fact at all and `session.slots[key]` keeps its declared type.

What the checker does not see is a second reference to the same table. A Lua
table is a reference, so a field cleared through another name leaves the
refinement standing:

```luam static
local alias = self

if self.connection ~= nil then
    release(alias)

    local handle: userdata = self.connection
end
```

`release` may set `alias.connection` to `nil`, and `self.connection` is still
`userdata` on the line below. Tracking that is a points-to analysis across
function boundaries, and the alternative — dropping every field fact at every
call — would erase the refinement whenever a single `outputDebugString` sits
between the guard and the use. Neither is what Luam does.

## A condition stored in a variable is not a guard

**Design boundary.** Recorded in
[ADR-031](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/031-flow-narrowing.md).

A fact is attached to the path a condition tested. Storing the condition in a
variable attaches nothing, because the variable is not the test:

<<< @/snippets/errors/flow-narrowing/src/server/adapter.luam{luam}

<<< @/snippets/output/errors/flow-narrowing.txt{text}

Test the path itself, in the block that uses it:

```luam static
if self.connection ~= nil then
    local handle: userdata = self.connection
end
```

Everything else about flow does carry. A branch that `return`s, `break`s, or
`continue`s hands the other side to the rest of the block; a path refined the
same way in every branch keeps that type after the join; an assignment refines a
union or an optional to the member it wrote; and a `while` leaves the negation of
its condition behind. See
[what a fact survives](/en/language/types#what-a-fact-survives).

A loop stays conservative on purpose: every path its body assigns loses its fact
for the whole loop, even where the write cannot run. The body is analyzed once,
against the state it would see on any iteration.

An operation must still be valid for the whole union: `key + 1` on
`string | number` is `check-invalid-operand`, because one of the members cannot
be added. Concatenation is the exception, since every member of
`string | number` concatenates.

## A method the receiver does not declare is not reported

**Design boundary.** Recorded in
[32.01](https://github.com/ThigasDevelopment/luam/blob/main/.claude/plans/32.01-method-call-checking.md).

`counter:bump(1)` is checked against the signature the receiver's type declares
for `bump` — argument count, argument types, and the return type it produces.
`counter:missing(1)` is not. The receiver resolves no member, the call keeps
returning `any`, and nothing is reported. Reading the same name with a dot is
`check-unknown-record-key`.

The asymmetry is deliberate. A `:` call is how Lua reaches a method a metatable
or a library attached at runtime, and a receiver the checker never saw annotated
has no member list to report against. Annotate the receiver and the call is
checked; the check follows the annotation, never the call syntax.

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

## Three metamethods stay blocked

**Design boundary.** Recorded in
[ADR-035](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/035-safe-class-metamethods.md).

A class declares a metamethod by its Lua name — `__tostring`, `__eq`, `__lt`,
`__le`, `__len`, `__concat`, `__unm` and the arithmetic operators. See
[classes](/en/language/classes#metamethods).

What stays blocked, whatever else is exposed:

- `__index` replaces member lookup, which the class helper owns.
- `__newindex` swallows a field write, which the class helper owns.
- `__call` makes an instance callable, which hides construction.
- `__gc` does not run for a table in Lua 5.1.
- `__metatable` and `__mode` hide or weaken the metatable the helper needs.

`__eq` follows Lua 5.1: it is called only when both operands are tables sharing
the same metamethod, so comparing instances of two different classes falls back
to identity whatever either class declares. And the checker does not verify that
an operator's operands declare the matching metamethod — a missing `__add`
surfaces when the code runs, not when it compiles.

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

## A call only the build can name is verified

**Design boundary.** Recorded in
[ADR-033](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/033-resource-export-abi.md).

A build writes an [export contract](/en/language/exports#the-export-contract),
and a call into a declared dependency is checked against it when the resource
name and the export name are both literal. Everything else is compiled and left
alone:

- A call whose resource or export name is computed at runtime. There is nothing
  for a compiler to resolve, and rejecting it would break code that works.
- A call into a resource with no contract on disk — one written in plain Lua,
  one not built yet, or one whose contract was never shared.
- The runtime itself. The contract is a compile-time artifact; MTA does not read
  it, and nothing checks at run time that the resource you call is the one the
  contract described.

A stale contract is checked as written. The build reads the file it finds; it
does not compile the provider to confirm the file still matches it.

## `config.lua` is never parsed

**Design boundary.** A build never reads project Lua for meaning.

It is copied verbatim, so the compiler knows nothing about its contents. Describe
it with a [declaration file](/en/language/declaration-files) to get types, or
generate one with [`luam config`](/en/tooling/cli#luam-config) — a command you
run and a file you commit, never a step inside the build. That command reads the
literal data and nothing else: a call, a concatenation, or a function in
`config.lua` is reported and skipped, and you declare it by hand.

Executing it to read its values would make a build run project code, which is
what the compiler refuses to do, so the extractor reads the file rather than
loading it. A value it produces is only as true as the file it read: change
`config.lua` and the declaration is stale until you run the command again.

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

## Development logs are read from disk, never from a server

**Design boundary.** The CLI opens no connection to an MTA server.

`luam dev` reads the **local** MTA server log. `luam dev --start-server` starts
the server in your terminal and follows
`<serverPath>/mods/deathmatch/logs/server.log` from there, which is what makes
the structured records and their source positions work.

There is no remote mode. Collecting logs from a server you cannot read from disk
would mean the CLI connecting to it, and the product went the other way: the
`transport` manifest field that used to configure a server connection was
removed, and `ensure` syncing files with `dev --start-server` restarting the
server it owns is what replaced it. Mount the remote log directory, or read it
where it is.

Two smaller edges: native lines for other named resources are ignored, and
unattributed engine lines can appear as plain server output because their origin
cannot be classified reliably.

Evaluating an expression on a running server is not part of any of this. That is
a debugger, and it needs its own protocol and its own security decision.
