# Compatibility

## Output target

| Target | Version |
| --- | --- |
| Lua | **5.1** |
| Multi Theft Auto | 1.5 or newer |

The compiler emits Lua 5.1 text only. It never runs Lua, never bundles an
interpreter, and never requires a Lua toolchain on the machine that builds.

Lua 5.2 and later constructs — `goto`, integer division, bitwise operators — are
not emitted, because MTA runs 5.1.

## Toolchain

| Requirement | Version |
| --- | --- |
| Node.js | 20, 22 and 24 are tested in CI |
| npm | Any version shipping with a supported Node.js |
| pnpm | 9 or newer, for building from source |

## Editors

| Editor | Launcher | `luam setup` | Notes |
| --- | --- | --- | --- |
| Visual Studio Code | `code` | yes | Marketplace, then release `.vsix` |
| VS Code Insiders | `code-insiders` | yes | Marketplace, then release `.vsix` |
| Cursor | `cursor` | yes | Editor marketplace, then release `.vsix` |
| VSCodium | `codium` | yes | Open VSX when available, then release `.vsix` |
| Windsurf | `windsurf` | yes | Editor marketplace, then release `.vsix` |
| JetBrains IDEs | — | no | Need a separate plugin. |
| Neovim, Zed, Sublime Text | — | no | Need their own LSP client. See [Language server](/en/tooling/language-server). |

Other VS Code-compatible forks can usually install the release `.vsix` manually.
`luam setup` does not claim support until a fork's launcher and extension APIs
are stable.

## Operating systems

Windows, macOS and Linux are supported for the CLI and the editor extension. Path
handling normalizes separators, so a `.luam.manifest` written on one platform works on
another.

`serverPath` points at the MTA server root on the machine running the CLI, so
`ensure` needs either a local server or a mounted path.

## Network

A build makes exactly one kind of outbound request: the `min_mta_version` lookup
against the latest published MTA release, cached in `.luam/mta-version.json`.

| Situation | Result |
| --- | --- |
| Network available | The value is resolved and cached. |
| No network, cache present | The cached value is used. |
| No network, no cache | A warning; the element is omitted and the build succeeds. |
| `--offline` or `LUAM_OFFLINE` | The lookup is skipped. |

The compiler packages make no network calls at all. A build with no network
always succeeds.

## Existing Lua

Existing MTA Lua compiles after three mechanical changes:

| Lua | Luam |
| --- | --- |
| `-- comment` | `# comment` |
| `--[[ block ]]` | `#* block *#` |
| `a != b` (non-standard) | `a ~= b` |

Add `#!nocheck` to the file and the build passes while you annotate module by
module. See [Strictness](/en/language/strictness).

## Documentation versioning

This manual documents the Luam version named in the banner at the top of every
page. Documentation changes are recorded in the
[documentation changelog](/en/changelog); compiler changes are in the
repository's
[CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).
