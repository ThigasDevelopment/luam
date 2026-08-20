# Installation

## Requirements

| Requirement | Version | Why |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 20 or newer | Runs the compiler and the CLI. |
| [MTA:SA server](https://multitheftauto.com/) | 1.5 or newer | Runs the resource the compiler writes. |
| Lua toolchain | not needed | The compiler emits Lua text and never executes it. |

```bash
node --version
```

## Install the CLI

```bash
npm install --global @thigasdevelopment/luam
```

That installs one command, `luam`:

```bash
luam --version
```

| Task | Command |
| --- | --- |
| Install | `npm install --global @thigasdevelopment/luam` |
| Update to the latest | `npm update --global @thigasdevelopment/luam` |
| Install a specific version | `npm install --global @thigasdevelopment/luam@%LUAM_VERSION%` |
| Uninstall | `npm uninstall --global @thigasdevelopment/luam` |
| Run once, without installing | `npx @thigasdevelopment/luam <command>` |

`npx @thigasdevelopment/luam build` works anywhere and caches the download, which
suits CI and any machine you would rather not install into.

## `luam: command not found`

npm placed the binary in its global bin directory and that directory is not on
your `PATH`. Find it:

```bash
npm config get prefix
```

- **Windows** — add that folder to your user `PATH`
  (*Settings → System → About → Advanced system settings → Environment
  Variables*), then open a **new** terminal.
- **macOS and Linux** — add `<prefix>/bin` to your `PATH` in `~/.zshrc` or
  `~/.bashrc`, then run `source ~/.zshrc`.

`npx @thigasdevelopment/luam <command>` needs no `PATH` entry at all.

## Install the editor extension

The extension gives you completion, hover and diagnostics from the same checker
the CLI runs, so the editor and the build never disagree. Let the CLI detect
supported editors and ask before changing each one:

```bash
luam setup
```

For an unattended development machine, approve every detected editor:

```bash
luam setup --yes
```

The command never installs into an editor silently. In CI, or in any other
non-interactive terminal, pass `--yes` explicitly.

See [Editors](/en/tooling/editors) for the compatibility matrix, the manual
`.vsix` route, and the settings the extension adds.

## Verify the installation

```bash
luam doctor
```

`doctor` reports the running CLI and Node.js versions, every supported editor
found on `PATH`, and whether that editor has the Luam extension.

## Install from source

For contributing, or to run a change that is not released yet. Needs
[pnpm](https://pnpm.io/) 9 or newer.

```bash
git clone https://github.com/ThigasDevelopment/luam.git
cd luam
pnpm install
pnpm install:cli
```

`install:cli` bundles the compiler into one self-contained file, writes a
publishable manifest next to it, and runs `npm install --global` on the result.
It finishes by running `luam --version` and telling you what to fix when the npm
bin directory is not on your `PATH`.
