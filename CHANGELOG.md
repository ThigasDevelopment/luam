# Changelog

Notable changes to Luam, newest first. Every heading below a released
version names the change set that shipped with it, and the date matches the
tag for that release. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Manual changes live in the documentation changelog, in
[English](docs/en/changelog.md) and
[Portuguese (Brazil)](docs/pt-br/changelog.md).

Releases before `0.2.0` were never published, so the work of milestones 1 to
13 is listed under `0.2.0`, the first release on npm.

## Unreleased

## 0.16.0 - 2026-08-25

### The Generated Lua Is The File You Wrote

#### Added

- A readable build now emits one line of Lua for every line of Luam, and copies
  through everything Lua 5.1 already accepts: indentation, blank lines, the space
  before a parenthesis, the quotes, and the semicolons you wrote. `luam dev` and
  `luam ensure` are always in this form, and `luam build` uses it whenever
  `output.minify` is `false`. There is no manifest field for it, because turning
  minification off is already the request for output meant to be read.
- A declaration with no runtime form stays visible instead of leaving a gap. An
  `interface`, `type`, `declare`, or `declare event` becomes a Lua block comment
  over the lines it occupied, its trailing semicolon inside the comment. An
  inline type annotation stays erased, so a generated signature reads as plain
  Lua.
- A build directive is a comment now, not a blank line. `#!client` reads
  `--!client` in the generated Lua, so the environment of a file is legible in
  the file itself and not only in `meta.xml`.
- An `enum` and a `class` keep the shape they were written in. A multi-line enum
  stays multi-line over its own lines with its members quoted, and a class keeps
  its body spacing and the semicolons written inside it while still receiving the
  quoted name, the implicit `self` parameter, and the member separators.

#### Fixed

- An erased declaration written with a trailing semicolon emitted a bare `;`.
  Lua 5.1 has no empty statement, so `interface I { name: string };` produced a
  file the runtime refused to load. The semicolon is now absorbed into the
  erasure, in every build.
- Lowering a `continue` no longer adds a line. The `repeat ... until true`
  scaffolding rides the first and last lines of the loop body, and the sentinel
  that carries an author's `break` past the wrapper shares a line with it, so
  `for ... do` and its `end` are copied through untouched.
- A single lowered statement no longer reformats everything around it. Canonical
  replacement narrowed from the enclosing top-level statement to the statement
  that actually needs lowering, so one compound assignment inside a handler
  changes its own line and leaves the handler's layout alone.

### A Caret That Lands On The Problem

#### Fixed

- The caret under a diagnostic ignored tabs. It padded with spaces while the
  terminal drew each tab several columns wide, so on a tab-indented file it
  pointed to the left of the code it meant. It now copies the indentation of the
  line it underlines.
- `parse-invalid-statement` pointed at the token after the offending expression,
  usually the semicolon, and said only what it expected. It now points at where
  the expression starts and names it: `"count.abs" is not a statement. Assign it
  with "=", pass it to a call, or remove the line.`

### The Wrong Form Is Now An Error

#### Added

- `check-extension-form` reports an object extension written in the other form.
  A property extension that is called, such as `count.abs()`, compiled to
  `math.abs(count)()` and failed at runtime on a call to a number. A call
  extension that is only read, such as `count.clamp`, compiled to an index that
  never runs. Both are rejected before anything is emitted.
- `check-not-callable` reports a call on a value the checker knows is not a
  function, such as `count()` on a number or `label()` on a string.

#### Fixed

- A statement the compiler has to lower kept the semicolon that closed it in the
  authored file. It used to be left behind, alone on the line after the lowered
  statement.

### A Shared Enum Reaches The Generated Lua

#### Fixed

- An enum declared in one file and read from another was erased. The build
  decided erasure from the declaring file alone, so the generated Lua held no
  table and the resource failed at runtime. Erasure now reads the whole
  resource: an enum any file reads is emitted, and only an enum nothing reads
  is erased.
- A declaration erased at the end of a file left its blank lines behind. The
  generated Lua now ends at the last line that carries code. The blank slots
  that keep line numbers aligned are still written everywhere else.

### No Transport To Configure

#### Removed

- **Breaking.** The `transport` manifest table, the `http` transport, and every
  field, diagnostic, and environment variable that served them. A manifest that
  still writes `transport` reports `config-removed-field` and names what replaced
  it. The removed codes are `config-invalid-transport`,
  `config-invalid-url-segment`, `config-missing-secret`,
  `config-plaintext-password` and `config-remote-plaintext-transport`.
- The CLI no longer opens a connection to an MTA server, so the only outbound
  request a build can make is the `min_mta_version` lookup.

#### Changed

- `luam ensure` builds and syncs the resource, and stops there. Loading the sync
  is `refresh` and `restart <name>` in the server console.
- `luam dev --start-server` is the one path that restarts a resource for you. It
  owns the MTA process and writes those commands to the console it started, which
  is what it already did.
- `luam init` scaffolds a manifest without a `transport` block.

### One Version, Checked Before It Ships

#### Added

- `pnpm release:prepare <version>` bumps every workspace package and promotes the
  `Unreleased` section of all three changelogs into a `## X.Y.Z - YYYY-MM-DD`
  heading. It refuses a malformed version, a version at or below the committed
  one, a version that already has a heading, and an empty `Unreleased` section in
  any locale, and it writes nothing when any of those fail.
- `pnpm docs:versions [tag]` fails when a workspace package, a changelog heading,
  a locale pair, or a supplied tag disagrees with `packages/cli/package.json`.
- `pnpm docs:obsolete` fails when current documentation, snippets, or maintained
  examples still show a removed form. A removed form is allowed only under a
  release heading no newer than the version that removed it, or through an
  exact-line exemption that records its replacement and reason.
- `pnpm release:notes` prints the GitHub release body, with anchors into both
  manual changelogs and this file.
- `pnpm docs:verify` runs the version and obsolete-content checks, and the
  documentation workflow now also triggers on package manifests, changelogs,
  release tooling, examples, and the workspace files.

#### Changed

- Every section of this file now sits under the release that shipped it. The
  header no longer claims that nothing is published.
- Both manual changelogs use the same dated release headings, so a locale cannot
  document a release the other one is missing.
- Version-specific install and extension examples in the manual are written as
  `%LUAM_VERSION%` and rendered from `packages/cli/package.json` at build time.
- The release workflow verifies the tag against the committed version and no
  longer stamps versions in the runner. It packages only what the tagged commit
  already declares, and it runs the full documentation verification first.

### Dead Configuration Says So

#### Added

- A manifest `local` that no field reads is reported as `check-unused-local`, a
  warning with a caret under the name. The manifest is always checked in its own
  strict mode, so this does not depend on `compilerOptions.noUnusedLocals`, and a
  leading `_` keeps the local on purpose.

## 0.15.6 - 2026-08-17

### Typed Events

#### Added

- `declare event 'name'(...)` declares the contract of a custom MTA event. It is
  erased from the output, takes its environment from the file path, and reaches
  every module of the project.
- The generated catalog carries the handler signature of all 203 built-in
  events, per environment.
- `addEventHandler` and `removeEventHandler` type their callback from the event
  name, and `triggerEvent`, `triggerServerEvent`, `triggerClientEvent` and the
  latent variants check their payload against the signature of the side they
  reach. An unresolved name keeps the permissive MTA signature.
- Completion inside an event-name string lists the contracts, the names created
  with `addEvent`, and the catalog events of the targeted side; hover shows the
  contract and its origin; signature help names the handler and payload
  arguments; the outline lists declared events.

#### Changed

- `event` is contextual after `declare` only, so `local event` still compiles.

## 0.15.5 - 2026-08-16

### Contextual Callback Types

#### Added

- Function expressions inherit parameter types from their call-site callback
  contract, including environment-specific MTA callbacks.
- Completion, hover, navigation, and signature help use contextual callback
  parameters and can insert generated parameter names into an empty callback.

#### Changed

- The generated MTA catalog retains nested callback signatures and exact
  server, client, and shared variants from upstream declarations.

### Readable Lua Preserves Authored Formatting

#### Changed

- Readable modules preserve authored whitespace, quotes, semicolons, comments,
  and multiline layout while Luam-only syntax is erased.
- Top-level statements requiring lowering use canonical Lua without reformatting
  neighboring statements, while source maps cover expanding transformations.
- Production minification removes readable formatting and keeps production bytes
  compact.

## 0.15.4 - 2026-08-16

### CLI-Owned Local MTA Server

#### Added

- `luam server` runs an existing Windows or Linux MTA installation in the
  foreground, and `luam dev --start-server` waits for it before the first sync.
- The integrated development flow refreshes and restarts the resource through
  the owned MTA console, including the first deployment, without HTTP transport.
- `development.server.executable` selects a contained executable under
  `serverPath`; platform defaults are probed when it is unset.

#### Security

