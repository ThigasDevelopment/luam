# Changelog

Notable changes to Luam, newest first. Every heading below a released
version names the change set that shipped with it, and the date matches the
tag for that release. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Manual changes live in the documentation changelog, in
[English](docs/en/changelog.md) and
[Portuguese (Brazil)](docs/pt-br/changelog.md).

Releases before `0.2.0` were never published, so the work of milestones 1 to
13 is listed under `0.2.0`, the first release on npm.

## Unreleased

### Added

- Completion closes an open block and scaffolds a whole one. The closer item
  writes `then .. end`, `do .. end` or `until condition` on the block the
  cursor sits in and lands on the indented line between them, and the scaffold
  writes the whole block — `if`, `for` in both forms, `while`, `repeat`,
  `do` and `function` — from the word that opens it at a statement start. A
  closer is preselected only while the block is still unclosed, and a client
  without snippet support receives the block as plain text. The block scanner
  lives in the language server, so every LSP client gets it, not one editor.

## 1.0.1 - 2026-09-03

### Added

- `async function` compiles its body into a coroutine the promise scheduler
  drives, so `await` and `sleep` work anywhere inside it without the author
  constructing a pool. The return annotation is the inner type:
  `async function f(): number` has the signature `f(): Promise<number>`, and
  `local value = await f()` binds the resolved value with that type.
- `async` and `await` are reserved words. Both remain legal as property names —
  `value.async`, `Threads.await` — like every other reserved word, and naming a
  local or a parameter with either is `parse-reserved-name`.
- A promise runtime, `promise.lua`: `new Promise(executor)`, `Promise.resolve`,
  `Promise.reject`, `Promise.all`, `Promise.race`, `Promise.settle`,
  `promise:next`, `promise:catch`, and `delay(milliseconds)`. A settle fires
  its handlers once, a trailing `nil` survives the round trip, an executor that
  throws rejects, and every `coroutine.resume` result is read.
- `Threads` and `Async` run on that scheduler: one pulse timer for the runtime,
  the frame budget and the three scheduling styles unchanged. `pool:add(fn)`
  still returns the job id first and now returns a promise second, as do
  `Async.map`, `Async.iterate` and `Async.foreach`. A failing job rejects its
  promise instead of raising out of the timer callback.
- Four diagnostics: `check-await-outside-async`, `check-await-non-promise`,
  `check-async-return-annotation`, and the `check-sleep-outside-async` warning.

### Changed

- `sleep` moved from `threads.lua` to `promise.lua` and dispatches on the
  coroutine it runs in: a timer inside an async function, the pool pulse inside a
  `Threads` job, and an actionable error anywhere else. Because MTA never fires a
  timer sooner than 50ms, `sleep(0)` inside an async function resumes on the next
  tick.
- `PRIORITIES.extreme` no longer asks `setTimer` for a 0ms interval, which MTA
  refuses. A pool now throttles itself against the shared pulse, so `extreme`
  means every pulse.

## 1.0.0 - 2026-09-02

### Added

- A `type` alias now reaches the whole project, the way an `interface`, a
  `class` and an `enum` already did. Two declarations of one alias name are
  `check-duplicate-type`.
- An `interface` takes type parameters, with the constraint syntax a class and
  an alias already accept. A member is substituted where it is read, `implements`
  is checked against the substituted contract, and a wrong argument count is the
  `check-generic-arity` the other two forms report.
- A global assignment at the top level of a file carries a type —
  `network?: Network = nil` — and that annotation is the contract every later
  assignment and every other file is checked against. The annotation is erased.
- A project function declares several return values as a parenthesised list,
  `function f(): (number, number, number)`. Each `return` is checked element by
  element, and the call site distributes exactly as an MTA catalog call does. A
  list written anywhere but a return type is `check-tuple-position`.
- An `interface`, an object type and a `class` declare a key an identifier
  cannot spell: `['medium:20']: DxFont`. It is read through the index form,
  offered in completion with its quotes, and emitted quoted in a class body.
- A `fun` type takes an optional parameter by name, `fun(reason?: string): void`,
  which lowers the type's required arity. Hover prints the marker on the name.
- Three warnings for a declaration that overwrites something the compiler models:
  `check-shadowed-api` for an MTA API, `check-shadowed-helper` for a standard
  library member an object extension lowers to, and `check-implicit-global` for
  an assignment that creates an undeclared global — the last behind
  `compiler = { noImplicitGlobals = true }`, off by default.
