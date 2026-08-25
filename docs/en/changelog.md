# Documentation changelog

Changes to this manual. Compiler and CLI changes live in the repository's
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).

The banner at the top of every page names the Luam version the manual documents.
Every heading below is a released version and the date it shipped, newest first.
`Unreleased` holds the manual changes that land after the current release.

## Unreleased

### Changed

- [The manifest](/en/tooling/luam-manifest) and
  [Configuration fields](/en/reference/configuration-fields) rename the
  `compilerOptions` table to `compiler`, with the same members and defaults, and
  list `compilerOptions` among the removed fields that report
  `config-removed-field`. [OOP API](/en/mta/oop),
  [Project layout](/en/guide/project-layout),
  [Troubleshooting](/en/guide/troubleshooting) and
  [Diagnostics](/en/reference/diagnostics) use the new name throughout.
- [Classes](/en/language/classes) documents declaration order as two rules
  instead of one warning: a class is a type everywhere in its file, and a value
  from the line its declaration runs. `extends` may name a parent written
  further down; a top-level `new` of a class declared below is
  `check-class-before-declaration`.

- [Limitations](/en/reference/limitations) labels every entry planned, design
  boundary, upstream constraint or platform constraint, states which ones are
  never coming back — `__index`, `__newindex` and `__call`, implicit runtime
  checks, a build that reads `config.lua` — and names the release it describes.
- [Editors](/en/tooling/editors) lists the keyword hover and the decorator hover
  as their own rows: `self` carries its class and that class shape, and a
  decorator carries the members it generates at that site.
  [Decorators](/en/language/decorators) describes what the decorator hover shows,
  including the three that generate nothing.
- [Diagnostics](/en/reference/diagnostics) stops saying the only decorators are
  `@Getter` and `@Setter`, and lists the four decorator codes that were missing:
  `check-lazy-initializer`, `check-readonly-assignment`, `check-deprecated-use`
  and `check-invalid-override`.

### Fixed

- [Troubleshooting](/en/guide/troubleshooting) said Luam does no narrowing. A
  guard narrows a name, an `or` drops the nil on its left, and it is a **field**
  that keeps its declared type. The page now shows both.
- [Editors](/en/tooling/editors) and [Troubleshooting](/en/guide/troubleshooting)
  said the server never re-checks an open file when another one changes, and told
  you to restart it to pick up files. It re-analyzes on a declaration change, and
  it scans the workspace and watches `**/*.luam`, `.luam.manifest` and `.env*`.
- The [server command](/en/recipes/server-command) and
  [exported function](/en/recipes/exported-function) recipes annotated a local
  `any` for a limitation that does not exist. Both locals are `number`.

## 0.17.0 - 2026-08-25

### Changed

- [APIs and events](/en/mta/apis-and-events) and the
  [MTA overview](/en/mta/) report the catalog's new size: 1413 API declarations
  and 58 element types, generated from a committed MTA wiki snapshot covering
  MTA 1.7.0.
- [Enums and interfaces](/en/language/enums-and-interfaces) states that an
  optional interface member is optional for the class implementing it.

## 0.16.0 - 2026-08-25

### Removed

- The `transport` reference and every page that described configuring one. The
  field no longer exists: `ensure` syncs files, and `dev --start-server` restarts
  the resource through the console it owns.

### Added

- [Output layouts and source maps](/en/reference/output-layouts) documents the
  development output contract: which commands write readable Lua, what is
  rewritten, what is copied through byte for byte, and what the contract does not
  promise. It carries a worked example of a `continue` loop and of an erased
  declaration.

### Changed

- [Enums and interfaces](/en/language/enums-and-interfaces) records what enum
  reachability sees and what it does not: erasure is silent, reachability is
  matched by identifier name so a dynamic or cross-resource read is invisible to
  the build, a surviving enum is a global so declaration order matters at load
  time, and member names stay quoted because the runtime helper uses each element
  as a table key.
- [Limitations](/en/reference/limitations) states that generated Lua is the
  source rather than a rewrite, and links to the output contract and to resolving
  an MTA runtime position.
- [Object extensions](/en/language/extensions) names `check-extension-form` as
  the error for using the wrong form, and
  [Diagnostics](/en/reference/diagnostics) lists it next to `check-not-callable`.
- [Enums and interfaces](/en/language/enums-and-interfaces) states that erasure
  looks at the whole resource, so an enum declared in a shared file and read
  from a server or client file is kept.
- [The manifest](/en/tooling/luam-manifest) explains that a `local` no field
  reads is reported as `check-unused-local`, and
  [Diagnostics](/en/reference/diagnostics) records that the code also fires in
  the manifest regardless of `compilerOptions.noUnusedLocals`.
- This changelog now uses dated release headings. Every entry written since the
  first published manual moved under the version that shipped it, and
  `Unreleased` holds only the work that follows the current release.
- [Installation](/en/guide/installation) and [Editors](/en/tooling/editors) no
  longer name a version by hand. The pinned install command and the `.vsix` file
  name are rendered from the version the banner shows, so they cannot go stale.

## 0.15.6 - 2026-08-17

### Changed

- [APIs and events](/en/mta/apis-and-events) documents typed event handlers,
  payload checking on every trigger, and the `declare event` contract for custom
  events, with the diagnostics each mistake raises.