- Local server launch uses no shell, validates real path containment, and stops
  only the child owned by the current command.

## 0.14.0 - 2026-08-15

### Parent Calls Use `super(...)`

#### Changed

- Parent constructor and overridden method calls now use `super(...)` directly.
  The former `self:super(...)` syntax reports `check-invalid-super`.
- Class hover includes inferred constructor return types, and completion offers
  `super` inside subclass methods.

## 0.13.0 - 2026-08-15

### The Administrator Edits `.env`, Not Lua

0.12.0 compiled the declared keys straight into `env.lua` and handed that file to
the server administrator. It removed the runtime parser, but it also handed a Lua
table to the person least equipped to edit one: an unquoted string is a syntax
error, the file then fails to load, `env` is never defined, and every read blows
up far from the mistake. A format that tolerates a typo was traded for one where
a typo takes the resource down.

The two files now split by who owns them. `.env` is written once and owned by the
administrator, in the `KEY=value` form they already know. `lib/env.lua` is a
generated server helper that reads it, and like every other helper it is
rewritten on each build — so the reader always matches the project while the
values stay with the server. Editing `.env` and restarting is all a deploy needs,
and neither `build` nor `ensure` ever overwrites what the administrator set.

`process` is gone with it. It was declared by the checker and published by the
old runtime; the reader publishes only `env`, so keeping `process` typed would
have promised a global that no longer exists.

#### Added

- `env.lua`, a generated server helper that reads the deployment file named by
  `environment.file` and publishes `env`. It is written to `lib/` like any other
  helper, and the file it reads is substituted at build time.

#### Changed

- The deployment file is `.env` again, written once, never overwritten, never
  pruned, with sensitive-looking keys blanked for the administrator to fill.
- `env.lua` is regenerated on every build instead of being written once, so a key
  added to the project can never leave a stale reader behind on the server.

#### Removed

- `process` and `process.env`. Read `env` instead. A file still naming `process`
  compiles, because an undeclared global is legal Lua — it simply reads nil at
  run time.

### The Editor Suggests the Environment It Typed

`env` was typed from `.env`, completed after a dot, and hovered — but the name
itself was never suggested. The completion list gathered the MTA catalog and the
project's own symbols, and the globals the manifest declared were in neither. You
had to know `env` existed to reach the keys the editor could already describe.

Hover repeated itself as well. A record renders as its own name, and the record
behind `env` is called `env`, so the hover read `env: env` — true and useless.

#### Added

- `env` is suggested in a server file whenever the project declares keys, and
  hidden in a client or shared file, matching the rule the checker enforces. The
  item names the file the keys came from.

#### Changed

- Hovering `env` lists the declared keys, their types, and their configured
  values instead of repeating the name. Completing a key shows its value too.

## 0.12.0 - 2026-08-15

### Deployment Values Are Compiled, Not Parsed

A resource carried 178 lines of Lua to read its own `.env` at start. `dotenv.lua`
held a parser — quoting, escapes, type casting, a sealed table — and `env.lua`
decided which file to read and when. The compiler already knew every key and its
type: it reads `.env` at build time to declare `env` and `process.env` for the
checker. The resource spent run time re-deriving what the build already had.

The keys are now written as Lua. A project with a `.env` gets a generated
`env.lua` at the resource root holding the values as a table, publishing `env`
and `process.env` behind a metatable that raises on an undeclared key and refuses
assignment. Nothing parses anything at run time.

The file belongs to the server administrator. It is written once and never
overwritten, so a later `build` or `ensure` replaces the code and leaves the
deployed values alone — a deploy from one machine can no longer overwrite another
server's configuration. A key whose name reads as sensitive is written blank for
the administrator to fill, so a secret never travels inside a build artifact, and
`.env.local` still reaches the checker and never the generated file.

#### Added

- `env.lua`, generated from the project's `.env` and declared a server script in
  the configuration slot of `meta.xml` — after the runtime library, before the
  sources. Written once, never overwritten, and never pruned.

#### Changed

- `env` and `process.env` are published by the generated file rather than by a
  runtime helper. Their types still come from `.env` through the checker, so a
  key the file does not declare is still `check-unknown-record-key` and no
  declaration file is needed to describe them.
- A resource no longer ships a `.env`. The values live in `env.lua`, and an
  already deployed `.env` is still protected from pruning.

#### Removed

- The `dotenv` and `env` runtime helpers, and `dotenv.lua` and `env.lua` from the
  runtime package. `helpers = { 'env' }` in a manifest is now
  `config-unknown-helper`.
- The `Dotenv` native class, with its constructor, members, and documentation.
  Reading a second environment file at run time is no longer part of the
  language.
- The `manual` helper injection kind, which had no remaining member.

### The Runtime Library Is One Directory

Runtime helpers were written to `lib/<environment>/`, so `class.lua` landed in
`lib/shared/` and a client-only `string.lua` in `lib/client/`. The directory
repeated what each `meta.xml` entry already carried, and it could never
disambiguate anything: a helper resolves to exactly one environment per build, so
two files with one name never existed.

#### Changed

- Runtime helpers are written flat to `lib/`. Each `meta.xml` entry still carries
  its helper's environment, and load order is unchanged — a helper still loads
  after everything it requires.

## 0.11.1 - 2026-08-15

### A Contract Comes From the Interface That Names It

A class and an interface may carry the same name, and `implements` resolved the
contract through a lookup that answers with a class first. The interface was
found; its members were not. A class implementing `Command` was checked against
the fields of a class called `Command` and told to implement `core` — a field no
interface ever declared, on a class that satisfied its actual contract
completely. The same lookup backed `interface extends`, so a class could stand in
for an inherited contract as well.

A name means what the position it sits in says it means. `implements Command`,
and `Command` after `extends` on an interface, now read the interface namespace
alone, and the member a class is checked for is looked up through the class
hierarchy alone.

#### Fixed

- `implements` collected the members of a class sharing the interface's name,
  reporting `check-unimplemented-interface` for fields the interface never
  declared and passing over the ones it did.
- `interface extends` inherited from a class of the same name.

`.luam.manifest` described a little of the project and left the rest implicit.
`sourceDirs` named a directory and the environment came from the folder inside
it; `assetDirs` copied one tree and a second, undeclared rule copied whatever
else lived beside the source; `oop` sat at the top level next to `outDir` as if
the two were the same kind of thing. There was no way to say which MTA version a
resource needs, which resources it depends on, or which `.env` a build should
read.

It is now a closed set of typed domains, each owning one thing and each read by
one implemented consumer. `compilerOptions` says how the checker reads the
project, `sources` says which files belong to it and on which side, `assets` says
what is copied and where it lands, `dependencies` and `engine` say what the
resource needs at run time, and `environment` says which files carry its
configuration. A field is only there because something reads it.

Nothing is copied by accident any more. The rule that swept non-source files out
of `sourceDirs` is gone — a data file beside server code needs a mapping, and in
exchange the contents of a built resource are what the manifest says they are.

#### Added

- `compilerOptions` with `strict`, `oop`, `noUnusedLocals`,
  `noUnusedParameters`, and `warningsAsErrors`. A file directive still wins over
  the project's strict mode, and a name starting with `_` is never reported as
  unused.
- `check-unused-local` and `check-unused-parameter`, off unless asked for.
- `sources`, mapping patterns to `server`, `client`, and `shared`. The side that
  matches a file is its environment unless the file says otherwise, and a
  disagreement is reported instead of resolved in silence. A file two sides claim
  is `config-source-side-conflict`.
- One path-pattern engine behind the compiler, the CLI, and the editor. It takes
  `*`, `**`, and `?` with `/` as the separator, and matches without backtracking,
  so no pattern can hang a build. Regex, negation, brace expansion, and extglobs
  are `config-invalid-pattern`.
- `assets`, a list of `{ from, to }` mappings. Everything a mapping names is
  copied and declared as `<file>`. A duplicate destination, or one that would
  overwrite `meta.xml` or the generated `lib/`, is `config-output-collision`.
- `dependencies`, written as `<include resource="..." />` and sorted, so MTA
  starts what the resource needs first.
- `engine.minVersion`, which becomes `min_mta_version`. Pinning a version keeps
  the build off the network entirely; the default still looks the latest release
  up and still succeeds without one.
- `environment`, selecting the file that declares the keys behind `env` and
  `process.env` and the file that overrides their values. The local file may
  never add a key, and it no longer reaches the deployment template — a value set
  on one machine stops there.
- `output.minify`, with `--minify` and `--no-minify`. `dev` and `ensure` never
  minify, so a stack trace stays readable while you work.
- Completion and hover for every domain, including the members of an `assets`
  entry, which the catalog could describe but the editor could not reach.

#### Changed

- The declaration and module caches are keyed on the compiler options and on each
  file's environment, so changing an option or moving a file between sides
  recompiles what it affects and nothing else.
