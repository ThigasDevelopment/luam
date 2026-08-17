# Documentation changelog

Changes to this manual. Compiler and CLI changes live in the repository's
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).

The banner at the top of every page names the Luam version the manual documents.
When that version changes, the entry below says what moved.

## Unreleased

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
- [Language server](/en/tooling/language-server) uses expected callback types for
  parameter completion, member completion, hover, navigation, and signature
  help, including environment-specific MTA callbacks.
- [Output layouts](/en/reference/output-layouts) explains how readable Lua keeps
  authored statement lines for direct MTA debugging while source maps cover
  expanding transforms and production minification removes the padding.

- [CLI commands](/en/tooling/cli) documents `luam server` and
  `luam dev --start-server`; the manifest and troubleshooting pages cover
  executable discovery, readiness, shutdown, and platform support.

- [Keywords](/en/reference/keywords) gains a section on `self` and `super`, the
  two contextual names, and states that `constructor` is the one member name a
  class must declare as a method.
- [Language server](/en/tooling/language-server) lists where each reserved word
  completes, including `fun` in a type annotation and `super` after `self:`.
- [Diagnostics](/en/reference/diagnostics) lists `check-invalid-self` and
  `check-invalid-constructor`.
- [Output layouts](/en/reference/output-layouts) drops the `do ... end` blocks
  from the bundle description. A bundle is now the plain concatenation of its
  helpers and modules, so the page states what the shared chunk scope means for
  a file-level `local` and for the Lua 5.1 limit of 200 active locals.
- [Diagnostics](/en/reference/diagnostics) lists `parse-class-method-form`, the
  error raised when a class member is written as `name(...) { ... }` instead of
  `name = function (...) ... end`.
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

## Documents Luam 0.1.1

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
