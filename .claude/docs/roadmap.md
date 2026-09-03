# Roadmap

Incremental milestones. Each milestone produces a usable artifact and is
verifiable through tests. Each task has a plan file in `plans/` following
`TEMPLATE.md`. Update task `status` in the plan frontmatter and reflect it
here as work advances.

## Milestone 1 — Core Language and Lua 5.1 Emitter

Deliver a compiler that lexes, parses, type checks a small but useful subset,
and emits Lua 5.1.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 01.01 | Scaffold pnpm workspace and compiler package | ../plans/01.01-scaffold-workspace.md | architecture-engineer | done |
| 01.02 | Implement lexer with tokens and positions | ../plans/01.02-lexer.md | architecture-engineer | done |
| 01.03 | Implement parser with Lua blocks | ../plans/01.03-parser.md | architecture-engineer | done |
| 01.04 | Implement type checker and diagnostics | ../plans/01.04-type-checker.md | architecture-engineer | done |
| 01.05 | Implement Lua 5.1 emitter and extensions | ../plans/01.05-emitter.md | architecture-engineer | done |
| 01.06 | Cover milestone 1 with fixtures and snapshot tests | ../plans/01.06-language-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` passes with no errors.
- `pnpm test` passes the full suite (140 tests across 6 files).
- Fixture snapshots lock lexer, parser, checker, and emitter behavior.
- Typed source with type errors produces diagnostics and no output.
- Strictness modes (`#!nocheck`, `#!nonstrict`, `#!strict`) behave as documented.
- Templates lower to `string.template` and native extensions track required helpers.

Deferred to a later milestone:

- Type narrowing. `if value ~= nil then` does not refine `string?` to `string`,
  so an optional must be passed through `tostring` before concatenation.
- Unresolved global references are typed `any` without a diagnostic. Environment
  and MTA API validation lands in milestone 3.

## Milestone 2 — Classes, Inheritance, Enums, and Runtime Injection

Add OOP and runtime-aware builds.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 02.01 | Add class model and semantics | ../plans/02.01-class-model.md | architecture-engineer | done |
| 02.02 | Add runtime helper modules | ../plans/02.02-runtime-helpers.md | architecture-engineer | done |
| 02.03 | Emit classes and enums to Lua runtime calls | ../plans/02.03-class-emitter.md | architecture-engineer | done |
| 02.04 | Cover milestone 2 with class and runtime tests | ../plans/02.04-oop-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` passes with no errors.
- `pnpm test` passes the full suite (168 compiler tests, 16 runtime tests).
- Classes, inheritance, `super`, interfaces, enums, and `new` bind and
  check, with fixture snapshots locking the generated Lua.
- `class.lua` is required only when an OOP or enum feature is emitted.
- Interfaces are compile-only and never reach the generated Lua.
- An enum that is never referenced is erased.

Deferred to a later milestone:

- Static members, metamethod declarations in source syntax, and generic classes.
- Cross-file class visibility, delivered in milestone 6. Within a file,
  declaration order still decides what `extends` and `new` can resolve, which
  matches the runtime registration order.

## Milestone 3 — Environments and Resource Manifest

Add server/client/shared awareness and `meta.xml` generation.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 03.01 | Add environment resolution model | ../plans/03.01-environment-model.md | architecture-engineer | done |
| 03.02 | Add MTA API type catalogs | ../plans/03.02-mta-types.md | architecture-engineer | done |
| 03.03 | Validate environments for APIs and imports | ../plans/03.03-environment-validation.md | architecture-engineer | done |
| 03.04 | Generate resource manifest and assembly | ../plans/03.04-manifest-resource-assembly.md | architecture-engineer | done |
| 03.05 | Cover milestone 3 with environment and manifest tests | ../plans/03.05-environment-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` and `pnpm build` pass with no errors.
- `pnpm test` passes the full suite (204 compiler tests, 12 mta-types tests,
  16 runtime tests).
- Path and `#!` directive resolve the environment; the directive wins and a
  contradicting path is a warning, while two different directives are an error.
- `outputChatBox` on the client, `dxDrawText` on the server, and any server or
  client API in a `shared` file are diagnostics, and so are events used on the
  wrong side. Milestone 8 superseded the `outputChatBox` case: the full catalog
  declares it `shared` because MTA declares it on both sides, and `banPlayer`
  carries the server-only example instead.
- A server file that references a global declared by a client module is a
  diagnostic, and `shared` files can reference only `shared` declarations.
- `meta.xml` lists runtime helpers before dependent scripts and types every
  entry `server`, `client`, or `shared`, with attribute values escaped.
- A fixture with all three environments assembles into a resource plan with the
  compiled Lua, the helper files to copy, and the manifest.

Deferred to a later milestone:

- Writing the assembled resource to disk. The compiler produces the plan; the
  CLI copies helper files and writes the output directory in milestone 4.
- Multi-return MTA signatures (`getElementPosition`) are typed `any`.
- Cross-environment checks resolve globals by name. A file that shadows a name
  declared elsewhere keeps its own declaration.

## Milestone 4 — CLI: build, check, ensure

Ship the developer workflow.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 04.01 | Scaffold CLI package and configuration | ../plans/04.01-cli-scaffold.md | architecture-engineer | done |
| 04.02 | Implement build and check commands | ../plans/04.02-build-check-commands.md | architecture-engineer | done |
| 04.03 | Implement ensure watch loop and MTA sync | ../plans/04.03-ensure-watch.md | architecture-engineer | done |
| 04.04 | Cover milestone 4 with CLI tests | ../plans/04.04-cli-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` and `pnpm build` pass with no errors.
- `pnpm test` passes the full suite (204 compiler tests, 70 CLI tests,
  12 mta-types tests, 16 runtime tests).
- `pnpm --filter @luam/cli bundle` emits `dist/luam.mjs`, and the `luam` bin runs
  `build`, `check`, and `ensure` outside the workspace.
- `luam.json` resolves source dirs, resource name, MTA server path, and the
  restart transport; every invalid field reports a diagnostic and exits `2`.
- `check` reports `path:line:column` diagnostics and exits `1` on failure without
  writing output.
- `build` writes the compiled Lua, the required helpers, and `meta.xml`, rewrites
  only changed files, prunes generated files the project no longer produces, and
  leaves the previous resource intact when a build fails.
- `ensure` builds, syncs into `<serverPath>/<resourcesDir>/<name>`, and calls
  `refresh` then `restart` through the transport. A build with errors skips both
  the sync and the restart.
- `ensure --watch` rebuilds on `.luam` changes, and the mocked transport asserts
  the expected refresh and restart calls.
- The MTA HTTP transport reads its password from an environment variable, warns
  on a plaintext password, and never prints the secret.

Deferred to a later milestone:

- Incremental AST and type caching. Every rebuild recompiles the whole project;
  only the write step is incremental.
- Resource scaffolding (`luam init`), delivered in milestone 6.
- Publishing the `luam` bin. `pnpm bundle` is manual until CI wires it in 07.05.

## Milestone 5 — LSP and VS Code Extension

Provide editor support.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 05.01 | Scaffold LSP server on compiler APIs | ../plans/05.01-lsp-server.md | architecture-engineer | done |
| 05.02 | Implement LSP capabilities | ../plans/05.02-lsp-capabilities.md | architecture-engineer | done |
| 05.03 | Build VS Code extension and syntax highlighting | ../plans/05.03-vscode-extension.md | architecture-engineer | done |
| 05.04 | Cover milestone 5 with LSP and extension tests | ../plans/05.04-lsp-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` and `pnpm build` pass with no errors.
- `pnpm test` passes the full suite (204 compiler tests, 70 CLI tests, 45 LSP
  tests, 24 VS Code tests, 12 mta-types tests, 16 runtime tests).
- The LSP publishes diagnostics on open and on change and clears them when the
  file is fixed. Environment resolution runs per file, and a `#!` directive that
  contradicts the path still wins with a warning.
- Completion is scoped by environment: `dxDrawText` never appears in a server
  file, `kickPlayer` never appears in a client file, and a `shared` file sees
  only shared APIs. A `server` file completes globals from `shared` modules and
  never from `client` modules.
- Member completion resolves class fields and methods including inherited ones,
  enum members, `math`/`string`/`table` library members, and the native
  extensions that apply to the receiver's type.
- Hover reports the declared or inferred type, the function signature, and the
  environment of an MTA API.
- Definition, references, and rename resolve locals, parameters, shadowed
  declarations, class members, and globals across files.
- `pnpm --filter @luam/vscode bundle` emits `dist/extension.cjs` and
  `dist/server/luam-lsp.cjs`, and the bundled server answers `initialize`,
  `didOpen`, `didChange`, completion, hover, definition, and rename over stdio.
- Extension tests run headlessly against stubbed `vscode` modules and cover
  activation, command registration, the manifest contract, and the grammar.

Deferred to a later milestone:

- Cross-module diagnostics in the editor. The LSP checks one file at a time;
  `luam check` still reports environment violations across modules.
- Incremental analysis. Every keystroke reanalyzes the whole document, which
  lands with the caching work in milestone 7.
- Signature help, document symbols, formatting, and code actions.
- Publishing the extension. `pnpm bundle` is manual until CI wires it in 07.05.

## Milestone 6 — Template and Framework Adaption

Adapt `mta-project-base` patterns to the language.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 06.01 | Port mta-project-base framework to the language | ../plans/06.01-framework-port.md | architecture-engineer | done |
| 06.02 | Add automatic listener and command loading | ../plans/06.02-auto-loading.md | architecture-engineer | done |
| 06.03 | Add resource scaffold command | ../plans/06.03-scaffold-resource.md | architecture-engineer | done |
| 06.04 | Cover milestone 6 with framework tests | ../plans/06.04-framework-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` and `pnpm test` pass the full suite (208 compiler tests, 91
  CLI tests, 45 LSP tests, 24 VS Code tests, 15 template tests, 14 mta-types
  tests, 18 runtime tests).
- The framework lives in `@luam/template` as Luam source, not compiler logic:
  `Core`, `Loader`, `Event`, `Listener`, `Command`, and `ThreadPool`, all
  `shared`, all depending only on the `class.lua` runtime helper.
- `luam init` writes a project that passes `luam check` with no diagnostics and
  that `luam build` turns into a resource with `meta.xml`, `runtime/class.lua`,
  the framework, and the example handlers.
- `meta.xml` orders `runtime/class.lua` before the framework and the framework
  before the server and client files that extend it, so `extends` resolves at
  load time.
- Auto-loading is registry driven: `Loader` walks `getClasses()`, follows the
  `__super` chain, sorts the names it finds so registration order is stable, and
  instantiates each subclass with the `Core` instance. Base classes are never
  instantiated. A command registers its name and every alias.
- `luam init` keeps existing files unless `--force` is passed, takes the resource
  name from `--name` or the project directory, and needs no `luam.json` to run.
- `luam.json` gained a `helpers` field so a project can opt into a manually
  injected runtime helper. `ThreadPool` needs `"helpers": ["threads"]`.

Prerequisite delivered with this milestone:

- **Cross-file class visibility.** A handler extending a framework base class in
  another file used to be `check-unknown-class`. `compileProject` now runs two
  passes: the first collects each module's classes, interfaces, and enums, and
  the second re-checks every file with the declarations its environment is
  allowed to reference. Direction rules are unchanged — a `shared` file still
  cannot extend a `server` class, and the diagnostic names the module the class
  comes from.

Deferred to a later milestone:

- Publishing the template as its own package. `@luam/template` is private and the
  CLI bundle carries a copy under `dist/template`.
- Executing the generated Lua in tests. No Lua interpreter runs in the test
  stack, so runtime behavior is asserted through emitted output and manifest load
  order.

## Milestone 7 — Performance and Polish

Status: done

Scope:

- Incremental compile with AST/type caching across files.
- Emit only changed files.
- Strictness modes (`#!nocheck`, `#!nonstrict`, `#!strict`).
- Diagnostics polish and performance profiling.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 07.01 | Add incremental compilation and cache | ../plans/07.01-incremental-cache.md | architecture-engineer | done |
| 07.02 | Profile build and runtime helper performance | ../plans/07.02-performance-profiling.md | performance-engineer | done |
| 07.03 | Review generated code and runtime security | ../plans/07.03-security-review.md | security-engineer | done |
| 07.04 | Polish diagnostics, strictness, and docs | ../plans/07.04-docs-and-changelog.md | documentation-engineer | done |
| 07.05 | Set up CI for build, tests, and release | ../plans/07.05-ci-workflows.md | github-engineer | done |

Acceptance:

- `pnpm typecheck` and `pnpm test` pass the full suite (225 compiler tests, 96
  CLI tests, 45 LSP tests, 24 VS Code tests, 24 runtime tests, 16 template
  tests, 14 mta-types tests).
- `createProjectCache()` caches declarations and compiled modules per file. A
  rebuild after a body edit reuses every other file; a rebuild that changes a
  declaration invalidates only the environments that can see it. `ensure` holds
  one cache for the session, and `writeResource` still compares content before
  writing, so only changed files reach disk.
- On a 300-file synthetic project: cold build 45.6 ms, warm rebuild after a
  body edit 1.1 ms, warm rebuild after a declaration edit 26.9 ms. Numbers,
  methodology, and the benchmark harness are in
  [performance.md](performance.md).
- Two optimizations, both measured before and after: the checker seeds a file's
  global scope in constant time instead of walking the `mta-types` catalog per
  file (cold build 84.1 ms to 51.9 ms), and the project layer shares one merged
  ambient set per environment across non-declaring files (1200-file cold build
  445 ms to 336 ms). `class.lua` builds one instance metatable and one
  constructor per class instead of allocating both on every `new`.
- Eight security findings are recorded with severity in
  [security-review.md](security-review.md). Five are fixed with tests: control
  character escaping in emitted string literals, URL segment validation in the
  `http` transport, a cleartext-credential warning for a non-loopback host,
  output and source path containment, and `.env` in the scaffolded
  `.gitignore`. Three are informational.
- Strictness modes are documented with worked examples and pinned by tests,
  including the one case where `#!nonstrict` changes the emitted Lua: an
  unannotated local widens to `any`, and `any` has no extension rewrites.
- Diagnostics gained hints. A strict `nil` mismatch names both ways out, an
  empty template interpolation lists the accepted forms, and argument-count
  errors are pluralized.
- `CHANGELOG.md` covers every milestone. The `ensure` loop, the strictness
  modes, the cache API, and the CI commands are documented.
- CI runs typecheck, the suite on Node 20, 22 and 24, a build that scaffolds
  and compiles a resource with the bundled CLI, the benchmark, and
  `pnpm audit`. A `v*` tag packages the CLI tarball and the VSIX.

Deferred to a later milestone:

- **A per-reference dependency key.** The cache keys a module on every
  declaration its environment exposes, not on the ones it uses, so changing a
  `shared` class rechecks every file. A finer key needs the checker to report
  which ambient names a file resolved, plus the transitive closure over
  superclasses, interfaces and member types.
- **The quadratic term in cold builds.** Files that declare something still
  merge the ambient set of their environment. Closing it needs
  `AmbientDeclarations` to carry the module each declaration came from.
- **Lint.** No ESLint or Prettier dependency exists, and a hard gate on the
  250-line convention would fail on `packages/compiler/src/parser/ast.ts` (283
  after milestone 10, with the build-directive nodes already split into
  `parser/directive-nodes.ts`) and
  `packages/lsp/src/symbols/statement-collector.ts` (281).
- **Executing the generated Lua.** Runtime helper performance and the
  `class.lua` change are reviewed statically; no Lua interpreter runs in CI.
- **Publishing.** Both packages stay `private`, so the release workflow attaches
  artifacts to a GitHub Release instead of pushing to npm and the Marketplace.
- **A green CI run.** The workspace is not a git repository yet, so no workflow
  has executed. Every command each workflow runs was verified locally.