- The language server resolves environment files from the manifest that selects
  them, rooted at the manifest's own directory. A project nested below a
  workspace folder still finds its own configuration, now because it is declared
  rather than because a search walked up to it.
- The watcher observes the roots the `sources` patterns imply.

#### Removed

- `oop`, `sourceDirs`, `assetDirs`, and `mta`. Each is rejected with
  `config-removed-field` naming its replacement rather than quietly aliased, so a
  stale manifest fails instead of building something other than what it says.
- `build-no-sources`, `build-source-dir-missing`, and
  `build-source-dir-outside-root`, replaced by `config-no-sources`,
  `config-missing-source`, and `config-escaping-path` — the manifest is where the
  mistake is, so that is where it is reported.

## 0.10.6 - 2026-08-14

### Directives Complete

`#` opens a comment, so the completion pass stopped at `#!` and offered nothing.
The six directives the language has were the one thing you had to remember
without help.

#### Added

- Completion after `#!`, offering `server`, `client`, `shared`, `strict`,
  `nonstrict`, and `nocheck`, each with what it does. It fires while the name is
  being typed, with or without a space after the marker, and on any line — not
  just the first. `#items` and an ordinary `# comment` are left alone.

## 0.10.5 - 2026-08-14

### A Nested Project Is Still a Project

The editor read `.env` only from the workspace folders it was opened with, so a
project living below one of them never found its own. Opening a repository that
holds a resource in a subdirectory reported `env` as not in scope on every
interpolation, while `luam check --cwd` on the same resource was clean — the CLI
is pointed at the project, the editor was not.

The lookup now walks up from the file to the nearest `.env`, bounded by the
workspace folders so nothing outside them is ever read, and the result is cached
per directory.

#### Added

- `destroy` on `Connection`, mapped to `destroyElement`. MTA does destroy the
  connection that way; what it does not have is the rest of the element surface.
- `OOP_MEMBER_ADDITIONS`, the override that declares a member the upstream class
  omits, resolved against the catalog so a wrong procedural name fails the build
  instead of shipping.

## 0.10.4 - 2026-08-14

### The Editor Says What It Knows

Signature help on an MTA constructor read `argument1: string, argument2: string`.
The names were in the upstream declaration and in the wiki documentation the
catalog already ships; the OOP surface just had no field to carry the link. Every
one of the 47 constructors was affected — `File(argument1: string)`,
`Connection(argument1: string, argument2: string)`.

Hovering a type alias showed `type Database` and stopped there, which is the one
thing the reader already knows. The name was hardcoded and the annotation was
never rendered.

#### Added

- `procedural` on an OOP constructor, linking it to the function it maps to, so
  signature help names the parameters and carries their documentation.
  `Connection('sqlite', ...)` now reads
  `Connection(databaseType: string, host: string, username?: string, ...)`.
- The definition in a type alias hover: `type Database = SQLite | MySQL`, with
  the type parameters of a generic alias included.

#### Fixed

- The multi-line branch of the OOP constructor emitter dropped the type
  descriptor entirely. It was unreachable until the procedural name made a
  constructor line long enough to take it.

## 0.10.2 - 2026-08-14

### A Table Literal Carries Its Shape

A table literal was typed `table` whatever it held, so nothing compared it to the
shape it was assigned to. `local data: Config = {}` compiled, a misspelled key
compiled, and a literal missing half the keys of its type compiled. The manual
documented this as a limitation rather than a gap.

A literal written with named keys is now a record built from those keys, checked
against the target the ordinary way. That is what reports the empty literal, the
missing key, and the misspelling — the last one through the key that is missing
rather than the one that is unexpected.

#### Added

- A shape for a table literal with named keys, with member types left unwidened
  so a string value can pick a member of a discriminated union.
- Completion inside a table literal now offers every key of a union until a
  discriminant is written, then narrows to the member that matches it.
- The mismatch names the key that is missing. Against a union, the literal-typed
  keys already written pick the member to report against, so the message points
  at the branch you meant rather than the whole union.
- Type completion in the two positions that were falling through to the value
  scope: the right of a type alias, including after `|` and `&`, and the keys of
  an object type, nested ones included. Both offered every global and function
  instead of the types.

#### Fixed

- `examples/resource` had no `.luam.manifest`, so it was not a project. Nothing
  loaded its `.env` and `env.SERVER_NAME` reported that `env` was not in scope.

#### Notes

- `{}` is unchanged in every container position: it still fits an array, a map,
  and `table`, and an unannotated `local items = {}` still widens to `table` so
  the object extensions keep working. Only a shape that requires a key rejects it.

## 0.10.1 - 2026-08-14

### Literals Are Types, and the Editor Knows the Shape

`true`, `false`, and a number were not types. The parser accepted `true` and
`false` in type position and the checker had nowhere to put them, so they
resolved to a named type that matched anything — and once undeclared names
warned, `local flag: true = true` warned about a form the grammar allows.

The editor knew less than the compiler. A union receiver offered no keys at all,
an intersection offered only the keys written inline and dropped everything it
inherited, and a table literal annotated with a type offered the global scope
instead of the keys it expects.

#### Added

- String, boolean, and number literal types, negative and decimal numbers
  included. A literal is assignable to its base type and to the same literal,
  never the reverse, and an unannotated local still widens, so `local flag = true`
  stays `boolean`.
- Booleans and numbers discriminate a union, so a two-case result written as
  `ok: true` and `ok: false` narrows.
- Key completion inside a table literal annotated with an object type, an
  interface, a class, or a union of those. Keys already written are dropped, the
  insert carries the `=`, and the surrounding scope stays available below them.
- Member completion on a union receiver, offering the keys every member declares.
- `variable.language.vararg.luam` for `...`, which the grammar was colouring as
  the concatenation operator.
- Value completion inside a string, offering the members of a literal type. It
  reads the type from the annotated local, the key of a table literal, or the
  parameter of the call it sits in.
- `Connection`, the element `dbConnect` returns. It was excluded from the
  generated catalog, so the connection was typed `Element` and there was no name
  to annotate it with. `dbExec` and `dbPrepareString` now take it, and the OOP
  surface carries its constructor, `exec`, `prepareString`, and `query` — and
  nothing else, matching the upstream class, which declares no parent. A database
  handle has no position, alpha, or attachment to offer.

#### Fixed

- Completion on an intersection lost the keys it inherited. The editor re-derived
  types from annotations on its own and could not resolve a named part; it now
  reads the aliases the checker already resolved, exposed on the check result.
- The catalog generator did not apply an element type alias to the return of a
  generated constructor, so `Object` reported `MTASAObject`, a name nothing
  declares.

## 0.10.0 - 2026-08-14

### Shapes That Combine and Unions That Narrow

`type SQLite = Base & { kind: 'sqlite' }` did not lex — `&` was not a character
the language knew, so the only way to extend a shape was `interface ... extends`.
A union of object types was worse than unchecked: it was accepted in an
annotation and then dropped, so `config.anything` on a `SQLite | MySQL` resolved
to `any` and no `if config.kind == 'mysql' then` ever refined it. The discriminated
union, the shape the pattern exists for, compiled without a single check.

#### Added

- `&` in type position, merging object types, interfaces, and classes into one
  record. It binds tighter than `|`, so `A & B | C` is `(A & B) | C`, and the
  merge is erased by the build.
- Key access on a union of object types, interfaces, and classes. A key every
  member declares gives the union of its types. Unions of anything else stay
  permissive.
- Narrowing on a string-literal discriminant. `value.key == 'literal'` keeps the
  members that can match, `~=` keeps the rest, and the `else` branch of a
  single-clause `if` gets the complement, so a guard clause that returns early
  narrows the rest of the block.
- `check-unknown-union-key`, reported when a key is missing from at least one
  member of the union.
- `check-invalid-intersection`, reported on a part of an intersection that is not
  an object type, an interface, or a class.
- `check-conflicting-intersection-member`, reported when two parts declare the
  same key with different types.
- `check-unknown-type`, a warning on a type name the file cannot reach. Nothing
  reported an undeclared type, so a misspelled element name compiled silently
  against a type that does not exist. The check is deferred to the end of the
  file, so a type declared further down, a recursive alias, and a
  self-referencing interface stay silent, and the name still resolves the way it
  always did — no source stops compiling.

#### Fixed

- The types manual claimed Luam performs no type narrowing and told the reader to
  annotate a checked value as `any`. Narrowing had already shipped, and the same
  page documented it a few sections later.

## 0.8.0 - 2026-08-12

### Every Reserved Word Completes

Completion offered the 32 reserved words at a statement, `constructor` in a
class body, and `extends` and `implements` in a class header, but never `fun` or
`super` — the two contextual names, which are exactly the ones an author cannot
guess from the grammar. Two misuses also compiled silently and failed only when
the resource ran: `self` outside a method emitted a read of a global that is
`nil`, and a class field named `constructor` replaced the constructor with a
value, so `new` called it.

