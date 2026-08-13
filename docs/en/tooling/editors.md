# Editors

The **Luam** extension starts a language server built on the same frontend the CLI
uses, so the editor and the build never disagree about a file.

## What you get

| Feature | Details |
| --- | --- |
| Syntax highlighting | `.luam` files, including type annotations, `#!` directives and template strings. |
| Diagnostics | On open and on every keystroke, cleared when you fix the file. |
| Completion | Scope symbols, workspace globals, MTA APIs scoped to the file's environment, keywords. |
| Member completion | `.` completes fields and static methods; `:` completes instance methods, including inherited MTA members. |
| Class headers | After `class Name `, completes `extends` and `implements`, then the declared classes or interfaces that can follow. |
| Argument ranking | Inside a call, candidates matching the expected parameter type sort first, then functions returning it. |
| Hover | Declared or inferred type, function signature, and the environment of an MTA API. |
| Navigation | Go to definition, find references, and rename — across files for globals. |

Completion is scoped exactly like the checker: `dxDrawText` never appears in a
server file, `kickPlayer` never appears in a client file.

## Installing through the CLI

The command detects every supported editor whose launcher is on `PATH` and asks
before installing:

```bash
luam setup
```

| Editor | Launcher | Automatic | Distribution |
| --- | --- | --- | --- |
| Visual Studio Code | `code` | yes | Marketplace, then release `.vsix` |
| VS Code Insiders | `code-insiders` | yes | Marketplace, then release `.vsix` |
| Cursor | `cursor` | yes | Editor marketplace, then release `.vsix` |
| VSCodium | `codium` | yes | Open VSX when available, then release `.vsix` |
| Windsurf | `windsurf` | yes | Editor marketplace, then release `.vsix` |

Other VS Code-compatible forks can usually install the release `.vsix` manually,
but `luam setup` does not claim support until their launcher and extension APIs
are stable. JetBrains IDEs need a separate plugin. Neovim, Zed and Sublime Text
need their own LSP client — see
[Language server](/en/tooling/language-server).

## Installing from a release

Download `luam-<version>.vsix` from the
[Releases page](https://github.com/ThigasDevelopment/luam/releases), then:

```bash
code --install-extension luam-0.1.1.vsix
cursor --install-extension luam-0.1.1.vsix
codium --install-extension luam-0.1.1.vsix
windsurf --install-extension luam-0.1.1.vsix
```

In a compatible editor you can also open **Extensions**, choose **Install from
VSIX**, and select the downloaded file. Reload the window when prompted.

## Installing from source

```bash
git clone https://github.com/ThigasDevelopment/luam.git
cd luam
pnpm install
pnpm --filter luam bundle
npx --yes @vscode/vsce package --no-dependencies --skip-license --out luam.vsix
code --install-extension luam.vsix
```

To hack on the extension, skip packaging and launch a development host instead —
it reloads on rebuild:

```bash
pnpm --filter luam bundle
code --extensionDevelopmentPath=packages/vscode
```

## Activation

The extension activates when the workspace holds a `.luam.manifest` or any `.luam`
file, so **open your resource folder as the workspace root**. It watches
`**/*.luam`, so files changed outside the editor still reach the server.

## Commands

| Command | Shortcut | What it does |
| --- | --- | --- |
| **Luam: Ensure Resource** | `Ctrl+Alt+E` (`Cmd+Alt+E`) | Runs `luam ensure` in a terminal for the current project. |
| **Luam: Restart Language Server** | — | Restarts the server when it gets confused. |

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `luam.cliPath` | `"luam"` | Command used to run the CLI. Point it at a bundle to test an unreleased build. |
| `luam.ensureWatch` | `true` | Pass `--watch` when the ensure command runs. |
| `luam.trace.server` | `"off"` | Trace LSP traffic. Set to `"verbose"` when reporting a bug. |

## A known limitation

The server does not re-check an already open file when a **different** file
changes, so a cross-module violation can surface only in `luam check`. Run
**Luam: Restart Language Server** to force a rescan.
