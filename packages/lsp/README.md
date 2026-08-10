# Luam LSP

`@luam/lsp` is the Language Server for Luam. It reuses the compiler's lexer,
parser, binder, type checker, and diagnostics, so the editor and the build never
disagree about a file.

The server is editor-agnostic. `@luam/vscode` bundles it, and any editor that
speaks LSP can launch it the same way.

## Capabilities

| Capability | Behavior |
| ---------- | -------- |
| Diagnostics | Published on open and on every change, cleared when the file is fixed. |
| Completion | Scope symbols, workspace globals, environment-scoped MTA APIs, and keywords. |
| Hover | Declared or inferred type, function signature, and MTA API environment. |
| Definition | Locals, parameters, class members, and globals declared in another file. |
| References | Every use of a symbol, across files for globals. |
| Rename | Edits every occurrence, across files for globals. |

Completion triggers on `.` and `:` for members: class fields and methods
(including inherited ones), enum members, `math`/`string`/`table` library
members, and the native extensions that apply to the receiver's type.

## Environments

Every document resolves its environment (`server`, `client`, or `shared`) from
its path or a `--!` directive before anything else runs. The environment decides
which MTA APIs the file sees, so `dxDrawText` never completes in a server file
and `kickPlayer` never completes in a client file. A `shared` file sees only
shared declarations.

Globals declared by other files follow the same rule: a `server` file completes
globals from `shared` modules, never from `client` modules.

## Workspace

On `initialize` the server scans the workspace folders for `.luam` files and
analyzes them. Open documents always win over the scanned copy, so unsaved edits
drive diagnostics and navigation immediately.

## Running

`pnpm --filter @luam/lsp bundle` emits `dist/luam-lsp.mjs`, a self-contained
Node bundle. Launch it with `--stdio`, or with `--node-ipc` when the client
forks it.

```
node dist/luam-lsp.mjs --stdio
```

## Layout

| Path | Responsibility |
| ---- | -------------- |
| `src/index.ts` | Entrypoint that creates the connection and starts the server. |
| `src/server/` | Connection wiring, declared capabilities, and the language service facade. |
| `src/analysis/` | Runs the compiler over one document and keeps the result. |
| `src/symbols/` | Scope tree and symbol index built from the AST and the checker's types. |
| `src/features/` | Diagnostics, completion, hover, definition, references, and rename. |
| `src/workspace/` | URI conversion, source scanning, and the per-workspace analysis store. |

## Known Gaps

- Cross-module diagnostics are not published. The server checks one file at a
  time; `luam check` still reports environment violations across modules.
- Member navigation resolves through the declared class of the receiver. A value
  the checker types `any` offers no member completion.
- Every change reanalyzes the whole document. Incremental caching lands with
  milestone 7.