#### Added

- `fun` completes in type position, beside the primitive types.
- `super` completes after `self:` inside a method of a class that extends
  another, and nowhere else.
- `check-invalid-self`, reported on `self` outside a class method and outside a
  `function Name:method()` declaration. A `local self` and an explicit `self`
  parameter both still resolve.
- `check-invalid-constructor`, reported on a class member named `constructor`
  that is declared as a field instead of as a method.

## 0.7.0 - 2026-08-12

### One Class Method Form

A class member could be written two ways. `name = function (...) ... end` is the
form the manual documents and the form the emitter mirrors; `name(...) { ... }`
was still parsed and still compiled, silently, with nothing naming it as the
older spelling. Two forms for one construct meant the editor accepted source the
manual does not describe, and a project could carry both.

#### Added

- `parse-class-method-form`, reported on the member name when a class member is
  written as `name(...) { ... }`. The message names the form to write instead.
  The member is still parsed, so the rest of the class checks normally and one
  diagnostic is reported rather than a cascade.

#### Changed

- Every class in `examples/`, `docs/snippets/`, and the compiler fixtures is
  written in the `= function` form.

#### Removed

- `name(...) { ... }` as an accepted class member. Interface methods are
  unchanged: they have no body and keep `name(parameters): type`.

### Flat Bundle Output

#### Changed

- A bundle is the load-ordered concatenation of its helpers and modules, with no
  wrapper. Each member was emitted inside `do ... end`, which cost two lines per
  member and put scaffolding the author never wrote between a reader and the
  shipped code.
- Because the block is gone, every module in a bundle shares the bundle chunk
  scope. A file-level `local` is visible to every module after it in the same
  environment, and the Lua 5.1 limit of 200 active locals applies to the bundle
  rather than to each module. Neither is checked by the compiler, and the `tree`
  layout is unaffected, so a resource that relies on either builds correctly with
  `--no-bundle`.

### Hover Across Files

#### Fixed

- Hovering a class, interface, enum, function, or type alias declared in another
  file showed nothing. `hover` was the only navigation feature not given the rest
  of the workspace, so a name it could not resolve in the open document fell
  through to the MTA catalog and returned nothing, while go-to-definition on the
  same name worked. The hover now names the declaration and the file it comes
  from, and respects the environment rules, so a server file does not see a class
  declared under `src/client`.

## 0.6.0 - 2026-08-12

### The `.luam.manifest` Dialect

`luam.json` was the same on every machine and for every command, so a project
that wanted a development `outDir` or an `http` transport only when a password
was present kept two files and remembered which one to pass to `--config`. A
manifest now varies by mode and environment, and it is written in Luam — the
compiler parses, checks, and evaluates it in process, so a configuration mistake
reads like a compile error and the editor understands the file.

#### Added

- `.luam.manifest`, a restricted Luam dialect at the project root. It holds
  `local` declarations and assignments to configuration fields. A value is a
  literal, a table, or those combined with `and`, `or`, `not`, comparison,
  arithmetic, and concatenation. There are no calls and no function values, so
  evaluating a manifest is pure and total.
- `mode` (`development` for `dev` and `ensure`, `production` for `build`,
  otherwise the command name), `env` (a table of `string?`), and the absolute
  `root`, in scope alongside the configuration fields and nothing else.
- `--manifest <path>`, which loads an alternate `.luam.manifest` for a
  deployment profile.
- Positioned configuration diagnostics: every one carries a line and a column, so
  `outDir = 5` points at the value rather than at the file.
- Manifest support in the language server — diagnostics as you type, completion
  for every field with its type, whether it is required, and its default, and
  completion for the closed sets inside the quotes; hover names the field's full
  path and type.
- A `luam-manifest` file association in the VS Code extension, with its own
  grammar, `#` comment configuration, and light and dark document icons,
  separate from the `.luam` grammar.
- `config-unsupported-manifest`, `config-unreadable-manifest`,
  `config-invalid-statement`, and `config-invalid-expression`.

#### Changed

- **Breaking.** `luam.json` is no longer read, merged, or reported, even when it
  sits beside a `.luam.manifest`. Rename the file, drop the outer braces and the
  quotes around the field names, write `=` instead of `:`, and rename `--config`
  to `--manifest`.
- **Breaking.** `--config` was renamed to `--manifest` on `build`, `check`,
  `dev`, `ensure`, and `trace`.
- **Breaking.** `transport.kind` is required once a `transport` table is written.
  `transport = { }` is `config-missing-field` instead of silently meaning `none`.
  Omitting the table entirely still means `none`.
- `luam init` writes `.luam.manifest` and nothing else.
- The language server reads the manifest directly, so a change to `oop` takes
  effect on save rather than after the next CLI run. No diagnostic carries the
  manifest source or an environment value.

#### Removed

- `config-invalid-json` and `config-unreadable`, which described the JSON reader.
- `.luam/settings.json`. There is no settings snapshot, and no child process
  evaluates the manifest.

### HTTP Exports

#### Added

- `export http function name()` emits an MTA export with `http="true"`.

#### Changed

- A regular `export function name()` now emits an explicit `http="false"`.

### One-Line Production Lua

MTA downloads every client script to every joining player, and until now those
scripts shipped with the comments and indentation the emitter wrote for a reader
who never sees them.

#### Added

- A Lua 5.1 token scanner and a minifier. `luam build` writes every generated
  `.lua` file — bundles, the mirrored tree under `--no-bundle`, runtime helpers,
  and `config.lua` — as one line with comments and formatting removed. A single
  space is inserted only where two tokens would otherwise merge, so `a - -b`
  never becomes a comment and `1 .. 2` never becomes a malformed number.
- `minified: true` on the resource map `luam build` writes, and a `luam trace`
  that refuses such a map with an actionable message rather than resolving a
  generated line that a one-line artifact does not have.

#### Changed

- `meta.xml`, `.env`, and copied assets are still written untouched, and no
  identifier is renamed, so a production error names the symbol the developer
  wrote. `luam ensure` and `luam dev` output is unchanged.
- Minification runs over the whole file set in memory before the first write, so
  a file that does not scan as Lua 5.1 aborts the command with its file and line
  and leaves the previous production resource intact.

### CLI Command Registry

The hand-written parser wrote every flag into one flat record, so it accepted
every option on every command and silently ignored the ones that did not apply.

#### Added

- `luam <command> --help` and `luam help <command>`, generated from each
  command's own declaration instead of a maintained string constant.
- Declarative command modules over `commander`, a shared project-context factory,
  and an `index.ts` that does nothing but assign `process.exitCode`.

#### Changed

- Every option now belongs to the commands that read it, and an option outside
  that set exits `2` without running the command. `luam dev --bundle` fails
  instead of warning, `luam check --offline` and `luam doctor --config` fail
  instead of succeeding, and `--version` is a root option. Exit codes `0`, `1`,
  and `2` keep their meanings. See the migration table in the CLI reference.

## 0.3.0 - 2026-08-11

### Object Types

An argument bag is the most common shape in an MTA resource, and the only way to
type one was to declare an `interface` for it. Luam now accepts an object type
inline, wherever a type is accepted.

#### Added

- `{ key: Type }` as a type annotation, on locals, parameters, fields, return
  types, type aliases, and nested inside another type. Keys are separated by a
  comma, a semicolon, or a line break, and the optional marker attaches to the
  key — `team?: string`. The annotation is erased like every other one.
- Key checking on a value with an object type. Reading a key the type does not
  declare is `check-unknown-record-key`, and an alias lends its name to the
  message, so a misspelled key on a `SpawnArgs` names `SpawnArgs`.
- Structural assignability between object types: a source is accepted when it
  declares every key the target requires with a compatible type, and a key the
  target marks optional may be missing. A table literal carries no shape, so it
  stays assignable to any object type.
- `parse-duplicate-key`, reported when an object type declares the same key more
  than once.
- Editor support: hover and signature help render an object type by its keys,
  completion after a dot offers the keys, including keys of a nested object type,
  and the grammar keeps highlighting the types inside the braces.

#### Changed

- A local declared with an annotation now takes its type from that annotation in
  the language server instead of from its initializer, so completion after a dot
  follows the declared type.

### Completion Inside a Block

Typing `args.` to see what is on a value is the moment completion matters most,
and it is exactly the moment the file does not parse. A statement that failed
inside a `do`, `if`, loop, or function body took the whole enclosing declaration
down with it, so the editor lost the parameters and locals it needed to answer.

#### Fixed

- The parser now recovers from a failed statement inside a block terminated by
  `end`, the way it already did inside a `{ }` body: the diagnostic is reported,
  the rest of the line is skipped, and the surrounding declaration survives. A
  parameter is offered after a dot in its own function body again, whatever its
  type — class, MTA element, or object type.
