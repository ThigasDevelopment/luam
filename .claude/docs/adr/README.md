# Architecture Decision Records

One decision per record, numbered in the order it was accepted. Claim the next
free number before writing a new one so two machines never allocate the same
slot — that collision is what produced the duplicate 019 and 020 this index now
prevents.

Each row links the record; the record itself carries the full status note.

| # | Title | Status |
|---|---|---|
| 001 | [Use typed Lua as the source syntax](001-typed-lua-source-syntax.md) | Accepted |
| 002 | [Use `.luam` as the source file extension](002-luam-source-file-extension.md) | Accepted |
| 003 | [Mirror the source tree in the generated resource](003-mirror-source-tree-in-generated-resource.md) | Accepted, partly superseded by [ADR-008](008-generated-manifest-standard.md) |
| 004 | [Split resource configuration between `config.lua` and `.env`](004-resource-configuration-and-environment-files.md) | Accepted |
| 005 | [Type verbatim Lua with `.d.luam` declaration files](005-declaration-files.md) | Accepted |
| 006 | [Generate the MTA catalog from `mtasa-lua-types`](006-mta-declaration-source.md) | Accepted |
| 007 | [Build directives as contextual keywords that contribute to the manifest](007-build-directives.md) | Accepted, partly superseded by [ADR-008](008-generated-manifest-standard.md) |
| 008 | [The generated `meta.xml` follows an authored standard](008-generated-manifest-standard.md) | Accepted |
| 009 | [Decorators rewrite the class they annotate](009-decorators.md) | Accepted |
| 010 | [The production build bundles one script per environment](010-bundled-production-output.md) | Accepted, partly amended by [ADR-016](016-flat-bundle-concatenation.md) |
| 011 | [Generated positions map back to `.luam` through a line map](011-source-position-mapping.md) | Accepted |
| 012 | [The CLI is a declarative command registry, not a global parser](012-cli-command-registry.md) | Accepted |
| 013 | [`luam build` emits one-line Lua through a lexical minifier](013-production-lua-minification.md) | Accepted |
| 014 | [The project manifest is a `.luam.manifest` ESM module evaluated out of process](014-luam-manifest-module.md) | Accepted, amended by [ADR-015](015-luam-manifest-language.md) |
| 015 | [The manifest is a restricted Luam dialect, evaluated in process](015-luam-manifest-language.md) | Accepted |
| 016 | [Bundle members are concatenated without a wrapper block](016-flat-bundle-concatenation.md) | Accepted |
| 017 | [The manifest is a closed set of typed domains, each with one owner](017-manifest-domain-contract.md) | Accepted |
| 018 | [Emit source-faithful Lua in development builds](018-source-faithful-development-output.md) | Accepted |
| 019 | [Model native MTA class values](019-native-mta-class-values.md) | Accepted |
| 020 | [Let the CLI own an opt-in local MTA server process](020-cli-owned-mta-server-process.md) | Accepted |
| 021 | [Erase type annotations by default](021-erased-type-annotations.md) | Accepted |
| 022 | [Keep a native `config.lua` opaque to compilation](022-opaque-native-configuration.md) | Accepted |
| 023 | [Assign one environment per file](023-file-level-environments.md) | Accepted |
| 024 | [Separate when a class is a type from when it is a value](024-two-phase-class-declaration.md) | Accepted |
| 025 | [Key narrowing facts on stable access paths](025-access-path-narrowing.md) | Accepted |
| 026 | [Bind self paths directly in template context tables](026-self-field-template-bindings.md) | Accepted |
| 027 | [A template fallback marks an interpolated name optional](027-template-fallback-scope-rule.md) | Accepted |
| 028 | [Give a class one value with its own member space](028-static-class-members.md) | Accepted |
| 029 | [Generate the MTA catalog from a committed wiki snapshot](029-mta-wiki-catalog-source.md) | Accepted |
| 030 | [One role table generates every Luam editor theme](030-editor-theme-contract.md) | Accepted |
| 031 | [Carry narrowing facts through a syntax-directed flow state](031-flow-narrowing.md) | Accepted |
| 032 | [Erase class type parameters at the point of use](032-erased-generic-classes.md) | Accepted |
| 033 | [Publish resource exports as a versioned JSON contract](033-resource-export-abi.md) | Accepted |
| 034 | [Validate a shape at runtime only where a class is marked](034-opt-in-boundary-validation.md) | Accepted |
| 035 | [Expose Lua metamethods by reserved member name](035-safe-class-metamethods.md) | Accepted |
| 036 | [Read a native `config.lua` for literal data, never execute it](036-config-declaration-extraction.md) | Accepted |
| 037 | [Run tests on a discovered Lua 5.1 interpreter with recorded MTA stubs](037-test-execution-host.md) | Accepted |