- [Porting a Lua resource](https://thigasdevelopment.github.io/luam/en/guide/porting)
  documents what converting an existing MTA resource costs, and a compiler corpus
  keeps every shape it names.

### Changed

- `{}` initialises **any** map. The empty literal was compared against the map's
  key type, so `table<number, Vehicle>` and `table<Ped, Data>` rejected it while
  `table<string, number>` accepted it.
- `map[key] = nil` and `map.key = nil` delete an entry. `nil` is accepted on the
  right of an assignment whose target is an index or a property on a map, an
  array or `table`; everywhere else it still reports, and a read is unchanged.
- A final argument that is a call of unknown return arity — `f(unpack(t))` —
  spreads into the rest of the list, so the minimum is not checked and the
  maximum counts only the arguments before it.
- A parameter positioned at or beyond a signature's required-argument count
  accepts `nil`, on the procedural catalog, the OOP surface and the runtime
  globals alike. Forwarding an optional value into an API that already accepts
  none compiles.
- A partial table literal assigned to a record, interface or class-typed target
  is completed by later assignments in the same block; a key still missing when
  the value escapes or the block ends is `check-incomplete-record`. An inferred
  literal that a later statement extends widens to include the key.
- An unannotated table literal widens its members, so `local shape = { x = 0 }`
  infers `{ x: number }` and can be reassigned with computed values. Widening
  recurses through a nested literal, an array element and a union member.
- `RedisAdapter:connect()` on an instance member is now `check-class-receiver`,
  whose message names instantiating with `new` instead of prescribing a dotted
  call that does not work. A genuinely static member keeps `check-static-receiver`.
- A reserved word in a name position is `parse-reserved-name`, the parser
  recovers at the word, and the surrounding declaration still registers. One
  reserved parameter name produced eight diagnostics and a cross-file
  `check-unknown-member`; it now produces two and nothing downstream.
- A `shared` file now sees the shared MTA surface plus the server and client
  ones, and reports **nothing** for a side-restricted API, event, project
  declaration or MTA OOP member. A module that decides its own side at runtime
  compiles in one file, clean, with the real types of both surfaces — so
  `localPlayer` is a `Player` and `triggerServerEvent()` with no arguments is
  still `check-argument-count`. A `server` or `client` file is unchanged, and a
  `shared` file importing a `server` or `client` module is still an error. The
  emitted Lua, the line map and the generated manifest are unchanged.
- In a `shared` file the editor offers the shared APIs first and the two sides
  after them, each carrying its side in the completion detail, and hover on a
  side-restricted name adds a line naming its side. With no diagnostic, these
  labels are where the side is reported.
- Hovering a value now lists the fields of its type. A local, a parameter, a
  field or a global typed by a `type` alias, an `interface`, a class or an
  inline object type carries that type's fields under the signature — one level
  deep, optional fields keeping their `?`, capped at 24 with a `# N more` line.
  A value typed `string`, `number`, `any`, `table` or a function is unchanged.
  `parameter props: NetworkProps` stops being a name the author has to go look
  up.

### Fixed

- Hovering a property answered with an unrelated declaration that happened to
  share its name. With a `class Network { password: string }` anywhere in the
  file, hovering `props.password` — where `props` is typed by a `type` alias
  declaring `password?: string` — reported the class field. It now reports the
  type the checker gave the access, `string?`, and deleting the class no longer
  changes the answer. Definition and rename on that property no longer reach the
  class field either. A member of a class instance, of an MTA element, of a
  library and of an enum resolves as it did before, and `self.password` still
  answers with the class field.
- A property narrowed by a guard hovered with its declared type. Inside
  `if props.password and type(props.password) == 'string' then`, the
  assignment's `props.password` now reports `string` and names the declared type
  under it, `narrowed from string?`.
- A `local` that destructures a multi-return call labelled the whole tuple on
  the first name and left every other name blank.
  `local cX, cY, cZ = getVehicleComponentPosition(vehicle, part, 'root')` showed
  `cX: (number, number, number)` and no hint at all on `cY` and `cZ`, and
  hovering `cY` answered `local cY`, with no type. Each name now answers
  `number` — in the inlay hint, in hover, in the completion detail and in both
  symbol outlines. `local only = f()` narrows to the first value instead of
  labelling the tuple, and a call anywhere but last in a value list contributes
  its first value alone. The checker was always right about this: the adjust
  rules now exist once, and the two places in the language server that paired a
  name with a value expression read that one distribution. The initializer text
  is shown on the first name the call covers, so `b` reads `local b: string`
  rather than claiming it holds `triple()`.

The editor picks these up only after the extension is reinstalled and the window
reloaded; until then it keeps answering the way the installed build answers. An
editor still running the 0.19.12 extension keeps the tuple on the first name and
the blank hints on the rest, however current the checkout is.

## 0.19.12 - 2026-08-31

### Added

- The catalog declares 221 MTA events against 203. The 18 the editor did not
  know include `onAccountCreate`, `onAccountRemove`, `onExplosion`, `onShutdown`,
  `onPlayerTeamChange`, `onPlayerTeleport`, `onPlayerWeaponReload`,
  `onResourceStateChange` and `onClientCoreCommand`. An event the catalog does
  not declare has no handler signature, so every one of its parameters was
  `any`.

### Fixed

- Event handler parameters are read from the MTA wiki rather than from the
  frozen upstream declarations, so a parameter carries the type and the name the
  wiki documents. `onChatMessage` gives its second parameter as `Element` rather
  than `any`, and `onPlayerPickupHit`, `onPlayerPickupLeave` and
  `onPlayerPickupUse` give theirs as `Pickup`.
- Seven signatures were short of the parameters MTA passes. `onVehicleExplode`
  declared none against the wiki's `withExplosion` and `player`; `onPlayerWasted`,
  `onPedWasted` and `onClientPlayerWasted` were missing `animGroup` and `animID`;
  `onDebugMessage` was missing `r`, `g` and `b`; `onPlayerPrivateMessage` was
  missing `content`.
- Four parameters carried names the wiki has renamed, which the generated
  documentation then attached to the wrong argument: `isMain`, `loss`,
  `bodypart` and `weapon` are now `isMainFrame`, `lossOrStealth`, `bodyPart` and
  `weaponID`.
- A wiki type spelled `double` maps to `number` instead of degrading to `any`,
  which corrects `onClientSoundBeat`.

## 0.19.11 - 2026-08-31

### Fixed

- A class field written with only a type reaches the generated class. A
  development build emitted a blank line where `name: Type;` was written, while
  a release build already emitted `name = nil`; the two paths now agree, on the
  line the field was written on, whatever separator the author wrote.
- A statement lowered to canonical Lua keeps the semicolon written after it. A
  multi-line statement holding a compound assignment left its `;` alone on the
  next line; the semicolon now lands on the generated statement, and no
  generated line is a bare `;`.
- A `new`, a template string and a native extension are lowered as expressions
  rather than as the statement holding them, so a development build keeps the
  layout written around them. A table literal spanning several lines with a
  `new` inside no longer collapses onto one line and leaves the rest blank.
- Hovering a member reports the type of the property under the cursor. The
  editor answered only for a project global, and matched the first member in the
  file with that name, so two tables sharing a property name reported the same
  type for both. A class instance, a table typed inline and an `interface` now
  answer too. When the property is a class or an `interface`, the hover carries
  its shape as well, looked up across the workspace and bounded by what the
  environment may reference.

## 0.19.10 - 2026-08-31

### Added

- Completion inside a table literal with a declared type offers only the keys
  that type still allows, dropping the ones already written. It offered every
  symbol in scope, so the editor knew the shape and would not say it, and the
  writer had to read the type declaration in another file to learn which keys
  were left. A key shared by more than one member of a union is typed as the
  union of what those members declare, and while more than one member still
  matches, every discriminant value is offered rather than the first one
  guessed.

## 0.19.9 - 2026-08-31

### Added

- The language server serves inlay hints for what it inferred and the source did
  not write: the type of a local, a parameter that took its type from context,
  and a return the signature left out. What the checker knew was visible only on
  hover, one symbol at a time, which made an inferred local read like an untyped
  one. Each kind is turned off on its own, so a reader who wants only parameter
  names is not paying for the rest, and the extension surfaces the settings and
  forwards them.

## 0.19.8 - 2026-08-31

### Added

- `luam format` writes the layout the language server already served, so the
  same formatting is reachable from an editor, a terminal and a pipeline.
  `--check` reports what differs and writes nothing, which is the form a gate
  uses.
- A build result can be emitted machine-readable, so a tool consumes diagnostics
  instead of parsing human text that was never a contract.
- `luam check --watch` rechecks on change, including a change to the manifest,
  rather than asking for a rerun.
- A project configures the formatter through `.luam.formatter`
  ([ADR-042](.claude/docs/adr/042-formatter-configuration-file.md)). The editor
  completes and hovers its fields, the file has its own grammar and icons, and
  the language server reads it like any other project setting.

### Fixed

- A call to a method a class does not declare is reported. `adapter:query(...)`
  on a class with no `query` compiled clean, and the failure moved to the
  server, where a nil call says nothing about which name was wrong. Member
  resolution now answers for a class value and for a typed field that holds one,
  walking the parent chain before deciding, so an inherited member is found
  rather than reported, and the message names the members the class does
  declare.

## 0.19.7 - 2026-08-31

### Added

- A Luam library is an npm package, listed in the new `libraries` manifest
  domain and compiled into the resource that names it. The compiler resolves the
  package from `node_modules`, reads the layout its `package.json` declares in a
  `luam` field, checks its sources with the project, and vendors the output to
  `libs/<package>/<environment>/` in tree layout or into the environment bundle
  ahead of the project's own modules. Nothing is fetched: installing is the
  developer's step, and a build with a populated `node_modules` and no network
  produces the same output. A missing package is `config-library-missing`, naming
  the install command; a malformed `luam` field, a duplicate entry, an escaping
  pattern and an unlisted `requires` entry each have their own diagnostic. Two
  libraries claiming one global on one side are `project-library-collision`, a
  library claiming an MTA name is the warning `project-library-shadows-api`, and
  a library that reads a project global is `project-library-project-reference`.
  The editor resolves libraries the same way, so the CLI and the LSP agree.

## 0.19.6 - 2026-08-31

### Added

- A function takes its own type parameters. `function identity<T>(value: T): T`
  parses, checks, infers the argument at the call site, accepts an explicit
  `identity<string>(...)`, enforces an `extends` constraint with the same
  diagnostic a class constraint produces, and leaves no trace in the generated
  Lua. A function expression and a class method take them the same way, and a
  method parameter shadows a class parameter of the same name.

### Fixed

- A class field written with only a type reaches the generated class. A
  development build emitted a blank line where `name: Type;` was written, while
  a release build already emitted `name = nil`; the two paths now agree, on the
  line the field was written on, whatever separator the author wrote.
- A statement lowered to canonical Lua keeps the semicolon written after it. A
  multi-line statement holding a compound assignment left its `;` alone on the
  next line; the semicolon now lands on the generated statement, and no
  generated line is a bare `;`.
- A `new`, a template string and a native extension are lowered as expressions
  rather than as the statement holding them, so a development build keeps the
  layout written around them. A table literal spanning several lines with a
  `new` inside no longer collapses onto one line and leaves the rest blank.
- Hovering a member reports the type of the property under the cursor. The
  editor answered only for a project global, and matched the first member in the
  file with that name, so two tables sharing a property name reported the same
  type for both. A class instance, a table typed inline and an `interface` now
  answer too. When the property is a class or an `interface`, the hover carries
  its shape as well, looked up across the workspace and bounded by what the
  environment may reference.
- A declared return type is enforced on every path. A function annotated with a
  concrete type that can reach its closing `end` without returning is now
  `check-missing-return` instead of silently handing the caller `nil`. An
  optional, `nil`, `void`, `any` or a union containing `nil` still tolerates it,
  and a loop that cannot fall through — `while true do` or
  `repeat ... until false` with no `break` — is not reported. Nothing in the
  repository was rejected by the new rule.

## 0.19.5 - 2026-08-28

### Changed

- The pipelines are reorganized around a written contract, and the merge gate is
  separated from the advisory signal: typecheck, test, build and docs decide
  whether a change may merge, while benchmark and audit report without blocking.
  Each unit is its own reusable workflow, every action is pinned, and a suite in
  `@luam/pipeline` asserts the contract so a workflow cannot drift from it
  silently. Contributions from forks are bounded by a recorded threat model
  rather than by convention.
- The project gains its contributor entry documents: `CONTRIBUTING.md`,
  `SECURITY.md` with a private channel for a vulnerability, `CODEOWNERS`, a pull
  request template, and issue forms for a bug, a proposal and a documentation
  problem. The manual gains a contributing page in both locales.

## 0.19.4 - 2026-08-28

### Changed

- Luam ships no debugger, and the CLI stays out of a running server. Debugging
  was never addressed in its own right: the only place the product said anything
  was the closing line of an entry about development logs, carrying none of the
  four labels the limitations page uses to separate what will change from what
  will not, so a reader could not tell whether a debugger was coming. It is
  answered now, and recorded as a design boundary rather than pending work. What
  a developer already has is unchanged: `luam dev` follows the local log and
  prints server records and relayed client output as one stream, with authored
  positions.
- How a third-party Luam library is distributed is settled: a library is an npm
  package, vendored into the resource that consumes it. Three constraints
  decided it. Fetching may not happen inside a build, because the compiler
  packages make no network calls and a build with no network still succeeds.
  MTA has no module system, so a library is either vendored or deployed as its
  own resource, and only the first is a distribution model. The manifest is a
  closed set of typed domains, so that is where a dependency is declared.
  Nothing is implemented yet: this release records the decision and changes no
  package behaviour.

## 0.19.3 - 2026-08-28

### Added

- `luam test` runs the tests a developer writes for their own resource. A file
  ending in `.test.luam` is compiled with the project and executed on a Lua 5.1
  interpreter found on `PATH` — `lua5.1`, `lua51`, `lua`, then `luajit` — pinned
  with `--lua <path>` or `LUAM_LUA`, and reported by `luam doctor`. The published
  CLI gained no dependency. Inside a test file, `describe`, `test`, `beforeEach`,
  `afterEach`, `expect` and `mta` are declared to the checker, so the editor
  understands a test the way it understands any other module, and a non-test file
  that calls `test` still reports an unknown global. Every MTA function is
  replaced by a stub that records its arguments and returns `nil`; `mta.returns`,
  `mta.stub` and `mta.calls` configure and read them. A stub records a call, it
  does not simulate MTA. A failing assertion reports `path:line:column` in the
  `.luam` source, and the command exits non-zero so CI can gate on it. Test files
  are excluded from `sources`, so `luam build` output is unchanged whether or not
  they exist, and `build`, `check` and `ensure` still execute no project code.

## 0.19.2 - 2026-08-28

### Added

- `luam test` runs the tests a developer writes for their own resource. A file
  ending in `.test.luam` is compiled with the project and executed on a Lua 5.1
  interpreter found on `PATH` — `lua5.1`, `lua51`, `lua`, then `luajit` — pinned
  with `--lua <path>` or `LUAM_LUA`, and reported by `luam doctor`. The published
  CLI gained no dependency. Inside a test file, `describe`, `test`, `beforeEach`,
  `afterEach`, `expect` and `mta` are declared to the checker, so the editor
  understands a test the way it understands any other module, and a non-test file
  that calls `test` still reports an unknown global. Every MTA function is
  replaced by a stub that records its arguments and returns `nil`; `mta.returns`,
  `mta.stub` and `mta.calls` configure and read them. A stub records a call, it
  does not simulate MTA. A failing assertion reports `path:line:column` in the
  `.luam` source, and the command exits non-zero so CI can gate on it. Test files
  are excluded from `sources`, so `luam build` output is unchanged whether or not
  they exist, and `build`, `check` and `ensure` still execute no project code.
- A value checked against an `interface` or a `class` now reports what a `type`
  alias already reported. An interface is satisfied structurally, so a record
  missing a member or carrying one at the wrong type is `check-type-mismatch`,
  and the message names the missing member. A class stays nominal: it fits its
  own class, any parent in its `extends` chain, and every interface it
  `implements`, and nothing else. A name the checker never resolved stays
  permissive in every position, which is what keeps the MTA element types and
  ambient declarations working.
- A formatter, served by the language server as document and range formatting,
  so format-on-save works in every editor the extension supports. It rewrites
  whitespace only — indentation, spacing and blank-line runs — and never moves a
  construct or re-wraps a line. A file that does not parse yields no edits, and
  the formatter re-reads what it produced and returns nothing rather than a
  result whose tokens or comments differ from the source. The style is recorded
  in the manual.
- `luam.formatting`, a setting that turns the formatter off. It gates the client
  the way `luam.semanticHighlighting` already gates semantic tokens: the language
  server stops being asked, so `Shift+Alt+F` and format-on-save both go quiet and
  another tool can own the layout.
- A keyword hover for `static`, and `static` in the completion offered inside a
  class body beside the `constructor` snippet. Neither appears at the top level
  or inside a method body, and the hover stays quiet for a field or a local named
  `static`, because the modifier is contextual. The `class` hover stopped saying
  static members and generic classes are unsupported — both shipped.
- Quick fixes for the six diagnostics that have exactly one correct repair:
  `parse-optional-position`, `parse-redundant-optional`, `check-invalid-super`,
  `check-static-receiver`, `check-native-constructor` and
  `check-explicit-self-parameter`. No other diagnostic offers an action, because
  a plausible wrong edit is worse than none.
- `name?: Type?` is `parse-redundant-optional`. The marker attaches to the name,
  and writing it in both places was the one spelling that slipped through
  silently — the parser reported only when the marker was on the type alone. The
  annotation now carries a single optional node, so hover and signature help stop
  echoing the form the rule exists to remove.
- Workspace symbols, answered from the language server's existing index without
  recompiling. A result carries the environment of the file it came from, so a
  `server` and a `client` declaration of the same name stay distinguishable.
- `receiver:method(...)` is checked when the receiver is an object type or a
  native library instance. Argument count and argument types are reported against
  the declared signature, and the call produces the declared return type instead
  of `any`. A first parameter named `self` is the receiver, so a method declared
  with one and a method declared without report the same arity. A receiver typed
  `any`, and a member the receiver's type does not declare, are unchanged.
- Three paired manual pages, in English and Portuguese: how a build works end to
  end, Luam beside Lua 5.1, Luau and TypeScript, and a migration guide covering
  every release since `0.2.0` that asks an author to change something. The
  landing page carries a short comparison and links to the full one.
- A per-page report link that opens a GitHub issue prefilled with the page URL,
  its language and the documented version. It requires an explicit submission,
  and no page sends anything in the background — there is no voting endpoint and
  no third-party analytics.
- `Luam: Rescan Workspace`, a command that rebuilds the language server index
  from disk without restarting the server.
- `luam config`, a command that derives a declaration file from the literal data
  in a native `config.lua`. It reads the file and never executes it, accepts
  top-level assignments of literals and table constructors, reports anything
  else with its position, and refuses to overwrite a declaration it did not
  generate ([ADR-036](.claude/docs/adr/036-config-declaration-extraction.md)).
  `check` and `build` are unchanged: `config.lua` is still copied verbatim and
  never compiled.
- A class declares a metamethod under its Lua name. `__tostring`, `__eq`,
  `__lt`, `__le`, `__len`, `__concat`, `__unm` and the arithmetic operators are
  exposed with a checked signature, inherited like any other member, and
  installed on the instance metatable by the class helper
  ([ADR-035](.claude/docs/adr/035-safe-class-metamethods.md)). `__index`,
  `__newindex`, `__call`, `__gc`, `__metatable` and `__mode` stay blocked, in
  the checker and in the helper. New diagnostics: `check-blocked-metamethod`
  and `check-invalid-metamethod`.
- `@Validated`, the one decorator that adds a runtime check. On a class it
  generates static `validate(value)` and `matches(value)` members that walk a
  value against the declared field types, with a fixed depth, entry-count and
  string-length limit, and a failure that names the path and the expected type
  but never the value
  ([ADR-034](.claude/docs/adr/034-opt-in-boundary-validation.md)). A field type
  with no runtime shape is `check-unreifiable-type`, reported before emit. A
  program that never writes the decorator emits no validation code, so erased
  annotations stay erased.
- An export contract. A build that exports anything writes one versioned JSON
  file per resource into the directory the new `contracts` manifest field names,
  default `.luam/contracts`, and reads the same directory for the contracts of
  the resources listed in `dependencies`. A `call(getResourceFromName('core'),
  'getBalance', ...)` or `exports.core:getBalance(...)` whose resource and export
  names are literal is then checked like any other call — arguments, count,
  return type and the side the export runs on
  ([ADR-033](.claude/docs/adr/033-resource-export-abi.md)). The contract stays
  outside the runnable resource, contracts are read as untrusted input, and a
  dynamic name still compiles unchecked. New diagnostics:
  `check-unknown-resource-export`, `check-resource-export-side` and
  `build-invalid-contract`.
- A class takes type parameters, the way a type alias already did. `class Box<T>`
  declares them, `Box<string>` uses them, `extends Box<T>` forwards them and
  `extends Box<string>` pins them, and `new Box('text')` infers them from the
  constructor call. A parameter may carry a constraint. Two specializations of
  one class no longer assign to each other, and everything erases: one class
  emits one implementation whatever it was specialized to
  ([ADR-032](.claude/docs/adr/032-erased-generic-classes.md)). New diagnostics:
  `check-generic-constraint` and `check-generic-depth`.

### Changed

- The development logs are documented as a boundary rather than a gap. There is
  no remote mode and none is planned: collecting logs from a server the CLI
  cannot read from disk would mean opening a connection to it, and the
  `transport` manifest field that once configured one was removed in favour of
  `ensure` syncing files and `dev --start-server` restarting the server it owns.
  `luam dev` reads the local server log, which is what makes structured records
  and source positions work.
- A narrowing fact now survives the block that established it when every path
  into the code after it agrees. A field refined in both arms of an `if`, a
  union an assignment narrowed to one member, a `while` that filled a missing
  value — each used to go back to its declared type at the closing `end`.
  Branches, guard clauses and loop invalidation are one mechanism now, a flow
  state with an explicit join and an explicit reachability bit
  ([ADR-031](.claude/docs/adr/031-flow-narrowing.md)). An `elseif` chain narrows
  like the nested `if` it stands for, which it did not before. What still does
  not carry is a condition stored in a variable, and an arbitrary call still
  does not drop a fact — the aliasing boundary is unchanged.
- A declaration edit now rechecks only the files that reach that declaration.
  The project cache used to key every module on a fingerprint of every
  declaration visible to its environment, so touching one shared class rebuilt
  the whole side. Checking now reports the ambient names each file reaches, and
  the cache keys a module on the transitive closure of the declarations behind
  those names. On a 1200-file project a leaf declaration edit costs what a body
  edit costs, instead of a near-full rebuild.
- The language server reruns the reverse closure of a changed declaration
  instead of every other open document, and reconciles files created or deleted
  while it was running rather than rebuilding the index on each watched-file
  event.

### Fixed

- The playground's no-JavaScript line had no text in either locale, because the
  string the component reads was never declared.

## 0.19.1 - 2026-08-27

### Added

- A class member declared `static` belongs to the class value instead of an
  instance. State that belongs to a class had to live in a file-level local or
  a global, outside the type that owns it, while MTA's own surface already drew
  the line. `static` is a contextual modifier, recognized only when a member
  name follows it on the same line, so a member or a local named `static` keeps
  working. The two spaces never mix: reading across them is
  `check-unknown-member` or `check-static-receiver`, and declaring one name in
  both is `check-duplicate-class-member`. Statics emit into the same class table
  in authored order and are reached through `getClass`, so they inherit and
  share a slot with no new runtime helper
  ([ADR-028](.claude/docs/adr/028-static-class-members.md)). The editor follows
  the same split: completion on a class name offers its statics and refuses them
  after a colon, signature help and the argument matcher resolve a static
  through the class value, and a static method body no longer declares `self`.
- Every MTA event carries its description on hover. Event pages the wiki wraps
  in `{{Added feature/item}}` parsed as an empty intro, which left 16 events
  showing only a signature and swallowed 97 function summaries; the template is
  now on the describing list. The parameter bullets follow the handler signature
  instead of the page — names match exactly, then case-insensitively, then by
  position when the counts agree — so the parameters the wiki documents beyond
  the signature no longer reach the hover, and a `Note` template no longer reads
  as a parameter of its own.

### Changed

- Completion at an argument offers only the values that argument can accept. It
  ranked candidates against the expected parameter type but still listed every
  one of them, so an element argument buried the three elements in scope under
  hundreds of unrelated globals. Values whose type cannot reach the expectation
  are dropped, along with functions whose return type cannot and the keywords
  that cannot open an expression; anything untyped, `any`, or `nil` stays, so
  the filter only removes what is certainly wrong. The event-only globals stop
  leaking too: `source`, `client` and `eventName` appear inside a handler body
  and nowhere else, `sourceTimer` only inside a timer callback, and a named
  function used as a handler counts as a handler body.

### Fixed

- Hovering a client-only class in a server file said its members were not
  available and then listed a surface of them anyway, counting what the class
  inherits from a shared ancestor. It became visible once `GuiElement` gained a
  parent, which put `Element`'s shared members in reach of every GUI widget.
- `guiCreateWindow`, `dxCreateFont`, `playSound` and 16 other constructors
  return the class they create instead of a generic `Element`. The wiki types
  every element-returning constructor as `Element`, so completion and hover
  could not tell what a call produced. The override carries a return type
  applied in the normalizer, after the wiki and upstream declarations merge,
  which keeps eleven arity classifications intact. Ten element types also
  carried no parent, `GuiElement` among them, so no GUI widget reached
  `Element` and every one of them was rejected wherever an element was expected.

## 0.19.0 - 2026-08-27

### Added

- Hovering an MTA class name explains the class. `Player`, `Element`, `Vehicle`
  and the other 54 classes each carry a written description, the chain they
  inherit, how many instance members and static methods they reach in that
  file's environment, how many of those members are inherited, and whether the
  class is callable as a constructor. It describes the class instead of dumping
  its members, works on a type annotation as well as on a static receiver, says
  when a client class is out of reach in a server file, and with `compiler.oop`
  off it still explains the class and names the restriction. The same
  descriptions ride along with the class in completion.

- A type guard now refines a stable access path, not only a name. A path is a
  name followed by literal fields, so `if self.connection ~= nil then` refines
  the field inside the block, `self.socket.handle` refines a nested one, and
  `self.state.kind == 'ready'` discriminates a union behind a path. Copying the
  field into a local first is no longer required.
- The refinement is dropped on every write the checker can name: to the path,
  to a prefix of it, to a path below it, to its root, inside a loop body, or
  inside a function declared in the same block. A call or a dynamic index in
  the path produces no refinement at all. A field cleared through a second
  reference to the same table is a recorded boundary, not a diagnostic.
- A template interpolation rooted at `self` now binds the value it reads
  instead of the receiver. `${self.version}` emits
  `{ version = self.version }` and `${self.person.data.name}` emits
  `{ person_data_name = self.person.data.name }`, so the context table carries
  only what the template uses and the runtime resolves one key instead of
  walking the path. A joined name that collides with another root in the same
  template keeps `{ self = self }`.
- A fallback now marks an interpolated name optional. `${missing:Guest}`
  compiles where `missing` is not declared, because the fallback already states
  that the value may be missing. Without one the name still has to be in scope.
- The editor resolves every field of an interpolated path, not only its root.
  Hover, go to definition, and the semantic colour of `version` inside
  `${self.version}` now match the same field written outside the string.
- Hover on a declaration with a literal value names the value and its size,
  as in `field version: string = '0.18.3' # 6 bytes`. The count is in UTF-8
  bytes, which is what a Lua string holds, so `'Assunção'` reads 10 rather
  than 8.

### Changed

- An interpolation that is not a name or a member path is reported on its own
  terms rather than as a name that is not in scope, and it stays an error with
  or without a fallback.
- A deeper `self` path in a template is now read at the call site. A nil
  segment in the middle raises `attempt to index a nil value` where the runtime
  helper used to stop and return the fallback.

### Fixed

- Instantiating a class whose parent never arrives names the parent again. The
  class helper cleared its own pending mark by removing the field, so the read
  fell through the metatable to the parent still marked pending, and the error
  blamed the child — `Class Child is not defined` instead of
  `Class Child extends Ghost, which is not defined`. The helper now clears the
  mark to `false`, which shadows the parent. The runtime helpers are covered by
  a real Lua VM from now on, so the class helper is exercised as MTA runs it.

## 0.18.2 - 2026-08-27

### Fixed

- A class field declared with a type and no default now generates
  `name = nil` on the line it was written on. It used to generate nothing,
  which left a blank line inside the class and hid the declared shape from the
  Lua a reader opens.
- The example resource no longer carries a `transport` table in
  `.luam.manifest`. The field was removed with the `ensure` rework and reports
  `config-removed-field`.

## 0.18.1 - 2026-08-27

### Changed

- The theme paints an MTA native blue and italic — the same blue as a call to
  one of your own functions, italic because you did not write it — instead of
  the violet it shared with the Lua standard library. Violet now marks only
  keywords and the stdlib. Every generated target follows: VS Code, Zed,
  Neovim, and the two `.tmTheme` files.

### Added

- The README renders the introductory example through `Luam Dark` and
  `Luam Light`, generated from the committed grammar and theme files rather
  than screenshotted by hand.

## 0.18.0 - 2026-08-25

### Added

- A class is now a type everywhere in its file. `extends` may name a parent
  written further down, and a function may instantiate a class declared after
  it, so a file can be ordered by meaning instead of by inheritance. The
  checker collects every class header before it checks a statement; the runtime
  helper links a child to a pending shell of the parent and fills that same
  table when the parent's declaration runs
  ([ADR-024](.claude/docs/adr/024-two-phase-class-declaration.md)).
  What did not move is the runtime: a class declaration is a statement, so
  instantiating a class before its line has run is the new
  `check-class-before-declaration`, reported only where the code is a top-level
  effect — a top-level statement or a field initializer. Inside a function body
  `new` on a class declared further down is accepted. An inheritance cycle,
  which the old ordering rule made impossible, is the new `check-class-cycle`.
  No generated line moves or appears: a file that compiled before emits exactly
  the same Lua.

### Changed

- The manifest table that holds `strict`, `oop`, `noUnusedLocals`,
  `noUnusedParameters` and `warningsAsErrors` is now named `compiler` instead of
  `compilerOptions`. The members and their defaults are unchanged. The old name
  is not aliased: `compilerOptions` reports `config-removed-field` and names
  `compiler` as its replacement, so a stale manifest fails loudly instead of
  building with the defaults. Rename the table to migrate.

- Hovering `self` or a decorator now answers what it is, not just what it is
  named. `self` was one line, `self: Round`, next to a `super(...)` hover that
  explains itself in full; it now carries the class it is bound to and that
  class shape, where it is bound, and the two diagnostics that govern it, and
  outside a class member it says it is unbound instead of showing nothing. A
  decorator opens with the exact API it produces at that site — `isAdmin():
  boolean` for a `@Getter` on a boolean field, the whole `AccountBuilder` class
  for a `@Builder`, the decorated member itself for the three that generate
  nothing — followed by where it may sit, the shape it generates, how it
  behaves, and the diagnostics it can raise. A decorator on a method had no
  hover at all and now has one, and the same text backs the `@` completion.
  Where a decorator may sit is read from one catalog the checker validates
  against, so the editor text and the rule cannot drift apart.

- Every published limitation now opens with one label — planned, design
  boundary, upstream constraint, or platform constraint — so a reader can tell
  what is going to move from what is not. Three boundaries stop being implicit
  and are recorded as decisions: annotations are erased and no implicit runtime
  guard is ever generated for them
  ([ADR-021](.claude/docs/adr/021-erased-type-annotations.md)), `config.lua` is never
  parsed or executed by a build
  ([ADR-022](.claude/docs/adr/022-opaque-native-configuration.md)), and the environment
  is a property of the file because MTA assigns a side to each `<script>` entry
  ([ADR-023](.claude/docs/adr/023-file-level-environments.md)). Each records what a
  future opt-in feature may and may not change.

### Fixed

- The README, the troubleshooting guide and the editor guide claimed Luam does
  no type narrowing, and that the language server never re-checks an open file
  when a different one changes. Both had been false for releases: a guard
  narrows a name, an `or` drops the nil on its left, and an edit that changes
  what a file declares re-analyzes every file that can see the declaration. The
  same pages now describe what actually holds — a field keeps its declared type,
  and the re-check is wider than it needs to be rather than absent — and say
  that the server scans the workspace and watches `.luam`, `.luam.manifest` and
  `.env*` instead of telling the reader to restart it.
- Two recipes annotated a local `any` and blamed the missing narrowing.
  `tonumber(amount) or MAX_HEALTH` is a `number` and `scores[name] or 0` is a
  `number`, so both now carry the real type.

### Added

- `pnpm docs:limitations` fails the documentation build when a limitation
  carries no label, when the two locales disagree about one, when a limitation
  points at an owning task the roadmap has already closed, or when one of the
  corrected claims comes back. It runs in the documentation workflow and in
  `pnpm docs:verify`.

## 0.17.0 - 2026-08-25

### Added

- Accepting an event name inside `addEventHandler` now writes the whole handler.
  Typing `addEventHandler('onPlayerLo` and taking the completion produces the
  call, `root`, and a `function` whose parameters carry the event's real names
  and types, with the cursor left in the body. It keeps the quote style you
  typed, nests under the indentation of the line it lands on, and leaves a call
  that already carries a handler untouched. A client without snippet support
  gets the same scaffolding without the tab stop.
- `source`, `client`, `eventName`, `sourceResource`, and `sourceResourceRoot`
  rank above everything else while the cursor is inside an event handler body,
  including inside a nested call.
- 43 string parameters carry the exact values MTA accepts instead of a bare
  `string`. Typing `engineSetPoolCapacity('` now lists the twenty engine pools,
  `createMarker` lists `'checkpoint' | 'ring' | 'cylinder' | 'arrow' | 'corona'`,
  and `dxDrawText` lists the alignments and the ten built-in fonts. A value the
  enumeration does not carry reports `check-type-mismatch`, so
  `engineSetPoolCapacity('player', 1000)` is now an error rather than a silent
  runtime failure. The values are read from the wiki templates and parameter
  lists that document them, carried in the committed snapshot, and a curated map
  records which parameter each list describes.
  At such an argument the completion offers those values and nothing else, ready
  quoted, whether or not a quote has been typed yet. An argument whose union also
  accepts an element keeps the rest of the list, so a variable holding one stays
  completable.
  `dxDrawText`'s `font` takes a built-in name or a `DxFont`; because any value
  is assignable to an element type, that parameter gains the suggestions without
  the check.
- The MTA catalog is generated from the MTA wiki again. It came from
  `mtasa-lua-types`, which stopped being published on 2023-02-05, so the
  declarations had been frozen against MTA as it stood three and a half years
  ago. `packages/mta-types/data/mta-wiki.json` is now a committed,
  revision-stamped snapshot of every page the wiki's two curated function lists
  name, and generation reads that file and nothing else — a clone with no
  network still regenerates the catalog byte for byte.
- 119 MTA functions that MTA has shipped since 2023 are declared for the first
  time, among them engine streaming and IMG, Discord Rich Presence, PostFX,
  `createBuilding`, and the HTTP server. The catalog covers 1413 declarations
  against 1294, up to MTA 1.7.0.
- 100 multi-return functions such as `getElementPosition` now return a tuple
  instead of `any`, because the wiki states the return list directly.
- Catalog drift now fails the test suite. A test compares the snapshot's
  function list to the catalog and fails on any missing function or environment
  disagreement an allowlist does not cover, and reports the MTA release the
  snapshot covers.
- A scheduled workflow refreshes the snapshot weekly and opens a pull request
  summarising the diff by blast radius, linking each entry to the wiki revision
  it came from. It never merges one, refuses to write a catalog when the parse
  degrades or the diff looks like upstream breakage, and never deletes a
  declaration because a page was blanked.

### Fixed

- 24 functions named the wrong environment, so the checker rejected code MTA
  accepts. `getPlayerSerial`, `getControlState`, `setControlState`,
  `getAllElementData`, `setWorldSpecialPropertyEnabled`, `addVehicleSirens`,
  `breakObject`, and the rest gained a second side in a later MTA release and
  are now `shared`. `usePickup` moves the other way, to server only, which can
  reject a client call that compiles today.
- 93 existing signatures gained real types where the second-hand source had
  `any`, and picked up the optional parameters MTA has added since — among them
  `setElementData`, `createVehicle`, `processLineOfSight`, `shutdown`,
  `injectBrowserMouseDown`, and `reloadBrowserPage`.
- An optional interface member is optional for the class that implements it. A
  class omitting `name?: string` no longer reports
  `check-unimplemented-interface`; declaring it with the wrong type still does.

## 0.16.0 - 2026-08-25

### The Generated Lua Is The File You Wrote

#### Added

- A readable build now emits one line of Lua for every line of Luam, and copies
  through everything Lua 5.1 already accepts: indentation, blank lines, the space
  before a parenthesis, the quotes, and the semicolons you wrote. `luam dev` and
  `luam ensure` are always in this form, and `luam build` uses it whenever
  `output.minify` is `false`. There is no manifest field for it, because turning
  minification off is already the request for output meant to be read.
- A declaration with no runtime form stays visible instead of leaving a gap. An
  `interface`, `type`, `declare`, or `declare event` becomes a Lua block comment
  over the lines it occupied, its trailing semicolon inside the comment. An
  inline type annotation stays erased, so a generated signature reads as plain
  Lua.
- A build directive is a comment now, not a blank line. `#!client` reads
  `--!client` in the generated Lua, so the environment of a file is legible in
  the file itself and not only in `meta.xml`.
- An `enum` and a `class` keep the shape they were written in. A multi-line enum
  stays multi-line over its own lines with its members quoted, and a class keeps
  its body spacing and the semicolons written inside it while still receiving the
  quoted name, the implicit `self` parameter, and the member separators.

#### Fixed

- An erased declaration written with a trailing semicolon emitted a bare `;`.
  Lua 5.1 has no empty statement, so `interface I { name: string };` produced a
  file the runtime refused to load. The semicolon is now absorbed into the
  erasure, in every build.
- Lowering a `continue` no longer adds a line. The `repeat ... until true`
  scaffolding rides the first and last lines of the loop body, and the sentinel
  that carries an author's `break` past the wrapper shares a line with it, so
  `for ... do` and its `end` are copied through untouched.
- A single lowered statement no longer reformats everything around it. Canonical
  replacement narrowed from the enclosing top-level statement to the statement
  that actually needs lowering, so one compound assignment inside a handler
  changes its own line and leaves the handler's layout alone.

### A Caret That Lands On The Problem

#### Fixed

- The caret under a diagnostic ignored tabs. It padded with spaces while the
  terminal drew each tab several columns wide, so on a tab-indented file it
  pointed to the left of the code it meant. It now copies the indentation of the
  line it underlines.
- `parse-invalid-statement` pointed at the token after the offending expression,
  usually the semicolon, and said only what it expected. It now points at where
  the expression starts and names it: `"count.abs" is not a statement. Assign it
  with "=", pass it to a call, or remove the line.`

### The Wrong Form Is Now An Error

#### Added

- `check-extension-form` reports an object extension written in the other form.
  A property extension that is called, such as `count.abs()`, compiled to
  `math.abs(count)()` and failed at runtime on a call to a number. A call
  extension that is only read, such as `count.clamp`, compiled to an index that
  never runs. Both are rejected before anything is emitted.
- `check-not-callable` reports a call on a value the checker knows is not a
  function, such as `count()` on a number or `label()` on a string.

#### Fixed

- A statement the compiler has to lower kept the semicolon that closed it in the
  authored file. It used to be left behind, alone on the line after the lowered
  statement.

### A Shared Enum Reaches The Generated Lua

#### Fixed

- An enum declared in one file and read from another was erased. The build
  decided erasure from the declaring file alone, so the generated Lua held no
  table and the resource failed at runtime. Erasure now reads the whole
  resource: an enum any file reads is emitted, and only an enum nothing reads
  is erased.
- A declaration erased at the end of a file left its blank lines behind. The
  generated Lua now ends at the last line that carries code. The blank slots
  that keep line numbers aligned are still written everywhere else.

### No Transport To Configure

#### Removed

- **Breaking.** The `transport` manifest table, the `http` transport, and every
  field, diagnostic, and environment variable that served them. A manifest that
  still writes `transport` reports `config-removed-field` and names what replaced
  it. The removed codes are `config-invalid-transport`,
  `config-invalid-url-segment`, `config-missing-secret`,
  `config-plaintext-password` and `config-remote-plaintext-transport`.
- The CLI no longer opens a connection to an MTA server, so the only outbound
  request a build can make is the `min_mta_version` lookup.

#### Changed

- `luam ensure` builds and syncs the resource, and stops there. Loading the sync
  is `refresh` and `restart <name>` in the server console.
- `luam dev --start-server` is the one path that restarts a resource for you. It
  owns the MTA process and writes those commands to the console it started, which
  is what it already did.
- `luam init` scaffolds a manifest without a `transport` block.

### One Version, Checked Before It Ships

#### Added

- `pnpm release:prepare <version>` bumps every workspace package and promotes the
  `Unreleased` section of all three changelogs into a `## X.Y.Z - YYYY-MM-DD`
  heading. It refuses a malformed version, a version at or below the committed
  one, a version that already has a heading, and an empty `Unreleased` section in
  any locale, and it writes nothing when any of those fail.
- `pnpm docs:versions [tag]` fails when a workspace package, a changelog heading,
  a locale pair, or a supplied tag disagrees with `packages/cli/package.json`.
- `pnpm docs:obsolete` fails when current documentation, snippets, or maintained
  examples still show a removed form. A removed form is allowed only under a
  release heading no newer than the version that removed it, or through an
  exact-line exemption that records its replacement and reason.
- `pnpm release:notes` prints the GitHub release body, with anchors into both
  manual changelogs and this file.
- `pnpm docs:verify` runs the version and obsolete-content checks, and the
  documentation workflow now also triggers on package manifests, changelogs,
  release tooling, examples, and the workspace files.

#### Changed

- Every section of this file now sits under the release that shipped it. The
  header no longer claims that nothing is published.
- Both manual changelogs use the same dated release headings, so a locale cannot
  document a release the other one is missing.
- Version-specific install and extension examples in the manual are written as
  `%LUAM_VERSION%` and rendered from `packages/cli/package.json` at build time.
- The release workflow verifies the tag against the committed version and no
  longer stamps versions in the runner. It packages only what the tagged commit
  already declares, and it runs the full documentation verification first.

### Dead Configuration Says So

#### Added

- A manifest `local` that no field reads is reported as `check-unused-local`, a
  warning with a caret under the name. The manifest is always checked in its own
  strict mode, so this does not depend on `compilerOptions.noUnusedLocals`, and a
  leading `_` keeps the local on purpose.

## 0.15.6 - 2026-08-17

### Typed Events

#### Added

- `declare event 'name'(...)` declares the contract of a custom MTA event. It is
  erased from the output, takes its environment from the file path, and reaches
  every module of the project.
- The generated catalog carries the handler signature of all 203 built-in
  events, per environment.
- `addEventHandler` and `removeEventHandler` type their callback from the event
  name, and `triggerEvent`, `triggerServerEvent`, `triggerClientEvent` and the
  latent variants check their payload against the signature of the side they
  reach. An unresolved name keeps the permissive MTA signature.
- Completion inside an event-name string lists the contracts, the names created
  with `addEvent`, and the catalog events of the targeted side; hover shows the
  contract and its origin; signature help names the handler and payload
  arguments; the outline lists declared events.

#### Changed

- `event` is contextual after `declare` only, so `local event` still compiles.

## 0.15.5 - 2026-08-16

### Contextual Callback Types

#### Added

- Function expressions inherit parameter types from their call-site callback
  contract, including environment-specific MTA callbacks.
- Completion, hover, navigation, and signature help use contextual callback
  parameters and can insert generated parameter names into an empty callback.

#### Changed

- The generated MTA catalog retains nested callback signatures and exact
  server, client, and shared variants from upstream declarations.

### Readable Lua Preserves Authored Formatting

#### Changed

- Readable modules preserve authored whitespace, quotes, semicolons, comments,
  and multiline layout while Luam-only syntax is erased.
- Top-level statements requiring lowering use canonical Lua without reformatting
  neighboring statements, while source maps cover expanding transformations.
- Production minification removes readable formatting and keeps production bytes
  compact.

## 0.15.4 - 2026-08-16

### CLI-Owned Local MTA Server

#### Added

- `luam server` runs an existing Windows or Linux MTA installation in the
  foreground, and `luam dev --start-server` waits for it before the first sync.
- The integrated development flow refreshes and restarts the resource through
  the owned MTA console, including the first deployment, without HTTP transport.
- `development.server.executable` selects a contained executable under
  `serverPath`; platform defaults are probed when it is unset.

#### Security

- Local server launch uses no shell, validates real path containment, and stops
  only the child owned by the current command.

## 0.14.0 - 2026-08-15

### Parent Calls Use `super(...)`

#### Changed

- Parent constructor and overridden method calls now use `super(...)` directly.
  The former `self:super(...)` syntax reports `check-invalid-super`.
- Class hover includes inferred constructor return types, and completion offers
  `super` inside subclass methods.

## 0.13.0 - 2026-08-15

### The Administrator Edits `.env`, Not Lua

0.12.0 compiled the declared keys straight into `env.lua` and handed that file to
the server administrator. It removed the runtime parser, but it also handed a Lua
table to the person least equipped to edit one: an unquoted string is a syntax
error, the file then fails to load, `env` is never defined, and every read blows
up far from the mistake. A format that tolerates a typo was traded for one where
a typo takes the resource down.

The two files now split by who owns them. `.env` is written once and owned by the
administrator, in the `KEY=value` form they already know. `lib/env.lua` is a
generated server helper that reads it, and like every other helper it is
rewritten on each build — so the reader always matches the project while the
values stay with the server. Editing `.env` and restarting is all a deploy needs,
and neither `build` nor `ensure` ever overwrites what the administrator set.

`process` is gone with it. It was declared by the checker and published by the
old runtime; the reader publishes only `env`, so keeping `process` typed would
have promised a global that no longer exists.

#### Added

- `env.lua`, a generated server helper that reads the deployment file named by
  `environment.file` and publishes `env`. It is written to `lib/` like any other
  helper, and the file it reads is substituted at build time.

#### Changed

- The deployment file is `.env` again, written once, never overwritten, never
  pruned, with sensitive-looking keys blanked for the administrator to fill.
- `env.lua` is regenerated on every build instead of being written once, so a key
  added to the project can never leave a stale reader behind on the server.

#### Removed

- `process` and `process.env`. Read `env` instead. A file still naming `process`
  compiles, because an undeclared global is legal Lua — it simply reads nil at
  run time.

### The Editor Suggests the Environment It Typed

`env` was typed from `.env`, completed after a dot, and hovered — but the name
itself was never suggested. The completion list gathered the MTA catalog and the
project's own symbols, and the globals the manifest declared were in neither. You
had to know `env` existed to reach the keys the editor could already describe.

Hover repeated itself as well. A record renders as its own name, and the record
behind `env` is called `env`, so the hover read `env: env` — true and useless.

#### Added

- `env` is suggested in a server file whenever the project declares keys, and
  hidden in a client or shared file, matching the rule the checker enforces. The
  item names the file the keys came from.

#### Changed

- Hovering `env` lists the declared keys, their types, and their configured
  values instead of repeating the name. Completing a key shows its value too.

## 0.12.0 - 2026-08-15

### Deployment Values Are Compiled, Not Parsed

A resource carried 178 lines of Lua to read its own `.env` at start. `dotenv.lua`
held a parser — quoting, escapes, type casting, a sealed table — and `env.lua`
decided which file to read and when. The compiler already knew every key and its
type: it reads `.env` at build time to declare `env` and `process.env` for the
checker. The resource spent run time re-deriving what the build already had.

The keys are now written as Lua. A project with a `.env` gets a generated
`env.lua` at the resource root holding the values as a table, publishing `env`
and `process.env` behind a metatable that raises on an undeclared key and refuses
assignment. Nothing parses anything at run time.

The file belongs to the server administrator. It is written once and never
overwritten, so a later `build` or `ensure` replaces the code and leaves the
deployed values alone — a deploy from one machine can no longer overwrite another
server's configuration. A key whose name reads as sensitive is written blank for
the administrator to fill, so a secret never travels inside a build artifact, and
`.env.local` still reaches the checker and never the generated file.

#### Added

- `env.lua`, generated from the project's `.env` and declared a server script in
  the configuration slot of `meta.xml` — after the runtime library, before the
  sources. Written once, never overwritten, and never pruned.

#### Changed

- `env` and `process.env` are published by the generated file rather than by a
  runtime helper. Their types still come from `.env` through the checker, so a
  key the file does not declare is still `check-unknown-record-key` and no
  declaration file is needed to describe them.
- A resource no longer ships a `.env`. The values live in `env.lua`, and an
  already deployed `.env` is still protected from pruning.

#### Removed

- The `dotenv` and `env` runtime helpers, and `dotenv.lua` and `env.lua` from the
  runtime package. `helpers = { 'env' }` in a manifest is now
  `config-unknown-helper`.
- The `Dotenv` native class, with its constructor, members, and documentation.
  Reading a second environment file at run time is no longer part of the
  language.
- The `manual` helper injection kind, which had no remaining member.

### The Runtime Library Is One Directory

Runtime helpers were written to `lib/<environment>/`, so `class.lua` landed in
`lib/shared/` and a client-only `string.lua` in `lib/client/`. The directory
repeated what each `meta.xml` entry already carried, and it could never
disambiguate anything: a helper resolves to exactly one environment per build, so
two files with one name never existed.

#### Changed

- Runtime helpers are written flat to `lib/`. Each `meta.xml` entry still carries
  its helper's environment, and load order is unchanged — a helper still loads
  after everything it requires.

## 0.11.1 - 2026-08-15

### A Contract Comes From the Interface That Names It

A class and an interface may carry the same name, and `implements` resolved the
contract through a lookup that answers with a class first. The interface was
found; its members were not. A class implementing `Command` was checked against
the fields of a class called `Command` and told to implement `core` — a field no
interface ever declared, on a class that satisfied its actual contract
completely. The same lookup backed `interface extends`, so a class could stand in
for an inherited contract as well.

A name means what the position it sits in says it means. `implements Command`,
and `Command` after `extends` on an interface, now read the interface namespace
alone, and the member a class is checked for is looked up through the class
hierarchy alone.

#### Fixed

- `implements` collected the members of a class sharing the interface's name,
  reporting `check-unimplemented-interface` for fields the interface never
  declared and passing over the ones it did.
- `interface extends` inherited from a class of the same name.

`.luam.manifest` described a little of the project and left the rest implicit.
`sourceDirs` named a directory and the environment came from the folder inside
it; `assetDirs` copied one tree and a second, undeclared rule copied whatever
else lived beside the source; `oop` sat at the top level next to `outDir` as if
the two were the same kind of thing. There was no way to say which MTA version a
resource needs, which resources it depends on, or which `.env` a build should
read.

It is now a closed set of typed domains, each owning one thing and each read by
one implemented consumer. `compilerOptions` says how the checker reads the
project, `sources` says which files belong to it and on which side, `assets` says
what is copied and where it lands, `dependencies` and `engine` say what the
resource needs at run time, and `environment` says which files carry its
configuration. A field is only there because something reads it.

Nothing is copied by accident any more. The rule that swept non-source files out
of `sourceDirs` is gone — a data file beside server code needs a mapping, and in
exchange the contents of a built resource are what the manifest says they are.

#### Added

- `compilerOptions` with `strict`, `oop`, `noUnusedLocals`,
  `noUnusedParameters`, and `warningsAsErrors`. A file directive still wins over
  the project's strict mode, and a name starting with `_` is never reported as
  unused.
- `check-unused-local` and `check-unused-parameter`, off unless asked for.
- `sources`, mapping patterns to `server`, `client`, and `shared`. The side that
  matches a file is its environment unless the file says otherwise, and a
  disagreement is reported instead of resolved in silence. A file two sides claim
  is `config-source-side-conflict`.
- One path-pattern engine behind the compiler, the CLI, and the editor. It takes
  `*`, `**`, and `?` with `/` as the separator, and matches without backtracking,
  so no pattern can hang a build. Regex, negation, brace expansion, and extglobs
  are `config-invalid-pattern`.
- `assets`, a list of `{ from, to }` mappings. Everything a mapping names is
  copied and declared as `<file>`. A duplicate destination, or one that would
  overwrite `meta.xml` or the generated `lib/`, is `config-output-collision`.
- `dependencies`, written as `<include resource="..." />` and sorted, so MTA
  starts what the resource needs first.
- `engine.minVersion`, which becomes `min_mta_version`. Pinning a version keeps
  the build off the network entirely; the default still looks the latest release
  up and still succeeds without one.
- `environment`, selecting the file that declares the keys behind `env` and
  `process.env` and the file that overrides their values. The local file may
  never add a key, and it no longer reaches the deployment template — a value set
  on one machine stops there.
- `output.minify`, with `--minify` and `--no-minify`. `dev` and `ensure` never
  minify, so a stack trace stays readable while you work.
- Completion and hover for every domain, including the members of an `assets`
  entry, which the catalog could describe but the editor could not reach.

#### Changed

- The declaration and module caches are keyed on the compiler options and on each
  file's environment, so changing an option or moving a file between sides
  recompiles what it affects and nothing else.
- The language server resolves environment files from the manifest that selects
  them, rooted at the manifest's own directory. A project nested below a
  workspace folder still finds its own configuration, now because it is declared
  rather than because a search walked up to it.
- The watcher observes the roots the `sources` patterns imply.

#### Removed

- `oop`, `sourceDirs`, `assetDirs`, and `mta`. Each is rejected with
  `config-removed-field` naming its replacement rather than quietly aliased, so a
  stale manifest fails instead of building something other than what it says.
- `build-no-sources`, `build-source-dir-missing`, and
  `build-source-dir-outside-root`, replaced by `config-no-sources`,
  `config-missing-source`, and `config-escaping-path` — the manifest is where the
  mistake is, so that is where it is reported.

## 0.10.6 - 2026-08-14

### Directives Complete

`#` opens a comment, so the completion pass stopped at `#!` and offered nothing.
The six directives the language has were the one thing you had to remember
without help.

#### Added

- Completion after `#!`, offering `server`, `client`, `shared`, `strict`,
  `nonstrict`, and `nocheck`, each with what it does. It fires while the name is
  being typed, with or without a space after the marker, and on any line — not
  just the first. `#items` and an ordinary `# comment` are left alone.

## 0.10.5 - 2026-08-14

### A Nested Project Is Still a Project

The editor read `.env` only from the workspace folders it was opened with, so a
project living below one of them never found its own. Opening a repository that
holds a resource in a subdirectory reported `env` as not in scope on every
interpolation, while `luam check --cwd` on the same resource was clean — the CLI
is pointed at the project, the editor was not.

The lookup now walks up from the file to the nearest `.env`, bounded by the
workspace folders so nothing outside them is ever read, and the result is cached
per directory.

#### Added

- `destroy` on `Connection`, mapped to `destroyElement`. MTA does destroy the
  connection that way; what it does not have is the rest of the element surface.
- `OOP_MEMBER_ADDITIONS`, the override that declares a member the upstream class
  omits, resolved against the catalog so a wrong procedural name fails the build
  instead of shipping.

## 0.10.4 - 2026-08-14

### The Editor Says What It Knows

Signature help on an MTA constructor read `argument1: string, argument2: string`.
The names were in the upstream declaration and in the wiki documentation the
catalog already ships; the OOP surface just had no field to carry the link. Every
one of the 47 constructors was affected — `File(argument1: string)`,
`Connection(argument1: string, argument2: string)`.

Hovering a type alias showed `type Database` and stopped there, which is the one
thing the reader already knows. The name was hardcoded and the annotation was
never rendered.

#### Added

- `procedural` on an OOP constructor, linking it to the function it maps to, so
  signature help names the parameters and carries their documentation.
  `Connection('sqlite', ...)` now reads
  `Connection(databaseType: string, host: string, username?: string, ...)`.
- The definition in a type alias hover: `type Database = SQLite | MySQL`, with
  the type parameters of a generic alias included.

#### Fixed

- The multi-line branch of the OOP constructor emitter dropped the type
  descriptor entirely. It was unreachable until the procedural name made a
  constructor line long enough to take it.

## 0.10.2 - 2026-08-14

### A Table Literal Carries Its Shape

A table literal was typed `table` whatever it held, so nothing compared it to the
shape it was assigned to. `local data: Config = {}` compiled, a misspelled key
compiled, and a literal missing half the keys of its type compiled. The manual
documented this as a limitation rather than a gap.

A literal written with named keys is now a record built from those keys, checked
against the target the ordinary way. That is what reports the empty literal, the
missing key, and the misspelling — the last one through the key that is missing
rather than the one that is unexpected.

#### Added

- A shape for a table literal with named keys, with member types left unwidened
  so a string value can pick a member of a discriminated union.
- Completion inside a table literal now offers every key of a union until a
  discriminant is written, then narrows to the member that matches it.
- The mismatch names the key that is missing. Against a union, the literal-typed
  keys already written pick the member to report against, so the message points
  at the branch you meant rather than the whole union.
- Type completion in the two positions that were falling through to the value
  scope: the right of a type alias, including after `|` and `&`, and the keys of
  an object type, nested ones included. Both offered every global and function
  instead of the types.

#### Fixed

- `examples/resource` had no `.luam.manifest`, so it was not a project. Nothing
  loaded its `.env` and `env.SERVER_NAME` reported that `env` was not in scope.

#### Notes

- `{}` is unchanged in every container position: it still fits an array, a map,
  and `table`, and an unannotated `local items = {}` still widens to `table` so
  the object extensions keep working. Only a shape that requires a key rejects it.

## 0.10.1 - 2026-08-14

### Literals Are Types, and the Editor Knows the Shape

`true`, `false`, and a number were not types. The parser accepted `true` and
`false` in type position and the checker had nowhere to put them, so they
resolved to a named type that matched anything — and once undeclared names
warned, `local flag: true = true` warned about a form the grammar allows.

The editor knew less than the compiler. A union receiver offered no keys at all,
an intersection offered only the keys written inline and dropped everything it
inherited, and a table literal annotated with a type offered the global scope
instead of the keys it expects.

#### Added

- String, boolean, and number literal types, negative and decimal numbers
  included. A literal is assignable to its base type and to the same literal,
  never the reverse, and an unannotated local still widens, so `local flag = true`
  stays `boolean`.
- Booleans and numbers discriminate a union, so a two-case result written as
  `ok: true` and `ok: false` narrows.
- Key completion inside a table literal annotated with an object type, an
  interface, a class, or a union of those. Keys already written are dropped, the
  insert carries the `=`, and the surrounding scope stays available below them.
- Member completion on a union receiver, offering the keys every member declares.
- `variable.language.vararg.luam` for `...`, which the grammar was colouring as
  the concatenation operator.
- Value completion inside a string, offering the members of a literal type. It
  reads the type from the annotated local, the key of a table literal, or the
  parameter of the call it sits in.
- `Connection`, the element `dbConnect` returns. It was excluded from the
  generated catalog, so the connection was typed `Element` and there was no name
  to annotate it with. `dbExec` and `dbPrepareString` now take it, and the OOP
  surface carries its constructor, `exec`, `prepareString`, and `query` — and
  nothing else, matching the upstream class, which declares no parent. A database
  handle has no position, alpha, or attachment to offer.

#### Fixed

- Completion on an intersection lost the keys it inherited. The editor re-derived
  types from annotations on its own and could not resolve a named part; it now
  reads the aliases the checker already resolved, exposed on the check result.
- The catalog generator did not apply an element type alias to the return of a
  generated constructor, so `Object` reported `MTASAObject`, a name nothing
  declares.

## 0.10.0 - 2026-08-14

### Shapes That Combine and Unions That Narrow

`type SQLite = Base & { kind: 'sqlite' }` did not lex — `&` was not a character
the language knew, so the only way to extend a shape was `interface ... extends`.
A union of object types was worse than unchecked: it was accepted in an
annotation and then dropped, so `config.anything` on a `SQLite | MySQL` resolved
to `any` and no `if config.kind == 'mysql' then` ever refined it. The discriminated
union, the shape the pattern exists for, compiled without a single check.

#### Added

- `&` in type position, merging object types, interfaces, and classes into one
  record. It binds tighter than `|`, so `A & B | C` is `(A & B) | C`, and the
  merge is erased by the build.
- Key access on a union of object types, interfaces, and classes. A key every
  member declares gives the union of its types. Unions of anything else stay
  permissive.
- Narrowing on a string-literal discriminant. `value.key == 'literal'` keeps the
  members that can match, `~=` keeps the rest, and the `else` branch of a
  single-clause `if` gets the complement, so a guard clause that returns early
  narrows the rest of the block.
- `check-unknown-union-key`, reported when a key is missing from at least one
  member of the union.
- `check-invalid-intersection`, reported on a part of an intersection that is not
  an object type, an interface, or a class.
- `check-conflicting-intersection-member`, reported when two parts declare the
  same key with different types.
- `check-unknown-type`, a warning on a type name the file cannot reach. Nothing
  reported an undeclared type, so a misspelled element name compiled silently
  against a type that does not exist. The check is deferred to the end of the
  file, so a type declared further down, a recursive alias, and a
  self-referencing interface stay silent, and the name still resolves the way it
  always did — no source stops compiling.

#### Fixed

- The types manual claimed Luam performs no type narrowing and told the reader to
  annotate a checked value as `any`. Narrowing had already shipped, and the same
  page documented it a few sections later.

## 0.8.0 - 2026-08-12

### Every Reserved Word Completes

Completion offered the 32 reserved words at a statement, `constructor` in a
class body, and `extends` and `implements` in a class header, but never `fun` or
`super` — the two contextual names, which are exactly the ones an author cannot
guess from the grammar. Two misuses also compiled silently and failed only when
the resource ran: `self` outside a method emitted a read of a global that is
`nil`, and a class field named `constructor` replaced the constructor with a
value, so `new` called it.

#### Added

- `fun` completes in type position, beside the primitive types.
- `super` completes after `self:` inside a method of a class that extends
  another, and nowhere else.
- `check-invalid-self`, reported on `self` outside a class method and outside a
  `function Name:method()` declaration. A `local self` and an explicit `self`
  parameter both still resolve.
- `check-invalid-constructor`, reported on a class member named `constructor`
  that is declared as a field instead of as a method.

## 0.7.0 - 2026-08-12

### One Class Method Form

A class member could be written two ways. `name = function (...) ... end` is the
form the manual documents and the form the emitter mirrors; `name(...) { ... }`
was still parsed and still compiled, silently, with nothing naming it as the
older spelling. Two forms for one construct meant the editor accepted source the
manual does not describe, and a project could carry both.

#### Added

- `parse-class-method-form`, reported on the member name when a class member is
  written as `name(...) { ... }`. The message names the form to write instead.
  The member is still parsed, so the rest of the class checks normally and one
  diagnostic is reported rather than a cascade.

#### Changed

- Every class in `examples/`, `docs/snippets/`, and the compiler fixtures is
  written in the `= function` form.

#### Removed

- `name(...) { ... }` as an accepted class member. Interface methods are
  unchanged: they have no body and keep `name(parameters): type`.

### Flat Bundle Output

#### Changed

- A bundle is the load-ordered concatenation of its helpers and modules, with no
  wrapper. Each member was emitted inside `do ... end`, which cost two lines per
  member and put scaffolding the author never wrote between a reader and the
  shipped code.
- Because the block is gone, every module in a bundle shares the bundle chunk
  scope. A file-level `local` is visible to every module after it in the same
  environment, and the Lua 5.1 limit of 200 active locals applies to the bundle
  rather than to each module. Neither is checked by the compiler, and the `tree`
  layout is unaffected, so a resource that relies on either builds correctly with
  `--no-bundle`.

### Hover Across Files

#### Fixed

- Hovering a class, interface, enum, function, or type alias declared in another
  file showed nothing. `hover` was the only navigation feature not given the rest
  of the workspace, so a name it could not resolve in the open document fell
  through to the MTA catalog and returned nothing, while go-to-definition on the
  same name worked. The hover now names the declaration and the file it comes
  from, and respects the environment rules, so a server file does not see a class
  declared under `src/client`.

## 0.6.0 - 2026-08-12

### The `.luam.manifest` Dialect

`luam.json` was the same on every machine and for every command, so a project
that wanted a development `outDir` or an `http` transport only when a password
was present kept two files and remembered which one to pass to `--config`. A
manifest now varies by mode and environment, and it is written in Luam — the
compiler parses, checks, and evaluates it in process, so a configuration mistake
reads like a compile error and the editor understands the file.

#### Added

- `.luam.manifest`, a restricted Luam dialect at the project root. It holds
  `local` declarations and assignments to configuration fields. A value is a
  literal, a table, or those combined with `and`, `or`, `not`, comparison,
  arithmetic, and concatenation. There are no calls and no function values, so
  evaluating a manifest is pure and total.
- `mode` (`development` for `dev` and `ensure`, `production` for `build`,
  otherwise the command name), `env` (a table of `string?`), and the absolute
  `root`, in scope alongside the configuration fields and nothing else.
- `--manifest <path>`, which loads an alternate `.luam.manifest` for a
  deployment profile.
- Positioned configuration diagnostics: every one carries a line and a column, so
  `outDir = 5` points at the value rather than at the file.
- Manifest support in the language server — diagnostics as you type, completion
  for every field with its type, whether it is required, and its default, and
  completion for the closed sets inside the quotes; hover names the field's full
  path and type.
- A `luam-manifest` file association in the VS Code extension, with its own
  grammar, `#` comment configuration, and light and dark document icons,
  separate from the `.luam` grammar.
- `config-unsupported-manifest`, `config-unreadable-manifest`,
  `config-invalid-statement`, and `config-invalid-expression`.

#### Changed

- **Breaking.** `luam.json` is no longer read, merged, or reported, even when it
  sits beside a `.luam.manifest`. Rename the file, drop the outer braces and the
  quotes around the field names, write `=` instead of `:`, and rename `--config`
  to `--manifest`.
- **Breaking.** `--config` was renamed to `--manifest` on `build`, `check`,
  `dev`, `ensure`, and `trace`.
- **Breaking.** `transport.kind` is required once a `transport` table is written.
  `transport = { }` is `config-missing-field` instead of silently meaning `none`.
  Omitting the table entirely still means `none`.
- `luam init` writes `.luam.manifest` and nothing else.
- The language server reads the manifest directly, so a change to `oop` takes
  effect on save rather than after the next CLI run. No diagnostic carries the
  manifest source or an environment value.

#### Removed

- `config-invalid-json` and `config-unreadable`, which described the JSON reader.
- `.luam/settings.json`. There is no settings snapshot, and no child process
  evaluates the manifest.

### HTTP Exports

#### Added

- `export http function name()` emits an MTA export with `http="true"`.

#### Changed

- A regular `export function name()` now emits an explicit `http="false"`.

### One-Line Production Lua

MTA downloads every client script to every joining player, and until now those
scripts shipped with the comments and indentation the emitter wrote for a reader
who never sees them.

#### Added

- A Lua 5.1 token scanner and a minifier. `luam build` writes every generated
  `.lua` file — bundles, the mirrored tree under `--no-bundle`, runtime helpers,
  and `config.lua` — as one line with comments and formatting removed. A single
  space is inserted only where two tokens would otherwise merge, so `a - -b`
  never becomes a comment and `1 .. 2` never becomes a malformed number.
- `minified: true` on the resource map `luam build` writes, and a `luam trace`
  that refuses such a map with an actionable message rather than resolving a
  generated line that a one-line artifact does not have.

#### Changed

- `meta.xml`, `.env`, and copied assets are still written untouched, and no
  identifier is renamed, so a production error names the symbol the developer
  wrote. `luam ensure` and `luam dev` output is unchanged.
- Minification runs over the whole file set in memory before the first write, so
  a file that does not scan as Lua 5.1 aborts the command with its file and line
  and leaves the previous production resource intact.

### CLI Command Registry

The hand-written parser wrote every flag into one flat record, so it accepted
every option on every command and silently ignored the ones that did not apply.

#### Added

- `luam <command> --help` and `luam help <command>`, generated from each
  command's own declaration instead of a maintained string constant.
- Declarative command modules over `commander`, a shared project-context factory,
  and an `index.ts` that does nothing but assign `process.exitCode`.

#### Changed

- Every option now belongs to the commands that read it, and an option outside
  that set exits `2` without running the command. `luam dev --bundle` fails
  instead of warning, `luam check --offline` and `luam doctor --config` fail
  instead of succeeding, and `--version` is a root option. Exit codes `0`, `1`,
  and `2` keep their meanings. See the migration table in the CLI reference.

## 0.3.0 - 2026-08-11

### Object Types

An argument bag is the most common shape in an MTA resource, and the only way to
type one was to declare an `interface` for it. Luam now accepts an object type
inline, wherever a type is accepted.

#### Added

- `{ key: Type }` as a type annotation, on locals, parameters, fields, return
  types, type aliases, and nested inside another type. Keys are separated by a
  comma, a semicolon, or a line break, and the optional marker attaches to the
  key — `team?: string`. The annotation is erased like every other one.
- Key checking on a value with an object type. Reading a key the type does not
  declare is `check-unknown-record-key`, and an alias lends its name to the
  message, so a misspelled key on a `SpawnArgs` names `SpawnArgs`.
- Structural assignability between object types: a source is accepted when it
  declares every key the target requires with a compatible type, and a key the
  target marks optional may be missing. A table literal carries no shape, so it
  stays assignable to any object type.
- `parse-duplicate-key`, reported when an object type declares the same key more
  than once.
- Editor support: hover and signature help render an object type by its keys,
  completion after a dot offers the keys, including keys of a nested object type,
  and the grammar keeps highlighting the types inside the braces.

#### Changed

- A local declared with an annotation now takes its type from that annotation in
  the language server instead of from its initializer, so completion after a dot
  follows the declared type.

### Completion Inside a Block

Typing `args.` to see what is on a value is the moment completion matters most,
and it is exactly the moment the file does not parse. A statement that failed
inside a `do`, `if`, loop, or function body took the whole enclosing declaration
down with it, so the editor lost the parameters and locals it needed to answer.

#### Fixed

- The parser now recovers from a failed statement inside a block terminated by
  `end`, the way it already did inside a `{ }` body: the diagnostic is reported,
  the rest of the line is skipped, and the surrounding declaration survives. A
  parameter is offered after a dot in its own function body again, whatever its
  type — class, MTA element, or object type.
- A stray `}` inside an `end` block is reported once instead of twice.
- The language server resolves a type alias when it looks for the members of a
  value, so a parameter annotated with an alias of an object type offers its
  keys. A class or interface of the same name still wins, and a self-referencing
  alias stops instead of recursing.

## 0.2.1 - 2026-08-11

### Editor Detection on Windows

Editor launchers ship as `.cmd` scripts on Windows, and a direct process spawn
never applies `PATHEXT`, so `luam setup` and `luam doctor` reported no editor at
all on a machine with Visual Studio Code installed.

#### Fixed

- `luam setup` and `luam doctor` now detect editors on Windows. The command is
  resolved against `PATH` and `PATHEXT` before it runs, and a `.cmd` or `.bat`
  launcher is executed through `COMSPEC` as a single quoted command line, so a
  launcher installed under a path with spaces is invoked as one argument.

## 0.2.0 - 2026-08-11

### The `continue` Statement

Lua 5.1 has neither `continue` nor the `goto` that replaced the need for it in
5.2, so every MTA script inverts a condition or nests another `if` to skip one
turn of a loop. Luam adds the statement and lowers it, at no runtime cost.

#### Added

- `continue`, which skips to the next iteration of the innermost `for`, `while`
  or `repeat`. The loop body is emitted as a `repeat ... until true` block, where
  `break` leaves only that block. A block emits no opcode in Lua 5.1 and a
  constant `until true` emits no test, so the lowered loop runs the instructions
  it would have run without the wrapper. A loop with no `continue` is emitted
  exactly as before.
- A `__luam_break` flag, emitted only when a real `break` shares the loop level
  with a `continue`, so the two keep their own meanings. Nested loops each carry
  their own flag, and a `break` belonging to an inner loop is left alone.
- `check-invalid-continue` and `check-invalid-break`, reported by a jump pass
  that runs before type checking. They cover a jump outside any loop, including
  one inside a function body nested in a loop; a jump that is not the last
  statement of its block, which Lua 5.1 requires; and a `continue` inside a
  `repeat` that would jump over a local the `until` condition reads, which the
  wrapper would put out of scope.
- 15 tests covering the lowering across the four loop forms, the break flag, loop
  nesting, and every diagnostic. The suite is 1021 tests.

#### Changed

- **Breaking**: `continue` is a reserved word. A variable, parameter or function
  named `continue` needs a rename, as with the other 10 words Luam adds.
- **Breaking**: a `break` followed by another statement in the same block now
  reports `check-invalid-break`. It previously compiled and emitted Lua 5.1 that
  the target refused, since `break` there must close its block.

### Output Layouts and Source Maps

A shipped resource and a resource under development want opposite shapes. The
bundle layout collapses each environment into one script for release; the tree
layout keeps every module addressable while you work. A resource map connects
the two, so a line in a generated bundle names the line you wrote.

#### Added

- The bundle layout, which emits at most `src/shared.lua`, `src/server.lua` and
  `src/client.lua`. Helpers and modules stay isolated in `do ... end` blocks,
  helpers precede modules, and `loadOrder` still orders modules. `config.lua`,
  `.env` and assets are never bundled. An empty environment produces no bundle
  and no `<script>` entry.
- Deterministic resource maps at `<outDir>/<name>.luam-map.json`, recording each
  generated file, its module and helper segments, and sparse generated-to-source
  line mappings with the enclosing function, method or class symbol.
- `luam trace`, which resolves a generated position back to its authored line.
  It accepts a bare `file:line`, a full MTA log line, or one position per stdin
  line, and `--map` selects a map from another build.
- `output.bundle` and `output.map` configuration, plus the `--bundle`,
  `--no-bundle` and `--no-map` flags.
- `luam dev` resolves streamed `server.log` positions through its in-memory map,
  so a development record names the authored file, line and symbol.
- `project-bundle-toplevel-return` and `project-bundle-output-collision`, which
  fail a bundle build before anything is written.

#### Changed

- **Breaking**: `luam build` produces the bundle layout by default, because
  `output.bundle` defaults to `true`. A project whose module ends in a top-level
  return no longer builds without a change: keep the previous output with
  `--no-bundle` or `"output": { "bundle": false }`, or remove the return. Both
  bundle diagnostics name these switches. `ensure` and `dev` still write the
  tree layout by default, so no deployment shape changes on its own.
- `luam dev` warns that it ignored `--bundle` or `--no-bundle` instead of
  dropping the flag silently.
- `luam trace` rejects empty input before it looks for a map, and reports it
  instead of blocking on an interactive terminal that never reaches end of file.
- Default map discovery skips `node_modules` and dot directories. On a project
  with installed dependencies this replaced a multi-second full-tree scan and
  can no longer match a map shipped by a dependency.
- A configuration type error names the full path of a nested field, so a wrong
  `output.bundle`, `development.logs.enabled` or `transport.port` is no longer
  reported under its bare name. Unknown-field errors already did this.

### Native MTA Class Values

#### Added

- Typed MTA static methods such as `Player.getRandom()` with server/client
  scoping, argument checks, completion, hover, and signature help.
- Typed callable MTA constructors such as `File(path)`, preserving native Lua
  emission and keeping `File.new(path)` as the destructive creation operation.

### MTA Development Logs

#### Added

- `luam dev`, which reuses the build, server sync, restart, and watch workflow
  while following appended records from the local MTA `server.log`.
- A development-only client and server helper pair that preserves
  `outputDebugString`, validates and rate-limits relayed client records, and
  produces stable `[time][environment][level]` terminal lines.
- `development.logs` configuration for message length, rate, and window limits.
  Normal `luam build` and `luam ensure` resources do not include the helpers.

### Decorators and Generated Accessors

#### Added

- `@Getter` and `@Setter` on class fields or classes. Resolved boolean fields
  generate `isName`; other fields generate `getName`; setters use `setName`.
- Generated accessors are typed, inherited, satisfy interfaces, emit as ordinary
  Lua 5.1 methods, and appear in completion, hover, definition, and signature
  help without duplicating entries in the document outline.
- Decorator completion and hover, VS Code syntax highlighting, dedicated parser
  and checker diagnostics, a compiler fixture, and end-to-end resource coverage.

### Native Classes and the `env` Global

`Threads` and `Async` were libraries with a static `new`, which meant the
language had two ways to construct something. Now they are classes, built with
the same `new` a project class uses, and `Dotenv` joins them.

#### Added

- `Dotenv`, a server-only native class over the `.env` reader that already
  shipped: `new Dotenv('.env.production')` answers `get(key, fallback)`,
  `has(key)`, `all()` and `apply()`. `apply()` republishes its keys as the
  global environment. It rides on the new `dotenv` runtime helper, injected
  only when a module names `Dotenv`.
- `env`, a global the project already has whenever it has a `.env`. It carries
  the same typed keys as `process.env`, which stays valid, and is declared
  `server` for the same reason.
- 15 tests covering construction, the constructor signature, `env` typing and
  environment pinning, plus `env.` completion in the editor. The suite is
  852 tests.

#### Changed

- `Threads`, `Async` and `Dotenv` are constructed with `new`:
  `local tasks = new Async(100)`. The constructor signature is checked from the
  catalog and the instance keeps its members. `new Async(100)` lowers to
  `Async.new(100)`, so the runtime libraries are untouched — only a project
  class goes through the `new` helper in `class.lua`.
- **Breaking**: `Async.new(100)` is now `check-native-constructor`. There is one
  construction syntax in the language, and the message names the form to write.
- `env.lua` no longer parses `.env` itself. It loads `dotenv.lua` and applies
  the root file, so one parser serves both the automatic global and an explicit
  `new Dotenv(path)`.

### Increment, Decrement and the `fun` Type Keyword

Two small syntax changes that pull in opposite directions: one adds an operator
Lua never had, the other stops a type from borrowing a keyword.

#### Added

- `++` and `--` as statements. `score++` compiles to `score = score + 1` and
  `score--` to `score = score - 1`. They take a single variable, field or index,
  the target must be numeric, and they are statements only — never expressions,
  because Lua has no assignment expression to build on.
- 11 tests covering the two operators across the lexer, parser, checker and
  emitter, plus the `operators.luam` fixture. The suite is 836 tests.

#### Changed

- Function types are written `fun(string): void`, not `function(string): void`.
  `function` stays a reserved keyword for declarations alone, so a type never
  competes with a block header. Writing `function` in a type position reports
  `parse-invalid-type` with the replacement in the message. Diagnostics, hovers
  and signature help render the new form. **Breaking**: every existing function
  type annotation needs the keyword swapped.
- Comments now use `#` for a line and `#* ... *#` for a block. `#items` remains
  the length operator; a line comment starts with `# `, `#!`, or a bare `#`.
  **Breaking**: Lua's `--` and `--[[ ... ]]` comment forms now report a lexical
  diagnostic, while `--` remains the decrement statement operator.

### Editor Experience — Documentation, Signatures and Context

Writing Luam by hand exposed an editor that knew the types but never explained
them. The catalog carried signatures with no parameter names and no prose, so a
hover read `mta api (shared)` and nothing else. Completion answered every
position with the same list of globals, and a half-typed line inside a class
discarded the class.

#### Added

- API documentation generated from the upstream `mtasa-lua-types` JSDoc:
  description, parameter names, per-parameter text, return text and the wiki
  link, for 1161 of the 1294 catalogued globals. It lands in
  `src/generated/docs/`, imported only by the LSP, so the CLI bundle is
  unchanged at 400 KB while the language server carries the prose.
- Signature help. Typing `outputChatBox(` now shows
  `outputChatBox(text: string, visibleTo?: …)` with the active parameter
  highlighted and its documentation beneath. It resolves MTA globals, Lua
  library members, MTA OOP methods, and functions declared in the file.
- Event-name completion. Inside the name argument of `addEventHandler`,
  `addEvent`, `triggerEvent`, `triggerServerEvent`, `triggerClientEvent` and
  their latent forms, the editor offers the events for the file's environment
  plus every custom event the workspace declares with `addEvent`.
- Type-position completion. After an annotation colon — a local, a parameter, a
  return type, a class field, or the next option after a union bar — the list
  holds only primitives, project classes, interfaces, enums and MTA element
  types.
- Parser recovery inside class bodies, interface bodies and brace blocks. A
  broken member or statement is reported and skipped, and the surrounding
  declaration survives.
- 42 tests covering documentation, signature help, the two new completion
  contexts, variable values and `self`. The suite is 805 tests.

#### Changed

- Hover on an MTA function renders the description, a named signature, the
  documented parameters, the return text and a wiki link, instead of the bare
  scope line.
- Completion items for MTA functions carry the same documentation and a detail
  line with parameter names rather than bare positional types.
- Hover on a local shows its value — `local maxPlayers: number = 32` — for a
  literal, or the call that produced it.
- Completion returns nothing inside a comment, and nothing inside a string that
  is not an event name, rather than the full list of globals.

- Hand-written documentation for the Lua standard library, the three Luam
  library tables and the native runtime — every Lua global, all 39 `math`,
  `string` and `table` members, and the `Thread`, `Threads` and `Async`
  surfaces. Lua entries link the 5.1 manual, and a Luam addition says so.
- A file icon for `.luam`, contributed per language so it slots into whatever
  file icon theme is active rather than replacing it. The mark is the crescent
  from the extension logo with its orbiting body, redrawn to stay legible at
  16 pixels, in a light and a dark variant.
- 24 tests covering the Lua and runtime documentation, the native library
  completion, the indentation rules and the icon contribution. The suite is
  829 tests.

#### Fixed

- `self` lost its type while a class method was mid-edit. A parse error inside
  a class body used to discard the whole class declaration, so typing `self.`
  removed the very information the completion needed.
- A diagnostic was listed in Problems but drawn nowhere in the editor. Ranges
  were one character wide, and a parse error at end of file landed on an empty
  line with nothing to underline. Parser diagnostics now carry the offending
  token's end, the checker's are widened to the whole token, and a range that
  would still be empty snaps back to the last visible character.
- `Async`, `Thread` and `Threads` offered no members. Member resolution
  consulted the project globals but never the API catalog, so the natively
  injected records resolved to nothing.
- Enter after a Lua block header reset the indentation. The increase pattern
  required a line to be exactly `function`, so `function greet()` and
  `local function greet()` never nested. Both patterns now follow the
  well-tested Lua rules, extended for braces and hanging parens.

### Milestone 13 — The Generated Manifest Standard

The generated `meta.xml` now reads like the file a resource author would write
by hand, recorded in
ADR-008. This is a
breaking change for any project already written against milestone 10 or the old
resource layout.

#### Added

- `loadOrder` in `luam.json`: an ordered array of source paths pinned ahead of
  their group in the manifest. It orders scripts and assets alike, since a
  shader can depend on another. An entry matching no file is
  `project-load-order-missing`, which fails the build naming the entry, so a
  rename cannot break the order silently.
- `min_mta_version` resolved at build time from the latest
  `multitheftauto/mtasa-blue` release. The value is cached in
  `.luam/mta-version.json` with a 24-hour freshness window, falls back to the
  cached value when the network is unavailable, and warns and omits the element
  when there is neither. No path in that chain can fail a build.
- `--offline` and the `LUAM_OFFLINE` environment variable skip the release
  lookup entirely, so CI and offline work stay deterministic.
- A `version` build phase, so the lookup's duration is visible in the timing
  breakdown rather than hidden inside discovery.
- Section comments in the manifest — `Resource information`, `Runtime library`,
  `Configuration`, `Source scripts`, `Exported functions`, `Assets`,
  `Minimum MTA version` — emitted only above a group that has entries.
- 39 tests covering the attribute policy, the wildcards, `loadOrder`, the
  helper relocation, pruning without the manifest enumeration, and the release
  lookup stubbed three ways. The suite is 747 tests and reaches no network.

#### Changed

- **Runtime helpers moved from `src/<environment>/lib/` to
  `lib/<environment>/`.** A helper inside `src/` would be matched by the new
  source wildcard as well as by its own explicit entry, and loading `class.lua`
  twice resets the class registry. This supersedes the helper location in
  ADR-003;
  the environment separation is unchanged.
- **Each environment's scripts collapse into one wildcard entry** —
  `src/shared/**/*.lua` rather than one line per file. Adding a module to an
  environment that already has one leaves `meta.xml` byte identical. A directory
  whose files do not all match the environment their path implies is enumerated
  explicitly instead, because a wildcard cannot express two types.
- `<info>` carries no `name`; MTA reads the resource name from the containing
  folder. Attribute order is `author`, `type`, `version`, `description`. Renaming
  the resource in `luam.json` changes the output directory, not the manifest.
- An attribute equal to the MTA default is omitted, so a server `<script>` and a
  server `<export>` carry no `type`.
- `cache="false"` is unconditional on every `client` and `shared` script, in
  development and production alike. The bandwidth cost is accepted deliberately.
- A shared `export` is one `<export type="shared" />` entry rather than the
  `server` and `client` pair milestone 10 emitted. The duplicate-export check is
  unchanged: it still compares one entry per name per side.
- Element order is `<oop>`, info, scripts, exports, files, `min_mta_version`.
- Pruning no longer reads the previous manifest, since an entry is now a pattern
  rather than a path. The removable set is the source directories, the asset
  directories, `lib/`, `meta.xml`, and every `.lua` file.
- `runBuildCommand` is async, because the release lookup is.
- The scaffolded `.gitignore` excludes `.luam/`.

#### Removed

- **The `setting` and `depends` build directives.** Parser, checker, manifest,
  editor completion, and VS Code grammar. Both words are ordinary identifiers
  again, so `local setting = 1` and a function named `depends` called with
  parentheses compile as plain source, and no input can produce a `<setting>` or
  an `<include>` element. This reverts that part of
  ADR-007; `export` is unchanged and
  the contribution channel stays. Gone with them: `check-setting-value-not-literal`,
  `check-depends-self`, `check-directive-not-top-level`, and
  `project-duplicate-setting`.
- `isCached` on `ManifestScript`, and `resourceName` from `CompileOptions`,
  `CompileProjectOptions`, and `CheckOptions` — it existed only for
  `check-depends-self`.
- `name` from `ResourceOptions`, which no longer reaches the manifest.
- `readDeclaredFiles`, which read the previous manifest for pruning.

#### Known caveat

- The manifest is no longer a pure function of the source. Reproducibility now
  reads "identical for a given resolved MTA version": the same commit built on
  two days can differ in `min_mta_version` alone.
- Whether MTA runs a file twice when an explicit entry and a wildcard both match
  it is still unverified on a real server. Nothing the compiler emits by default
  overlaps, so only a project that sets `loadOrder` is exposed.

### Milestone 12 — CLI Output and Build Feedback

#### Added

- One visual vocabulary for the CLI: a tone per severity, a marker per outcome,
  a symbol per phase, and a progress bar, all produced by
  `packages/cli/src/reporting/output-style.ts`. It is the only module in the
  repository that writes an escape sequence.
- Output capability is detected once per process — TTY, colour, unicode, and
  width. Colour and emoji switch off when the stream is not a terminal, when
  `NO_COLOR` holds a non-empty value, or when the new `--no-color` flag is
  passed. On a terminal without colour the run still advances, in ASCII.
- Named build phases: discovery, compile, assembly, manifest, and write, with
  `ensure` adding sync and restart. Each phase records its own duration, and
  `luam build`, `luam check`, and `luam ensure` close with a timing breakdown on
  a terminal.
- A progress renderer that paints the running phase, throttled to one frame per
  50 ms, drawing a counted bar for compile and write and a marker for the
  single-step phases. A run that finishes under roughly 150 ms — every warm
  rebuild — paints nothing at all. Frames go to stderr, so redirecting stdout
  captures the report alone.
- Diagnostics on a terminal are grouped under a bold path header and show the
  offending source line with a caret under the reported column, the diagnostic
  code, a parseable `path:line:column`, and the hint as a muted line. Output is
  capped at 10 entries per file and 10 files, with the remainder summarised.
- Each rebuild under `ensure --watch` is preceded by a timestamped rule.
- `ProgressEvent` and `ProgressReporter` in
  `packages/compiler/src/project/progress.ts`: a data-only contract carrying
  item, index, and total. Nothing under `packages/compiler` knows a terminal
  exists.
- 65 CLI tests across `output-style`, `build-phases`, `progress-renderer`,
  `diagnostic-layout`, and `cli-output`, covering the TTY and the piped path for
  every message kind.

#### Changed

- `createProjectCache().compile` accepts an optional `onProgress`, fired once per
  file in order. Omitting it leaves behaviour and timings identical.
- `assembleResource` accepts an optional `AssemblyReporter` third argument, so
  the CLI can time assembly and manifest generation separately without the
  function being split.
- `writeResource` accepts an optional `onProgress` and now counts the generated
  `.env` file, which it previously wrote outside the counted set.
- `runCompile(root, config, options)` replaces `runCompile(root, config, cache)`.
  `BuildOutcome` gained `phases` and the sources of the files carrying
  diagnostics.
- Commands print through a new `Reporter` rather than straight to `Logger`, which
  stays the plain sink it always was. `CommandContext.reporter` is optional, so a
  caller that does not supply one gets the plain path.
- Counted nouns are pluralised, so `Wrote 1 files` now reads `Wrote 1 file`.

#### Unaffected

- Piped output is the pre-milestone format, byte for byte: one line per
  diagnostic, no escape sequence and no carriage return in the transcript.
- The generated resource is byte identical between a plain and a rich run, and
  the 300-file benchmark is unchanged at 47.4–51.8 ms cold and 1.13–1.6 ms warm.

### Milestone 11 — MTA OOP API

#### Added

- The MTA OOP API is typed: **57 classes, 652 methods, 218 properties**,
  generated from the same pinned `mtasa-lua-types` snapshot as the procedural
  catalog. `player:getName()` resolves, returns `string`, follows the element
  hierarchy, and reports `check-unknown-member` for a member the element does
  not have.
- Every OOP member records the procedural function it wraps, read from the
  upstream `@see` wiki link rather than derived from the method name. A member
  whose target the catalog does not declare is dropped instead of guessed, so
  every member in the surface resolves to a declared function.
- An OOP member takes the environment of the function it wraps, so
  `player:kick()` in a client file is `check-environment-api` and names
  `kickPlayer`.
- Arguments to an OOP method are checked against the wrapped signature, so
  `player:setNametagText(5)` is `check-type-mismatch`.
- `"oop": true` in `luam.json` gates the whole feature. It writes
  `<oop>true</oop>` immediately above `<info>` — the first manifest element with
  text content rather than attributes — and enables the typing. With the flag
  off, the same call is `check-oop-disabled` and the message names the
  procedural function to use instead and the field that enables the API.
- Editor support: `player:` offers the element's members and the ones it
  inherits, scoped by environment and by the flag, and hover names the return
  type, the environment, and the procedural function the member wraps. The LSP
  reads the flag from `luam.json` in the workspace root.
- Generator scripts `oop-parser.ts`, `oop-surface-builder.ts`, and
  `oop-emitter.ts`, plus `oop-declaration.ts` and `oop-surface.ts` in
  `@luam/mta-types`. The drift test covers the generated OOP files, so a hand
  edit fails.
- A benchmark group for the OOP registry, and a cold build with the flag on.

#### Changed

- `compile`, `check`, and `createProjectCache().compile` accept `oop`. The flag
  folds into the ambient cache key, so flipping it rechecks every module.
- `assembleResource` accepts `oop` and `generateManifest` accepts a
  `ManifestOptions` argument.
- `MemberInfo` carries optional `environment` and `procedural` fields, set only
  for MTA members. `fingerprintDeclarations` ignores them, so project caches do
  not rekey.
- `obj:method()` is now checked when the receiver is an MTA element type. A
  method call on any other receiver is unchanged and still returns `any`.
- A class the project declares shadows the element class of the same name
  entirely, in the checker and in completion alike.

#### Unaffected

- A project that does not enable `oop` produces the same manifest and the same
  Lua as before the milestone. The emitter never rewrites an OOP call into its
  procedural form in either mode.

### Milestone 10 — Build Directives

#### Added

- Build directives: source-level words that describe how a declaration takes
  part in the built resource. They are contextual keywords — `KEYWORDS` in the
  lexer is still the Lua 5.1 set — they never change the emitted Lua, and each
  one contributes an entry to the generated `meta.xml`.
- `export function f()` marks a global function callable from another resource
  and adds `<export function="f" type="server" />`. A client file produces
  `type="client"`, and a shared file produces one entry per side.
- `setting NAME = <literal>` adds `<setting name="*NAME" value="..." />`. The
  value is a string, number, or boolean literal, optionally a negated number.
- `depends 'resource'` adds `<include resource="resource" />`. The same
  dependency declared in several modules collapses into one element.
- Directive diagnostics for the forms MTA fails silently on:
  `parse-export-local`, `check-export-not-top-level`, `check-export-member`,
  `check-export-in-declaration-file`, `check-directive-not-top-level`,
  `check-setting-value-not-literal`, `check-depends-self`,
  `project-duplicate-export`, and `project-duplicate-setting`.
- A contribution channel through the pipeline. `CompileResult.directives` carries
  what a file declares, `CompiledModule.contributions` carries the resolved
  manifest entries, and `assembleResource` merges them. A shared export expands
  into its two sides at the mapping step, so the manifest layer receives an
  already-resolved side. Adding the next directive costs a parse rule, a
  contribution kind, and a manifest element.
- Editor support: the TextMate grammar scopes `export`, `setting`, and `depends`
  as modifiers only in directive position, the LSP offers all three at statement
  position and nowhere else, and hover on an exported function names the sides it
  is exported to.
- `TokenStream.report` — a non-fatal parser diagnostic sink, so
  `export local function` reports once and the rest of the file still parses.

#### Changed

- `meta.xml` element order is `info`, `script`, `export`, `setting`, `include`,
  `file`, with each group sorted by its own key. A project that declares no
  directive produces a byte-identical manifest to the one before this milestone.
- `compileProject` and `createProjectCache().compile` accept `resourceName`, used
  by `check-depends-self` and folded into the ambient key.
- `FunctionDeclaration` gained `isExported`, and the AST gained
  `setting-directive` and `depends-directive`, both erased by the emitter.

#### Deferred

- Export attributes such as `http="true"`, and `<aclrequest>`.
- Exporting a class method, which needs a generated global wrapper.
- Reading a `setting` back from Luam through a typed accessor.
- Renaming an export across the project from the editor.

### Milestone 9 — Resource Layout and Configuration

#### Added

- Resource configuration in `config.lua` at the project root. It is plain Lua,
  copied verbatim, never parsed, and listed in `meta.xml` as a shared script.
- Deployment values in `.env`, with `.env.local` layered over it for one
  machine and `<outDir>/<name>/.env` generated once for the server
  administrator. A key whose name looks sensitive is written blank, and the
  generated file is never overwritten.
- `packages/runtime/lua/env.lua` — a server-only runtime helper that reads the
  resource's `.env` and exposes `process.env` as a sealed, read-only table.
  Reading an undeclared key or assigning to any key raises an error naming the
  file.
- `process.env` typing. The compiler reads `.env`, types each key by the quoting
  rule (`PORT=3306` is a `number`, `PORT="3306"` a `string`), and declares
  `process` as a server-only project global. A misspelled key is
  `check-unknown-record-key` and lists the declared keys; `process` in a client
  or shared file is `check-environment-api`.
- A `record` type descriptor with named members, and `project` as an
  `ApiSource`, so a diagnostic can name `.env` as the origin rather than
  implying an MTA API.
- Asset copying. Files under `assetDirs` (default `["assets"]`) are copied at
  their relative path and declared as `<file>` entries; non-source files under
  `sourceDirs` are copied but stay undeclared, so a server-side data file is
  never transmitted. Assets are copied and compared as bytes.
- `.d.luam` declaration files. A declaration file is type checked, emits
  nothing, takes its environment from its path, and exports its declarations to
  the project. It adds one statement, `declare <name>: <type>`, which binds a
  global — pair it with an `interface` to type `config.lua`. A statement with an
  effect is `check-declaration-file-statement`, and `declare` outside a
  `.d.luam` is `check-declare-outside-declaration-file`.
- Interface member resolution. A value annotated with an interface reports
  `check-unknown-member` for a member the interface does not declare.
- `assetDirs` in `luam.json`.

#### Changed

- The generated resource mirrors the authored tree. `src/server/modules/x.luam`
  now emits `src/server/modules/x.lua` instead of `server/modules/x.lua`, and a
  path with a repeated `src` segment no longer resolves against the last
  occurrence.
- Runtime helpers are written to `src/<environment>/lib` instead of a shared
  `runtime` directory, so a server-only helper is never downloaded by a client.
- `meta.xml` script order is built explicitly — libraries, then `config.lua`,
  then the developer's scripts — rather than falling out of alphabetical
  sorting.
- Pruning no longer assumes every removable file ends in `.lua`. It removes
  `.lua` files, `meta.xml`, every entry of the previous `meta.xml`, and anything
  under a configured source directory, and never touches `.env`.
- `AmbientDeclarations` gained a `globals` list, so a `declare` crosses module
  boundaries with its type. An ordinary global still crosses as `any`.
- The project cache folds the `.env` declarations into its ambient key, so
  editing `.env` rechecks the files that can see `process`.
- The scaffold ships `.env` and `config.lua`, uses `process.env` in
  `src/server/main.luam`, and its `.gitignore` now commits `.env` and ignores
  `.env.local` — the inverse of the Vite and Next convention, so it is called
  out in the scaffolded README.
- ADR-005 moved from `Proposed` to
  `Accepted` with its open questions resolved.

#### Removed

- The `helperDir` configuration field and its `runtime` default. Helpers now
  follow the mirrored layout. A `luam.json` that still names it fails with
  `config-unknown-field`.
- Stale `src/template.js` and `src/template.d.ts` build artifacts in
  `@luam/template`, which shadowed `template.ts` during test resolution.

### Milestone 8 — Full MTA API Catalog

#### Added

- A catalog generator (`pnpm --filter @luam/mta-types generate`). It parses the
  `mtasa-lua-types` declaration files with the TypeScript compiler API and
  rewrites every MTA catalog module, the event catalog, and the element type
  hierarchy. Running it twice produces no diff.
- `packages/mta-types/src/catalog-overrides.ts` — handwritten overrides that win
  over the generated declarations and survive a regeneration, plus the element
  type aliases, parents, and exclusions the upstream source does not carry.
- `packages/mta-types/tests/generator.test.ts` — a drift test that fails when a
  generated file is edited by hand, plus coverage for parsing, normalization,
  emission limits, and override precedence.
- `packages/compiler/tests/fixtures/mta-api` — a three-environment fixture that
  calls a broad set of server, client, and shared APIs and compiles with no
  diagnostics, covered by `tests/catalog-coverage.test.ts`.
- A `global scope` benchmark group measuring the cost of building the
  environment scopes from the full catalog against reusing the cached ones.
- ADR-006 — the upstream
  source decision, the options rejected, and the licensing position.

#### Changed

- The MTA catalog grew from 246 handwritten declarations to 1294 generated ones
  (509 shared, 226 server, 559 client), from 53 events to 203, and from 21
  element types to 57. Compile time did not move: the global scope is cached per
  environment, so a file never walks the catalog.
- `outputChatBox` is now `shared`. MTA declares it on both sides, and scoping it
  to the server made valid client code a diagnostic.
- The catalog modules are split by Wiki category and environment
  (`mta-<category>-<environment>.ts`), aggregated by `mta-shared.ts`,
  `mta-server.ts`, and `mta-client.ts`.
- `eventEnvironment` moved to `src/event-lookup.ts` and `isElementType` and
  `elementAncestors` moved to `src/element-hierarchy.ts`, so the generated
  modules carry data only.
- 97 multi-return functions such as `getElementPosition` are typed `any` by
  rule, from the `LuaMultiReturn` marker in the source, instead of by hand.

### Milestone 7 — Performance and Polish

#### Added

- Incremental compilation. `createProjectCache()` caches declarations and
  compiled modules per file, keyed by a hash of the source and by a fingerprint
  of the declarations the file's environment can see. `ensure` keeps one cache
  for the session, so a rebuild after a body edit costs about 1 ms on a
  300-file project against 46 ms for a cold build.
- `ProjectResult.stats` reports how many declarations and modules a build
  reused. `luam build` and `luam ensure` print the reused count.
- A compiler benchmark suite (`pnpm --filter @luam/compiler test:bench`) with a
  synthetic project generator, cold and warm build scenarios, and a per-phase
  breakdown of parse, check, and emit.
- `performance.md` — measurements, methodology, what was
  optimized, and the known scaling limits.
- `security-review.md` — the milestone 7 security findings with
  severity and resolution.
- GitHub Actions: a CI workflow (typecheck, tests on Node 20/22/24, a build
  that scaffolds and compiles a resource with the bundled CLI, the benchmark,
  and `pnpm audit`) and a release workflow that packages the CLI tarball and
  the VSIX on a `v*` tag. Dependabot watches npm and Actions weekly.
- Strictness modes are documented with worked examples, including the one case
  where `#!nonstrict` changes the emitted Lua.

#### Changed

- The checker seeds a file's global scope in constant time. The `mta-types`
  catalog is converted once per environment and consulted through the binder
  instead of being copied into every file's scope. Checking a 300-file project
  went from 26.4 ms to 15.2 ms, and a cold build from 84.1 ms to 45.6 ms.
- The project layer shares one merged ambient set per environment across every
  file that declares nothing, and drops non-declaring modules from the merge.
  A 1200-file cold build went from 445 ms to 336 ms.
- `class.lua` builds one instance metatable and one constructor per class
  instead of allocating both on every `new`. The blocked-metamethod error now
  fires on a class's first construction rather than on every construction.
- Diagnostics read better. Argument-count errors say "expects at least 2
  arguments" instead of "2 argument(s)", an empty template interpolation lists
  the accepted forms, and a strict-mode `nil` mismatch names both ways out —
  the `?` annotation and `#!nonstrict`.
- `pnpm` is pinned through the root `packageManager` field.

#### Fixed

- Emitted string literals escape every control character below `0x20` plus
  `0x7f` as three-digit decimal escapes. A NUL byte in a source string used to
  reach Lua 5.1's lexer raw and truncate the literal.
- The `http` transport validates `resource`, `refreshFunction`,
  `restartFunction`, and `host` before they reach the request URL, so a value
  containing `/`, `?`, `#`, or `..` can no longer retarget an authenticated
  request.
- The `http` transport warns when the password would cross the network without
  TLS, that is, when `host` is not a loopback address.
- `discoverSources` rejects a source directory that resolves outside the
  project root, and `writeResource` refuses to write a file that resolves
  outside the resource directory.
- The scaffolded `.gitignore` excludes `.env`, `.env.*`, and `*.log`, and
  re-includes `.env.example`.

### Milestone 6 — Framework Template and Scaffolding

- `luam init` scaffolds a project: `luam.json`, `README.md`, `.gitignore`, the
  framework under `src/shared/framework`, and one example listener and command
  per side. Existing files are kept unless `--force` is passed.
- The framework (`Core`, `Loader`, `Event`, `Listener`, `Command`,
  `ThreadPool`) ships as Luam source in `@luam/template`, all `shared`, all
  depending only on `class.lua`.
- Auto-loading walks the `class.lua` registry — `getClasses()`, `__super`,
  `__name` — instead of a compiler-generated list.
- Cross-file class visibility: `compileProject` runs two passes so a handler can
  extend a framework base class declared in another file.
- `luam.json` gained a `helpers` field for manually injected runtime helpers.

### Milestone 5 — LSP and Editor

- A language server on the compiler's own frontend: diagnostics, completion
  scoped to the file's environment, hover, definition, references, and rename.
- A VS Code extension that starts the server and ships the TextMate grammar.

### Milestone 4 — CLI

- `luam build`, `luam check`, and `luam ensure` with a watch loop.
- `luam.json` configuration with validation, MTA server sync, and an `http`
  transport that refreshes and restarts the resource.
- The CLI ships as an esbuild bundle.

### Milestone 3 — Environments and Resource Assembly

- Every file resolves to `server`, `client`, or `shared` from its path or a
  `#!` directive, and MTA API availability is scoped to it.
- `@luam/mta-types` describes the Lua standard library and the MTA APIs with
  neutral type descriptors.
- Resource assembly maps sources to Lua outputs, orders runtime helpers first,
  and generates `meta.xml`.

### Milestone 2 — Classes, Enums, and the Runtime

- `class`, `extends`, `implements`, `new`, `self:super`, and `enum`.
- `@luam/runtime` ships the Lua 5.1 helpers and the catalog that maps each
  language feature to the helper it requires.

### Milestone 1 — Compiler Pipeline

- Lexer, parser, binder, type checker, and Lua 5.1 emitter.
- Type annotations, `type` aliases, compound assignment, template strings, and
  native object extensions.