Sequencing note: [milestone 9](#milestone-9--resource-layout-and-configuration)
says it should run before 07.01 because it changes output paths and widens the
emitted file set. That ordering turned out not to matter. The cache keys
compiled modules by source content and declaration fingerprints, and never by
output path — resource assembly runs fresh on every build. Milestone 9 changes
`outputPath` and the file set assembly produces, neither of which the cache
touches.

## Milestone 8 — Full MTA API Catalog

Replace the hand written `mta-types` catalog with the complete MTA declaration
set, generated from an upstream source instead of typed by hand.

Status: done

The catalog held 246 MTA declarations (107 shared, 70 server, 69 client) and 53
events against the 1294 distinct functions the Wiki publishes. The gap did not
block a build — an undeclared name stays `any` with no diagnostic — but it left
most of the API untyped and unscoped by environment.

Sequencing: this milestone depended only on milestone 3 and blocked nothing.
Milestone 5 shipped autocomplete against the hand written catalog, so the LSP
already completed and scoped every declared name — it just could not offer the
names the catalog was missing. Importing the full catalog widened editor
completion and environment checking with no LSP change, and milestone 7 had
already cached the global scope per environment, so the import needed no
performance work of its own.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 08.01 | Choose the upstream MTA declaration source | ../plans/08.01-catalog-source-adr.md | architecture-engineer | done |
| 08.02 | Build the MTA catalog generator | ../plans/08.02-catalog-generator.md | architecture-engineer | done |
| 08.03 | Define signature normalization and overrides | ../plans/08.03-signature-normalization.md | architecture-engineer | done |
| 08.04 | Import the full MTA catalog | ../plans/08.04-full-catalog-import.md | architecture-engineer | done |
| 08.05 | Cover the full catalog with tests | ../plans/08.05-catalog-tests.md | test-engineer | done |

Acceptance:

- The catalog holds 1294 MTA declarations (509 shared, 226 server, 559 client),
  203 events, and 57 element types, and a refresh is
  `pnpm --filter @luam/mta-types generate`.
- Regenerating produces no diff, and a hand edit to a generated file fails the
  drift test in `packages/mta-types/tests/generator.test.ts`.
- Building the global scope for a file does not walk the full catalog:
  `builtinSymbols` caches per environment, and the cached lookup is four orders
  of magnitude cheaper than the build.
- `tests/fixtures/mta-api` calls a broad set of server, client, and shared APIs
  and compiles with no diagnostics, and environment misuse of a newly imported
  API still produces `check-environment-api`.
- `pnpm typecheck`, `pnpm build`, and `pnpm test` pass (478 tests).

Decisions this milestone recorded:

- The source is `mtasa-lua-types`, pinned exactly and dev-only, parsed with the
  TypeScript compiler API and never executed. See
  [ADR-006](adr/006-mta-declaration-source.md).
- `outputChatBox` is `shared`. MTA declares it on both sides, and the milestone 3
  decision to scope it to the server made valid client code a diagnostic. The
  rule "declared on both sides means shared" wins over the earlier exception, and
  the milestone 3 acceptance note below is superseded.
- Overrides live in `src/catalog-overrides.ts`, are handwritten, and win over the
  generated declaration.

Deferred to a later milestone:

- Tuple types for multi-return functions such as `getElementPosition`. The 97
  functions this affects stay `any` until the checker models multiple return
  values.
- OOP-style method declarations (`player:getName()`) from the MTA OOP API.
- Overload sets. A function whose two sides disagree merges into one widened
  signature instead of keeping both forms.

## Milestone 9 — Resource Layout and Configuration

Make the generated resource mirror the tree the developer authored, and give a
resource two settings files with two different owners: `config.lua` for the
resource author, `.env` for the server administrator.

Status: done, helper directory superseded by milestone 13

Milestone 13 moved runtime helpers from `src/<environment>/lib` to
`lib/<environment>`. Everything else below still holds.

Sequencing: this milestone was planned to run **before 07.01**, because 09.01 and
9.2 change output paths and widen the emitted file set beyond `.lua`. It ran
after instead, and the note at the end of milestone 7 held: the cache keys
modules by source content and declaration fingerprints, never by output path, so
nothing needed rekeying. The one cache change this milestone did make is
unrelated to layout — the ambient key now folds in the `.env` declarations, so
editing `.env` rechecks the files that can see `process`.

Decisions are recorded in
[ADR-003](adr/003-mirror-source-tree-in-generated-resource.md),
[ADR-004](adr/004-resource-configuration-and-environment-files.md), and
[ADR-005](adr/005-declaration-files.md), which this milestone moved from
`Proposed` to `Accepted` by resolving its open questions.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 09.01 | Mirror the source tree in the generated resource | ../plans/09.01-mirror-source-tree.md | architecture-engineer | done |
| 09.02 | Copy assets and non-source files into the resource | ../plans/09.02-copy-assets.md | architecture-engineer | done |
| 09.03 | Add resource configuration and environment files | ../plans/09.03-config-and-env-files.md | architecture-engineer | done |
| 09.04 | Type `process.env` in the checker | ../plans/09.04-type-process-env.md | architecture-engineer | done |
| 09.05 | Design and implement `.d.luam` declaration files | ../plans/09.05-declaration-files.md | architecture-engineer | done |
| 09.06 | Cover milestone 9 with layout and configuration tests | ../plans/09.06-layout-and-config-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck` passes and `pnpm test` passes the full suite (263 compiler
  tests, 113 CLI tests, 52 LSP tests, 40 mta-types tests, 28 runtime tests, 24
  VS Code tests, 18 template tests).
- `src/server/modules/example.luam` emits `src/server/modules/example.lua`, and
  a nested `src` segment no longer resolves against the last occurrence.
- Runtime helpers land in `src/<environment>/lib`, so a server-only helper is
  never downloaded by a client. A helper that declares its own environment —
  only `env` does — is pinned there regardless of where it is used. The
  `helperDir` configuration field is retired.
- Manifest order is libraries, configuration, developer scripts, built
  explicitly in `manifestScripts` rather than by alphabetical accident, so
  renaming a source file cannot move it across groups.
- Assets reach the resource at their relative path with `<file>` entries, and
  disappear from the build when deleted from the source. Non-source files inside
  `sourceDirs` are copied too but stay undeclared, so a server-side data file is
  not downloaded by clients.
- Assets are copied as bytes and compared as bytes, so a binary file survives a
  rebuild unchanged and is not rewritten.
- Pruning removes a generated file whose source is gone without touching a file
  it never wrote: the removable set is `.lua` files, `meta.xml`, every entry of
  the previous `meta.xml`, and everything under a configured source directory.
- `build/.env` is generated once and never overwritten; a hand edit survives
  every rebuild, and deleting it regenerates the skeleton. Sensitive keys —
  matched by name — are written blank.
- `.env` never appears as a `<file>` entry, and `process.env` in a client or
  shared file is a diagnostic naming the project as the origin.
- A misspelled `process.env` key is a compile error listing the declared keys,
  and `PORT=3306` types as `number` while `PORT="3306"` types as `string`.
- LSP completion offers the declared keys after `process.env.` in a server file
  and nothing after `process.` in a client file; hover names the file the value
  was declared in.
- A `.d.luam` file type checks, produces no output, takes its environment from
  its path, and exports its declarations to the rest of the project. `declare
  Config: ConfigShape` paired with an `interface` gives typed access to
  `config.lua`, and a misspelled member is `check-unknown-member`.

Deferred to a later milestone:

- **Generating `meta.xml` from a source template.** The compiler owns the
  manifest today; whether the author can contribute entries to it is undecided,
  and `examples/resource/runtime/meta.xml` is a placeholder for that
  conversation.
- **Validating that a deployed `build/.env` matches the declared types.** An
  administrator writing `PORT=abc` still produces a value the checker believes
  is a number. Closing it needs the compiler to emit declared types alongside
  the file and the `env` library to validate on load.
- **Verifying that a `.d.luam` declaration matches the Lua it describes.** The
  compiler asserts; it never reads the Lua.
- **Keys inside a template literal.** `${process.env.TYPO}` is not checked.
  Template interpolation validates only the root name, which is a limitation of
  `checkTemplate` predating this milestone.
- **`declare function`.** A declaration file describes a function by writing a
  real `function` with a body the compiler discards. A body-less form needs a
  parser change.
- **Sensitivity by declaration.** A key is treated as sensitive when its name
  matches `password`, `secret`, `token`, `key`, `credential`, `dsn`, or
  `private`. A marker in `.env` would be explicit instead of inferred.

## Milestone 10 — Build Directives

Give the language words that describe how a declaration participates in the
built resource, starting with `export`, and route their effect into `meta.xml`
through one channel every later directive reuses.

Status: done, partly superseded by milestone 13

Milestone 13 removed the `setting` and `depends` directives and collapsed a
shared `export` into one element. The record below describes what milestone 10
shipped, not what the language does now — `export` is the only build directive,
and neither `<setting>` nor `<include>` can be produced by any input. The
contribution channel survives and carries `export`.

```luam
export function getPlayerScore(player: Player): number
    return scores[player] or 0
end
```

emits the function unchanged and adds
`<export function="getPlayerScore" type="server" />` to the manifest.

Sequencing: 10.02 rewrites manifest assembly, which 09.01 also touches. 09.01 landed
first, so the manifest snapshots were rewritten once. 10.04 depended only on the
syntax and ran alongside 10.02 and 10.03.

Decisions are recorded in [ADR-007](adr/007-build-directives.md): directives are
contextual keywords rather than reserved words, they are erased from the emitted
Lua, and they produce contributions that `assembleResource` merges rather than
effects the compiler performs. The first of those is superseded — `export` is a
reserved word now, and the ADR records the change.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 10.01 | Parse, check, and erase the `export` directive | ../plans/10.01-export-directive-front-end.md | architecture-engineer | done |
| 10.02 | Carry manifest contributions through the pipeline and emit `<export>` | ../plans/10.02-manifest-contributions.md | architecture-engineer | done |
| 10.03 | Add the `setting` and `depends` directives on the same mechanism | ../plans/10.03-setting-and-depends-directives.md | architecture-engineer | done |
| 10.04 | Editor support for build directives | ../plans/10.04-directive-editor-support.md | architecture-engineer | done |
| 10.05 | Cover build directives with parser, checker, manifest, and CLI tests | ../plans/10.05-build-directive-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck`, `pnpm build`, and `pnpm test` pass the full suite (302
  compiler tests, 117 CLI tests, 63 LSP tests, 40 mta-types tests, 28 runtime
  tests, 27 VS Code tests, 18 template tests).
- `export function f()` in a server file emits `function f()` byte identical
  to the same function without the directive, compared string to string, and
  adds `<export function="f" type="server" />` to the manifest.
- A shared file's export produces one entry per side; a client file's produces
  `type="client"`.
- `export` is still usable as an identifier — only `export` before `function`
  is a directive, and `KEYWORDS` in the lexer stays the Lua 5.1 set. The same
  holds for `setting` and `depends`.
- `export local function`, an `export` nested in a block, `export function a.b()`,
  and an `export` in a `.d.luam` file are all diagnostics.
- Two modules exporting the same name for the same side report
  `project-duplicate-export` and no manifest is written. The same name exported
  once per side is accepted.
- `setting MAX_PLAYERS = 32` produces `<setting name="*MAX_PLAYERS" value="32" />`,
  and `depends "scoreboard"` produces `<include resource="scoreboard" />`. A
  dependency declared in two modules collapses into one element, and a setting
  declared twice with different values is `project-duplicate-setting`.
- Adding the 10.03 directives touched the parser, the checker, the AST, and
  `project/manifest.ts`, and no other file in the pipeline.
- Manifest element order is info, scripts, exports, settings, includes, files,
  and renaming an unrelated source file does not change it.
- A rebuild that reuses every cached module still writes the full manifest, and
  a project with no directives produces a byte-identical manifest to the one it
  produced before this milestone.
- The grammar scopes a directive as a modifier only in directive position, and
  `local export = 1` is scoped as a variable. Completion offers all three
  directives at statement position and none after `local`, inside an argument
  list, or after a member access. Hover on an exported function names the sides.

Decisions this milestone recorded, closing the ADR-007 open questions:

- The word is `depends`, not `include`. It describes the relationship the author
  states; `<include>` is the manifest's spelling of it.
- A `setting` is written to the manifest and read back through the MTA API. A
  typed accessor would mean modelling the settings registry, which is a runtime
  feature.
- Every `setting` carries the `*` prefix. Opting out needs attribute syntax,
  which is the same open question as `http="true"`.
- `depends 'name'` wins over the Lua call-with-a-string sugar, so a function
  named `depends` must be called with parentheses. That is the trade the language
  already makes for `type`, `declare`, `class`, `interface`, and `enum`.

Deferred to a later milestone:

- Export attributes. MTA supports `http="true"`; the syntax that carries an
  attribute without turning the directive into a decorator is undecided, so
  v1 emits the default.
- `<aclrequest>`. It is a directive by the ADR-007 test, but its entries are
  rights rather than symbols and it needs its own design.
- Exporting a class method. MTA exports plain functions, so this needs a
  generated global wrapper — a feature, not a directive detail.
- Reading a `setting` back from Luam through a typed accessor. Today a directive
  writes the manifest and the code reads it through the MTA API.
- Renaming an export across the project from the editor. The export is recorded
  on the document analysis beside the symbol index, which is what a rename would
  consult, but no rename touches the manifest yet.
- Validating that an exported function is actually reachable. The compiler names
  it in `meta.xml`; it never checks that another resource can call it.

## Milestone 11 — MTA OOP API

Type the object form of the MTA API — `player:getName()`, the element class
hierarchy, its methods and properties — and tie it to the `oop` setting, so the
compiler guarantees the code and the manifest agree about whether that API
exists.

Status: done

Milestone 8 imported the full procedural catalog and deferred the OOP form. The
gap is not cosmetic: a project that enables OOP writes `player:getName()` all
day and the checker types every one of those calls `any`, which is the same
blind spot the whole catalog had before milestone 8.

The gate is what makes it more than autocomplete. MTA only exposes the OOP API
when `meta.xml` carries `<oop>true</oop>`. Reading the flag from `luam.json`
lets the compiler emit the tag *and* reject an OOP call in a project that did
not enable it, turning a runtime `attempt to call a nil value` into a build
diagnostic that names the procedural function to use instead.

Sequencing: 11.01 depends only on the milestone 8 generator. 11.03 needs the
manifest work from milestone 10 to be settled, because it adds the first element
with text content rather than attributes. 11.04 depends on 11.02 and can run
alongside 11.3.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 11.01 | Generate the MTA OOP surface from the upstream catalog | ../plans/11.01-oop-catalog-source.md | architecture-engineer | done |
| 11.02 | Model MTA element types as classes in the checker | ../plans/11.02-element-types-in-checker.md | architecture-engineer | done |
| 11.03 | Gate the OOP API on the `oop` setting and emit the manifest tag | ../plans/11.03-oop-gate-and-manifest.md | architecture-engineer | done |
| 11.04 | Editor support for the MTA OOP API | ../plans/11.04-oop-editor-support.md | architecture-engineer | done |
| 11.05 | Cover the OOP API with catalog, checker, manifest, and editor tests | ../plans/11.05-oop-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck`, `pnpm build`, and `pnpm test` pass the full suite (324
  compiler tests, 123 CLI tests, 72 LSP tests, 58 mta-types tests, 28 runtime
  tests, 27 VS Code tests, 18 template tests).
- The OOP surface holds 57 classes, 652 methods, and 218 properties, generated
  from the same pinned snapshot as the procedural catalog by
  `pnpm --filter @luam/mta-types generate`. Regenerating produces no diff, and a
  hand edit to a generated OOP file fails the drift test.
- `player:getName()` checks, returns `string`, resolves `setDimension` inherited
  from `Element`, and reports `check-unknown-member` naming `Player` for a member
  the element does not have.
- A procedural function that returns an element was already typed with the
  element class by milestone 8, so `getPlayerFromName('x')` is a `Player` with no
  new work; the milestone added the member resolution on top of it.
- `player:kick()` in a client file is `check-environment-api` and the message
  names `kickPlayer`. `player:setNametagText(5)` is `check-type-mismatch`
  against the wrapped signature.
- `"oop": true` emits `<oop>true</oop>` immediately above `<info>`; with the flag
  off the same OOP call is `check-oop-disabled` and the message names
  `getPlayerName` and the `luam.json` field that enables the API.
- The emitter never rewrites an OOP call into its procedural form, asserted
  string to string, and a project with `oop` off produces a manifest with no
  `<oop>` element, byte identical to the one it produced before this milestone.
- Flipping the flag invalidates the ambient cache and rechecks every module.
- `player:` in the editor offers the element's members and the inherited ones,
  scoped by environment; with the flag off it offers nothing. Hover names the
  return type, the environment, and the procedural function.
- Cold build with the API enabled is 47.2 ms against 50.1 ms with it off on the
  same 300-file run — inside the run-to-run spread, so the surface costs nothing
  measurable. Building the OOP registry once costs 0.16 ms and is memoized.

Decisions this milestone recorded:

- **The mapping is read, never derived.** Every upstream OOP method carries an
  `@see` link to its wiki page, and the last URL segment lowercased at the first
  letter is the procedural function. All 918 upstream instance methods resolve
  this way. Deriving the name from the method instead (`getName` on `Player` ->
  `getPlayerName`) was measured at 73%, and the misses — `Player.outputChat` ->
  `outputChatBox`, `Timer.destroy` -> `killTimer` — are the ones a heuristic
  gets confidently wrong.
- **A member the catalog cannot explain is dropped.** The surface declares only
  what it can map, so "every method resolves to a declared procedural function"
  holds by construction rather than by a hand-maintained exception list.
- **The environment comes from the procedural function**, not from which upstream
  directory the class file sits in, so the two views of the API cannot disagree.
- **The OOP classes live in their own registry**, consulted after the file's own
  declarations. Seeding them into `context.declarations` would have leaked 57
  classes into every module's ambient set and its fingerprint.
- **A project class shadows an element class.** `class Player { ... }` wins in
  the checker and in completion alike.
- **A method call on a non-element receiver is still unchecked.** Milestone 2
  left `obj:method()` returning `any`; extending the check to user classes is a
  separate change with its own blast radius.

Deferred to a later milestone:

- Tuple types for multi-return functions, still open from milestone 8. The OOP
  form does not fix `getElementPosition`. Delivered in milestone 30.
- Static members and constructors. The upstream declares 145 statics and 58
  constructors; `Player.getRandom()` needs the class name to be a value, and
  `new Player(name)` collides with the language's own `new`.
- The 28 properties whose getter the upstream does not name — `Ped.vehicle`,
  `Vehicle.landingGearDown`, `GuiWindow.sizable` — are dropped rather than
  guessed. Closing them needs an override table like the catalog's.
- A code action converting between the procedural and OOP forms.
- Authoring a class that extends an MTA element class.
- Hover resolving the receiver by position. `mtaMemberHover` finds the first
  expression in the file whose member name matches, which is the same limitation
  `recordMemberHover` has carried since milestone 9.

## Milestone 12 — CLI Output and Build Feedback

Give the CLI one visual vocabulary — a colour per severity, a symbol per phase —
show the build advancing through named phases while it runs, and close with a
report that says what was produced and what it cost.

Status: done

Today every message the CLI prints looks the same. There is no colour anywhere
in the repository, so an error is as loud as a line reporting how many files
were written. There is no phase either: the build is one opaque call that prints
a summary when it finishes, which is fine at 48 ms and useless the moment
something is slow or stuck.

Two constraints shape the design:

- **The pipeline is synchronous.** Nothing can animate on a timer, because the
  event loop is blocked while the build runs. The renderer paints when the build
  hands it an event, throttled so drawing never costs more than the work it
  describes.
- **Most builds are too fast to animate.** A warm rebuild is around 1 ms and a
  cold 300-file build around 46 ms. A bar that appears and vanishes inside 46 ms
  is flicker, not feedback, so a run under roughly 150 ms prints its finished
  report directly.

Only compile and write have a unit to count. Discovery, assembly, and manifest
are single steps and get a marker rather than a percentage — a progress bar that
invents a denominator is worse than none.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 12.01 | Unify CLI output with a colour and symbol vocabulary | ../plans/12.01-output-style.md | architecture-engineer | done |
| 12.02 | Instrument the build with named phases and progress events | ../plans/12.02-build-phases.md | architecture-engineer | done |
| 12.03 | Render build phases with a progress bar and a final report | ../plans/12.03-progress-renderer.md | architecture-engineer | done |
| 12.04 | Group diagnostics by file and show the offending source line | ../plans/12.04-diagnostic-layout.md | architecture-engineer | done |
| 12.05 | Cover CLI output with style, phase, progress, and diagnostic tests | ../plans/12.05-cli-output-tests.md | test-engineer | done |

Acceptance:

- `pnpm typecheck`, `pnpm build`, and `pnpm test` pass the full suite (324
  compiler tests, 188 CLI tests, 72 LSP tests, 58 mta-types tests, 28 runtime
  tests, 27 VS Code tests, 18 template tests), with no skipped test. The CLI
  suite grew by 65 tests across five new files, and the 123 tests that existed
  before the milestone pass unchanged.
- `packages/cli/src/reporting/output-style.ts` is the only module in the
  repository that produces an escape sequence, holding the five tones, the four
  markers, the seven phase symbols, the bar glyphs, and the erase-line sequence.
  Everything else asks it for a string.
- Capability is detected once per process. Colour and emoji switch off when the
  stream is not a TTY, when `NO_COLOR` is set to a non-empty value, or when
  `--no-color` is passed. On a TTY without colour the run still animates, in
  ASCII: `interactive` drives the animation, `color` and `unicode` drive the
  escape sequences and the emoji.
- The build reports discovery, compile, assembly, manifest, and write; `ensure`
  adds sync and restart. Each phase is a contiguous segment, so the durations
  `runCompile` records sum to within a millisecond of the total it reports.
- Compile and write count a unit and draw a bar; discovery, assembly, manifest,
  and restart are single steps and get a marker. `BUILD_PHASES.filter(isCountedPhase)`
  is asserted to be exactly `['compile', 'write']`.
- A warm rebuild paints no intermediate frame, asserted by an in-memory paint
  sink that stays empty across a second `runBuildCommand`. On a 300-file build
  that did paint frames, the paint calls cost 0.02 ms in total against the 5 ms
  budget — the throttle keeps the frame count low enough that the cost is the
  string building, not the drawing.
- Diagnostics are grouped under a bold path header, each entry keeping its own
  `path:line:column error code: message`, the offending source line in a gutter,
  a caret run sized from the token at the column, and the hint as a muted line.
  Line 0, a line past the end of the file, and a column past the end of the line
  are all handled without a crash. Beyond 10 entries per file or 10 files, the
  remainder is summarised.
- Piped output is byte-for-byte the pre-milestone format: one line per phase, one
  line per diagnostic, no escape sequence and no carriage return in the
  transcript.
- Each rebuild under `ensure --watch` is preceded by a muted rule carrying an
  `HH:MM:SS` timestamp.
- A build that fails marks the failing phase and runs no later phase, asserted
  on the recorded durations.
- The generated resource is byte identical between a plain run and a rich run,
  compared file by file including `meta.xml`.
- Cold build is 47.4–51.8 ms and a warm rebuild 1.13–1.6 ms on the same 300-file
  benchmark that measured 47.2 ms and roughly 1 ms before the milestone, so the
  instrumentation costs nothing measurable.

Decisions this milestone recorded:

- **The compiler learned about progress, not about terminals.**
  `packages/compiler/src/project/progress.ts` declares `ProgressEvent` and
  `ProgressReporter` as data — item, index, total — and nothing under
  `packages/compiler` imports the CLI or references a stream.
- **Manifest generation is timed through a callback, not by splitting the call.**
  `generateManifest` runs inside `assembleResource`, so the function took an
  optional `AssemblyReporter` that announces which of the two steps just closed.
  Splitting the function would have moved the duplicate-path check and the error
  path out with it.
- **`interactive` is separate from `color` and `unicode`.** One boolean would have
  made `--no-color` turn off the animation as well, which is not what a user with
  a monochrome terminal is asking for.
- **The fast path is "refuse to paint", not "predict the duration".** The pipeline
  is synchronous, so the renderer cannot know in advance that a run is short. It
  simply paints nothing until 150 ms of wall clock have passed, which makes every
  warm rebuild silent by construction rather than by a heuristic.
- **`Logger` stayed the plain sink it always was.** The new `Reporter` sits
  between the commands and it, owning markers and tone; a command that never
  learns about a reporter still gets the plain path, which is why
  `CommandContext.reporter` is optional and every earlier test kept compiling.
- **Progress paints on stderr, reports print on stdout**, so redirecting stdout
  captures the report without the transient frames.
- **The hint is split off the message with a heuristic.** `Diagnostic` has no
  hint field — milestone 7 appended a second sentence to the message — so the
  layout splits at the first `'. '`. Changing the diagnostic shape was the larger
  change and belongs with whatever needs structured hints next.
- **The caret is sized from the source line**, scanning the identifier at the
  reported column, because `Diagnostic` carries a position but no token length.
  A column that lands on no identifier gets a single caret.

Deferred to a later milestone:

- Localising CLI output. Every message stays English, matching what the CLI
  prints today.
- A machine readable output mode (`--json`) for another tool to consume.
- Progress for the LSP, which has its own protocol for it.

## Milestone 13 — The Generated Manifest Standard

Bring the generated `meta.xml` to the standard the project owner authored in
`examples/meta.xml`, and move the runtime helpers out of the source tree so the
wildcards that standard requires are safe to emit.

Status: done

Milestone 3 made the compiler the sole owner of the manifest and milestone 10
gave it contributions. Both were built on the assumption that the compiler
enumerates every script into the file. The owner's manifest does the opposite: a
directory of scripts is one wildcard line, attributes equal to the MTA default
are omitted, and `<info>` carries no `name`. This milestone reverses that
assumption and implements the standard, recorded in
[ADR-008](adr/008-generated-manifest-standard.md).

The helper move is the hidden prerequisite. A helper under `src/` would be
matched by the source wildcard as well as by its own explicit entry, and loading
`class.lua` twice resets the class registry — so 13.01 runs before 13.02 or
nothing else is safe to emit.

Sequencing: 13.01 to 13.03 are one chain over the same two files, ordered so the
manifest snapshots are rewritten once rather than three times. 13.04 depends on
nothing and can run alongside them. 13.05 needs the element order 13.03 fixes.
13.06 and 13.07 close the milestone.

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 13.01 | Move runtime helpers out of `src` into `lib/<environment>` | ../plans/13.01-helper-library-directory.md | architecture-engineer | done |
| 13.02 | Emit wildcard script entries with a declared load order | ../plans/13.02-wildcard-scripts-and-load-order.md | architecture-engineer | done |
| 13.03 | Bring the manifest emitter to the authored standard | ../plans/13.03-manifest-standard-emitter.md | architecture-engineer | done |
| 13.04 | Remove the `setting` and `depends` directives from the language | ../plans/13.04-remove-setting-and-depends.md | architecture-engineer | done |
| 13.05 | Resolve `min_mta_version` from the MTA release feed | ../plans/13.05-min-mta-version-lookup.md | architecture-engineer | done |
| 13.06 | Cover the manifest standard with layout, order, and offline tests | ../plans/13.06-manifest-standard-tests.md | test-engineer | done |
| 13.07 | Document the manifest standard and the directive removal | ../plans/13.07-manifest-docs.md | documentation-engineer | done |

Acceptance:

- `pnpm typecheck`, `pnpm build`, and `pnpm test` pass the full suite with no
  skipped test.
- Runtime helpers land in `lib/<environment>/`, nothing is generated under
  `src/**/lib`, and a helper that stops being required is pruned.
- Each environment with modules produces exactly one `<script>` wildcard entry,
  and adding a module to an existing environment leaves `meta.xml` byte
  identical.
- `loadOrder` in `luam.json` pins scripts and assets ahead of their group, and an
  entry matching no file fails the build with a diagnostic naming the entry.
- A server `<script>` carries neither `type` nor `cache`; every `client` and
  `shared` script carries `cache="false"` unconditionally, and `isCached` no
  longer exists.
- `<info>` carries no `name`, in the order `author`, `type`, `version`,
  `description`, and renaming the resource changes the output directory without
  changing the manifest.
- A shared `export` is one `<export type="shared" />` entry rather than the
  server and client pair milestone 10 emitted.
- Section comments appear only above a group that has entries, and element order
  is `<oop>`, info, scripts, exports, files, `min_mta_version`.
- `setting` and `depends` are ordinary identifiers again, no input can produce a
  `<setting>` or an `<include>` element, and `export` is unchanged byte for byte.
- `min_mta_version` resolves from the `multitheftauto/mtasa-blue` releases,
  caches the value, falls back to the cache when offline, and warns and omits the
  element when there is neither — no path fails the build, and no compiler
  package makes a network call.
- Pruning works without reading the previous manifest, since an entry is now a
  pattern rather than a path.
- The generated resource still loads in MTA on a scaffolded project: helpers
  first, framework before the handlers that extend it.

Verified on 2026-08-10: 747 tests pass with no skipped test (332 compiler, 209
cli, 74 lsp, 28 vscode, 28 runtime, 18 template, 58 mta-types), `pnpm typecheck`
and `pnpm build` are clean, and the benchmark stays inside the milestone 12
spread — cold 47.9–50.3 ms, warm 1.01–1.57 ms. The scaffolded project builds,
checks clean, and produces a manifest in the standard. No test reaches the
network: the release lookup is stubbed in its own suite and skipped through
`LUAM_OFFLINE` everywhere else.

Not verified: that the generated resource loads on a real MTA server. No server
was available, so the load-order guarantee rests on manifest order, as it has
since milestone 6.

Decisions this milestone takes into the work, closing the ADR-008 open
questions:

- **Load order is a deterministic default plus an explicit `loadOrder`.** Helpers,
  `config.lua`, pinned entries, then the wildcards in shared, server, client
  order. An entry matching no file is a build error, so a rename cannot break
  the order silently.
- **`setting` and `depends` are removed from the language.** The owner does not
  need `<setting>` or `<include>`, and keeping words that produce nothing is
  worse than removing them. This reverts part of
  [ADR-007](adr/007-build-directives.md); `export` stays and the contribution
  channel stays with it.
- **`min_mta_version` is resolved over the network, with a cache and a fallback.**
  The manifest stops being a pure function of the source; reproducibility now
  reads "identical for a given resolved MTA version".

Open risk this milestone did not settle:

- **Whether MTA loads a file twice when an explicit entry and a wildcard both
  match it.** This was not verified on a real server — no MTA server was
  available to the run that implemented the milestone — so the design rests on
  the owner's production manifest, which places an `index`/`main` entry ahead of
  the wildcard. Nothing the compiler emits by default overlaps: the default
  order produces no explicit entry inside a wildcard's reach, so only a project
  that sets `loadOrder` is exposed. If a real server does double-load, the fix
  is the fallback already implemented for the environment mismatch below —
  enumerate the environment `loadOrder` touches and keep the wildcard for the
  others.

Decided during implementation, beyond the plan:

- **A directory whose files do not all match the environment their path implies
  is enumerated rather than collapsed.** A file under `src/shared/` carrying an
  `#!server` directive needs `type="server"`, which `src/shared/**/*.lua`
  cannot express. Emitting a wrong type would be a silent runtime failure, so
  that directory falls back to explicit entries and the others keep their
  wildcard.
- **Section comments are plain English** — `Resource information`,
  `Runtime library`, `Configuration`, `Source scripts`, `Exported functions`,
  `Assets`, `Minimum MTA version` — rather than the possessive-plural style of
  `examples/meta.xml`, because everything a user reads is one wording in
  English. The entries themselves match the authored file.
- **`resourceName` left `CheckOptions`, `CompileOptions`, and
  `CompileProjectOptions`,** and `name` left `ResourceOptions`. Both existed
  only for things this milestone removed.

Explicitly out of scope:

- What the production artifact contains. `build/<name>/.env` is generated with
  sensitive keys blank and never overwritten, which invites local edits a folder
  copy would carry to production. That question is still open and is not a
  manifest concern.
- Publishing. Both packages stay `private`, and the packages are still not a git
  repository, so no CI workflow has run.

## Milestone 14 — Decorators and Generated Accessors

Give the language a decorator syntax, and ship the first two: `@Getter` and
`@Setter`, which generate Java-style accessors on a class field.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 14.01 | Decorator syntax, AST, and ADR-009 | ../plans/14.01-decorator-syntax.md | architecture-engineer | done |
| 14.02 | Expand `@Getter` and `@Setter` into class methods | ../plans/14.02-getter-setter-accessors.md | architecture-engineer | done |
| 14.03 | Complete, highlight, and explain decorators in the editor | ../plans/14.03-decorator-editor-support.md | architecture-engineer | done |
| 14.04 | Cover decorators with fixtures, unit, and editor tests | ../plans/14.04-decorator-tests.md | test-engineer | done |
| 14.05 | Document decorators in the language reference | ../plans/14.05-decorator-docs.md | documentation-engineer | done |

Acceptance:

- `@Name` parses above a class declaration and above a class member. Decorator
  names stay ordinary identifiers, so `local Getter = 1` still compiles.
- `@Getter` and `@Setter` generate accessor methods from a field, named the way
  Java names them: `isAdmin` for a boolean, `getName` otherwise, and always
  `setName` for the setter. A boolean field already prefixed `is` keeps its name.
- Both decorators work on a field and on the class, where they apply to every
  field the class declares.
- A field whose *resolved* type is boolean produces `is`, never `get`. That
  covers `enabled?: boolean`, an alias chain ending in `boolean`, an alias declared in
  another file, and a field inferred from a `true`/`false` default.
- The accessor's signature reuses the annotation the author wrote, so
  `admin: Flag` generates `isAdmin(): Flag`.
- A generated accessor is an ordinary member: it is typed, inherited, satisfies
  an interface, completes in the editor, and its definition is the field.
- A decorator that would overwrite an existing member is
  `check-decorator-conflict` and produces no output.
- No decorator reaches the generated Lua, and a project that uses none produces
  byte-identical output to before the milestone.

Design constraints:

- A decorator rewrites the class it annotates and does nothing else.
- The expansion runs inside the checker's class pass, because the accessor name
  depends on the field's resolved type and `resolveAnnotation` is the only thing
  that follows an alias. A pass between parse and check was considered and
  rejected for exactly that reason.
- Generated members travel in a side table on the check result, not spliced into
  the parse tree. The parse tree stays what the author typed, and re-checking a
  program cannot generate an accessor twice.
- Adding a decorator is a data entry in one map, the way a native library is
  ([milestone 31](#milestone-31--native-libraries)).

Deferred to a later milestone:

- Decorator arguments, user-defined decorators, and decorators on functions,
  locals, parameters, interfaces, or enums. `@Getter(...)` parses and is rejected
  with its own diagnostic so the extension point stays visible.
- A rename that rewrites a field and its generated accessors together, and a
  quick fix that offers `@Getter` on an undecorated field.

Decided during implementation:

- Method calls on project classes now use the same member registry as property
  access, so generated and authored methods both validate arguments and returns.
- Synthetic methods remain in the symbol index for navigation but carry an
  origin flag. The new document-symbol projection filters that flag, keeping
  generated accessors out of the outline without breaking go-to-definition.

## Milestone 15 — Server-Only Ensure Output

Keep continuous MTA deployment out of the developer's project output directory.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 15.01 | Write ensure output only to the MTA server | ../plans/15.01-ensure-server-only.md | architecture-engineer | done |

Acceptance:

- `luam build` remains the only command that writes to
  `<root>/<outDir>/<name>`.
- `luam ensure` writes only to `<serverPath>/<resourcesDir>/<name>` during both
  its initial run and watched rebuilds.
- `luam ensure` without `serverPath` reports a diagnostic without writing output,
  starting a watcher, or invoking the restart transport.
- Existing local build output remains untouched by every ensure cycle.

Result:

- `build` and `ensure` use separate target resolvers. Configuring `serverPath`
  does not change where `build` writes, and configuring `outDir` does not change
  where `ensure` writes.
- Each successful ensure cycle performs one resource write, directly under the
  MTA server. The sync result alone controls refresh and restart.
- Missing `serverPath` fails before compilation and watch setup, with no output
  or transport operation.
- CLI regression coverage verifies relative and absolute server paths, custom
  resource and output directories, watched rebuilds, stale-file pruning, and
  byte-identical preservation of existing local output.

## Milestone 16 — MTA Development Logs

Bring server and resource client logs into the terminal that runs the development
workflow, using only the configured MTA server and its native event channel.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 16.01 | Stream MTA development logs to the Luam terminal | ../plans/16.01-mta-development-logs.md | architecture-engineer | done |

Acceptance:

- `luam dev` follows appended server logs for the active resource and stops with
  the development command.
- Client resource calls to `outputDebugString` remain visible in the MTA client
  console and are relayed through the resource server to the Luam terminal.
- `luam build` and `luam ensure` do not inject development log helpers or change
  their existing output.
- No new HTTP listener or outbound network path is introduced; the client relay
  uses MTA events and the CLI reads local server log files.

Result:

- `luam dev` reuses the ensure runner, follows appended local server records,
  survives truncation and rotation, and stops through the command abort signal.
- A development-only Lua helper pair preserves client debug output and relays
  validated, bounded, per-client rate-limited records through MTA events.
- Stable terminal formatting respects TTY and colour capability, while normal
  `build` and `ensure` output remains free of development helpers.

## Milestone 17 — Bilingual GitHub Pages Manual

Publish a modern, versioned Luam manual in en-US and pt-BR so developers can
install the toolchain, write resources, diagnose failures, and deploy to MTA
without relying on the repository README.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 17.01 | Publish a bilingual GitHub Pages manual | ../plans/17.01-bilingual-github-pages-manual.md | documentation-engineer | done |

Acceptance:

- `pnpm docs:build` produces a static site with no broken internal links.
- The deployed site provides equivalent en-US and pt-BR navigation at
  `/luam/en/` and `/luam/pt-br/`, plus a working locale selector.
- Locale parity validation fails when a non-exempt page is missing or has no
  paired translation.
- The keyword page separates the 22 lexical keywords from contextual language
  terms and links each term to its grammar page.
- A new user can create, check, build, and run a basic MTA resource by following
  either locale without unstated repository knowledge.
- All documented recipes and snippets are checked automatically against current
  compiler behavior.
- Deployment runs after successful validation and requires no deployment secret
  beyond GitHub's Pages token.
- Pages are readable with keyboard navigation, narrow screens, and both light and
  dark color schemes.

Deliberately retained boundaries:

- The manual is translated; the product is not. CLI output, compiler and LSP
  diagnostics, generated resources, and the VS Code extension stay English-only,
  as [code-conventions](code-conventions.md) requires.
- Code, API names, diagnostics, CLI commands, configuration keys, file paths, and
  source keywords are never translated. en-US is the source locale.

## Milestone 18 — Production Bundle and Source Position Mapping

Split what the two commands produce. `build` ships the smallest resource MTA can
load; `ensure` and `dev` keep the mirrored tree, and a position reported by MTA
becomes a position in the developer's own source in both.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 18.01 | Bundle the production resource into one script per environment | ../plans/18.01-bundled-production-output.md | architecture-engineer | done |
| 18.02 | Emit a source line map for every module | ../plans/18.02-emitter-line-map.md | architecture-engineer | done |
| 18.03 | Resolve runtime positions back to Luam source | ../plans/18.03-position-resolution.md | architecture-engineer | done |
| 18.04 | Cover both output layouts and position resolution with tests | ../plans/18.04-bundle-and-mapping-tests.md | test-engineer | done |
| 18.05 | Document the two output layouts and position resolution | ../plans/18.05-output-layout-docs.md | documentation-engineer | done |

Acceptance:

- `luam build` writes `meta.xml`, `config.lua` when present, `.env` when
  declared, `src/shared.lua`, `src/server.lua`, `src/client.lua`, and the
  declared assets at their authored paths, with no mirrored module tree, no
  `lib/` directory, and nothing under `src/` but the bundles.
- `luam ensure` and `luam dev` output is byte-identical to the output before the
  milestone, and `--bundle` and `--no-bundle` override the default on both
  commands.
- The bundle preserves the semantics separate chunks give today: file-level
  `local` scope, the Lua 5.1 active-local limit per module, and `error` levels.
- A top-level `return` and a bundle name colliding with an asset both fail the
  build with their own diagnostic and write nothing.
- The emitter produces a line map for every module in both layouts, and the
  generated Lua is unchanged.
- `luam dev` prints the authored `.luam` path, line, and enclosing symbol for a
  runtime error, instead of the generated path and a drifted line.
- `luam build` writes the map beside the resource under `outDir`, never inside
  it, and `luam trace` resolves a production position offline against it.

Deferred to a later milestone:

- Identifier renaming and any other minification. It would buy little over the
  dense Lua the emitter already produces, and it would invalidate the line map.
- Column precision in the map. Line and enclosing symbol are what MTA reports.

## Milestone 19 — CLI Command Registry and Production Minification

Rebuild the command line on a declarative registry so every option has an owning
command, and ship production Lua as one line per script.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 19.01 | Define the CLI command contract and migration boundary | ../plans/19.01-cli-command-contract.md | architecture-engineer | done |
| 19.02 | Rebuild CLI registration and command boundaries | ../plans/19.02-cli-command-registry.md | architecture-engineer | done |
| 19.03 | Emit one-line Lua 5.1 production scripts | ../plans/19.03-production-lua-minifier.md | architecture-engineer | done |
| 19.04 | Verify CLI compatibility and Lua minification | ../plans/19.04-cli-minifier-tests.md | test-engineer | done |
| 19.05 | Document the rebuilt CLI and production output | ../plans/19.05-cli-production-docs.md | documentation-engineer | done |

Acceptance:

- `luam --help` and `luam <command> --help` list the options the command reads,
  generated from its declaration rather than from a maintained string.
- An option outside its owning command exits `2` without running the command,
  and `0`, `1`, `2` keep their meanings.
- `build`, `check`, `dev`, `ensure`, `trace`, `init`, `setup`, and `doctor` keep
  their observable behaviour for every valid invocation.
- No command calls `process.exit`; `index.ts` assigns `process.exitCode`.
- Every `.lua` file `luam build` writes contains no newline, parses as Lua 5.1,
  and preserves string, long bracket, and numeric literals byte for byte.
- A compilation or minification failure writes and prunes nothing.
- `luam ensure` and `luam dev` output stays readable and source-mappable.
- `luam trace` refuses a map marked `minified` instead of reporting a false line.

Deferred to a later milestone:

- Identifier renaming, dead-code elimination, and bytecode compilation. Renaming
  would invalidate the enclosing symbols ADR-011 records.
- Column precision in the map, which is what a one-line artifact would need for
  a production position to resolve.

## Milestone 20 — The `.luam.manifest` Module

Replace the JSON project file with a discoverable ES module that may compute its
configuration from the command and the environment, without ever running in the
editor.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 20.01 | Replace `luam.json` with `.luam.manifest` environment modules | ../plans/20.01-luam-manifest-env.md | architecture-engineer | done |

Acceptance:

- `.luam.manifest` is discovered at the project root, and `--manifest <path>`
  selects an alternate one; `--config` no longer exists.
- A plain-object manifest and a function manifest produce the same validated
  model as the former JSON file, field for field.
- The function receives `mode`, a read-only `env`, and the absolute `root`, and
  nothing else crosses back but the serialized result.
- An unsupported extension, an evaluation failure, a missing or invalid default
  export, a `Promise`, and a non-object result each fail before compilation with
  their own `config-*` diagnostic, and none of them prints an environment value,
  the module source, or a stack trace.
- `luam.json` is ignored, including when it sits beside a `.luam.manifest`.
- The language server never imports the manifest. It reads
  `.luam/settings.json`, which the CLI writes atomically after validation, and a
  malformed manifest degrades the editor to defaults instead of crashing it.
- The VS Code extension activates on `.luam.manifest`, renders a dedicated light
  and dark icon for that filename, and keeps the `.luam` grammar untouched.
- `pnpm test`, `pnpm typecheck`, and `pnpm docs:verify` pass.

Deferred to a later milestone:

- TypeScript manifests, which would put a transpiler in the CLI's runtime path.
- Searching parent directories and merging several manifests. One file, one
  project.
- Asynchronous manifests. Configuration resolution sits in front of every
  command, including the synchronous ones.

## Milestone 21 — The Manifest Language

Turn `.luam.manifest` from an ES module into a restricted Luam dialect the
compiler parses, checks, and evaluates in process, so configuration errors get a
caret and the editor gets completion.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 21.01 | Make `.luam.manifest` a restricted Luam dialect with first-class editor support | ../plans/21.01-luam-manifest-language.md | architecture-engineer | done |

Acceptance:

- The manifest allows two statements — a `local` declaration and an assignment to
  a manifest field — and an expression language with no calls and no function
  expressions, so evaluation is pure and total.
- `mode`, `env`, and `root` reach the manifest as values, and `env` members type
  as `string?`.
- An unknown field, a wrong type at any nesting level, a missing `name`, and a
  disallowed statement or expression each report with a file, a line, and an
  excerpt.
- One field catalog derives the record descriptor, the validator, completion,
  and hover, so a field is added in one place.
- The language server checks manifests as they are typed, reads `oop` from the
  manifest itself, and offers field completion that sorts required fields first
  and shows each optional field's default.
- The child process, the stdout protocol, `.luam/settings.json`, and the four
  evaluator diagnostics from milestone 20 are deleted.
- A migrated manifest produces the same `meta.xml` and Lua as its milestone 20
  equivalent.
- `pnpm test`, `pnpm typecheck`, and `pnpm docs:verify` pass.

Deferred to a later milestone:

- A conditional expression in the language proper. `a and b or c` is the Lua
  idiom, and the manifest is the wrong reason to grow the grammar.
- Manifest imports or includes, and merging several manifests.
- Generating the configuration reference table from the field catalog.

## Milestone 22 — Interactive Documentation Experience

Turn the bilingual manual into a product demonstration with a stronger landing
page, real in-browser compilation, progressive examples, authentic MTA evidence,
and author-provided VS Code screenshots.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 22.01 | Turn the manual into an interactive product experience | ../plans/22.01-documentation-experience.md | documentation-engineer | done |
| 22.02 | Keep documentation versioning synchronized with releases | ../plans/22.02-documentation-versioning.md | github-engineer | done |

Acceptance:

- The first screen explains what Luam checks and emits and offers installation
  and no-install playground actions on desktop and mobile.
- A lazy browser worker runs the real compiler without executing generated Lua or
  sending source over the network, and browser results match Node fixtures.
- Recipes follow an outcome-first learning path and three realistic MTA use cases
  include verified source plus reviewed runtime evidence with provenance.
- Author-provided VS Code screenshots demonstrate completion, diagnostics, hover,
  and the development log loop without exposing private information.
- The committed CLI version drives current-version displays, and release CI
  rejects stale package versions or missing en-US, pt-BR, and root changelog
  sections before packaging a tag.
- Migration and comparison guides, generated example downloads, MTA API and
  diagnostic explorers, and a user-facing compiler pipeline make adoption and
  reference lookup concrete without duplicating compiler data.
- Integrity and obsolete-content checks catch broken links, orphan pages,
  inaccessible assets, stale syntax and configuration, and generated-data drift;
  page feedback sends no source code or background telemetry.
- Locale parity, accessibility, responsive layouts, evidence validation,
  playground tests, and `pnpm docs:verify` pass in CI.

## Milestone 23 — The Manifest as the Project Contract

Turn `.luam.manifest` into one typed, editor-aware contract covering compilation,
source discovery, assets, resource dependencies, engine requirements, output,
development, and deployment — without turning it into a build script.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 23.01 | Evolve `.luam.manifest` into the complete project contract | ../plans/23.01-compiler-options.md | architecture-engineer | done |

Acceptance:

- The manifest is a closed set of typed domains — `compiler`, `sources`,
  `assets`, `dependencies`, `engine`, `environment`, output, and deployment —
  each with one owner and one implemented consumer
  ([ADR-017](adr/017-manifest-domain-contract.md)).
- One path-pattern engine backs the compiler, the CLI, and the language server.
  It accepts `*`, `**`, and `?` with `/` as the separator, rejects regex,
  negation, brace expansion, and extglobs, and matches without backtracking.
- `sources` maps patterns to `server`, `client`, and `shared`. The matched side
  is the file's environment unless a file directive overrides it, which reports
  `env-path-directive-conflict` rather than resolving silently.
- `assets` is the only thing that copies a file into the resource. Every mapping
  is declared as `<file>`, and a duplicate or reserved destination is
  `config-output-collision`.
- `dependencies` writes `<include>` entries, and `engine.minVersion` writes
  `min_mta_version`. A pinned version keeps the build network-free and an
  offline build still succeeds.
- `environment` selects the file that declares the keys behind `env` and
  `process.env` and the file that overrides their values; the local file may
  never add a key and never reaches the deployment template.
- `compiler` carries `strict`, `oop`, `noUnusedLocals`,
  `noUnusedParameters`, and `warningsAsErrors`; the cache is keyed on them and on
  each file's environment, so changing one recompiles exactly what it affects.
- `oop`, `sourceDirs`, `assetDirs`, and `mta` are rejected with
  `config-removed-field` naming the replacement, never aliased.
- The CLI, the watcher, and the language server read the same normalized
  contract, and the editor completes and hovers every domain, including the
  members of an `assets` entry.
- `pnpm test`, `pnpm typecheck`, and `pnpm docs:verify` pass.

Deferred to a later milestone:

- Hooks, plugins, and any manifest field that describes how to build rather than
  what the project is.
- Optional dependencies, which MTA has no concept of.
- Copying a file into the resource without declaring it as `<file>`.

## Milestone 24 — Limitation Reduction and Explicit Boundaries

Remove high-value compiler and tooling limitations while preserving the product
contracts that keep Luam predictable, secure, and compatible with Lua 5.1 and MTA.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 24.01 | Classify and align Luam limitation contracts | ../plans/24.01-limitations-contract.md | documentation-engineer | done |
| 24.02 | Automate safe MTA catalog refreshes | ../plans/24.02-catalog-refresh.md | github-engineer | superseded by 28.06 |
| 24.03 | Build a per-reference dependency graph | ../plans/24.03-lsp-dependency-graph.md | performance-engineer | done |
| 24.04 | Add path-sensitive control-flow analysis | ../plans/24.04-flow-analysis.md | architecture-engineer | done |
| 24.05 | Predeclare classes without changing runtime effects | ../plans/24.05-class-predeclaration.md | architecture-engineer | done |
| 24.06 | Add static members to user classes | ../plans/24.06-static-class-members.md | architecture-engineer | done |
| 24.07 | Add erased generic user classes | ../plans/24.07-generic-classes.md | architecture-engineer | done |
| 24.08 | Define and verify a typed resource export ABI | ../plans/24.08-resource-export-abi.md | architecture-engineer | done |
| 24.09 | Generate opt-in runtime boundary validators | ../plans/24.09-runtime-boundary-validation.md | security-engineer | done |
| 24.10 | Expose a safe class metamethod subset | ../plans/24.10-safe-class-metamethods.md | security-engineer | done |
| 24.11 | Derive declarations from static `config.lua` data | ../plans/24.11-config-declarations.md | architecture-engineer | done |
| 24.12 | Add an authenticated remote development bridge | ../plans/24.12-remote-development-bridge.md | security-engineer | not planned |

Sequencing:

- 24.01 establishes the product boundaries and corrects stale claims before any
  implementation changes public behavior.
- 24.02 and 24.03 are independent early improvements. The dependency graph also
  provides the narrow invalidation required by the resource ABI.
- 24.05 establishes the two-phase class model before static members, generic
  classes, or metamethods extend it.
- 24.09 required security review before runtime code was accepted, and does not
  change production output by default.
- 24.12 is not planned. It needs the CLI to open a connection to an MTA server,
  and the product moved the other way twice: [CLAUDE.md](../CLAUDE.md) forbids
  that call, and `transport` — the manifest domain that used to configure it —
  was removed with `ensure` syncs files, `dev --start-server` restarts the
  server it owns as its replacement. The workflow the bridge would serve is
  already covered by that replacement, because the server runs in the
  developer's own terminal and its log is read from disk. Reopening it means
  bringing back a configuration surface that was deliberately deleted, which is
  a product decision rather than an implementation one.

Acceptance:

- Identifier and property narrowing is sound across branches, loops, mutation,
  and unknown calls, with bounded analysis cost.
- Same-file class references no longer depend on declaration order, and generated
  Lua preserves authored top-level effect order.
- Static members and generic classes have separate class-value and instance
  semantics and erase to Lua 5.1 without specialization.
- Only threat-modeled metamethods are exposed; `__index`, `__newindex`, and
  `__call` remain blocked.
- Catalog refreshes are reproducible and proposed automatically without adding
  network access to compilation.
- Incremental analysis matches clean analysis while rechecking only the semantic
  reverse dependency closure.
- Statically identifiable cross-resource calls use a versioned export ABI;
  dynamic calls remain explicitly unverified.
- Runtime validators are emitted only for marked trust boundaries.
- `config.lua` is never executed or treated as Luam source; the optional extractor
  accepts only bounded literal data and produces reviewable declarations.
- EN and PT-BR documentation accurately distinguish planned work, design
  boundaries, upstream constraints, and MTA platform constraints.

Deliberately retained boundaries:

- Type annotations remain erased by default
  ([ADR-021](adr/021-erased-type-annotations.md)).
- Native `config.lua` remains opaque to normal compilation
  ([ADR-022](adr/022-opaque-native-configuration.md)).
- Environment remains a file-level property because MTA assigns a side to each
  `<script>` entry. Luam does not promise block-level splitting of locals,
  closures, control flow, or side effects
  ([ADR-023](adr/023-file-level-environments.md)).
- Arbitrary remote expression evaluation remains outside the remote log bridge
  and requires a separate debugger protocol and security decision.

## Milestone 25 — CLI-Owned MTA Server Lifecycle

Let the CLI own the lifecycle of an existing local MTA Server installation,
through an interactive `luam server` command and an opt-in `luam dev
--start-server` workflow.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 25.01 | Run a local MTA server through the CLI | ../plans/25.01-mta-server-lifecycle.md | architecture-engineer | done |

Acceptance:

- `luam server` starts an existing local MTA installation from `serverPath` and
  accepts MTA console input.
- Windows and Linux executable names resolve automatically, with a manifest
  override for nonstandard layouts.
- `luam dev --start-server` waits for readiness before its first transport call
  and then preserves the current build, sync, watch, and log behavior.
- `luam dev` without `--start-server` never starts or stops an MTA process.
- `Ctrl+C` closes the watcher and log follower, requests graceful server
  shutdown, and cannot leave an owned child running after the fallback timeout.
- A missing executable, spawn error, readiness timeout, or early child exit
  produces an actionable diagnostic and a nonzero exit code.
- The CLI never stops an MTA process it did not start.
- No shell is involved in executable launch, and configured executable paths
  cannot escape `serverPath`.
- Unit and command tests pass on Windows and Linux CI without an MTA
  installation.

Deliberately retained boundaries:

- Downloading or updating MTA, detached and background processes, remote process
  management, multiple instances, and discovery by PID or port stay out of the
  supervisor. `luam ensure` is unchanged.
- This is not a network path. The CLI drives the console of the process it
  started, and never opens a connection to an MTA server
  ([ADR-020](adr/020-cli-owned-mta-server-process.md)).

## Milestone 26 — Contextual Callback Typing

Infer unannotated callback parameters from every callable signature that accepts
a function, then use those inferred types for checker diagnostics, hover, and
receiver-specific completion.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 26.01 | Add contextual typing for callback parameters | ../plans/26.01-contextual-callback-typing.md | architecture-engineer | done |

Acceptance:

- Given `function onPlayer(handler: fun(Player, string): void): void`,
  `onPlayer(function(player, command) ... end)` types `player` as `Player` and
  `command` as `string` with no authored parameter annotations.
- Every callback parameter represented as a function type by the pinned upstream
  MTA declarations stays a function descriptor in the generated catalog instead
  of degrading to `any`.
- A generated MTA API callback receives the same contextual typing;
  `addCommandHandler` is covered as a regression example, not a special case.
- Completion after an inferred callback parameter offers only members valid for
  that receiver type and respects `.` versus `:` and the file environment.
- Hover reports the inferred parameter type, and checker diagnostics use that
  same type inside the callback body.
- Explicit callback parameter and return annotations retain current validation
  behavior and are never silently replaced by context.
- Ambiguous or unavailable callback signatures degrade to `any` without false
  member suggestions or API-specific heuristics.
- Generated Lua output is byte-identical for fixtures that differ only by
  contextual type information.

Deliberately retained boundaries:

- Contextual typing applies whenever an expression is checked against an expected
  function type, never by API name.
- Named function declarations inferred from later call sites, overload syntax,
  generic inference, event-name-dependent callback signatures, and callback
  return-type covariance stay out of scope.
- Analysis only. The emitted Lua 5.1 is unchanged.

## Milestone 27 — Source-Faithful Development Output

Make the Lua written by a readable build a faithful rendering of the authored
Luam: the same lines, the same layout, and only the Luam constructs rewritten.
Minified output keeps the canonical path.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 27.01 | Repair the orphan semicolon left by an erased declaration | ../plans/27.01-orphan-semicolon.md | architecture-engineer | done |
| 27.02 | Add a development output mode to the compiler and CLI | ../plans/27.02-development-output-mode.md | architecture-engineer | done |
| 27.03 | Keep erased declarations visible as Lua comments | ../plans/27.03-erased-declaration-comments.md | architecture-engineer | done |
| 27.04 | Preserve authored class and enum layout | ../plans/27.04-class-and-enum-layout.md | architecture-engineer | done |
| 27.05 | Fold loop scaffolding so `continue` adds no line | ../plans/27.05-continue-scaffolding.md | architecture-engineer | done |
| 27.06 | Narrow canonical replacement to the lowered statement | ../plans/27.06-lowering-granularity.md | architecture-engineer | done |
| 27.07 | Cover development output with line-fidelity tests | ../plans/27.07-line-fidelity-tests.md | test-engineer | done |
| 27.08 | Document the development output contract | ../plans/27.08-development-output-docs.md | documentation-engineer | done |

Mode selection, decided during execution: the manifest gains no field. The
readable form is what a build without minification asks for, so `luam build`
derives it from the resolved `minify`, and `dev` and `ensure` are always in it
because they never minify. The compile boundary still carries an explicit
`development` flag so the emitter never reads a write-layer concern.

Sequencing:

- 27.01 is independent and lands first. It repairs invalid Lua 5.1 in every build,
  not only development ones, so it must not wait on the output mode.
- 27.02 introduces the gate that 27.03 and 27.04 need. Nothing user-visible changes
  until a later task uses it.
- 27.05 and 27.06 both reduce drift and are independent of each other, but 27.06
  is the deepest change and should not be started before 27.04 has established
  surgical editing for a construct.
- 27.07 runs against every task in the milestone and defines the invariant the
  milestone is measured by.
- 27.08 lands last so the documented contract matches shipped behavior.

Acceptance:

- `pnpm typecheck` passes with no errors.
- `pnpm test` passes the full suite.
- A development build of a file containing an interface, a class, an enum, a
  compound assignment, a native extension, and a `continue` produces Lua with
  the same number of lines as the source, and every statement that Lua 5.1
  already accepts is copied through unchanged.
- An erased declaration written with a trailing semicolon no longer emits a bare
  `;`, in development and release alike.
- Every erased declaration appears as a comment in a development build, its
  trailing semicolon inside the comment. Inline type annotations stay erased, so
  a generated signature reads as plain Lua.
- The `continue` scaffolding adds no line to its loop in either mode. It rides
  the first and last lines of the loop body, so the loop's own header and `end`
  are copied through unchanged, and a development build keeps the whole loop on
  its authored lines.
- A minified build changes only where the narrower canonical replacement, the
  folded scaffolding, or the orphan semicolon repair applies. Minification
  erases the layout differences, so the shipped bytes are equivalent.
- No comment carrying source text appears in a minified build.
- A construct that cannot fit the lines it was written on aborts source-faithful
  emission for the whole file in a development build, which falls back to
  canonical emission rather than shifting every line below it.

Deliberately retained boundaries:

- Interfaces remain compile-only. A comment is not code, so milestone 2 still
  holds: no interface reaches the generated Lua as a runtime construct.
- An enum keeps quoted member names. The runtime helper uses each element as a
  table key, so an unquoted member would produce an empty enum.
- Type annotations remain erased.
- The canonical emitter remains the release path and the fallback whenever a
  construct has no surgical form.

## Milestone 28 — MTA Catalog Resynchronization

Restore the catalog's ability to track MTA. The source it is generated from was
abandoned in February 2023, so the declarations are not only incomplete, they
are wrong in ways the compiler acts on. Replace the source with the wiki itself,
committed as a snapshot, refreshed on a schedule, adopted only under review.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 28.01 | Replace the dead upstream with a committed wiki snapshot | ../plans/28.01-wiki-snapshot-source.md | architecture-engineer | done |
| 28.02 | Fail the suite on MTA catalog drift | ../plans/28.02-catalog-drift-detection.md | test-engineer | done |
| 28.03 | Parse wiki signatures into the generator model | ../plans/28.03-wiki-signature-parser.md | architecture-engineer | done |
| 28.04 | Make the wiki snapshot the primary catalog source | ../plans/28.04-wiki-primary-source.md | architecture-engineer | done |
| 28.05 | Correct the environments and arities the frozen catalog gets wrong | ../plans/28.05-environment-and-arity-corrections.md | architecture-engineer | done |
| 28.06 | Automate refresh proposals without trusting the wiki | ../plans/28.06-scheduled-refresh-workflow.md | github-engineer | done |
| 28.07 | Record the catalog source change | ../plans/28.07-catalog-source-documentation.md | documentation-engineer | done |

What was measured, on 2026-08-25, against the full wiki:

- `mtasa-lua-types` last published 2023-02-05. `1.1.1` is final, so ADR-006's
  refresh path — bump the pin — no longer exists.
- The catalog declares 1294 functions. The wiki lists 1383. 119 are missing: 93
  client, 12 server, 14 shared.
- 24 declarations name the wrong environment. Every one is a function that
  gained a second side in a later MTA release and is still declared one-sided,
  so the checker rejects code MTA accepts.
- All 1383 pages carry a parseable `<syntaxhighlight lang="lua">` signature in
  their Syntax section. An untuned 120-line prototype parsed 99.0% of them and
  agreed with the existing catalog on 98.2% of total arities, 96.1% of required
  arities, and 98.1% of environments.

Sequencing:

- 28.01 lands the new input and nothing consumes it yet, so it is safe to merge
  before the parser exists.
- 28.02 depends only on 28.01 and delivers the milestone's first real value: the
  gap stops being invisible. It is worth landing even if the rest slips, and its
  baseline allowlist is what 28.04 and 28.05 are measured against.
- 28.03 is the risk. It carries the accuracy bar, and if the bar cannot be met
  the milestone stops there with 28.02's reporting already in place.
- 28.05 follows 28.04 rather than preceding it, because the corrections are only
  knowable once the wiki-generated catalog exists to diff against.
- 28.06 is deliberately last among the code tasks. Automating a refresh before
  the corrections land would propose a diff nobody can read.

Deliberately retained boundaries:

- Compiler packages make no network call. The fetch lives in one dev script and
  one scheduled workflow, and a build with no network still succeeds.
- An unknown MTA global stays `any` and blocks nothing. Completing the catalog
  improves types; it never turns an undeclared name into an error.
- `catalog-overrides.ts` remains the escape hatch and is applied after the
  parse, so no automated refresh can undo a hand-written correction.
- A function that disappears from the wiki is reported, never deleted. The
  source is publicly editable, and a blanked page must not remove a declaration
  from users' type information.
- No automated merge. The refresh is automatic; adopting it is not.

Settled question:

- The MTA wiki publishes under GNU Free Documentation License 1.3, as its own
  `rightsinfo` endpoint declares. The maintainer chose to keep both the
  committed snapshot and the wiki-derived documentation prose, attributing the
  wiki as the direct source under GFDL-1.3 in `packages/mta-types/README.md`,
  with every documentation entry linking back to the page it came from.

What the milestone delivered, measured on the same day:

- The catalog covers 1413 MTA declarations against 1294: 545 shared, 229 server,
  639 client, covering MTA 1.7.0. All 119 missing functions are declared, all 24
  wrong environments are corrected, and no declaration was removed.
- 93 existing signatures changed, mostly `any` becoming a real type, and 100
  multi-return functions now emit tuples.
- The parser reads 100% of the 1384 pages, agreeing with the frozen catalog on
  98.3% of total arities and 98.2% of required arities. Every one of the 44
  remaining disagreements is classified in
  `packages/mta-types/scripts/wiki-parse-classification.ts`, and none is a
  parser defect.
- Six corrections narrow a declaration and so can reject code that compiles
  today: `usePickup` moving from shared to server, plus `addBan`, `createLight`,
  `dxCreateTexture`, `dxDrawText`, `engineRestoreObjectGroupPhysicalProperties`,
  and `fetchRemote`.
- `mtasa-lua-types` remains a devDependency as the tiebreaker, narrowing 27
  positions, and still supplies the element hierarchy, the events, the OOP
  classes, and the predefined variables.
- Recorded in [ADR-029](adr/029-mta-wiki-catalog-source.md), which supersedes
  [ADR-006](adr/006-mta-declaration-source.md).

## Milestone 29 — The Luam Editor Theme

Ship a theme that reads Luam as Luam: minimal in palette, complete in
differentiation. One role table generates every editor's theme, and the
distinctions a grammar cannot make are served as LSP semantic tokens.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 29.01 | Define the theme token contract and palette | ../plans/29.01-theme-token-contract.md | architecture-engineer | done |
| 29.02 | Close the grammar scopes the theme cannot reach | ../plans/29.02-grammar-scope-completeness.md | architecture-engineer | done |
| 29.03 | Serve semantic tokens from the LSP | ../plans/29.03-semantic-tokens-provider.md | architecture-engineer | done |
| 29.04 | Generate and contribute the VS Code themes | ../plans/29.04-vscode-theme-contribution.md | architecture-engineer | done |
| 29.05 | Export the theme to the other editors | ../plans/29.05-cross-editor-theme-exports.md | architecture-engineer | done |
| 29.06 | Prove the theme differentiates and stays readable | ../plans/29.06-theme-tests.md | test-engineer | done |
| 29.07 | Document the theme and its contract | ../plans/29.07-theme-documentation.md | documentation-engineer | done |

Acceptance:

- `Luam Dark` and `Luam Light` install with the extension and are generated, not
  hand-written; regenerating produces no diff on any target.
- Every scope both grammars emit, and every semantic token the LSP produces,
  resolves to an explicit theme rule.
- Inside a confusion set no two elements share a style, and a user function, a
  method, an MTA native, and a Lua stdlib call read as four different things.
- Contrast floors hold in both modes and are asserted, not reviewed.
- Zed, Neovim, and the TextMate family are exported from the same role table.

Sequencing:

- 29.01 is the contract and blocks everything. Nothing about a colour is decided
  anywhere else.
- 29.02 and 29.03 are independent of each other and run in parallel. 29.02 fixes
  what position can prove; 29.03 supplies what only resolution knows, and neither
  may take over the other's half.
- 29.04 needs both, because the mapping surfaces are its input.
- 29.05 is serialisation once 29.04 has settled the mapping, and it is where the
  semantic layer is verified outside VS Code.
- 29.06 runs against the whole milestone and defines what it is measured by. Its
  distinctness test is the claim the milestone is named for.

Decided in advance:

- JetBrains is out. Its scheme format is `.icls`, its highlighting comes from a
  language plugin rather than a grammar, and the community IDEs do not colour
  LSP semantic tokens without one. The reason is recorded rather than left open.
- Red is a diagnostic colour and never a syntax colour, on either theme.

## Milestone 30 — Multi-Return Types and a Bare Scaffold

Close the last typing gap of the MTA catalog, and stop shipping a framework the
language was never meant to own.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 30.01 | Type multi-return functions with tuples | ../plans/30.01-multi-return-tuples.md | architecture-engineer | done |
| 30.02 | Reduce `luam init` to the manifest and retire the framework | ../plans/30.02-bare-scaffold.md | architecture-engineer | done |

Acceptance for 30.01:

- `LuaMultiReturn<[A, B]>` maps to a `tuple` descriptor instead of `any`, for
  the procedural catalog and the OOP surface alike. 97 functions are typed.
- A multi-return tuple with a rest element stays `any`, because its arity is not
  fixed.
- `local x, y, z = getElementPosition(element)` distributes the elements, and
  each name is checked against its own annotation.
- A call in single-value position narrows to the first element, which is Lua's
  own rule: `local x: number = getElementPosition(element)` passes and
  `local x: string = ...` is `check-type-mismatch`.
- A call spreads its values only as the last expression of a list, so
  `setElementPosition(element, getElementPosition(element))` checks as four
  arguments and a call in any earlier position contributes one.
- The emitted Lua is untouched — a tuple is a compile-time shape, never a
  rewrite.
- A name declared beyond the last element goes unchecked, which is what an
  over-declared `local a: number, b: number = 1` already does.

Decided during implementation:

- **`checkExpression` narrows, `checkMultiValueExpression` does not.** Making
  the narrowing form the default meant every existing single-value consumer
  stayed correct without being touched, and only the three list contexts —
  locals, assignments, returns — plus call arguments opted into expansion.
- **`Element.getPosition()` stays a table.** In OOP mode MTA returns a `Vector3`
  there rather than three numbers, so the tuple applies only where the upstream
  itself declares `LuaMultiReturn` — `Marker.getColor()`, `GuiElement.getPosition()`.
- **The catalog emitter wraps a long tuple return across lines.** A nineteen
  element tuple in `mta-world-client.ts` broke the generated-file line limit.


Acceptance for 30.02:

- `luam init` writes `luam.json` and nothing else. No framework, no example
  sources, no directory tree the user has to delete before writing their own
  first file.
- A build ships exactly what the project authored. Nothing is injected into the
  resource beyond the runtime helpers an emitted feature requires.
- `@luam/template` holds one file. The `Core` / `Loader` / `Event` / `Listener` /
  `Command` / `ThreadPool` sketch moved to `examples/framework`, alongside the
  old scaffold sources in `examples/resource`.

Decided during implementation:

- **The framework is not part of the language.** It was written as reference for
  how MTA class-based resources structure themselves, and milestone 6 mistook
  reference material for a deliverable. Neither scaffolding it nor injecting it
  is the language's job; `examples/` is where it belongs.
- **A resolved ambient parent is now an external reference.** `resolveSuperClass`
  only noted one when the parent was *missing*, so a module that extends a class
  from another file reported borrowing nothing. The record was simply wrong.
- **The LSP passes ambient declarations to the checker,** and `load` runs a
  second pass so a document sees the declarations of files scanned after it.
  Before this, `class Derived extends Base` was reported `check-unknown-class` in
  the editor whenever `Base` lived in another file — the checker had never been
  given anything but the open document. `luam check` was unaffected, which is
  why the suite never caught it.

Explicitly out of scope:

- Re-analysing an open document when a later edit to *another* file adds or
  removes a declaration. The second pass covers workspace load, not live edits.

## Milestone 31 — Native Libraries

Give the language its own standard libraries: Lua that ships with Luam, typed for
the checker and the editor, and injected by the compiler when the code names it.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 31.01 | Add reference-driven injection and make threads and async native | ../plans/31.01-native-libraries.md | architecture-engineer | done |
| 31.02 | Install the luam command onto PATH | ../plans/31.02-install-cli-on-path.md | architecture-engineer | done |
| 31.03 | Split mta-types into handwritten and generated | ../plans/31.03-split-mta-types.md | architecture-engineer | done |

Acceptance for 31.01:

- A third injection trigger exists. `automatic` fires on an emitted language
  feature, `manual` is an opt-in in `luam.json`, and `reference` fires when a
  module names one of the globals a library declares.
- A library is a data entry: its Lua file, the globals it declares, and the
  helpers it requires. Adding one touches no compiler logic.
- `threads` stopped being `manual`. `sleep` and `Threads` pull it in; `Async`
  pulls `async` in, and `async` pulls `threads` with it.
- `meta.xml` orders a library after everything it requires, so `threads.lua` is
  written before `async.lua` even though the paths sort the other way.
- `sleep`, `Threads` and `Async` are typed in `LUAM_RUNTIME_GLOBALS`, so the
  checker resolves their members and the editor completes them with no file on
  disk.
- A module that declares its own `sleep` does not pull the library in.
- A resource that names none of them ships neither file.

Decided during implementation:

- **The trigger reads `references`, not `externalReferences`.** A catalog global
  is not an external reference — it resolves — so the borrowed-globals map never
  sees `Async`. References minus the module's own globals is the honest input.
- **`RuntimeHelper` in the compiler is now `RuntimeHelperName`.** The two unions
  had drifted, and the compiler's copy silently excluded `env`.

Closed since:

- **A method call on a library instance is checked.** `task:getInterval()`
  returned `any`, because `obj:method()` on a non-element receiver had been
  unchecked since milestone 2. Task 32.01 closed it — see
  [32.01](../plans/32.01-method-call-checking.md).

Acceptance for 31.02:

- `pnpm install:cli` bundles the CLI, writes a publishable manifest into `dist`,
  installs it globally, and verifies `luam --version` runs from PATH.
- The published package declares **no dependencies**. The esbuild bundle carries
  the compiler, and the manifest is generated rather than reused, because the
  workspace manifest's `workspace:*` specifiers made `npm install` fail with
  `EUNSUPPORTEDPROTOCOL` — which also made the release artifact uninstallable.
- The release workflow packs `packages/cli/dist`, so what CI attaches to a
  release is the same thing `install:cli` installs.
- A failed install says what to fix: the npm global bin directory not being on
  PATH is reported with the directory, not a stack trace.

Decided during implementation:

- **The installer shells out for npm, not for node.** Node 20+ refuses to
  `execFileSync` a `.cmd` without a shell on Windows, and passing an args array
  with `shell: true` is deprecated, so npm goes through `execSync` with a quoted
  command line while node keeps the safe array form.
- **`npm install --global <dir>` links the workspace `dist`.** On a development
  machine that is a feature: rebundling updates the installed command. It also
  means moving the repository breaks `luam` until the next install.

Acceptance for 31.03:

- `packages/mta-types/src` holds 11 handwritten modules and one `generated/`
  directory, instead of 105 flat files.
- Generated modules live in `generated/api`, `generated/oop`, and two data files.
  The generator writes those paths and prunes stale files from them.
- No import path outside the package changed. The public surface is the root
  modules, and `@mta-types/catalog` still resolves.
- A generated module reaches the root through `@mta-types/*`, never `../`, which
  keeps the alias-only import convention.
- `pnpm --filter @luam/mta-types generate` reproduces every committed file byte
  for byte, which the suite asserts.

## Milestone 32 — Checker and Editor Maturity

Close the last unchecked call in the type system and give the editor the two
providers a developer expects before they trust a language: a formatter and a
quick fix.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 32.01 | Type-check method calls on non-nominal receivers | ../plans/32.01-method-call-checking.md | architecture-engineer | done |
| 32.02 | Add a document formatting provider to the LSP | ../plans/32.02-formatting-provider.md | architecture-engineer | done |
| 32.03 | Add code actions, quick fixes and workspace symbols to the LSP | ../plans/32.03-code-actions.md | architecture-engineer | done |
| 32.04 | Correct the generic-classes claim and the stale project memory | ../plans/32.04-documentation-drift.md | documentation-engineer | done |
| 32.05 | Cover milestone 32 with checker and LSP tests | ../plans/32.05-checker-and-lsp-tests.md | test-engineer | done |
| 32.06 | Check assignability against interfaces and classes | ../plans/32.06-nominal-assignability.md | architecture-engineer | done |
| 32.07 | Report the redundant optional marker on a name that already carries one | ../plans/32.07-redundant-optional-marker.md | architecture-engineer | done |

Acceptance:

- `obj:method(...)` on an object type or a native library instance checks its
  arguments, and the class, interface and MTA element paths are unchanged.
- Milestone 31 no longer carries a "Still open" note for that behaviour.
- A value checked against an `interface` or a `class` reports the same
  diagnostic a `type` alias reports, in return, assignment and argument
  position, and a `named` type with no declaration stays permissive.
- Formatting is idempotent, preserves comments, and compiles to byte-identical
  Lua across `docs/snippets` and the compiler fixtures.
- A file that fails to parse yields no formatting edits.
- Every diagnostic marked fixable offers a quick fix whose result compiles, and
  no other diagnostic offers one.
- `name?: Type?` reports a diagnostic and offers a quick fix, and the annotation
  it parses to is a single optional node.
- Workspace symbols answer from the existing index without recompiling.
- No page in either language tree claims generic classes are unsupported, and
  `.claude/CLAUDE.md` names `.luam.manifest` and both of the CLI's network calls.

Deliberately excluded:

- Inlay hints. The editor gains formatting and actions in this milestone; hints
  were decided separately, in milestone 40.
- A `luam format` CLI command. The editor is the surface here; what CI enforces
  is a later question.

Decided during implementation:

- **The formatter rewrites whitespace, never structure.** It reprints the token
  stream with the comments merged back in, so no construct can be dropped and no
  string, template or block comment interior can be touched. Line breaks are the
  author's; indentation, spacing and blank-line runs are the formatter's. The
  style is recorded in `docs/*/reference/formatting.md`.
- **A function type annotation carries its parameter names.** 32.01 needed to
  know whether a method's first parameter is `self`, and the parser had been
  discarding the names it already consumed. `FunctionType.parameterNames` widened
  to `(string | null)[]`, which changed two AST snapshots and nothing else.
- **`function (` over `function(`.** The corpus was split — 60 to 37 — and no
  rule makes both valid. A keyword takes a space before `(`, a name binds tight,
  which is the majority form and also explains `draw()` beside `function (x)`.
  The 25 `.luam` files that disagreed were reformatted, along with the 18
  documented examples, so the corpus is a fixed point of the formatter.
- **Meaning preservation is asserted modulo leading indentation.** The emitter is
  source-faithful by design — a recorded limitation — so re-indenting a file
  re-indents its generated Lua. The corpus test compares the compiled Lua with
  leading whitespace stripped, which pins every token, string and comment, and
  separately asserts the corpus is already formatted.
- **The registry reaches assignability through an optional resolver.**
  `AssignabilityOptions` gained `resolveNominal` and a `visited` set, both
  optional, so the call sites that never had a registry keep the permissive
  answer rather than a wrong one. A module-level resolver was rejected: the
  language server holds several documents at once.
- **An interface is structural, a class is nominal.** An interface expands
  through `collectInterfaceContract` and compares as a record; a class fits only
  its own chain and the interfaces it declares. Making classes structural would
  have widened `check-unimplemented-interface`, which is reported on the strength
  of that declaration.
- **A name with no registry entry stays permissive.** MTA element types, ambient
  declarations and enums all arrive as `named` with no entry. This is what kept
  the blast radius at zero — the plan predicted four failures from a primitive
  probe, and the full suite, the 242 documented examples and the 11 snippet
  projects all pass untouched.
- **A class value is rejected where a scalar is expected.** A class instance is
  never a string, a number, a boolean, a thread, userdata or a function, so those
  targets report. Table-like targets stay permissive, because comparing a class
  structurally is what the plan decided against.
- **Six diagnostics are fixable.** `parse-optional-position`, `parse-redundant-optional`,
  `check-invalid-super`, `check-static-receiver`, `check-native-constructor` and
  `check-explicit-self-parameter` each have exactly one correct repair named in
  their own message. A near-match rename for `check-unknown-record-key` and a
  `#!` directive for the environment codes were left out: both pick among
  candidates, and a plausible wrong edit that compiles is worse than no action.

## Milestone 33 — Testing Luam Code

Give a developer a way to test the resource they wrote.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 33.01 | Add a `luam test` command for user resources | ../plans/33.01-luam-test-command.md | architecture-engineer | done |

Acceptance:

- An ADR records the execution model, what a test may call, and why the rejected
  options were rejected.
- `luam test` runs the project's tests, reports `path:line:column` positions in
  the `.luam` source, and exits non-zero on failure.
- `build`, `check` and `ensure` execute no project code, unchanged, and no test
  file reaches the assembled resource or `meta.xml`.
- The published CLI's dependency count is unchanged, or the ADR records why it
  had to grow.

Deliberately excluded:

- Testing against a live MTA server. That is an integration surface with its own
  protocol and its own security decision, and it overlaps milestone 35.
- A `--watch` mode and coverage. The command runs once and reports; both are
  separate decisions once the surface has users.

Decided during implementation:

- **The interpreter is discovered, not shipped.** [ADR-037](adr/037-test-execution-host.md)
  weighs a bundled Lua, a headless MTA server and a Lua already on the machine,
  and takes the third. The published CLI's dependency count is unchanged, tests
  run on the exact language version the compiler targets, and the cost is a
  machine requirement paid in a diagnostic — `luam doctor` now reports whether
  `luam test` can run at all.
- **MTA APIs are stubbed, and the stub is honest about it.** Every `mta`-sourced
  catalog function for the file's environment becomes a recording stub that
  returns `nil` unless `mta.returns` or `mta.stub` says otherwise, and `mta.calls`
  reads back what was recorded. Non-function MTA globals such as `root` are
  absent rather than stubbed, because a stub function standing in for an element
  is a value that means nothing. A test proves which calls the code made; it
  cannot prove what MTA does in response.
- **A test file is invisible to a build by construction.** `.test.luam` is
  excluded from `sources` discovery, so `luam build` reads no test file and its
  output is byte-identical whether or not one exists. Listing one in `sources` is
  `config-test-source`, not a silent inclusion.
- **The assertion surface is per-file, not project-wide.** `describe`, `test`,
  `beforeEach`, `afterEach`, `expect` and `mta` are injected into the checker's
  project declarations only for test paths, in the project cache and in the
  language server alike. The editor understands a test the way it understands any
  other module, and a non-test file that calls `test` still reports an unknown
  global. Declarations a test file makes are kept out of every other file's
  ambient scope, so a test can never widen what the resource compiles against.
- **The runner reuses the bundle and the resource map.** `luam test` compiles in
  bundle layout with the map on, writes the bundles and a harness to a temporary
  directory, and runs one Lua process per environment that has tests — shared
  alone, server and client after the shared bundle. Positions come back through
  `resolveResourcePosition` from milestone 18.
- **The column is the statement's, not the expression's.** The line map records
  lines. The reported column points at the mapped symbol on the resolved line
  when the map names one, and at the first character of the statement otherwise.
  Carrying columns through the map would force one mapping per statement and grow
  every resource map for a test-only feature.
- **`luam check` does not compile test files.** `check` answers for the resource.
  A type error inside a test surfaces in the editor and in `luam test`.

## Milestone 34 — Library Distribution

Decide how a developer consumes Luam code someone else wrote. Today they copy
files.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 34.01 | Design a distribution model for third-party Luam libraries | ../plans/34.01-library-distribution.md | architecture-engineer | done |

Acceptance:

- An ADR records the model, the rejected alternatives, and the reasoning.
- The ADR states where a dependency is fetched and confirms a build with no
  network still succeeds.
- It answers how types reach the checker, how a library declares its
  environment, whether transitive dependencies exist, and how `meta.xml`
  ordering is preserved.
- It states whether Luam operates any infrastructure, and how the model relates
  to the export contract in ADR-033.

This milestone produces a decision, not an implementation. The milestone that
builds it follows.

Decided:

- **A library is an npm package, and Luam runs no infrastructure.**
  [ADR-038](adr/038-library-distribution.md) weighs npm, git URLs behind a
  `luam add`, a vendored `libs/` with a lockfile, a registry the project
  operates, and doing nothing. npm wins on a fact rather than a preference:
  every Luam developer already installs the CLI with `npm install --global`, so
  the version solver, the lockfile, the integrity checking and the registry
  arrive at no machine cost, and none of them is the project's to run.
- **Fetching is the package manager's, never a build's.** `npm install` is the
  only step that touches the network. `build`, `check`, `ensure`, `dev` and
  `test` read `node_modules` from disk, an offline build with a populated
  `node_modules` is byte-identical, and the CLI's two allowed outbound calls are
  unchanged. A named package that is missing is a configuration error naming the
  install command, not a fetch.
- **Types come from source, not from a published summary.** A library ships
  `.luam` that the consumer compiles and checks, with `.d.luam` for the verbatim
  Lua half. Unlike the export contract, the source is on disk, so there is no
  artifact to serialize and nothing to drift.
- **The library owns its environment; the consumer does not reassign it.** A
  library declares its per-environment sources in its own `package.json`, and a
  library file is then an ordinary file of that environment under the existing
  rules.
- **There are no transitive dependencies, deliberately.** Lua 5.1 has one flat
  global namespace, so two versions of a library cannot coexist and a resolver
  would only manufacture conflicts it could not resolve. A library declares what
  it requires and the compiler names anything missing; the developer lists it.
  Global collisions are likewise reported at compile time rather than resolved
  by last write.
- **Vendored, with explicit `meta.xml` entries.** Library scripts are enumerated
  rather than wildcarded, in a section after the runtime library and before
  `config.lua`, ordered by the manifest's `libraries` array. A helper a library
  needs feeds the same requirement set the reference trigger already computes,
  so helpers stay first and are emitted once.
- **Orthogonal to [ADR-033](adr/033-resource-export-abi.md), which stays.**
  Exports are a runtime boundary between two deployed resources; this is a
  compile-time source boundary that ships the code inside one. A stateful
  service is still a resource with exports; a pure module is a library.

## Milestone 35 — Debugging Decision

Promote an aside inside a limitations entry into a recorded decision.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 35.01 | Decide whether Luam ships a debugger | ../plans/35.01-debugging-decision.md | documentation-engineer | done |

Acceptance:

- An ADR records the decision, the case both ways, and the consequences.
- `limitations.md` addresses debugging in a section of its own, under one of the
  page's four labels, in both `en` and `pt-br`.
- The relationship to the removed `transport` field and to the
  CLI-never-connects rule is stated explicitly.
- If the decision is to build, the security model is scoped in the ADR rather
  than deferred.

Decided:

- **Luam ships no debugger, and the decision reaffirms the boundary.**
  [ADR-039](adr/039-no-debugger.md) weighs reaffirming, a Debug Adapter Protocol
  server attached to a live MTA server, an eval-only channel, a debugger over the
  test host, and improving print debugging instead. The live options were
  rejected on two independent grounds, either fatal alone: the CLI never opens a
  connection to an MTA server — the third time the product has decided this,
  after removing `transport` and shelving 24.12 — and pausing on a breakpoint
  stops the thread the whole server runs on, so the debug session is a frozen
  game.
- **The security model is refusing the channel.** A live debug channel evaluates
  expressions inside a process with players connected to it, so an exposed port
  is a server takeover rather than a leaked stack frame. Nothing is deferred to
  an implementing milestone, because there is no channel to authenticate, scope
  or rate-limit.
- **The gap is narrower than "there is no debugger".** `luam dev` gives
  structured logs with source positions, `luam trace` and the resource map turn a
  runtime position back into an authored one, `luam test` executes project code
  off the server, and the checker reports most of what a step debugger is used to
  find in untyped Lua. All of it already ships.
- **A test runner and a debugger constrain each other, and the answer is
  already recorded.** 33.01 and [ADR-037](adr/037-test-execution-host.md) decided
  that project code runs in a process the CLI starts, on a discovered Lua 5.1
  interpreter, with MTA stubbed. A debugger wanting a live server with real
  elements and real players asks to reverse that boundary too.
- **`limitations.md` gained a labelled section of its own.** The closing aside of
  the development-logs entry now points at "Luam ships no debugger", a **Design
  boundary** in both `en` and `pt-br`, registered in the limitation contract so
  the labels and the recorded decision are enforced.
- **Reopening it has a stated order.** MTA would first have to offer a way to
  suspend a resource without suspending the server; shipping any live channel
  would then require amending the CLI-never-connects rule in `.claude/CLAUDE.md`
  explicitly. The offline test-host debugger is the one shape that needs neither.

## Milestone 36 — Pipeline Consolidation and Community Contribution

Reorganize every workflow around one written contract, and open the project to
outside contributors with a pipeline designed for code the project does not
trust.

Status: doing

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 36.01 | Inventory the pipelines and define their contract | ../plans/36.01-pipeline-contract.md | github-engineer | done |
| 36.02 | Extract reusable workflows and pin every action | ../plans/36.02-reusable-workflows.md | github-engineer | done |
| 36.03 | Separate the merge gate from the advisory signal | ../plans/36.03-merge-gate-and-signal.md | github-engineer | doing |
| 36.04 | Threat-model contributions from forks | ../plans/36.04-fork-threat-model.md | security-engineer | done |
| 36.05 | Add the community pull request pipeline | ../plans/36.05-fork-pull-request-pipeline.md | github-engineer | doing |
| 36.06 | Add the contributor entry documents and templates | ../plans/36.06-contributor-entry-documents.md | documentation-engineer | done |
| 36.07 | Verify the reorganized pipelines | ../plans/36.07-pipeline-verification.md | test-engineer | doing |
| 36.08 | Protect the permanent branches and the release tags | ../plans/36.08-branch-and-tag-protection.md | github-engineer | doing |

Sequencing:

- 36.01 writes the contract first. Every task after it moves code against a
  written rule rather than a preference, and 36.02 and 36.03 both depend on it.
- 36.02 and 36.03 are independent of each other and run in parallel. One removes
  duplication and pins the supply chain; the other decides what may block a
  merge.
- 36.04 is the gate on the community work. No fork pipeline is written before
  the boundary is modelled, because the dangerous repair — `pull_request_target`
  with a checkout of the head — has to be refused in writing rather than
  rediscovered later.
- 36.05 composes the fork run from the units 36.02 extracted, so a fork and a
  maintainer verify the same thing.
- 36.06 follows the pipeline it documents, so the guide describes what the
  pipeline actually does.
- 36.07 runs against the whole milestone and enforces the invariants 36.04
  established.
- 36.08 turns the rules into rules GitHub enforces. Its first step, blocking
  force-push and deletion, has no dependency and should land ahead of the
  milestone: it carries the whole history-safety benefit at no workflow cost.
  The pull request and check requirements wait for 36.03, because a required
  check that fails for a reason the change did not cause would block `main`.

Acceptance:

- Every workflow has one role, and no verification step is written twice.
- Every third-party action is pinned to a commit SHA, and every job declares
  its permissions.
- A pull request cannot fail for a reason it did not cause: a newly published
  advisory does not turn a green branch red, and a benchmark cannot block.
- A dependency advisory is still surfaced, on a schedule, as an issue.
- A pull request from a fork runs the same verification a maintainer branch
  runs, with no secret and a read-only token.
- No job reachable from a fork holds a write token or can poison a cache a
  trusted run later reads.
- Every required check is one a fork run can satisfy.
- A contributor can reproduce every required check locally from
  `CONTRIBUTING.md`, and a vulnerability has a private channel in `SECURITY.md`.
- The invariants above are asserted by a suite that blocks a merge, each proven
  by a deliberate regression.
- Neither permanent branch accepts a force-push or a deletion, and a `v*` tag
  cannot be moved to another commit after it is published.
- A merge into `main` requires a pull request whose required checks passed, and
  the single maintainer can merge it without an administrator bypass.

Deliberately retained boundaries:

- The compiler packages still make no network calls, and a build with no network
  still succeeds. The pipeline reorganization does not add an exception.
- Publication, deployment and repository writes stay on the trusted path. No
  fork context reaches them.

Deferred to a later milestone:

- Automated enforcement of the source conventions. The workspace has no linter
  or formatter, so `code-conventions.md` — kebab-case, single quotes, the line
  and file limits — is enforced only by review. Adding one is a new gate rather
  than a reorganization of an existing pipeline, and it belongs to its own task.
- Auto-merge for Dependabot. It opens up to ten pull requests a week with no
  automated path to landing them, but the trust model for that path depends on
  the required-check set this milestone defines.

Decided:

- **One role per workflow, one gate, and a pinned supply chain.**
  [ADR-040](adr/040-pipeline-contract.md) inventories every workflow, job,
  trigger, permission and secret, marks the duplicated steps and the unpinned
  actions, and assigns each workflow exactly one role — merge gate, publication,
  scheduled maintenance, or advisory signal. The verifications are extracted into
  `workflow_call` units the gate, the release path and a fork run all compose, so
  a maintainer and a contributor cannot silently verify different things.
- **A required check must report on every pull request.** This is why docs
  validation moved into the gate rather than being required where it lived: a
  path-filtered check is held pending by GitHub when its workflow does not run,
  which would block every pull request that touches none of its paths. `docs.yml`
  keeps its filter and becomes publication only.
- **The two jobs that could fail for reasons a change did not cause are off the
  gate.** The production audit runs on a schedule and files an issue, with a
  read-only re-run on a pull request that changes a dependency manifest; the
  benchmark measures after a merge to `develop` and records the number instead of
  failing on it. `typecheck` and the test matrix now start together.
- **A fork pull request runs verification only.**
  [ADR-041](adr/041-untrusted-contribution-boundary.md) lists every pipeline
  asset with a reachability verdict, forbids `pull_request_target` outright, and
  writes six invariants as assertions rather than intentions. The one elevated
  path is `workflow_run`, which starts after the gate, checks out the default
  branch, and never executes contributed code — `triage.yml` labels by path and
  size that way.
- **The invariants are enforced by a suite that blocks a merge.**
  `@luam/pipeline` parses the workflow files and the committed rulesets and
  asserts the permission budget, the SHA pins, one definition per verification,
  the untrusted boundary, and that every required check name resolves to a job
  that actually reports. Losing a `permissions` block, unpinning an action, and
  giving a fork-reachable job a secret were each proven to fail it.
- **`.github/rulesets` is the source of truth for what GitHub enforces.** `main`
  and `develop` block a force-push and a deletion, `main` additionally requires a
  pull request with zero approvals and the five reported gate checks, and a `v*`
  tag can be neither deleted nor moved. No bypass actor, for anyone.

- **The reorganized gate ran green on `develop`, and the names match.** Run
  33206816933 reported exactly `typecheck / Typecheck`,
  `test / Test on Node 22`, `test / Test on Node 24`, `docs / Docs` and
  `build / Build` — the five names `@luam/pipeline` computes from the workflow
  files and the five `.github/rulesets/main.json` requires. The benchmark ran as
  its own workflow and the audit did not run at all, which is where 36.03 put
  them. Wall-clock fell from 3m00s to 2m15s, because typecheck, the matrix and
  the docs no longer wait on each other.

- **The three rulesets are live, and private vulnerability reporting is on.**
  `develop` (21931640), `main` (21931663) and `release tags` (21931665) were
  created from `.github/rulesets` verbatim, so the committed JSON and what
  GitHub enforces are the same text. `main` requires zero approvals and exactly
  the five gate checks, and no ruleset has a bypass actor. `main` no longer
  accepts a direct push, which is what the two-branch model already described.

Remaining:

- Raising fork run approval from first-time contributors to all outside
  contributors. It is a repository setting with no file behind it.
- Proving the rules rather than reading them back: a refused force-push, a
  refused deletion, a merge into `main` under the requirement, and a `v*` tag
  that cannot be moved. Each needs an attempt against the live repository.
- A deliberate break in a type, a test and the smoke build, to prove the gate
  still fails on one, and the fork rehearsal in 36.07, which needs a real fork.

## Milestone 37 — Checker Soundness and Generic Functions

Close a hole where a declared return type is not enforced, and give functions the
type parameters aliases and classes already have.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 37.01 | Report a function that can end without returning | ../plans/37.01-missing-return.md | architecture-engineer | done |
| 37.02 | Take type parameters on functions and methods | ../plans/37.02-generic-functions.md | architecture-engineer | done |
| 37.03 | Cover milestone 37 with checker tests | ../plans/37.03-checker-soundness-tests.md | test-engineer | done |
| 37.04 | Document the return rule and generic functions | ../plans/37.04-checker-soundness-documentation.md | documentation-engineer | done |

Sequencing:

- 37.01 and 37.02 are independent and run in parallel. One changes what the
  checker reports at the end of a body, the other changes what the parser accepts
  before a parameter list; they share no code.
- 37.03 and 37.04 both wait on the two, because each records decisions the tests
  and the pages have to state.

Acceptance:

- A function annotated with a concrete return type that can reach its closing
  `end` reports `check-missing-return`; the same body annotated optional, `nil`,
  `void`, `any`, or not at all, reports nothing.
- A loop that never falls through is not reported.
- `function identity<T>(value: T): T` parses, checks, infers at the call site,
  accepts explicit arguments, enforces constraints, and leaves no trace in the
  generated Lua in either layout.
- A generic method inside a generic class resolves both sets of parameters.
- The formatter is a fixed point on a file declaring a generic function.
- Both manual trees describe the return rule and generic functions, and
  `pnpm docs:verify` passes.

Why now:

- Both were found by compiling a probe, not by reading code. `function pick(flag:
  boolean): string` with a `return` only inside an `if` passes `luam check` with
  zero diagnostics today, and `function identity<T>` is
  `parse-unexpected-token`.
- Both reuse machinery that already exists. The return check reads the
  reachability flag `FlowState` already carries and `markUnreachable` already
  clears; generic functions compose `parseTypeParameters`, `inferTypeArguments`,
  `substituteType` and `checkTypeConstraints`, all exported and all already used
  by the class path.
- Milestone 38 needs 37.02. A library of utilities without generic functions
  ships an untyped surface.

Deliberately excluded:

- Exhaustiveness over a discriminated union.
- Treating `error(...)` as a terminator, which needs a never-returning type and
  is recorded as a known false positive instead.
- Variance, higher-kinded parameters, and inference from a return position.
- A strictness flag. A second checking mode is a permanent cost paid to avoid a
  one-time fix.

What it decided:

- **`check-missing-return` lands as an error, not a staged warning.** 37.01 T-02
  ran the diagnostic against every corpus before deciding: the compiler suite,
  all 85 tracked `.luam` files, `docs/snippets`, the documented examples, the
  captured outputs, and the LSP and CLI suites. Zero hits. With nothing to
  migrate, the argument for a softer landing had no case to answer, and the
  defect sits at the same severity as `check-return-mismatch` — which is the
  point of reporting it at all.
- **Two loops needed a reachability fix before the diagnostic could be written.**
  `checkLoopBody` restores the entry flow after a body, so `while true do` and
  `repeat ... until false` left the state reachable and would have been reported.
  Both now end the path when the condition is a literal and the body carries no
  `break` of its own.
- **`error(...)` is a recorded false positive, not a bug to fix later.** A call
  cannot end a path without a never-returning return type, and guessing from the
  name would be a rule about one identifier rather than about types. It is a
  **Design boundary** on the limitations page, and the repair is the annotation.
- **No quick fix for `check-missing-return`.** Every one of the six fixable
  diagnostics is a meaning-preserving rewrite — the same type spelled
  canonically, the same call, the same construction. This one has two ordinary
  repairs, and the machine-applicable one, widening the annotation, is the first
  candidate that would change what the program means, for every caller rather
  than at the site the diagnostic points to.
- **Generic functions added no diagnostic code and no new analysis.** The call
  site reuses `inferTypeArguments`, `substituteType` and the class constraint
  reporter, which was generalized out of `checkTypeConstraints` rather than
  duplicated. `check-generic-arity`, `check-generic-constraint` and
  `check-type-mismatch` carry their existing meanings.
- **The `<` ambiguity is resolved by speculation, not by lookahead.** A type
  argument list at a call site is kept only when a `(` follows it immediately;
  anything else rewinds the index, the erasure spans and the diagnostics
  together. `a < b > (c)` is the one form that resolves to the generic reading,
  and a chained comparison is not valid Lua anyway.
- **The formatter was not a fixed point on a generic call, and had not been for
  generic classes either.** `new Box<number>(1)` was already being reformatted to
  `new Box<number> (1)`; no corpus file had exercised it. A type `>` now binds
  tight to a following `(`, and a type `<` keeps its space after `function`.
- **`docs/*/language/types.md` still said generic classes were unsupported.**
  That stopped being true in 0.13.0. The page now names classes and functions as
  the other two forms of the same feature.
- **Signature help does not specialize a generic call's parameter labels.** It
  resolves through the symbol index's rendered text, and the call frame exposes
  argument source rather than argument types; doing it properly means giving that
  path the declared type and the checked arguments, which is its own task. Hover
  does show the type parameters and the specialized result type.

## Milestone 38 — Library Distribution

Build what milestone 34 decided. A developer consuming third-party Luam code
still copies files.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 38.01 | Add the libraries manifest domain and resolve packages from disk | ../plans/38.01-libraries-manifest-domain.md | architecture-engineer | done |
| 38.02 | Compile library sources as part of the consuming project | ../plans/38.02-library-compilation.md | architecture-engineer | done |
| 38.03 | Report global collisions and missing library requirements | ../plans/38.03-library-collisions.md | architecture-engineer | done |
| 38.04 | Vendor library output and order it in meta.xml | ../plans/38.04-library-vendoring.md | architecture-engineer | done |
| 38.05 | Cover milestone 38 with a real library fixture | ../plans/38.05-library-tests.md | test-engineer | done |
| 38.06 | Document authoring and consuming a Luam library | ../plans/38.06-library-documentation.md | documentation-engineer | done |

Sequencing:

- 38.01 resolves packages before anything reads them, and its T-01 decides the
  workspace-link question the fixture in 38.05 depends on.
- 38.02 puts library files into the same module list the project uses, which is
  what lets 38.03 and 38.04 reuse the passes that already walk it rather than
  growing a second path.
- 38.03 and 38.04 are independent of each other and run in parallel.
- 38.05 runs against the whole milestone, because the failure modes are
  structural — an invisible symbol, an order that disagrees with the compile,
  output that ships after a library is removed — and none of them appear in a
  unit test over one function.

Acceptance:

- A `libraries` entry naming an installed package resolves, compiles, checks and
  is vendored into the resource; one naming a missing package is a configuration
  error naming the install command, and the build writes nothing.
- A package in `node_modules` that the manifest does not name is not compiled.
- A library's types come from its source. A library that does not type-check
  fails the consumer's build, with a path naming the package.
- The library owns its environment, and the existing environment diagnostics
  apply to its symbols with no new rule.
- Two libraries claiming one name on one side is a compile error naming both;
  a declared requirement the manifest omits is a compile error naming both
  repairs.
- Tree output lands in `libs/<package>/<environment>/`, bundle output is
  concatenated ahead of the project's own modules, and `meta.xml` lists library
  scripts as enumerated entries after the runtime helpers and before
  `config.lua`, the pinned `loadOrder` entries and the source wildcards.
- The emission order equals the compile order, asserted rather than assumed.
- Removing a library from the manifest removes its output.
- A build with a populated `node_modules` and no network succeeds and is
  byte-identical to a networked one.
- A project with an empty `libraries` list produces byte-identical output to the
  pre-milestone build.

Why now:

- Milestone 34's own acceptance says it "produces a decision, not an
  implementation" and that "the milestone that builds it follows". No milestone
  followed, and `grep -rln "libraries" packages/*/src` returns nothing.
- It is the difference between a language and an ecosystem. Until it exists,
  every Luam project starts from zero and `examples/framework` is copied by hand
  rather than installed.

Deliberately retained boundaries:

- The compiler packages make no network calls, and a build with no network still
  succeeds. `npm install` is the developer's step; `build`, `check`, `ensure`,
  `dev` and `test` read `node_modules` from disk.
- Luam operates no registry, no index and no directory.
- There are no transitive dependencies. Lua 5.1 has one flat global namespace, so
  two versions of a library cannot coexist and a resolver would only manufacture
  conflicts it could not resolve.
- Collisions are reported, never resolved. No namespacing, aliasing or renaming.

Deferred to a later milestone:

- Library assets. A library ships code; one that wants to ship an image is a
  question this milestone does not answer.
- Anything that would require Luam to run infrastructure.

What it decided:

- **Resolution reads `<projectRoot>/node_modules/<name>` and stops.** Node's
  algorithm was rejected: walking up would let a package a parent directory
  installed reach a build the manifest never named, which is the opposite of the
  rule ADR-038 set. A scoped name is looked up as the two directories npm writes,
  `@scope/name`, independent of the `scope-name` flattening 38.04 applies to the
  emitted path. A pnpm workspace link and a `file:` dependency resolve, because
  the lookup reads through the symlink like any other path — the fixture in
  `docs/snippets/using-a-library` is a workspace package and proves it.
- **The library's resolved root is part of the cache key.** `declarationsFor`
  hashes the origin root beside the environment, the options and the source, so a
  library swapped for another copy of the same name invalidates rather than
  reusing the previous declarations.
- **A `#!` directive inside a library file that disagrees is an error.** The
  library declares its layout once, in `luam.sources`; a second place that can
  disagree is a bug source with no benefit, and `env-library-directive` names
  both sides. An agreeing directive is accepted in silence, so a library that
  documents its side in the file is not punished for it.
- **Visibility is one way and reported, not merely absent.** `createAmbientScope`
  gives a library file only library declarations, so a consumer global never
  reaches it — but an unknown global is not a diagnostic in Lua, so the rule
  would have been invisible. `project-library-project-reference` reports it
  against the library file, with the project file that declares the name.
- **A library claiming an MTA name is a warning, not an error.** A library that
  wraps `getPlayerName` deliberately is a legitimate and probably common shape,
  and the checker cannot tell it from an accident. `project-library-shadows-api`
  is loud enough to be seen and quiet enough not to block. The rule is not
  extended to project files: a project shadowing its own API is the developer's
  own file, and reporting it would fire on existing projects this milestone has
  no reason to migrate.
- **A collision is reported once per pair, and reads as the library intruding.**
  A `shared`-versus-`shared` collision occupies both sides; reporting per side
  produced two messages for one problem, so the sides are gathered and the
  message says `"shared"`. The diagnostic is attributed to the library's file
  whichever module the walk recorded first, so the direction never depends on
  list order.
- **`libs/` beside `lib/` was reconsidered and kept.** The pairing is one letter
  apart and is a real legibility hazard, but renaming means amending an accepted
  ADR for a directory whose two occupants are already separated everywhere a
  reader meets them: `meta.xml` labels them `Runtime library` and `Libraries`,
  and both manual trees name them in the same paragraph. The hazard is cheaper
  than the divergence.
- **A `loadOrder` entry may not name a library file.** Pinning one would let a
  consumer override the order the library declared, which the ADR's ordering rule
  already refuses. `project-load-order-library` says so instead of leaving the
  misleading "no source file matches" for a path that plainly exists.
- **Two scoped names that flatten to one directory are not a new diagnostic.**
  `@a/b-c` and `@a-b/c` both flatten to `a-b-c`, and the collision surfaces as
  `project-duplicate-output`, which already reports two sources producing one
  path and names both. A second code for an improbability the existing net
  catches was not worth its weight.
- **Library files are ordered by package, then by declared pattern, then by
  path.** The sides are walked `shared`, `server`, `client`, matching the order
  project scripts already use, and a file takes the side of the first pattern
  that matches it. The compile order and the emission order are the same list, so
  what the checker approved and what the resource loads cannot disagree.
- **Verbatim `.lua` a library ships is vendored as its own kind.** It is not a
  compiled module, so it reaches assembly as `ResourceOptions.libraryFiles` and
  merges into the library scripts by the same origin ordering. `.d.luam` gives it
  types and emits nothing, exactly as in a project.
- **The LSP resolves libraries the same way, which the plans did not require.**
  Without it every library symbol would be an unknown type in the editor while
  the CLI passed. `workspace/library-index.ts` reuses the compiler's declaration
  reader, scans only the package roots the manifest names, applies the same
  locked environment and the same one-way visibility, and shows the same
  `@scope/name/path` form the CLI prints.
- **A call into a library *function* is not checked at the call site, and that is
  not new.** Cross-file function signatures do not reach the checker for project
  files either; classes, interfaces, enums and `declare`d globals do. A library's
  classes and its `.d.luam` declarations are therefore checked precisely, and its
  bare top-level functions are as unchecked as a project's own. It is a
  pre-existing boundary this milestone inherits rather than one it introduces.

Remaining:

- Watching `node_modules` in `ensure` and `dev`. A library change is picked up by
  the next build, not by the watcher, because installing is a step a person runs.
- Publishing `examples/library` to npm. It is a workspace package the manual
  compiles against; nothing in the model needs it published to prove the path.

## Milestone 39 — Toolchain Surfaces

Give the toolchain the three surfaces it lacks outside the editor, let a project
choose the formatter's whitespace decisions, and close the conventions gap
milestone 36 deferred.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 39.01 | Add luam format with a check mode | ../plans/39.01-format-command.md | architecture-engineer | done |
| 39.02 | Emit diagnostics in a machine-readable form | ../plans/39.02-machine-readable-diagnostics.md | architecture-engineer | done |
| 39.03 | Add a watch mode to luam check | ../plans/39.03-check-watch.md | architecture-engineer | done |
| 39.04 | Enforce the source conventions in the pipeline | ../plans/39.04-conventions-gate.md | github-engineer | done |
| 39.05 | Let a project configure the formatter through .luam.formatter | ../plans/39.05-formatter-configuration.md | architecture-engineer | done |

Sequencing:

- 39.01, 39.02 and 39.03 are independent and run in parallel. Each adds one
  surface over an engine that already exists.
- 39.04 waits on 39.01, because `luam format --check` is the half of the
  conventions gate that stops being a question once the command exists.
- 39.05 waits on 39.01 too, and 39.04 should land before it. The gate is written
  against a formatter with one style; adding configuration afterwards makes the
  gate's independence from it a property to confirm rather than a question to
  answer while both are moving.

Acceptance:

- `luam format` rewrites a project's `.luam` files to the recorded style, is a
  fixed point on a second run, and agrees byte for byte with the editor's
  formatting provider across the whole corpus.
- `luam format --check` writes nothing, lists what differs, and exits `1` when
  anything does.
- `luam check --json` writes one parseable document to stdout carrying every
  diagnostic the human output reports, with unchanged exit codes; without the
  flag, output is byte-identical to today.
- The machine schema is versioned from its first release, and what a consumer may
  rely on is written down.
- `luam check --watch` re-runs on change, writes nothing in any layout, and needs
  no network.
- A pull request violating a mechanical convention fails the merge gate, proven
  by a deliberate violation; the check reports on every pull request, a fork run
  can satisfy it, and `CONTRIBUTING.md` names the command that reproduces it.
- A project with no `.luam.formatter` formats byte-identically to before the
  milestone, across the whole corpus.
- A project that sets one gets tab or space indentation at the width it names,
  `function(` or `function (` as it chooses, the blank-line run it asks for, and
  the line ending it pins.
- Every configuration is idempotent and preserves the compiled Lua modulo leading
  indentation, and no configuration can produce output whose token stream differs
  from the input — enforced by the formatter's existing round-trip check rather
  than by review.
- The nearest `.luam.formatter` wins with no merging, an unparseable one stops
  the run rather than falling back, and the CLI and the editor agree byte for
  byte under a non-default configuration.

Why now:

- The formatter is idempotent, style-fixed and corpus-verified, and reaches a
  developer only through VS Code. A contributor on another setup cannot satisfy a
  style the project asks for.
- Nothing can consume a Luam build except a human. The CLI writes prose by
  design, so a pipeline, a hook or a non-LSP editor has to match a regular
  expression against output the project reserves the right to improve.
- The tightest loop the toolchain offers writes to disk. `--watch` is owned by
  `dev` and `ensure`, and both produce a resource.
- Milestone 36 deferred conventions enforcement because "the workspace has no
  linter or formatter". Half of that stops being true with 39.01.
- Milestone 32 settled `function (` over `function(` on a 60–37 corpus count.
  That is a majority, not a consensus, and the minority currently cannot use the
  formatter at all. `INDENT` is likewise a hard-coded four spaces, so a team that
  indents with tabs has no path that does not involve not formatting. A formatter
  nobody can adopt is a formatter nobody runs.

Deliberately excluded:

- Any formatter option that changes a token — quote style, semicolons, name
  casing, line breaking. The formatter reprints the token stream and verifies the
  result against the original, so such an option would produce no output rather
  than wrong output.
- Per-file or directive-based formatter overrides, ignore ranges, presets, and
  inheritance from another package.
- Reopening this repository's own style. It sets no `.luam.formatter` and keeps
  the milestone 32 defaults, which is what keeps 39.04 enforceable.
- A second machine-readable format.
- Auto-fixing in CI. The gate reports; the developer fixes.
- Broader static analysis than the conventions the project has already written
  down.

## Milestone 40 — Inference Feedback in the Editor

Show what the checker inferred, inline. Milestone 32 built the formatter and the
quick fixes and left this as a separate decision.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 40.01 | Add inlay hints to the language server | ../plans/40.01-inlay-hints.md | architecture-engineer | done |

Acceptance:

- An inferred local type, an inferred return type and a contextually typed
  callback parameter each show a hint; an annotated one shows nothing.
- A parameter-name hint appears on a literal argument and nowhere else.
- No hint ever reads `any`.
- Each kind can be turned off, through settings a client that is not VS Code can
  set.
- A file that fails to parse yields no hints.
- A hint and a hover on the same position render the same type.
- A range request is answered from the analysis the server already holds, with no
  recompile, and the measurement is recorded.

Why now:

- Luam erases everything. A type annotation exists only for the checker, so a
  reader who wants to know what a local holds has no runtime artifact and no
  generated declaration to look at — hover answers one name at a time.
- Contextual callback typing gives an event handler's parameters types the
  developer never wrote, and there is currently no way to see them at all except
  by hovering each one.
- The server already computes every type a hint would show, and renders it
  through the same `typeToString` a hint needs.

Deliberately excluded:

- Inserting an annotation from a hint. That is a code action, and belongs with
  the quick fixes.
- Hints in `.luam.manifest`, where a field's type is already declared.
- Any change to inference itself.

Decided during implementation:

- **The switches live in the LSP initialization options**, one boolean per kind
  under an `inlayHints` object, so a client that is not VS Code sets them the same
  way. Every field is optional and a non-boolean falls back to the default. The
  extension maps `luam.inlayHints.*` onto that object and restarts the server when
  one changes, because the options are read once on connect.
- **The three type kinds are on and parameter names are off**, as the plan
  recommended: the first three show what was inferred, the fourth restates what a
  reader can already look up.
- **A parameter-name hint needs a literal argument and a non-method call.** A
  template literal does not count, and `a:b(x)` gets none, because its callee type
  is the receiver rather than the function.
- **Names for a catalog call come from the MTA documentation** when the checker
  carries none, so `setTimer(tick, 1000, 0)` reads `timeInterval:` and
  `timesToExecute:` rather than positional placeholders.
- **A constructor shows no return type.** It is the class, and saying so adds
  nothing.
- **Measured**: a whole-document request over the largest fixture takes 0.118 ms,
  and 1.681 ms over a synthetic 2000-line document, from the analysis the server
  already holds.

## Milestone 41 — Table Literal Completion

Answer the question a cursor inside a typed table literal is asking. Reported
from a discriminated union of intersections, where the editor named one
discriminant value out of two, offered keys where a value goes, and buried the
right answers under the whole global surface.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 41.01 | Complete a typed table literal by the keys its type still allows | ../plans/41.01-table-literal-key-completion.md | architecture-engineer | done |

Acceptance:

- Inside a literal annotated with a record type, a key position offers the keys
  that type still allows and nothing else.
- A written discriminant narrows the keys to the matching member; a written key
  is removed from the list.
- Inside the quotes of a discriminant, every value the remaining members declare
  is offered, not the first one.
- A value position, an unannotated literal, a call argument and a class body each
  keep offering the scope, each proven by its own test.
- The checker is untouched, and the diagnostic on the reported source is
  unchanged.

Why now:

- The type system already answers this. Intersections merge, unions narrow by
  discriminant, and the checker reports the missing key correctly — the editor
  was reading that answer wrong on the way out.
- A union of intersections is the shape the language pushes people toward, and it
  is the shape where the completion list was least useful.
- Two of the three defects are already fixed; what remains is one decision and
  the code that follows it.

Deliberately excluded:

- Any change to inference, narrowing or the diagnostic.
- Lifting the single-line reach of the annotation, which keeps a multi-line or
  nested literal without key completion.
- Completion for an array-style literal, which has no keys to offer.

Decided during implementation:

- **A key position offers the keys alone**, overturning the merge the suite fixed
  deliberately. A position that takes an identifier the type names has no use for
  seven hundred and fifty entries, and the one case the merge served — reaching a
  scope name where a key goes — is one `=` away, in a value position that offers
  the scope in full.
- **The guard is `keys.length > 0`**, so every position outside the feature keeps
  the list it built before: no annotation, a call argument, an array-style
  literal, a class or interface body, and an annotation on an earlier line each
  yield no key items and fall through untouched.
- **A key declared by more than one matching member is typed as the union of what
  they declare**, folded with `createUnion`. That is what made the discriminant
  offer both values inside the quotes rather than the first one, and it is what
  the `detail` of the item reads.
- **The client decides the final order.** The items carry no `sortText`, so the
  server returns declaration order and VS Code renders them alphabetically. The
  list is short enough that the order is not what makes it readable.
- **Reloading the window was not enough** to pick up a reinstalled VSIX on a
  window that was already open; it took restarting the extension host. The two
  brace shapes that exposed the stale server — braces the editor closed for you,
  and a cursor on the line after the opening brace — are covered by their own
  tests now.

## Milestone 42 — Class Output and Member Hover

Three defects reported from one file: a class field written with only a type disappeared
from the generated class, the semicolon after a lowered statement was left alone on a line,
and hovering the property of a typed table answered nothing.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 42.01 | Emit a class field declared without a default in the preserved class body | ../plans/42.01-declared-class-field-output.md | architecture-engineer | done |
| 42.02 | Keep the trailing semicolon of a lowered statement on the statement line | ../plans/42.02-lowered-statement-semicolon.md | architecture-engineer | done |
| 42.03 | Hover a member expression by the type the checker gave it | ../plans/42.03-member-expression-hover.md | architecture-engineer | done |
| 42.04 | Record what the class body and a hover now show | ../plans/42.04-class-output-documentation.md | documentation-engineer | done |

Acceptance:

- A field written as `name: Type;` reaches the generated class as `name = nil`, on the line
  it was written on, in a development build as well as a release build.
- No generated line consists only of a semicolon, in either build mode.
- Line counts are unchanged by all three repairs, proven by the line-fidelity fixtures.
- Hovering the property of a class instance or of a typed table reports its type, while an
  MTA API member, a library member and a record global hover exactly as before.
- Both locales and the changelog describe what the build now produces.

Why now:

- The class-field repair already landed once, in the canonical emitter, and was never
  carried into the source-preserving path a development build actually takes. The two paths
  disagreeing is worse than either behaviour on its own.
- `docs/en/reference/output-layouts.md` already documents `name = nil` for this path, so the
  documentation and the compiler are in open contradiction.
- The orphan semicolon is the defect milestone 27 closed for erased declarations, reappearing
  through the lowering branch, which never called the repair that milestone added.
- The types the hover is missing are already computed and already correct; only the read is
  wrong, so the fix is small and the current behaviour makes a typed field look untyped.

Deliberately excluded:

- Finer-grained lowering. A `new` inside a table literal still collapses the whole statement
  to canonical Lua, as the output-layouts page records; preserving the authored layout around
  a lowered sub-expression is a separate milestone.
- Building a table from a field annotation. A field initialised to a table in the class body
  would share that table across every instance; the annotation stays compile-time only.
- Any change to inference, to the checker, or to completion.

## Milestone 43 — One Shared File, Both Sides

A shared module that decides its own side at runtime cannot be written today. The
reported `Network` class asks which side it is on with `isElement(localPlayer)`,
stores the answer in `self.isClient`, and branches on that field between
`triggerServerEvent` and `triggerClientEvent`; every one of those names is
`check-environment-api` in a `shared` file — six errors on a file that would run
correctly as written.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 43.01 | Merge the server and client surfaces in a shared file | ../plans/43.01-merged-shared-surface.md | architecture-engineer | done |
| 43.02 | Offer the shared surface first and the sides as complements | ../plans/43.02-shared-completion-order.md | architecture-engineer | done |
| 43.03 | Test the merged shared surface | ../plans/43.03-shared-surface-tests.md | test-engineer | done |
| 43.04 | Record what a shared file may use | ../plans/43.04-shared-surface-documentation.md | documentation-engineer | done |

Acceptance:

- A shared file resolves every MTA API: the shared surface as the standard list,
  the server and client declarations complementing it, each keeping its real type
  and signature instead of falling back to `any`.
- A side-restricted API, event or OOP member in a shared file is a warning that
  names its side, not an error; the same use in a `server` or `client` file is
  still an error, unchanged.
- Completion in a shared file offers the shared names first and labels every
  side-restricted one with the side it belongs to; hover repeats that note.
- Import direction does not change: a `shared` module still cannot import a
  `server` or `client` module.
- The emitted Lua, the line map and the generated manifest are untouched.

Why now:

- The reported file is the common shape for a network, log or config module, and
  the compiler rejects it outright while MTA runs it.
- The decision cannot be recovered by the compiler. The branch tests a stored
  field, so neither control-flow narrowing nor a compiler-provided `isClient`
  would accept the class without restructuring it — a large mechanism that misses
  the case that motivated it.
- The author already knows the side; they wrote the test that proves it. What the
  compiler can still add is the type of the API and a visible label, not a verdict.

Deliberately excluded:

- Control-flow narrowing over a side test, and any `isClient` / `isServer` global.
  Both were designed and dropped: see ADR-044 for why.
- Silence. A file whose path does not resolve is `shared` by default — the
  reported one included — so reporting nothing would strip environment checking
  from every misplaced file. The warning is what keeps that signal.
- Block-level or function-level environments, which ADR-023 rejected and this does
  not reopen: nothing is split and no chunk is generated.
- Import direction, which resolves when the chunk loads and cannot be undone by a
  runtime branch.

## Milestone 44 — Member Resolution in the Editor

Hovering `props.password`, where `props` is a parameter typed `NetworkProps` and
`password` is declared `password?: string`, answers with the class field
`password: string` declared elsewhere in the same file. The editor is resolving a
property by name against every declaration in the file instead of against the
receiver it was written on.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 44.01 | Bind a member reference to its receiver | ../plans/44.01-member-reference-binding.md | architecture-engineer | done |
| 44.02 | Answer a property hover with the type the checker gave it | ../plans/44.02-member-hover-type.md | architecture-engineer | done |
| 44.03 | Test member resolution against name collisions | ../plans/44.03-member-resolution-tests.md | test-engineer | done |
| 44.04 | Record what a property hover answers | ../plans/44.04-member-hover-documentation.md | documentation-engineer | done |
| 44.05 | Show the fields of a value's type on hover | ../plans/44.05-hover-type-shape.md | architecture-engineer | done |

Acceptance:

- A property whose receiver is a record, an alias, a class instance, an MTA
  element or a library resolves against that receiver and never against a
  same-named declaration elsewhere in the file.
- A member reference whose receiver cannot be named resolves to nothing rather
  than to the first name that matches, and the hover answers from the checker's
  type instead.
- Hovering an optional member reports its optionality; hovering it inside a guard
  reports the narrowed type.
- Hovering a value whose type has fields answers with those fields under the
  signature, whether the type is a `type` alias, an interface, a class or an
  inline object type; a primitive, a function and an opaque type hover unchanged.
- Hover, definition, references, highlight and rename all inherit the fix, each
  covered by a fixture that fails against the current tree.

Why now:

- The wrong answer is not a near miss — it names a different declaration, of a
  different type, from a different container. An author reading `string` where the
  type is `string?` is being told the guard they wrote is unnecessary.
- The correct answer is already computed: `memberHover` reads the checker's type
  map and returns `Props.secret: string?` the moment the collision is removed.
  Only the resolution order and one wildcard match stand in front of it.
- The same wildcard sits under go-to-definition and rename, where a wrong binding
  is not a cosmetic problem.
- Milestone 42 fixed member hover for the receivers it could name; this closes the
  case it could not.
- A hover that answers `parameter props: NetworkProps` and stops sends the author
  back to the type declaration to read two fields. The renderer that expands a
  body already exists — it is reached only from the declaration itself, never from
  a value that carries the type.

Deliberately excluded:

- Any change to the checker, to inference or to narrowing. The compiler already
  accepts the reported guard: `if props.password and type(props.password) == "string" then`
  narrows correctly on the current tree, and the assignment diagnostic in the
  report comes from an extension build that predates it. 44.03 locks that with a
  fixture and 44.04 records that an editor keeps the old answers until the
  extension is reinstalled.
- Completion, which resolves members through a different path and is correct.

## Milestone 45 — Porting a Real Lua Resource

A 3,600-line MTA resource annotated for the Lua language server was converted to
Luam, file for file, to find what a real port runs into. The first `luam check`
reported 56 errors and 2 warnings across 24 files. Removing the findings milestone
43 already owns, and the genuine defects the port exposed in the resource itself,
what is left is fourteen compiler gaps, two stale rules in the internal design
document, and one pattern with no Luam spelling at all.

Status: todo

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 45.01 | Reconcile the internal language design with the optional marker and super rules | ../plans/45.01-optional-marker-and-super-drift.md | documentation-engineer | done |
| 45.02 | Accept the empty table literal for a map whose value is an element class | ../plans/45.02-empty-literal-element-map.md | architecture-engineer | done |
| 45.03 | Accept nil assignment as the deletion of a key | ../plans/45.03-nil-assignment-deletes-a-key.md | architecture-engineer | done |
| 45.04 | Spread unpack into the argument list it ends | ../plans/45.04-unpack-argument-spread.md | architecture-engineer | done |
| 45.05 | Declare a member whose key is not an identifier | ../plans/45.05-quoted-member-keys.md | architecture-engineer | done |
| 45.06 | Take an optional parameter in a fun type | ../plans/45.06-optional-parameter-in-fun-type.md | architecture-engineer | done |
| 45.07 | Take type parameters on an interface | ../plans/45.07-generic-interfaces.md | architecture-engineer | done |
| 45.08 | Publish a type alias to the project, the way an interface already is | ../plans/45.08-project-wide-type-aliases.md | architecture-engineer | done |
| 45.09 | Type a global the source assigns later | ../plans/45.09-typed-globals.md | architecture-engineer | done |
| 45.10 | Build a record over several statements | ../plans/45.10-incremental-record-construction.md | architecture-engineer | done |
| 45.11 | Widen the members of an inferred table literal | ../plans/45.11-widen-inferred-literal-members.md | architecture-engineer | done |
| 45.12 | Accept nil for a parameter the catalog declares optional | ../plans/45.12-nil-for-an-optional-catalog-parameter.md | architecture-engineer | done |
| 45.13 | Report a declaration that overwrites an MTA API or a runtime helper | ../plans/45.13-shadowed-api-and-helper.md | architecture-engineer | done |
| 45.14 | Say what a class receiver and a reserved parameter name really are | ../plans/45.14-class-receiver-and-reserved-name-messages.md | architecture-engineer | done |
| 45.15 | Author a multi-return signature | ../plans/45.15-author-a-multi-return-signature.md | architecture-engineer | done |
| 45.16 | Decide what replaces instantiating a class the code names at runtime | ../plans/45.16-runtime-named-instantiation.md | architecture-engineer | done |
| 45.17 | Keep a ported Lua resource as a compiler corpus | ../plans/45.17-ported-resource-corpus.md | test-engineer | done |
| 45.18 | Document what porting a Lua resource to Luam actually costs | ../plans/45.18-porting-guide.md | documentation-engineer | done |
| 45.19 | Detect the extension by the identifier it actually publishes | ../plans/45.19-extension-identifier-mismatch.md | architecture-engineer | done |

Acceptance:

- Every shape the port could not express has either a spelling or a recorded
  refusal, and the corpus in 45.17 carries one occurrence of each.
- A Lua idiom that is correct Lua and correct in the resource — deleting a key,
  spreading `unpack`, initialising a container with `{}`, filling a record over
  several statements — compiles.
- A type the resource needs to describe — a quoted key, an optional callback
  parameter, a generic contract, a global assigned later, a multi-return wrapper —
  can be written.
- No relaxation is silent: each one keeps a negative test proving the diagnostic
  it replaces still fires where it should.
- The emitted Lua, the line map and the generated manifest are unchanged by every
  task in the milestone except 45.05 and 45.16, and each of those carries its own
  baseline.

Why now:

- The gaps are not exotic. Eleven of the fourteen are single Lua idioms that
  appear in every resource, and four of them produced false positives on code that
  is correct — a false positive is worse than a missing check, because it teaches
  the author to stop reading the output.
- Two of the milestone's findings are the internal design document teaching forms
  the compiler rejects, in the exact section a porting author reads first. Both
  were corrected in `docs/en` and never carried back.
- The port also found seventeen genuine defects in a resource that had been
  running in production, including a getter typed non-optional over an optional
  field and an event handler that validates everything and then does nothing.
  That is the argument for the language, and it is unusable while the port itself
  costs a day of fighting the checker.
- Nothing here needs a new subsystem. Twelve of the tasks are local changes to the
  checker or the parser, and the two that are not — 45.16 and 45.10 — are
  decisions with the machinery already built.
- 45.19 is one wrong string. `luam doctor` tells every user their extension is not
  installed, and `luam setup` re-downloads it every run, because the identifier the
  CLI looks for is not the one the extension publishes.

Deliberately excluded:

- The environment findings in a `shared` file, which milestone 43 owns in full.
  The port reproduced them exactly and adds nothing.
- The member resolution and hover findings, which milestone 44 owns.
- Auto-loading and any framework surface. 45.16 decides how a resource that has
  one is ported; it does not put one in the language. CLAUDE.md stands.
- The defects the port found in the resource itself. They are the output of the
  exercise, not work for this repository.

## Milestone 46 — A Multi-Return Local in the Editor

`local cX, cY, cZ = getVehicleComponentPosition(...)` shows the whole tuple as the
type of `cX` and shows nothing on `cY` and `cZ`. The checker is correct — it has
always applied Lua's adjust rules — but two places in the language server pair
declarator `n` with value expression `n` and read that expression's type whole, so
the hint and the hover contradict the compiler that produced them.

Status: done

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 46.01 | Share one distribution rule for a value list | ../plans/46.01-value-list-distribution.md | architecture-engineer | done |
| 46.02 | Hint every name a multi-return local declares | ../plans/46.02-multi-return-inlay-hints.md | architecture-engineer | done |
| 46.03 | Answer hover and completion with the destructured type | ../plans/46.03-multi-return-hover-and-completion.md | architecture-engineer | done |
| 46.04 | Cover a multi-return local across the editor surfaces | ../plans/46.04-multi-return-editor-tests.md | test-engineer | done |
| 46.05 | Record what a multi-return local shows in the editor | ../plans/46.05-multi-return-documentation.md | documentation-engineer | done |

Acceptance:

- The adjust rules exist once. The checker and the language server read the same
  `distributeValueTypes`, and neither carries a second copy of the rule.
- A `local` that destructures a multi-return call answers one type per name, in
  the inlay hint, in hover, in completion detail and in both symbol outlines.
- A call in non-final position contributes only its first value, and
  `local only = f()` narrows to the first element rather than labelling a tuple.
- Every suppression the hint has today survives: an annotated declarator, an empty
  name, a type that prints as `any`, and an index the value list cannot account
  for.
- The emitted Lua, the line map and every existing compiler fixture are unchanged.

Why now:

- The wrong answer is rendered without being asked for. Hover is one name at a
  time; a hint appears on every name at once, so on the reported line the wrong
  label sits beside two names the editor left blank.
- The documentation already promises the correct behaviour. `functions.md` states
  that each target gets its own type, so a reader who checks their editor concludes
  the language lacks the feature rather than the hint.
- The fix is extraction, not new machinery. `checkValueList` already implements the
  rule in four lines, and both helpers it uses are exported.
- Two surfaces drifted apart because the rule was written twice. Fixing either one
  in place would write it a third and a fourth time.

Deliberately excluded:

- `generic-for` variables. They record no type and receive no hint today; giving
  them one is its own decision, not part of repairing a value list.
- Assignment targets, the return, callback-parameter and parameter-name hint
  kinds, and the hint settings. None of them reads a value list.
- Any change to the checker's behaviour, to inference, or to the emitted Lua.
  46.01 rewrites `checkValueList` over the extracted helper and changes nothing it
  answers.

## Milestone 47 — Async Functions and a Promise Runtime

`sleep` only works inside a coroutine that a `Threads` pool created and resumes.
Called anywhere else it fails at runtime with *attempt to yield from outside a
coroutine*, and the compiler says nothing about it. A blocking `sleep` outside a
coroutine is impossible on Lua 5.1 — there is no stack to suspend, so it would
freeze the server — which means the answer is not a better `sleep` but making the
coroutine invisible. An `async function` compiles its body into a coroutine the
promise scheduler drives, so `await` and `sleep` work anywhere inside it.

Status: todo

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 47.01 | Ship a promise runtime with an event-driven scheduler | ../plans/47.01-promise-runtime.md | architecture-engineer | todo |
| 47.02 | Parse async functions and await expressions | ../plans/47.02-async-await-front-end.md | architecture-engineer | todo |
| 47.03 | Type Promise, async returns and await | ../plans/47.03-promise-type.md | architecture-engineer | todo |
| 47.04 | Lower async bodies onto coroutines | ../plans/47.04-async-lowering.md | architecture-engineer | todo |
| 47.05 | Fold Threads onto the promise scheduler | ../plans/47.05-threads-on-the-promise-scheduler.md | architecture-engineer | todo |
| 47.06 | Surface async, await and Promise in the editor | ../plans/47.06-async-editor-support.md | architecture-engineer | todo |
| 47.07 | Cover async, await and the promise scheduler | ../plans/47.07-async-tests.md | test-engineer | todo |
| 47.08 | Document async, await and the promise runtime | ../plans/47.08-async-documentation.md | documentation-engineer | todo |

Acceptance:

- `local variable = await otherAsyncFn()` binds the resolved value, typed as the
  async function's declared return. A rejection raises at the `await` site and
  rejects the promise of the function containing it, so it reaches `:catch()`
  rather than disappearing.
- `async` and `await` are contextual, not reserved. `local async = new Async(100)`
  still compiles, and every existing fixture is unchanged.
- An async body is a real coroutine, so `await` lowers to a plain call. The
  emitter gains no statement buffer, no temporary-name counter and no CPS pass.
- One yield protocol and one pulse timer serve both libraries. `await` and `sleep`
  behave identically inside an async function and inside a pool job.
- `pool:add(fn)` still returns its id first, so existing code is untouched, and
  its second value is a promise that settles when the job finishes.
- No failure is silent. Every `coroutine.resume` result is read, a double settle
  is a no-op, an executor that throws rejects, and `await` outside a task errors
  instead of returning nil.
- A resource that names none of the runtime globals and declares no async
  function ships no promise file.

Why now:

- The gap is already being worked around by hand. Resource code in the wild
  reimplements `async`, `await` and a promise per project, and those copies share
  the same defects: resumes whose results are discarded, no guard against a
  double settle, rejection reasons dropped, and `unpack` truncating a trailing
  nil. Every one of those is a language-level fix, made once.
- The two libraries are on a collision course. `Threads` resumes a coroutine with
  the `Thread` object and a promise scheduler resumes it with `(ok, ...)`. Until
  they merge, `await` inside a pool job is broken, and broken quietly.
- The cheap version of this feature is available and the expensive one is not.
  Because the body is a coroutine, `await` needs no continuation transform — the
  work is a wrap and a call. A design without coroutines would need hoisting
  machinery the emitter does not have.
- `sleep` is the wrong default today. It busy-yields and is re-checked on every
  pulse; a timer-driven wait consumes nothing while suspended.

Deliberately excluded:

- Promise wrappers for `fetchRemote`, `dbQuery` and event round trips. They are
  the obvious payoff and they belong to their own milestone, once the core is
  proven.
- `try` / `catch`. `Promise.settle` covers branching on an outcome without
  syntax, and a statement form is a separate language decision.
- Inferring `T` from an executor's `resolve` calls. An explicit type argument or
  `Promise<any>` is enough here.
- Removing or deprecating any `Threads` or `Async` method. 47.05 keeps every one
  of them working; only the recommendation changes.

## Milestone 48 — Block Completion in the Editor

Typing `if 1 + 1 == 2 then` and pressing Enter leaves an open block. The author
writes the header, the body, and then goes back for the `end` — or forgets it and
reads a parser diagnostic pointing at the end of the file. Every editor for a
block language answers this from the completion list, and the language server
already has what the answer needs: it knows where strings and comments are, and
it can see whether the block ahead is closed. Accepting `then .. end` writes the
header, an indented empty line holding the cursor, and the `end`.

Status: todo

| ID | Task | Plan | Agent | Status |
|---|---|---|---|---|
| 48.01 | Close a block from the completion list | ../plans/48.01-close-a-block-from-completion.md | architecture-engineer | todo |
| 48.02 | Scaffold a block from its opening keyword | ../plans/48.02-scaffold-a-block-at-a-statement-start.md | architecture-engineer | todo |
| 48.03 | Cover block completion in the editor tests | ../plans/48.03-block-completion-tests.md | test-engineer | todo |
| 48.04 | Document block completion | ../plans/48.04-block-completion-documentation.md | documentation-engineer | todo |

Acceptance:

- Completing `then` on an open `if` or `elseif` header inserts `then`, an
  indented empty line with the cursor on it, and `end` at the header
  indentation. `do` behaves the same on a `for` or `while` header, and a
  `repeat` block offers `until condition`.
- The closer is preselected only while the block is unclosed. On code that
  already ends, the item is still offered, one row lower and unselected, so
  Enter never writes a second `end` into working code.
- Nothing is offered inside a string, inside a comment, in a type position,
  after `.` or `:`, or inside a call's arguments.
- Scaffolds — `if`, both `for` forms, `while`, `repeat`, `do`, `function` —
  appear only at a statement start, are never preselected, and never replace the
  plain keyword, which stays in the list.
- A client that reports no snippet support receives the same block as plain
  text, with no tab stops leaking into the buffer.
- One scan serves the feature. The block walk drives the scanner
  `source-context.ts` already owns instead of adding a second string and comment
  reader to the LSP.

Why now:

- The information is already in the LSP and unused. `scanContext` walks the
  document on every completion and knows exactly where code ends and a string
  begins; nothing reads that to decide whether a block is open.
- The cheap alternative is worse than nothing. A VS Code `snippets` file serves
  one editor and no context: it would offer `then .. end` inside a string and on
  a block that already ends, and the second `end` costs more than the first one
  saved.
- The scaffolding pattern is proven here. The event handler completion already
  inserts a multi-line snippet with a tab stop and a plain-text fallback, so
  this is the same mechanism applied to the language's own blocks.

Deliberately excluded:

- `class`, `interface` and `enum` scaffolds. Their bodies are brace blocks the
  editor already closes, and their members are typed — a frozen scaffold would
  compete with the member completion that already exists.
- `else` and `elseif` continuations. They close nothing, so they carry none of
  the reasoning this milestone is built on.
- Rewriting or repairing blocks the author did not just type. Completion writes
  at the cursor; an unclosed block elsewhere in the file is a diagnostic and a
  quick fix, not a completion item.