- A stray `}` inside an `end` block is reported once instead of twice.
- The language server resolves a type alias when it looks for the members of a
  value, so a parameter annotated with an alias of an object type offers its
  keys. A class or interface of the same name still wins, and a self-referencing
  alias stops instead of recursing.

## 0.2.1 - 2026-08-11

### Editor Detection on Windows

Editor launchers ship as `.cmd` scripts on Windows, and a direct process spawn
never applies `PATHEXT`, so `luam setup` and `luam doctor` reported no editor at
all on a machine with Visual Studio Code installed.

#### Fixed

- `luam setup` and `luam doctor` now detect editors on Windows. The command is
  resolved against `PATH` and `PATHEXT` before it runs, and a `.cmd` or `.bat`
  launcher is executed through `COMSPEC` as a single quoted command line, so a
  launcher installed under a path with spaces is invoked as one argument.

## 0.2.0 - 2026-08-11

### The `continue` Statement

Lua 5.1 has neither `continue` nor the `goto` that replaced the need for it in
5.2, so every MTA script inverts a condition or nests another `if` to skip one
turn of a loop. Luam adds the statement and lowers it, at no runtime cost.

#### Added

- `continue`, which skips to the next iteration of the innermost `for`, `while`
  or `repeat`. The loop body is emitted as a `repeat ... until true` block, where
  `break` leaves only that block. A block emits no opcode in Lua 5.1 and a
  constant `until true` emits no test, so the lowered loop runs the instructions
  it would have run without the wrapper. A loop with no `continue` is emitted
  exactly as before.
- A `__luam_break` flag, emitted only when a real `break` shares the loop level
  with a `continue`, so the two keep their own meanings. Nested loops each carry
  their own flag, and a `break` belonging to an inner loop is left alone.
- `check-invalid-continue` and `check-invalid-break`, reported by a jump pass
  that runs before type checking. They cover a jump outside any loop, including
  one inside a function body nested in a loop; a jump that is not the last
  statement of its block, which Lua 5.1 requires; and a `continue` inside a
  `repeat` that would jump over a local the `until` condition reads, which the
  wrapper would put out of scope.
- 15 tests covering the lowering across the four loop forms, the break flag, loop
  nesting, and every diagnostic. The suite is 1021 tests.

#### Changed

- **Breaking**: `continue` is a reserved word. A variable, parameter or function
  named `continue` needs a rename, as with the other 10 words Luam adds.
- **Breaking**: a `break` followed by another statement in the same block now
  reports `check-invalid-break`. It previously compiled and emitted Lua 5.1 that
  the target refused, since `break` there must close its block.

### Output Layouts and Source Maps

A shipped resource and a resource under development want opposite shapes. The
bundle layout collapses each environment into one script for release; the tree
layout keeps every module addressable while you work. A resource map connects
the two, so a line in a generated bundle names the line you wrote.

#### Added

- The bundle layout, which emits at most `src/shared.lua`, `src/server.lua` and
  `src/client.lua`. Helpers and modules stay isolated in `do ... end` blocks,
  helpers precede modules, and `loadOrder` still orders modules. `config.lua`,
  `.env` and assets are never bundled. An empty environment produces no bundle
  and no `<script>` entry.
- Deterministic resource maps at `<outDir>/<name>.luam-map.json`, recording each
  generated file, its module and helper segments, and sparse generated-to-source
  line mappings with the enclosing function, method or class symbol.
- `luam trace`, which resolves a generated position back to its authored line.
  It accepts a bare `file:line`, a full MTA log line, or one position per stdin
  line, and `--map` selects a map from another build.
- `output.bundle` and `output.map` configuration, plus the `--bundle`,
  `--no-bundle` and `--no-map` flags.
- `luam dev` resolves streamed `server.log` positions through its in-memory map,
  so a development record names the authored file, line and symbol.
- `project-bundle-toplevel-return` and `project-bundle-output-collision`, which
  fail a bundle build before anything is written.

#### Changed

- **Breaking**: `luam build` produces the bundle layout by default, because
  `output.bundle` defaults to `true`. A project whose module ends in a top-level
  return no longer builds without a change: keep the previous output with
  `--no-bundle` or `"output": { "bundle": false }`, or remove the return. Both
  bundle diagnostics name these switches. `ensure` and `dev` still write the
  tree layout by default, so no deployment shape changes on its own.
- `luam dev` warns that it ignored `--bundle` or `--no-bundle` instead of
  dropping the flag silently.
- `luam trace` rejects empty input before it looks for a map, and reports it
  instead of blocking on an interactive terminal that never reaches end of file.
- Default map discovery skips `node_modules` and dot directories. On a project
  with installed dependencies this replaced a multi-second full-tree scan and
  can no longer match a map shipped by a dependency.
- A configuration type error names the full path of a nested field, so a wrong
  `output.bundle`, `development.logs.enabled` or `transport.port` is no longer
  reported under its bare name. Unknown-field errors already did this.

### Native MTA Class Values

#### Added

- Typed MTA static methods such as `Player.getRandom()` with server/client
  scoping, argument checks, completion, hover, and signature help.
- Typed callable MTA constructors such as `File(path)`, preserving native Lua
  emission and keeping `File.new(path)` as the destructive creation operation.

### MTA Development Logs

#### Added

- `luam dev`, which reuses the build, server sync, restart, and watch workflow
  while following appended records from the local MTA `server.log`.
- A development-only client and server helper pair that preserves
  `outputDebugString`, validates and rate-limits relayed client records, and
  produces stable `[time][environment][level]` terminal lines.
- `development.logs` configuration for message length, rate, and window limits.
  Normal `luam build` and `luam ensure` resources do not include the helpers.

### Decorators and Generated Accessors

#### Added

- `@Getter` and `@Setter` on class fields or classes. Resolved boolean fields
  generate `isName`; other fields generate `getName`; setters use `setName`.
- Generated accessors are typed, inherited, satisfy interfaces, emit as ordinary
  Lua 5.1 methods, and appear in completion, hover, definition, and signature
  help without duplicating entries in the document outline.
- Decorator completion and hover, VS Code syntax highlighting, dedicated parser
  and checker diagnostics, a compiler fixture, and end-to-end resource coverage.

### Native Classes and the `env` Global

`Threads` and `Async` were libraries with a static `new`, which meant the
language had two ways to construct something. Now they are classes, built with
the same `new` a project class uses, and `Dotenv` joins them.

#### Added

- `Dotenv`, a server-only native class over the `.env` reader that already
  shipped: `new Dotenv('.env.production')` answers `get(key, fallback)`,
  `has(key)`, `all()` and `apply()`. `apply()` republishes its keys as the
  global environment. It rides on the new `dotenv` runtime helper, injected
  only when a module names `Dotenv`.
- `env`, a global the project already has whenever it has a `.env`. It carries
  the same typed keys as `process.env`, which stays valid, and is declared
  `server` for the same reason.
- 15 tests covering construction, the constructor signature, `env` typing and
  environment pinning, plus `env.` completion in the editor. The suite is
  852 tests.

#### Changed

- `Threads`, `Async` and `Dotenv` are constructed with `new`:
  `local tasks = new Async(100)`. The constructor signature is checked from the
  catalog and the instance keeps its members. `new Async(100)` lowers to
  `Async.new(100)`, so the runtime libraries are untouched — only a project
  class goes through the `new` helper in `class.lua`.
- **Breaking**: `Async.new(100)` is now `check-native-constructor`. There is one
  construction syntax in the language, and the message names the form to write.
- `env.lua` no longer parses `.env` itself. It loads `dotenv.lua` and applies
  the root file, so one parser serves both the automatic global and an explicit
  `new Dotenv(path)`.

### Increment, Decrement and the `fun` Type Keyword

Two small syntax changes that pull in opposite directions: one adds an operator
Lua never had, the other stops a type from borrowing a keyword.

#### Added

- `++` and `--` as statements. `score++` compiles to `score = score + 1` and
  `score--` to `score = score - 1`. They take a single variable, field or index,
  the target must be numeric, and they are statements only — never expressions,
  because Lua has no assignment expression to build on.
- 11 tests covering the two operators across the lexer, parser, checker and
  emitter, plus the `operators.luam` fixture. The suite is 836 tests.

#### Changed

- Function types are written `fun(string): void`, not `function(string): void`.
  `function` stays a reserved keyword for declarations alone, so a type never
  competes with a block header. Writing `function` in a type position reports
  `parse-invalid-type` with the replacement in the message. Diagnostics, hovers
  and signature help render the new form. **Breaking**: every existing function
  type annotation needs the keyword swapped.
- Comments now use `#` for a line and `#* ... *#` for a block. `#items` remains
  the length operator; a line comment starts with `# `, `#!`, or a bare `#`.
  **Breaking**: Lua's `--` and `--[[ ... ]]` comment forms now report a lexical
  diagnostic, while `--` remains the decrement statement operator.

### Editor Experience — Documentation, Signatures and Context

