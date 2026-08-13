# Luam for VS Code

The extension registers the `luam` language, starts `@luam/lsp`, and ships the
TextMate grammar that highlights Luam source.

> **User documentation:**
> [Editors](https://thigasdevelopment.github.io/luam/en/tooling/editors)
> · [Editores](https://thigasdevelopment.github.io/luam/pt-br/tooling/editors).

## Features

- Diagnostics, completion, hover, go to definition, find references, and rename
  through the language server.
- Syntax highlighting for Lua blocks, `#` and `#* *#` comments, `#!`
  directives, template strings with `${}` interpolation, type annotations, and
  the `class`, `interface`, `enum`, `type`, and `new` declarations.
- Bracket matching, comment toggling, and indentation rules for `end` and `}`.

## Commands

| Command | Default key | Behavior |
| ------- | ----------- | -------- |
| `Luam: Ensure Resource` | `ctrl+alt+e` | Runs `luam ensure` in a dedicated terminal. |
| `Luam: Restart Language Server` | — | Restarts the language server. |

## Settings

| Setting | Default | Meaning |
| ------- | ------- | ------- |
| `luam.cliPath` | `luam` | Command used to run the CLI. |
| `luam.ensureWatch` | `true` | Pass `--watch` when the ensure command runs. |
| `luam.trace.server` | `off` | Trace the communication with the language server. |

## Activation

The extension activates when the workspace contains a `.luam` file or a
`.luam.manifest`. It selects `file`-scheme documents with the `luam` and
`luam-manifest` language ids, and watches `**/*.luam`, `**/.luam.manifest` and
`**/.env` so the server sees files that change outside the editor.

The manifest dialect has no calls and no function values, so the server evaluates
it in process and opening a folder never runs project code.

`.luam.manifest` gets its own `luam-manifest` file association, with dedicated
light and dark document icons, `#` comment configuration, and its own grammar for
the dialect. The `.luam` language, its grammar, and its icon are untouched by it.

## Building

`pnpm --filter luam bundle` produces both halves of the extension:

- `dist/extension.cjs` — the extension itself, with `vscode` left external.
- `dist/server/luam-lsp.cjs` — the language server the extension forks over IPC.

Both must exist before the extension is packaged or run from source.

## Testing

`pnpm --filter luam test` runs headlessly. The tests stub the `vscode`
and `vscode-languageclient/node` modules, so activation, command registration,
the ensure command line, the manifest contract, and every grammar pattern are
verified without downloading VS Code.
