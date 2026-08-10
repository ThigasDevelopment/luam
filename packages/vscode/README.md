# Luam for VS Code

The extension registers the `luam` language, starts `@luam/lsp`, and ships the
TextMate grammar that highlights Luam source.

## Features

- Diagnostics, completion, hover, go to definition, find references, and rename
  through the language server.
- Syntax highlighting for Lua blocks, `--` and `--[[ ]]` comments, `--!`
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
`luam.json`. It selects `file`-scheme documents with the `luam` language id and
watches `**/*.luam` so the server sees files that change outside the editor.

## Building

`pnpm --filter @luam/vscode bundle` produces both halves of the extension:

- `dist/extension.cjs` — the extension itself, with `vscode` left external.
- `dist/server/luam-lsp.cjs` — the language server the extension forks over IPC.

Both must exist before the extension is packaged or run from source.

## Testing

`pnpm --filter @luam/vscode test` runs headlessly. The tests stub the `vscode`
and `vscode-languageclient/node` modules, so activation, command registration,
the ensure command line, the manifest contract, and every grammar pattern are
verified without downloading VS Code.
