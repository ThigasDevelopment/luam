# Documentation changelog

Changes to this manual. Compiler and CLI changes live in the repository's
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).

The banner at the top of every page names the Luam version the manual documents.
When that version changes, the entry below says what moved.

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
| The `luam.json` table | [luam.json](/en/tooling/luam-json) and [Configuration fields](/en/reference/configuration-fields) |
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
