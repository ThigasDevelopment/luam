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

### Reserved words

Every reserved word is completed, each in the position where it is legal:

| You have typed | You get |
| --- | --- |
| A statement | The Lua 5.1 keywords, plus `class`, `continue`, `declare`, `enum`, `export`, `interface`, `new` and `type` |
| A class body | `constructor`, expanded into the method form |
| A class or interface header | `extends` and `implements` |
| A type annotation | The primitive types and `fun` |
| Inside a method of a subclass | `super` |

`self`, `super` and `fun` are contextual rather than reserved, so completion
offers them only where they mean something. See
[Keywords](/en/reference/keywords).

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

When the expected parameter is itself a function, an anonymous callback inherits
its parameter names and types. Completion can insert those names after
`function (`, and member completion, hover, definition, and references use the
inherited types inside the body. MTA callback variants follow the current file's
environment, so `addCommandHandler` offers `player, commandName, ...` on the
server and `commandName, ...` on the client.

## Events

An event name is resolved from the string literal in the call, so the handler of
`addEventHandler('onPlayerQuit', root, function (` completes as
`quitType: string, reason: string, responsibleElement: Element`, and signature
help names the payload arguments of `triggerEvent` and its client and server
variants. Hovering the name shows the contract and where it comes from.

Inside the quotes, completion lists the events reachable from that call: the
contracts declared with [`declare event`](/en/mta/apis-and-events) first, with
their parameters, then the names created with `addEvent`, then the catalog. A
cross-environment trigger lists the events of the side it targets, so
`triggerClientEvent(root, '` offers client events from a server file.

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

It also handles `workspace/didChangeWatchedFiles`: a file the client reports as
created or changed is read from disk and analyzed, and a deleted one drops its
declarations before diagnostics are republished. Registering those watchers is
the client's half — a client that registers none keeps what the initial scan
found plus whatever you open.

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
4. **File watchers** — optional, over `**/*.luam`, `.luam.manifest` and `.env*`,
   so a change made outside the editor reaches the server.

There is no configuration section the server requires; the settings listed under
[Editors](/en/tooling/editors) belong to the VS Code extension, not to the
protocol.

## Reporting a problem

Set the client's trace level to `verbose` (`luam.trace.server` in VS Code), then
attach the trace together with the output of `luam doctor`.