Writing Luam by hand exposed an editor that knew the types but never explained
them. The catalog carried signatures with no parameter names and no prose, so a
hover read `mta api (shared)` and nothing else. Completion answered every
position with the same list of globals, and a half-typed line inside a class
discarded the class.

#### Added

- API documentation generated from the upstream `mtasa-lua-types` JSDoc:
  description, parameter names, per-parameter text, return text and the wiki
  link, for 1161 of the 1294 catalogued globals. It lands in
  `src/generated/docs/`, imported only by the LSP, so the CLI bundle is
  unchanged at 400 KB while the language server carries the prose.
- Signature help. Typing `outputChatBox(` now shows
  `outputChatBox(text: string, visibleTo?: …)` with the active parameter
  highlighted and its documentation beneath. It resolves MTA globals, Lua
  library members, MTA OOP methods, and functions declared in the file.
- Event-name completion. Inside the name argument of `addEventHandler`,
  `addEvent`, `triggerEvent`, `triggerServerEvent`, `triggerClientEvent` and
  their latent forms, the editor offers the events for the file's environment
  plus every custom event the workspace declares with `addEvent`.
- Type-position completion. After an annotation colon — a local, a parameter, a
  return type, a class field, or the next option after a union bar — the list
  holds only primitives, project classes, interfaces, enums and MTA element
  types.
- Parser recovery inside class bodies, interface bodies and brace blocks. A
  broken member or statement is reported and skipped, and the surrounding
  declaration survives.
- 42 tests covering documentation, signature help, the two new completion
  contexts, variable values and `self`. The suite is 805 tests.

#### Changed

- Hover on an MTA function renders the description, a named signature, the
  documented parameters, the return text and a wiki link, instead of the bare
  scope line.
- Completion items for MTA functions carry the same documentation and a detail
  line with parameter names rather than bare positional types.
- Hover on a local shows its value — `local maxPlayers: number = 32` — for a
  literal, or the call that produced it.
- Completion returns nothing inside a comment, and nothing inside a string that
  is not an event name, rather than the full list of globals.

- Hand-written documentation for the Lua standard library, the three Luam
  library tables and the native runtime — every Lua global, all 39 `math`,
  `string` and `table` members, and the `Thread`, `Threads` and `Async`
  surfaces. Lua entries link the 5.1 manual, and a Luam addition says so.
- A file icon for `.luam`, contributed per language so it slots into whatever
  file icon theme is active rather than replacing it. The mark is the crescent
  from the extension logo with its orbiting body, redrawn to stay legible at
  16 pixels, in a light and a dark variant.
- 24 tests covering the Lua and runtime documentation, the native library
  completion, the indentation rules and the icon contribution. The suite is
  829 tests.

#### Fixed

- `self` lost its type while a class method was mid-edit. A parse error inside
  a class body used to discard the whole class declaration, so typing `self.`
  removed the very information the completion needed.
- A diagnostic was listed in Problems but drawn nowhere in the editor. Ranges
  were one character wide, and a parse error at end of file landed on an empty
  line with nothing to underline. Parser diagnostics now carry the offending
  token's end, the checker's are widened to the whole token, and a range that
  would still be empty snaps back to the last visible character.
- `Async`, `Thread` and `Threads` offered no members. Member resolution
  consulted the project globals but never the API catalog, so the natively
  injected records resolved to nothing.
- Enter after a Lua block header reset the indentation. The increase pattern
  required a line to be exactly `function`, so `function greet()` and
  `local function greet()` never nested. Both patterns now follow the
  well-tested Lua rules, extended for braces and hanging parens.

### Milestone 13 — The Generated Manifest Standard

The generated `meta.xml` now reads like the file a resource author would write
by hand, recorded in
ADR-008. This is a
breaking change for any project already written against milestone 10 or the old
resource layout.

#### Added

- `loadOrder` in `luam.json`: an ordered array of source paths pinned ahead of
  their group in the manifest. It orders scripts and assets alike, since a
  shader can depend on another. An entry matching no file is
  `project-load-order-missing`, which fails the build naming the entry, so a
  rename cannot break the order silently.
- `min_mta_version` resolved at build time from the latest
  `multitheftauto/mtasa-blue` release. The value is cached in
  `.luam/mta-version.json` with a 24-hour freshness window, falls back to the
  cached value when the network is unavailable, and warns and omits the element
  when there is neither. No path in that chain can fail a build.
- `--offline` and the `LUAM_OFFLINE` environment variable skip the release
  lookup entirely, so CI and offline work stay deterministic.
- A `version` build phase, so the lookup's duration is visible in the timing
  breakdown rather than hidden inside discovery.
- Section comments in the manifest — `Resource information`, `Runtime library`,
  `Configuration`, `Source scripts`, `Exported functions`, `Assets`,
  `Minimum MTA version` — emitted only above a group that has entries.
- 39 tests covering the attribute policy, the wildcards, `loadOrder`, the
  helper relocation, pruning without the manifest enumeration, and the release
  lookup stubbed three ways. The suite is 747 tests and reaches no network.

#### Changed

- **Runtime helpers moved from `src/<environment>/lib/` to
  `lib/<environment>/`.** A helper inside `src/` would be matched by the new
  source wildcard as well as by its own explicit entry, and loading `class.lua`
  twice resets the class registry. This supersedes the helper location in
  ADR-003;
  the environment separation is unchanged.
- **Each environment's scripts collapse into one wildcard entry** —
  `src/shared/**/*.lua` rather than one line per file. Adding a module to an
  environment that already has one leaves `meta.xml` byte identical. A directory
  whose files do not all match the environment their path implies is enumerated
  explicitly instead, because a wildcard cannot express two types.
- `<info>` carries no `name`; MTA reads the resource name from the containing
  folder. Attribute order is `author`, `type`, `version`, `description`. Renaming
  the resource in `luam.json` changes the output directory, not the manifest.
- An attribute equal to the MTA default is omitted, so a server `<script>` and a
  server `<export>` carry no `type`.
- `cache="false"` is unconditional on every `client` and `shared` script, in
  development and production alike. The bandwidth cost is accepted deliberately.
- A shared `export` is one `<export type="shared" />` entry rather than the
  `server` and `client` pair milestone 10 emitted. The duplicate-export check is
  unchanged: it still compares one entry per name per side.
- Element order is `<oop>`, info, scripts, exports, files, `min_mta_version`.
- Pruning no longer reads the previous manifest, since an entry is now a pattern
  rather than a path. The removable set is the source directories, the asset
  directories, `lib/`, `meta.xml`, and every `.lua` file.
- `runBuildCommand` is async, because the release lookup is.
- The scaffolded `.gitignore` excludes `.luam/`.

#### Removed

- **The `setting` and `depends` build directives.** Parser, checker, manifest,
  editor completion, and VS Code grammar. Both words are ordinary identifiers
  again, so `local setting = 1` and a function named `depends` called with
  parentheses compile as plain source, and no input can produce a `<setting>` or
  an `<include>` element. This reverts that part of
  ADR-007; `export` is unchanged and
  the contribution channel stays. Gone with them: `check-setting-value-not-literal`,
  `check-depends-self`, `check-directive-not-top-level`, and
  `project-duplicate-setting`.
- `isCached` on `ManifestScript`, and `resourceName` from `CompileOptions`,
  `CompileProjectOptions`, and `CheckOptions` — it existed only for
  `check-depends-self`.
- `name` from `ResourceOptions`, which no longer reaches the manifest.
- `readDeclaredFiles`, which read the previous manifest for pruning.

#### Known caveat

- The manifest is no longer a pure function of the source. Reproducibility now
  reads "identical for a given resolved MTA version": the same commit built on
  two days can differ in `min_mta_version` alone.
- Whether MTA runs a file twice when an explicit entry and a wildcard both match
  it is still unverified on a real server. Nothing the compiler emits by default
  overlaps, so only a project that sets `loadOrder` is exposed.

### Milestone 12 — CLI Output and Build Feedback

#### Added

- One visual vocabulary for the CLI: a tone per severity, a marker per outcome,
  a symbol per phase, and a progress bar, all produced by
  `packages/cli/src/reporting/output-style.ts`. It is the only module in the
  repository that writes an escape sequence.
- Output capability is detected once per process — TTY, colour, unicode, and
  width. Colour and emoji switch off when the stream is not a terminal, when
  `NO_COLOR` holds a non-empty value, or when the new `--no-color` flag is
  passed. On a terminal without colour the run still advances, in ASCII.
- Named build phases: discovery, compile, assembly, manifest, and write, with
  `ensure` adding sync and restart. Each phase records its own duration, and
  `luam build`, `luam check`, and `luam ensure` close with a timing breakdown on
  a terminal.
