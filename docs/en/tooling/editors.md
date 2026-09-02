# Editors

The **Luam** extension starts a language server built on the same frontend the CLI
uses, so the editor and the build never disagree about a file.

## What you get

| Feature | Details |
| --- | --- |
| Syntax highlighting | `.luam` files, including type annotations, `#!` directives and template strings. |
| Semantic highlighting | An MTA native, a Lua library call, a method and one of your own functions each read differently, and a native carries the environment it belongs to. |
| Themes | `Luam Dark` and `Luam Light`, generated from one role table shared with the Zed, Neovim and TextMate exports. |
| Diagnostics | On open and on every keystroke, cleared when you fix the file. |
| Completion | Scope symbols, workspace globals, MTA APIs scoped to the file's environment, keywords. |
| Member completion | `.` completes fields and static methods; `:` completes instance methods, including inherited MTA members. |
| Table literal completion | Where a key belongs inside a literal annotated with a record type, the list is the keys that type still allows and nothing else: the keys already written are removed, and a written discriminant narrows a union to the members that still match. Where a value belongs, the scope is offered in full. |
| Directives | After `#!`, completes the environment and strictness directives, each with what it does. |
| Class headers | After `class Name `, completes `extends` and `implements`, then the declared classes or interfaces that can follow. |
| Class bodies | Inside a class body, completes `static` and — while the class has none — a `constructor` snippet. Neither is offered at the top level or inside a method body. |
| Argument ranking | Inside a call, candidates matching the expected parameter type sort first, then functions returning it. |
| Events | Inside the quotes, completes the events reachable from the call; the handler and the payload of a known event carry its typed parameters. |
| Hover | Declared or inferred type, function signature, the environment of an MTA API, and the contract of an event. |
| Documentation hover | The `#` comment lines directly above any declaration — function, method, class, interface, enum, type alias, declared event, field, local or global — appear under its signature, at the declaration and at every use. Decorators between the comment and the declaration do not break the pair. |
| Keyword hover | `self` carries the class it is bound to and the shape of that class; `super(...)` carries how the parent implementation is selected; `static` carries what it puts on the class value and the diagnostics that report reading across the split. |
| MTA class hover | A class name — `Player`, `Element`, `Vehicle` — carries what the class is, the chain it inherits, how much surface it has in that environment and whether it is callable. It describes the class instead of listing its members. |
| Decorator hover | The exact members the decorator generates at that site, where it may sit, and the diagnostics it can raise. |
| Navigation | Go to definition, find references, and rename — across files for globals. |
| Workspace symbols | `Ctrl+T` finds a class, an interface, an enum, a type alias, a function or a declared event anywhere in the project, including files you never opened. Each result carries the environment of the file it lives in. |
| Quick fixes | A diagnostic with exactly one correct repair offers it on the lightbulb. See [the list](#quick-fixes). |
| Formatting | Format the document or the selection, with format-on-save. The style is [Formatting](/en/reference/formatting). |
| Inlay hints | What the checker inferred, shown inline: the type of a local, the return type of a function, and the type a callback parameter was given by the call it was passed to. See [the kinds](#inlay-hints). |

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
code --install-extension luam-%LUAM_VERSION%.vsix
cursor --install-extension luam-%LUAM_VERSION%.vsix
codium --install-extension luam-%LUAM_VERSION%.vsix
windsurf --install-extension luam-%LUAM_VERSION%.vsix
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

The extension activates when the workspace holds a `.luam.manifest`, a
[`.luam.formatter`](/en/reference/formatter-file) or any `.luam` file, so **open
your resource folder as the workspace root**. It watches `**/*.luam`,
`.luam.manifest`, `.luam.formatter` and `.env*`, so files changed outside the
editor still reach the server.

Each of the three gets its own file icon and its own language: `.luam` sources,
the manifest, and the formatter file. The manifest and the formatter file share
the same dialect and the same highlighting; they are separate languages so the
file tree tells them apart at a glance.

## Commands

| Command | Shortcut | What it does |
| --- | --- | --- |
| **Luam: Ensure Resource** | `Ctrl+Alt+E` (`Cmd+Alt+E`) | Runs `luam ensure` in a terminal for the current project. |
| **Luam: Restart Language Server** | — | Restarts the server when it gets confused. |
| **Luam: Rescan Workspace** | — | Rebuilds the index from disk after files change outside the editor. |

## Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `luam.cliPath` | `"luam"` | Command used to run the CLI. Point it at a bundle to test an unreleased build. |
| `luam.ensureWatch` | `true` | Pass `--watch` when the ensure command runs. |
| `luam.formatting` | `true` | Format `.luam` with the language server. Turn it off to leave formatting to another tool, or to none — the server stops being asked, so `Shift+Alt+F` and format-on-save both go quiet. |
| `luam.inlayHints.localTypes` | `true` | Show the inferred type of a local declared without an annotation. |
| `luam.inlayHints.returnTypes` | `true` | Show the inferred return type of a function declared without a return annotation. |
| `luam.inlayHints.callbackParameterTypes` | `true` | Show the type a callback parameter was given by the call it was passed to. |
| `luam.inlayHints.parameterNames` | `false` | Show the parameter name in front of a literal argument at a call site. |
| `luam.semanticHighlighting` | `true` | Colour Luam with the semantic tokens the server serves. Turn it off to keep only the grammar layer. |
| `luam.trace.server` | `"off"` | Trace LSP traffic. Set to `"verbose"` when reporting a bug. |

Changing any `luam.inlayHints.*` switch restarts the language server, because the
server reads them once when the client connects. The restart is the same one
**Luam: Restart Language Server** performs, and it costs one workspace scan.

## Formatting

The server formats a whole document and a selection. The extension already makes
itself the default formatter for `.luam`, so turning format-on-save on is one
setting:

```json
{
    "[luam]": {
        "editor.formatOnSave": true
    }
}
```

A file that does not parse yields no edits, so saving mid-edit never mangles it.
[Formatting](/en/reference/formatting) is the style it writes.

## Inlay hints

Luam erases every annotation, so nothing the checker inferred survives into the
output. Inlay hints put it back on screen: the type is shown where it would have
been written, greyed out, and it is not part of the file.

| Kind | Shown where | You see |
| --- | --- | --- |
| Local type | A `local` with an initializer and no annotation | `local count` becomes `local count: number` |
| Return type | A function, method or callback with no return annotation | `function total()` becomes `function total(): number` |
| Callback parameter | A parameter typed by the call the callback was passed to | `function (player)` becomes `function (player: Player)` |
| Parameter name | A **literal** argument at a call site | `setTimer(tick, 1000, 0)` becomes `setTimer(tick, timeInterval: 1000, timesToExecute: 0)` |

Three rules keep them out of the way:

- An annotated declaration shows nothing. The hint only ever fills a gap.
- A hint never reads `any`. Taking space to report that the checker knows
  nothing is worse than staying quiet.
- A file that does not parse yields no hints, the same rule formatting follows.

A `local` that destructures a multi-return call is hinted name by name, the way
[functions](/en/language/functions#multi-return) says each target gets
its own type. Given `function triple(): (number, string, boolean)`,
`local a, b, c = triple()` reads `a: number`, `b: string` and `c: boolean` — three
hints on one line, not the whole tuple on the first name. The same holds for the
catalog: `local cX, cY, cZ = getVehicleComponentPosition(...)` reads `number` on
each of the three.

Two cases follow from Lua's own adjust rules rather than from the hint:

- A name that stands alone takes the first value and nothing else, so
  `local only = triple()` reads `number`, not `(number, string, boolean)`.
- A call anywhere but last in the value list contributes its first value only, so
  `local x, y = 1, triple()` reads `number` twice.

A hint and a hover on the same name always render the same type: both go through
the checker's own renderer.

Parameter names are the one kind that is **off by default**. The other three show
what was inferred; this one restates what you can already look up, and on dense
code it costs more than it gives.

## Quick fixes

A quick fix is offered only where exactly one repair is correct. A repair that
would be a guess — which declared key you meant, which environment a file
belongs to — is left to you, because accepting a plausible wrong edit is worse
than typing the right one.

| Diagnostic | The fix |
| --- | --- |
| `parse-optional-position` | Moves the `?` from the type onto the name. |
| `parse-redundant-optional` | Deletes the `?` after the type, keeping the one on the name. |
| `check-invalid-super` | Rewrites `self:super(...)` as `super(...)`. |
| `check-static-receiver` | Reads the static member with a dot instead of a colon. |
| `check-native-constructor` | Rewrites `Name.new(...)` as `new Name(...)`. |
| `check-explicit-self-parameter` | Removes the `self` parameter from the method. |

## Colours

The extension ships `Luam Dark` and `Luam Light`, generated from one role
table so every editor reads Luam the same way. Installing the extension does
not change your colours — pick the theme from **File → Preferences → Theme →
Color Theme**. The rule the theme teaches, and every element it paints, is on
[The Luam theme](/en/tooling/theme).

| Editor | How to install the theme | What it colours |
| --- | --- | --- |
| VS Code and its forks | Included with the extension; pick it in the theme picker. | Everything: the grammar layer and the semantic layer. |
| Zed | Copy `packages/theme/dist-themes/luam-zed.json` into `~/.config/zed/themes/`. | The base layer; register the language server first. |
| Neovim | Copy `packages/theme/dist-themes/luam.lua` onto your runtime path and call `require('luam').setup()`. | Everything the server reports, including the environment of a native. |
| Sublime Text and TextMate | Install `packages/theme/dist-themes/luam-dark.tmTheme` or `luam-light.tmTheme` alongside the `.tmLanguage.json` grammars. | The grammar layer only. |

The TextMate format has no semantic tokens, so in that family an MTA native and
one of your own functions share a colour, as do a parameter and a local. That is
the limit of the format, not a defect in the theme.

Zed and Neovim both need the language server configured before any of this
applies — see [Language server](/en/tooling/language-server).

### JetBrains

There is no Luam colour scheme for the JetBrains IDEs. Their scheme format is
`.icls`, their highlighting comes from a language plugin rather than from a
grammar, and the community IDEs do not map LSP semantic tokens onto a colour
scheme without one. Shipping an `.icls` that coloured nothing Luam-specific
would be a worse promise than shipping nothing. The question reopens if a Luam
plugin is ever built.

## What a change re-checks

Editing a file republishes diagnostics for that file. The other files are
re-analyzed only when the edit changes what the file **declares** — a class, an
interface, an enum, or a global, including the type of any member. A body edit
costs one file.

A declaration edit costs the files that reach that declaration, and only those.
The server follows each name to the file that declares it, then through that
file's own superclasses, interfaces and member types, so an indirect parent
still invalidates. A file that never names what changed is left alone, however
many files share its environment.

Nothing here waits for a file to be opened. The server scans the workspace when
it starts and the extension watches the file patterns above, so a file created,
moved or deleted outside the editor reaches it without a restart. **Luam: Rescan
Workspace** rebuilds the index from disk if a change slipped past the watcher,
and **Luam: Restart Language Server** is the way out if the server and the
project still disagree.

None of this reaches a change to the server itself. The editor runs the server
bundled into the extension it has installed, so a fix to hover, completion or
diagnostics lands only after the extension is reinstalled and the window
reloaded — **Developer: Reload Window**. Until then the editor keeps answering
the way the installed build answers, however current the checkout is.
