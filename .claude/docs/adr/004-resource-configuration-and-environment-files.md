# ADR-004: Split resource configuration between `config.lua` and `.env`

**Status:** Accepted

**Context:**
A generated resource carries two kinds of settings that look alike and behave
nothing alike. Structural settings — spawn points, colours, limits, feature
flags — belong to the resource and change when the resource changes. Deployment
settings — database credentials, API tokens, host names — belong to the machine
the resource runs on and change when the server changes, edited by an
administrator who never opens the source tree.

Treating both as compiler output makes the second kind unusable: `writeResource`
rewrites any generated file whose content differs and `pruneResource` deletes
generated files, so an administrator's edits disappear on the next build.

MTA makes the distinction load-bearing rather than cosmetic. Every `<file>`
entry in `meta.xml` is downloaded to every player and cached on their disk, so
anything reachable by a client script is public. Server-side `fileOpen` reads
any file in the resource directory without a manifest entry, so a file that is
never declared is never transmitted.

`luam.json` was considered as the place to declare environment values, but it
is versioned, which is the wrong home for a per-machine secret.

**Options considered:**
- One configuration file for everything — Cons: either the compiler owns it and
  administrator edits are lost, or it does not and nothing is typed. Sensitive
  values sit next to public ones with no rule saying which is which.
- Environment values declared in `luam.json` — Pros: a single versioned schema
  the checker can read directly. Cons: puts per-machine secrets in a versioned
  file, and the file is shared by every deployment.
- Values injected as globals in `_G` — Cons: collides with developer code and
  offers no single surface for the checker to type.
- Two files with different owners — the resource author owns structural
  configuration, the server administrator owns deployment values.

**Decision:**
Structural configuration lives in `config.lua` at the resource root. It is
plain Lua 5.1, authored by hand, copied verbatim, and listed in `meta.xml` as
a shared script. The compiler does not parse it, so it is untyped. It exposes
one global table.

Deployment values live in `.env` files, read only on the server. Three files
with three owners:

| File | Versioned | Owner | Role |
|---|---|---|---|
| `.env` | yes | resource author | declares the keys and safe defaults; the source of truth for types |
| `.env.local` | no | developer | overrides values on the developer's machine |
| `build/.env` | no | server administrator | the deployed values |

`build/.env` is generated on the first build from the keys in `.env`, with
sensitive values left blank, and is never overwritten afterwards. A local run
reads `.env` with `.env.local` layered over it.

The guidance a developer applies when choosing between the two: if a player may
see it, it belongs in `config.lua`; if only the server may know it, it belongs
in `.env`.

Values reach Luam code through `process.env`, a read-only table built by the
`env` runtime library. Reading an undeclared key and assigning to any key both
raise an error, and the metatable is sealed. The library returns early on the
client, so `process` does not exist there.

`process` is declared to the checker with `environment: 'server'`, so
`isAvailableIn` rejects it in client and shared files exactly as it rejects a
server-only MTA API. This is what keeps deployment values off the client; the
manifest rule that `.env` is never declared as a `<file>` is the second layer.

Types come from `.env`, never from `.env.local` or `build/.env`. Unquoted
values carry their Lua type — `PORT=3306` is a number, `DEBUG=true` a boolean —
and quoting forces a string. Typing `process.env` member by member needs two
additions the type system does not have yet: a record descriptor holding named
members in `packages/mta-types/src/type-descriptor.ts`, and a `project` value
in `ApiSource` so a diagnostic can name `.env` as the origin rather than
implying an MTA API.

**Consequences:**
- Positive: each file has one owner, and no file is rewritten by someone other
  than its owner.
- Positive: a deployment value cannot reach a client without both the checker
  and the manifest rule failing.
- Positive: an administrator configures a server by editing one file at the
  resource root, without a toolchain.
- Positive: type checking reads a versioned file, so a machine without a local
  `.env.local` still type checks identically.
- Negative: `config.lua` is `any` in Luam. A typo in a key is `nil` at runtime
  with no diagnostic. [ADR-005](005-declaration-files.md) proposes the way out.
- Negative: `.env.local` is versioned nowhere while `.env` is committed, which
  inverts the convention Node developers bring from Vite and Next, where
  `.env.local` is the ignored file. Documentation has to state this directly.
- Negative: nothing forces a deployed `build/.env` to match the declared types.
  An administrator writing `PORT=abc` produces a runtime value the checker
  believes is a number. Closing this needs the compiler to emit the declared
  types alongside the file and the library to validate on load.
- Negative: `process.env` is a proxy over an empty table, so `pairs` does not
  iterate it. Dynamic access goes through the library instance instead.