- A progress renderer that paints the running phase, throttled to one frame per
  50 ms, drawing a counted bar for compile and write and a marker for the
  single-step phases. A run that finishes under roughly 150 ms — every warm
  rebuild — paints nothing at all. Frames go to stderr, so redirecting stdout
  captures the report alone.
- Diagnostics on a terminal are grouped under a bold path header and show the
  offending source line with a caret under the reported column, the diagnostic
  code, a parseable `path:line:column`, and the hint as a muted line. Output is
  capped at 10 entries per file and 10 files, with the remainder summarised.
- Each rebuild under `ensure --watch` is preceded by a timestamped rule.
- `ProgressEvent` and `ProgressReporter` in
  `packages/compiler/src/project/progress.ts`: a data-only contract carrying
  item, index, and total. Nothing under `packages/compiler` knows a terminal
  exists.
- 65 CLI tests across `output-style`, `build-phases`, `progress-renderer`,
  `diagnostic-layout`, and `cli-output`, covering the TTY and the piped path for
  every message kind.

#### Changed

- `createProjectCache().compile` accepts an optional `onProgress`, fired once per
  file in order. Omitting it leaves behaviour and timings identical.
- `assembleResource` accepts an optional `AssemblyReporter` third argument, so
  the CLI can time assembly and manifest generation separately without the
  function being split.
- `writeResource` accepts an optional `onProgress` and now counts the generated
  `.env` file, which it previously wrote outside the counted set.
- `runCompile(root, config, options)` replaces `runCompile(root, config, cache)`.
  `BuildOutcome` gained `phases` and the sources of the files carrying
  diagnostics.
- Commands print through a new `Reporter` rather than straight to `Logger`, which
  stays the plain sink it always was. `CommandContext.reporter` is optional, so a
  caller that does not supply one gets the plain path.
- Counted nouns are pluralised, so `Wrote 1 files` now reads `Wrote 1 file`.

#### Unaffected

- Piped output is the pre-milestone format, byte for byte: one line per
  diagnostic, no escape sequence and no carriage return in the transcript.
- The generated resource is byte identical between a plain and a rich run, and
  the 300-file benchmark is unchanged at 47.4–51.8 ms cold and 1.13–1.6 ms warm.

### Milestone 11 — MTA OOP API

#### Added

- The MTA OOP API is typed: **57 classes, 652 methods, 218 properties**,
  generated from the same pinned `mtasa-lua-types` snapshot as the procedural
  catalog. `player:getName()` resolves, returns `string`, follows the element
  hierarchy, and reports `check-unknown-member` for a member the element does
  not have.
- Every OOP member records the procedural function it wraps, read from the
  upstream `@see` wiki link rather than derived from the method name. A member
  whose target the catalog does not declare is dropped instead of guessed, so
  every member in the surface resolves to a declared function.
- An OOP member takes the environment of the function it wraps, so
  `player:kick()` in a client file is `check-environment-api` and names
  `kickPlayer`.
- Arguments to an OOP method are checked against the wrapped signature, so
  `player:setNametagText(5)` is `check-type-mismatch`.
- `"oop": true` in `luam.json` gates the whole feature. It writes
  `<oop>true</oop>` immediately above `<info>` — the first manifest element with
  text content rather than attributes — and enables the typing. With the flag
  off, the same call is `check-oop-disabled` and the message names the
  procedural function to use instead and the field that enables the API.
- Editor support: `player:` offers the element's members and the ones it
  inherits, scoped by environment and by the flag, and hover names the return
  type, the environment, and the procedural function the member wraps. The LSP
  reads the flag from `luam.json` in the workspace root.
- Generator scripts `oop-parser.ts`, `oop-surface-builder.ts`, and
  `oop-emitter.ts`, plus `oop-declaration.ts` and `oop-surface.ts` in
  `@luam/mta-types`. The drift test covers the generated OOP files, so a hand
  edit fails.
- A benchmark group for the OOP registry, and a cold build with the flag on.

#### Changed

- `compile`, `check`, and `createProjectCache().compile` accept `oop`. The flag
  folds into the ambient cache key, so flipping it rechecks every module.
- `assembleResource` accepts `oop` and `generateManifest` accepts a
  `ManifestOptions` argument.
- `MemberInfo` carries optional `environment` and `procedural` fields, set only
  for MTA members. `fingerprintDeclarations` ignores them, so project caches do
  not rekey.
- `obj:method()` is now checked when the receiver is an MTA element type. A
  method call on any other receiver is unchanged and still returns `any`.
- A class the project declares shadows the element class of the same name
  entirely, in the checker and in completion alike.

#### Unaffected

- A project that does not enable `oop` produces the same manifest and the same
  Lua as before the milestone. The emitter never rewrites an OOP call into its
  procedural form in either mode.

### Milestone 10 — Build Directives

#### Added

- Build directives: source-level words that describe how a declaration takes
  part in the built resource. They are contextual keywords — `KEYWORDS` in the
  lexer is still the Lua 5.1 set — they never change the emitted Lua, and each
  one contributes an entry to the generated `meta.xml`.
- `export function f()` marks a global function callable from another resource
  and adds `<export function="f" type="server" />`. A client file produces
  `type="client"`, and a shared file produces one entry per side.
- `setting NAME = <literal>` adds `<setting name="*NAME" value="..." />`. The
  value is a string, number, or boolean literal, optionally a negated number.
- `depends 'resource'` adds `<include resource="resource" />`. The same
  dependency declared in several modules collapses into one element.
- Directive diagnostics for the forms MTA fails silently on:
  `parse-export-local`, `check-export-not-top-level`, `check-export-member`,
  `check-export-in-declaration-file`, `check-directive-not-top-level`,
  `check-setting-value-not-literal`, `check-depends-self`,
  `project-duplicate-export`, and `project-duplicate-setting`.
- A contribution channel through the pipeline. `CompileResult.directives` carries
  what a file declares, `CompiledModule.contributions` carries the resolved
  manifest entries, and `assembleResource` merges them. A shared export expands
  into its two sides at the mapping step, so the manifest layer receives an
  already-resolved side. Adding the next directive costs a parse rule, a
  contribution kind, and a manifest element.
- Editor support: the TextMate grammar scopes `export`, `setting`, and `depends`
  as modifiers only in directive position, the LSP offers all three at statement
  position and nowhere else, and hover on an exported function names the sides it
  is exported to.
- `TokenStream.report` — a non-fatal parser diagnostic sink, so
  `export local function` reports once and the rest of the file still parses.

#### Changed

- `meta.xml` element order is `info`, `script`, `export`, `setting`, `include`,
  `file`, with each group sorted by its own key. A project that declares no
  directive produces a byte-identical manifest to the one before this milestone.
- `compileProject` and `createProjectCache().compile` accept `resourceName`, used
  by `check-depends-self` and folded into the ambient key.
- `FunctionDeclaration` gained `isExported`, and the AST gained
  `setting-directive` and `depends-directive`, both erased by the emitter.

#### Deferred

- Export attributes such as `http="true"`, and `<aclrequest>`.
- Exporting a class method, which needs a generated global wrapper.
- Reading a `setting` back from Luam through a typed accessor.
- Renaming an export across the project from the editor.

### Milestone 9 — Resource Layout and Configuration

#### Added

- Resource configuration in `config.lua` at the project root. It is plain Lua,
  copied verbatim, never parsed, and listed in `meta.xml` as a shared script.
- Deployment values in `.env`, with `.env.local` layered over it for one
  machine and `<outDir>/<name>/.env` generated once for the server
  administrator. A key whose name looks sensitive is written blank, and the
  generated file is never overwritten.
- `packages/runtime/lua/env.lua` — a server-only runtime helper that reads the
  resource's `.env` and exposes `process.env` as a sealed, read-only table.
  Reading an undeclared key or assigning to any key raises an error naming the
  file.
- `process.env` typing. The compiler reads `.env`, types each key by the quoting
  rule (`PORT=3306` is a `number`, `PORT="3306"` a `string`), and declares
  `process` as a server-only project global. A misspelled key is
  `check-unknown-record-key` and lists the declared keys; `process` in a client
  or shared file is `check-environment-api`.
- A `record` type descriptor with named members, and `project` as an
  `ApiSource`, so a diagnostic can name `.env` as the origin rather than
  implying an MTA API.
- Asset copying. Files under `assetDirs` (default `["assets"]`) are copied at
  their relative path and declared as `<file>` entries; non-source files under
  `sourceDirs` are copied but stay undeclared, so a server-side data file is
  never transmitted. Assets are copied and compared as bytes.
- `.d.luam` declaration files. A declaration file is type checked, emits
  nothing, takes its environment from its path, and exports its declarations to
  the project. It adds one statement, `declare <name>: <type>`, which binds a
  global — pair it with an `interface` to type `config.lua`. A statement with an
  effect is `check-declaration-file-statement`, and `declare` outside a
  `.d.luam` is `check-declare-outside-declaration-file`.
- Interface member resolution. A value annotated with an interface reports
  `check-unknown-member` for a member the interface does not declare.