- [Declaration files](/en/language/declaration-files) covers `declare event`, and
  [Keywords](/en/reference/keywords) records `event` as the second contextual
  term next to `fun`.
- [Language server](/en/tooling/language-server) and
  [Editors](/en/tooling/editors) describe event-name completion, hover, and
  signature help.
- [Diagnostics](/en/reference/diagnostics) lists the event contract codes.

## 0.15.5 - 2026-08-16

### Changed

- [Language server](/en/tooling/language-server) uses expected callback types for
  parameter completion, member completion, hover, navigation, and signature
  help, including environment-specific MTA callbacks.
- [Output layouts](/en/reference/output-layouts) explains how readable Lua keeps
  authored statement lines for direct MTA debugging while source maps cover
  expanding transforms and production minification removes the padding.

## 0.15.4 - 2026-08-16

### Changed

- [CLI commands](/en/tooling/cli) documents `luam server` and
  `luam dev --start-server`; the manifest and troubleshooting pages cover
  executable discovery, readiness, shutdown, and platform support.

## 0.8.0 - 2026-08-12

### Changed

- [Keywords](/en/reference/keywords) gains a section on `self` and `super`, the
  two contextual names, and states that `constructor` is the one member name a
  class must declare as a method.
- [Language server](/en/tooling/language-server) lists where each reserved word
  completes, including `fun` in a type annotation and `super` after `self:`.
- [Diagnostics](/en/reference/diagnostics) lists `check-invalid-self` and
  `check-invalid-constructor`.

## 0.7.0 - 2026-08-12

### Changed

- [Output layouts](/en/reference/output-layouts) drops the `do ... end` blocks
  from the bundle description. A bundle is now the plain concatenation of its
  helpers and modules, so the page states what the shared chunk scope means for
  a file-level `local` and for the Lua 5.1 limit of 200 active locals.
- [Diagnostics](/en/reference/diagnostics) lists `parse-class-method-form`, the
  error raised when a class member is written as `name(...) { ... }` instead of
  `name = function (...) ... end`.

## 0.6.0 - 2026-08-12

### Changed

- `luam.json` became [`.luam.manifest`](/en/tooling/luam-manifest), a restricted
  Luam dialect the compiler parses, checks, and evaluates. The page is rebuilt
  around the two statements it allows, the expression language, the injected
  `mode`, `env`, and `root`, and why the dialect has no calls. Every field,
  default, and validation rule is unchanged; `--config` became `--manifest`; and
  `luam.json` is no longer read at all. The page ends with the three-step
  migration.
- Every configuration sample in the manual is written in the dialect rather than
  JSON, and the diagnostics reference lists the manifest codes that replaced
  `config-invalid-json` and `config-unreadable`.
- [Configuration fields](/en/reference/configuration-fields) marks every field
  required or optional, matching what editor completion shows.
- [Project layout](/en/guide/project-layout) no longer describes a settings
  snapshot. The editor reads the manifest itself, so `oop` takes effect on save.

## 0.1.1 - 2026-08-11

The first published manual.

### Added

- A bilingual site in **en-US** and **pt-BR**, with a language selector at the
  root and local search in both locales.
- **Guide** — installation, quick start, project layout, daily development, and
  troubleshooting.
- **Language** — Lua foundations, types, functions, template strings, enums and
  interfaces, classes, decorators, object extensions, exports, declaration files,
  and strictness.
- **MTA** — environments, APIs and events, the OOP API, resources and `meta.xml`,
  `config.lua` and `.env`, and security boundaries.
- **Tooling** — CLI commands, `luam.json`, editors, the language server, and CI
  and deployment.
- **Recipes** — ten complete projects, each verified with `luam check` on every
  documentation build.
- **Reference** — keywords, operators, directives, configuration fields,
  diagnostics, limitations, and compatibility.

### Notes for readers coming from the README

The repository README stays the concise landing page. Material that used to live
there in detail now has a canonical home:

| Was in the README | Now at |
| --- | --- |
| Install and PATH troubleshooting | [Installation](/en/guide/installation) |
| The quick start | [Quick start](/en/guide/quick-start) |
| Every CLI command and option | [CLI commands](/en/tooling/cli) |
| The `luam.json` table | [.luam.manifest](/en/tooling/luam-manifest) and [Configuration fields](/en/reference/configuration-fields) |
| The feature table | [The language](/en/language/) |
| Editor support | [Editors](/en/tooling/editors) |
| Known limitations | [Limitations](/en/reference/limitations) |

## Conventions

- **English is the source locale.** A page is written in English first and then
  translated. Code, API names, diagnostics, CLI commands, configuration keys,
  file paths and source keywords are never translated.
- **The locales stay paired.** Every page exists in both, and a documentation
  build fails when one is missing. A locale may omit a page only while it carries
  a visible *Translation in progress* marker and the parity allowlist names it.
- **Snippets are shared.** Both locales render the same source files, so a code
  sample cannot drift between languages or away from the compiler.

## Reporting a documentation problem

Open an issue at
[github.com/ThigasDevelopment/luam/issues](https://github.com/ThigasDevelopment/luam/issues),
or use the **Edit this page on GitHub** link at the bottom of any page.
