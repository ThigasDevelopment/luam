# Changelog

Notable changes per milestone. Nothing is published yet, so entries are grouped
by milestone rather than by released version. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## Unreleased

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
  where `--!nonstrict` changes the emitted Lua.

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
  the `?` annotation and `--!nonstrict`.
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

## Milestone 6 — Framework Template and Scaffolding

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

## Milestone 5 — LSP and Editor

- A language server on the compiler's own frontend: diagnostics, completion
  scoped to the file's environment, hover, definition, references, and rename.
- A VS Code extension that starts the server and ships the TextMate grammar.

## Milestone 4 — CLI

- `luam build`, `luam check`, and `luam ensure` with a watch loop.
- `luam.json` configuration with validation, MTA server sync, and an `http`
  transport that refreshes and restarts the resource.
- The CLI ships as an esbuild bundle.

## Milestone 3 — Environments and Resource Assembly

- Every file resolves to `server`, `client`, or `shared` from its path or a
  `--!` directive, and MTA API availability is scoped to it.
- `@luam/mta-types` describes the Lua standard library and the MTA APIs with
  neutral type descriptors.
- Resource assembly maps sources to Lua outputs, orders runtime helpers first,
  and generates `meta.xml`.

## Milestone 2 — Classes, Enums, and the Runtime

- `class`, `extends`, `implements`, `new`, `self:super`, and `enum`.
- `@luam/runtime` ships the Lua 5.1 helpers and the catalog that maps each
  language feature to the helper it requires.

## Milestone 1 — Compiler Pipeline

- Lexer, parser, binder, type checker, and Lua 5.1 emitter.
- Type annotations, `type` aliases, compound assignment, template strings, and
  native object extensions.