- `assetDirs` in `luam.json`.

#### Changed

- The generated resource mirrors the authored tree. `src/server/modules/x.luam`
  now emits `src/server/modules/x.lua` instead of `server/modules/x.lua`, and a
  path with a repeated `src` segment no longer resolves against the last
  occurrence.
- Runtime helpers are written to `src/<environment>/lib` instead of a shared
  `runtime` directory, so a server-only helper is never downloaded by a client.
- `meta.xml` script order is built explicitly — libraries, then `config.lua`,
  then the developer's scripts — rather than falling out of alphabetical
  sorting.
- Pruning no longer assumes every removable file ends in `.lua`. It removes
  `.lua` files, `meta.xml`, every entry of the previous `meta.xml`, and anything
  under a configured source directory, and never touches `.env`.
- `AmbientDeclarations` gained a `globals` list, so a `declare` crosses module
  boundaries with its type. An ordinary global still crosses as `any`.
- The project cache folds the `.env` declarations into its ambient key, so
  editing `.env` rechecks the files that can see `process`.
- The scaffold ships `.env` and `config.lua`, uses `process.env` in
  `src/server/main.luam`, and its `.gitignore` now commits `.env` and ignores
  `.env.local` — the inverse of the Vite and Next convention, so it is called
  out in the scaffolded README.
- ADR-005 moved from `Proposed` to
  `Accepted` with its open questions resolved.

#### Removed

- The `helperDir` configuration field and its `runtime` default. Helpers now
  follow the mirrored layout. A `luam.json` that still names it fails with
  `config-unknown-field`.
- Stale `src/template.js` and `src/template.d.ts` build artifacts in
  `@luam/template`, which shadowed `template.ts` during test resolution.

### Milestone 8 — Full MTA API Catalog

#### Added

- A catalog generator (`pnpm --filter @luam/mta-types generate`). It parses the
  `mtasa-lua-types` declaration files with the TypeScript compiler API and
  rewrites every MTA catalog module, the event catalog, and the element type
  hierarchy. Running it twice produces no diff.
- `packages/mta-types/src/catalog-overrides.ts` — handwritten overrides that win
  over the generated declarations and survive a regeneration, plus the element
  type aliases, parents, and exclusions the upstream source does not carry.
- `packages/mta-types/tests/generator.test.ts` — a drift test that fails when a
  generated file is edited by hand, plus coverage for parsing, normalization,
  emission limits, and override precedence.
- `packages/compiler/tests/fixtures/mta-api` — a three-environment fixture that
  calls a broad set of server, client, and shared APIs and compiles with no
  diagnostics, covered by `tests/catalog-coverage.test.ts`.
- A `global scope` benchmark group measuring the cost of building the
  environment scopes from the full catalog against reusing the cached ones.
- ADR-006 — the upstream
  source decision, the options rejected, and the licensing position.

#### Changed

- The MTA catalog grew from 246 handwritten declarations to 1294 generated ones
  (509 shared, 226 server, 559 client), from 53 events to 203, and from 21
  element types to 57. Compile time did not move: the global scope is cached per
  environment, so a file never walks the catalog.
- `outputChatBox` is now `shared`. MTA declares it on both sides, and scoping it
  to the server made valid client code a diagnostic.
- The catalog modules are split by Wiki category and environment
  (`mta-<category>-<environment>.ts`), aggregated by `mta-shared.ts`,
  `mta-server.ts`, and `mta-client.ts`.
- `eventEnvironment` moved to `src/event-lookup.ts` and `isElementType` and
  `elementAncestors` moved to `src/element-hierarchy.ts`, so the generated
  modules carry data only.
- 97 multi-return functions such as `getElementPosition` are typed `any` by
  rule, from the `LuaMultiReturn` marker in the source, instead of by hand.

### Milestone 7 — Performance and Polish

#### Added

- Incremental compilation. `createProjectCache()` caches declarations and
  compiled modules per file, keyed by a hash of the source and by a fingerprint
  of the declarations the file's environment can see. `ensure` keeps one cache
  for the session, so a rebuild after a body edit costs about 1 ms on a
  300-file project against 46 ms for a cold build.
- `ProjectResult.stats` reports how many declarations and modules a build
  reused. `luam build` and `luam ensure` print the reused count.
- A compiler benchmark suite (`pnpm --filter @luam/compiler test:bench`) with a
  synthetic project generator, cold and warm build scenarios, and a per-phase
  breakdown of parse, check, and emit.
- `performance.md` — measurements, methodology, what was
  optimized, and the known scaling limits.
- `security-review.md` — the milestone 7 security findings with
  severity and resolution.
- GitHub Actions: a CI workflow (typecheck, tests on Node 20/22/24, a build
  that scaffolds and compiles a resource with the bundled CLI, the benchmark,
  and `pnpm audit`) and a release workflow that packages the CLI tarball and
  the VSIX on a `v*` tag. Dependabot watches npm and Actions weekly.
- Strictness modes are documented with worked examples, including the one case
  where `#!nonstrict` changes the emitted Lua.

#### Changed

- The checker seeds a file's global scope in constant time. The `mta-types`
  catalog is converted once per environment and consulted through the binder
  instead of being copied into every file's scope. Checking a 300-file project
  went from 26.4 ms to 15.2 ms, and a cold build from 84.1 ms to 45.6 ms.
- The project layer shares one merged ambient set per environment across every
  file that declares nothing, and drops non-declaring modules from the merge.
  A 1200-file cold build went from 445 ms to 336 ms.
- `class.lua` builds one instance metatable and one constructor per class
  instead of allocating both on every `new`. The blocked-metamethod error now
  fires on a class's first construction rather than on every construction.
- Diagnostics read better. Argument-count errors say "expects at least 2
  arguments" instead of "2 argument(s)", an empty template interpolation lists
  the accepted forms, and a strict-mode `nil` mismatch names both ways out —
  the `?` annotation and `#!nonstrict`.
- `pnpm` is pinned through the root `packageManager` field.

#### Fixed

- Emitted string literals escape every control character below `0x20` plus
  `0x7f` as three-digit decimal escapes. A NUL byte in a source string used to
  reach Lua 5.1's lexer raw and truncate the literal.
- The `http` transport validates `resource`, `refreshFunction`,
  `restartFunction`, and `host` before they reach the request URL, so a value
  containing `/`, `?`, `#`, or `..` can no longer retarget an authenticated
  request.
- The `http` transport warns when the password would cross the network without
  TLS, that is, when `host` is not a loopback address.
- `discoverSources` rejects a source directory that resolves outside the
  project root, and `writeResource` refuses to write a file that resolves
  outside the resource directory.
- The scaffolded `.gitignore` excludes `.env`, `.env.*`, and `*.log`, and
  re-includes `.env.example`.

### Milestone 6 — Framework Template and Scaffolding

- `luam init` scaffolds a project: `luam.json`, `README.md`, `.gitignore`, the
  framework under `src/shared/framework`, and one example listener and command
  per side. Existing files are kept unless `--force` is passed.
- The framework (`Core`, `Loader`, `Event`, `Listener`, `Command`,
  `ThreadPool`) ships as Luam source in `@luam/template`, all `shared`, all
  depending only on `class.lua`.
- Auto-loading walks the `class.lua` registry — `getClasses()`, `__super`,
  `__name` — instead of a compiler-generated list.
- Cross-file class visibility: `compileProject` runs two passes so a handler can
  extend a framework base class declared in another file.
- `luam.json` gained a `helpers` field for manually injected runtime helpers.

### Milestone 5 — LSP and Editor

- A language server on the compiler's own frontend: diagnostics, completion
  scoped to the file's environment, hover, definition, references, and rename.
- A VS Code extension that starts the server and ships the TextMate grammar.

### Milestone 4 — CLI

- `luam build`, `luam check`, and `luam ensure` with a watch loop.
- `luam.json` configuration with validation, MTA server sync, and an `http`
  transport that refreshes and restarts the resource.
- The CLI ships as an esbuild bundle.

### Milestone 3 — Environments and Resource Assembly

- Every file resolves to `server`, `client`, or `shared` from its path or a
  `#!` directive, and MTA API availability is scoped to it.
- `@luam/mta-types` describes the Lua standard library and the MTA APIs with
  neutral type descriptors.
- Resource assembly maps sources to Lua outputs, orders runtime helpers first,
  and generates `meta.xml`.

### Milestone 2 — Classes, Enums, and the Runtime

- `class`, `extends`, `implements`, `new`, `self:super`, and `enum`.
- `@luam/runtime` ships the Lua 5.1 helpers and the catalog that maps each
  language feature to the helper it requires.

### Milestone 1 — Compiler Pipeline

- Lexer, parser, binder, type checker, and Lua 5.1 emitter.
- Type annotations, `type` aliases, compound assignment, template strings, and
  native object extensions.
