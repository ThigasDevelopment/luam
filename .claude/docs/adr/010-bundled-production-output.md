# ADR-010: The production build bundles one script per environment

**Status:** Accepted, partly amended by [ADR-016](016-flat-bundle-concatenation.md)

**Amends:** [ADR-003](003-mirror-source-tree-in-generated-resource.md). The
mirroring rule stays exactly as written, but it stops being the only layout.
It becomes the layout of the development output, and a second layout is
introduced for the production output.

**Context:**
`writeResource` produces one `.lua` file per authored `.luam` file, plus one
file per runtime helper, and both `luam build` and `luam ensure` use it. ADR-003
chose that shape so a path in an MTA error maps to an authored file by changing
one extension.

That reasoning holds while a developer is watching the resource run. It stops
holding once the resource is shipped. A shipped resource pays for the tree:

- Every module is a separate `<script>` MTA opens, reads, and compiles. A
  hundred-module resource is a hundred file reads at start, and a hundred more
  on every `restartResource`.
- Every shared and client module is a separate transfer to every joining player,
  each with its own transfer record.
- The resource directory published to a server exposes the authored structure —
  directory names, module names, the shape of the project.

The two audiences want opposite things. The developer wants the tree, because
the tree is what makes a runtime error legible. The server wants the smallest
number of files, because the file count is what it pays for on every start and
every join.

Luam can serve both without a compromise, because Luam has no `import` and no
`require`. Modules reach each other through globals, and the load order is
whatever `meta.xml` declares. `manifestScripts` already computes that order.
Bundling is therefore concatenation in an order the compiler already knows,
not a module-resolution problem.

**Options considered:**
- Keep one layout for both commands — no work, and the production resource keeps
  paying for a structure only the developer reads.
- One file for the whole resource — impossible without breaking semantics. MTA
  decides where a script runs from the `type` attribute on its `<script>` entry,
  so a single file has to be `type="shared"`, which executes server logic on the
  client and ships it in the download. Restoring the separation with runtime
  guards adds bytes instead of removing them.
- Two files, `server.lua` and `client.lua`, with the shared code inlined into
  both — fewer entries, but the shared code is duplicated on the server disk and
  the client download is unchanged, because a `type="shared"` script is already
  downloaded by every player today. It costs bytes and buys nothing.
- Three files, one per environment — the shared code exists once, each file
  keeps the `type` it has today, and the semantics are the ones already running.

**Decision:**

*Two layouts, selected by intent.* `tree` writes one file per module, exactly as
ADR-003 specifies. `bundle` writes one script per environment. `luam build`
defaults to `bundle`, because building is the act of producing something to
ship. `luam ensure` and `luam dev` default to `tree`, because they exist to keep
a running server in step with an editor. `--bundle` and `--no-bundle` override
the default on both commands, and `output.bundle` in `luam.json` overrides it
for the project.

*Three bundles, under `src/`.* `src/shared.lua`, `src/server.lua`, and
`src/client.lua`, each declared with the `type` its members already carry. A
bundle whose environment contributes nothing is not written and not declared.
The directory is the literal `src`, not `sourceDirs`: it names where the
resource keeps its code, which is a property of the generated resource, not a
reflection of how the project happens to be organized. The resource root then
holds only what has an owner other than the compiler.

*Each bundle carries its own helpers first.* The runtime helpers for an
environment are concatenated at the head of that environment's bundle, in the
`helperDepth` order `collectHelpers` already produces. The `lib/` directory
disappears from the production output.

*Each module keeps its own scope through `do ... end`.* Reversed by
[ADR-016](016-flat-bundle-concatenation.md): members are now concatenated with
no wrapper. The original reasoning follows. A module is emitted as
a `do` block, not as a called function. The block preserves what separate chunks
give today — a file-level `local` stays invisible to other modules, and its
register is released at the end of the block, so the Lua 5.1 limit of 200 active
locals is bounded per module rather than summed across the resource. A function
wrapper would do the same for scope but would add a stack frame, shifting every
`error(message, level)` and every `debug.getinfo` depth in the resource. The
block adds no frame.

*Two constructs are rejected at bundle time.* A module ending in a top-level
`return` returns from the bundle chunk and skips every module after it, so
`project-bundle-toplevel-return` names the file and the position. A bundle name
colliding with an asset path raises `project-bundle-output-collision`, the same
way `findDuplicateOutputs` already guards module outputs.

*`config.lua` and `.env` are never bundled.* [ADR-004](004-resource-configuration-and-environment-files.md)
gives each file an owner, and neither owner is the compiler. `config.lua` is
authored by hand, copied verbatim, and edited in the deployed resource by the
person tuning the server; folding it into `src/shared.lua` would put it behind a
rebuild and hand it to an owner who never had it. `.env` is read by the `env`
helper through `fileOpen` at runtime and is never a `<file>` entry. Both stay at
the resource root in both layouts.

*Load order in `bundle` becomes:* `config.lua`, then `src/shared.lua`, then
`src/server.lua`, then `src/client.lua`. This moves the helpers of a side after
`config.lua` rather than before it, which ADR-004 already permits: `config.lua`
is data the compiler does not parse and exposes one global table, so it cannot
depend on a helper. Within every bundle, helpers still precede the modules that
use them, and the shared bundle still precedes both sided bundles.

*Identifiers are not renamed and whitespace is not stripped.* The emitter
already produces dense Lua with no comments and no blank lines, so a
minification pass would have to rename locals to gain anything, and renaming
would destroy the position mapping [ADR-011](011-source-position-mapping.md)
introduces. Bundling is the whole of the size decision.

The production resource is therefore `meta.xml`, `config.lua` when the project
has one, `.env` when the project declares one, up to three scripts under `src/`,
and the declared assets under the paths they were authored at, because resource
code addresses an asset by that path.

**Consequences:**
- Positive: a shipped resource opens at most three scripts on start and on every
  restart, whatever the module count.
- Positive: the client downloads at most two scripts instead of one per shared
  and client module.
- Positive: the authored structure is no longer published with the resource.
- Positive: `ensure` and `dev` are untouched, so the workflow ADR-003 was
  written for keeps working exactly as it does today.
- Negative: a position in a production runtime error names a bundle and a line
  in that bundle. ADR-011 exists to answer this, and without it the production
  layout is a regression in debuggability.
- Negative: the compiler grows a second output shape, so every rule about the
  generated tree — pruning, duplicate detection, the manifest — has to state
  which layout it belongs to.
- Negative: switching a target directory between layouts leaves the other
  layout's files behind unless pruning tracks the bundle paths as well as the
  generated roots, and `src/` is a generated root only while `sourceDirs` is
  left at its default.
- Negative: putting the bundles under `src/` puts them where the tree layout
  writes modules, so an authored `src/server.luam` produces the same output path
  as the server bundle. The collision is caught rather than silent, but it is a
  collision the root-level names would not have had.
- Negative: a top-level `return` is legal Lua in a module today and stops being
  legal in the production layout, so a rare construct becomes a build error.
