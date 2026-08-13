# Language server

`@luam/lsp` is editor-agnostic. The VS Code extension bundles it, and any editor
that speaks the Language Server Protocol can launch it the same way.

## Capabilities

| Capability | Behaviour |
| --- | --- |
| Diagnostics | Published on open and on every change, cleared when the file is fixed. |
| Completion | Scope symbols, workspace globals, environment-scoped MTA APIs, keywords. |
| Hover | Declared or inferred type, function signature, MTA API environment. |
| Definition | Locals, parameters, class members, and globals declared in another file. |
| References | Every use of a symbol, across files for globals. |
| Rename | Edits every occurrence, across files for globals. |

Completion triggers on `.` and `:` for members: class fields and methods
(including inherited ones), enum members, `math` / `string` / `table` library
members, and the [object extensions](/en/language/extensions) that apply to the
receiver's type.

### Inside a class header

Completion knows where it is in a `class` declaration and offers only what can
legally follow:

| You have typed | You get |
| --- | --- |
| `class Session ` | `extends` and `implements` |
| `class Session extends ` | Every declared **class**, minus `Session` itself |
| `class Session implements ` | Every declared **interface** |
| `class Session extends Base ` | `implements` only — `extends` is already used |

The interface position keeps offering after each comma, so
`implements Describable, ` completes the second one too.

### Inside a call

Completion ranks candidates by the parameter type the call expects, using the
same types the checker uses. The list is **ordered, never filtered** — everything
still appears:

| Rank | Candidate |
| --- | --- |
| First | Its type matches the expected parameter type. |
| Second | It is a **function whose return type** matches, so calling it provides the value. |
| Last | Everything else. |

For `setElementHealth(player, ` the second parameter is a `number`, so numeric
locals sort first, then functions returning `number`, then the rest. Element
types respect MTA's hierarchy, so a `Vehicle` ranks first where an `Element` is
expected.

## Environments

Every document resolves its environment (`server`, `client` or `shared`) from its
path or a `#!` directive **before anything else runs**. That decides which MTA
APIs the document sees, so `dxDrawText` never completes in a server file and
`kickPlayer` never completes in a client file. A `shared` document sees only
shared declarations.

Globals declared by other files follow the same rule: a `server` file completes
globals from `shared` modules, never from `client` modules.

## Workspace

On `initialize` the server scans the workspace folders for `.luam` files and
analyzes them. Open documents always win over the scanned copy, so unsaved edits
drive diagnostics and navigation immediately.

## The manifest

[`.luam.manifest`](/en/tooling/luam-manifest) is scanned and analyzed like any
other document. Its diagnostics appear as you type, completion offers the fields
valid at the cursor — with their type, whether they are required, and their
default — and the closed sets complete inside the quotes. Hover names the field's
full path and type.

The dialect has no calls and no function values, so the server evaluates a
manifest itself. Opening a folder never runs project code, and `oop` takes effect
on save rather than after the next CLI run.

## Running it

```bash
pnpm --filter @luam/lsp bundle    # emits packages/lsp/dist/luam-lsp.mjs
node packages/lsp/dist/luam-lsp.mjs --stdio
```

`--stdio` is the usual transport. `--node-ipc` is available when the client forks
the process.

The bundle is self-contained: it carries the compiler frontend and the MTA
catalog, and needs nothing but Node.js 20 or newer.

## Wiring an editor

Any LSP client needs three things:

1. **Command** — `node /path/to/luam-lsp.mjs --stdio`.
2. **Document selector** — files matching `**/*.luam`, language id `luam`.
3. **Root** — the folder holding `.luam.manifest`, so the workspace scan finds every
   module.

There is no configuration section the server requires; the settings listed under
[Editors](/en/tooling/editors) belong to the VS Code extension, not to the
protocol.

## Reporting a problem

Set the client's trace level to `verbose` (`luam.trace.server` in VS Code), then
attach the trace together with the output of `luam doctor`.
