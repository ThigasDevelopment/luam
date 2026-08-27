# ADR-003: Mirror the source tree in the generated resource

**Status:** Accepted, partly superseded by
[ADR-008](008-generated-manifest-standard.md)

**Superseded:** The helper directory. Helpers now land in `lib/<environment>/`,
outside the source tree, not in `src/<environment>/lib/`. A helper inside `src/`
would be matched by the source wildcard ADR-008 introduces as well as by its own
explicit entry, and loading `class.lua` twice resets the class registry. The
environment separation this decision established is preserved; only the
directory changed. The mirroring rule for author-written modules is unchanged.

**Context:**
`outputPath` in `packages/compiler/src/project/resource.ts` finds the last `src`
segment of a source path and drops everything up to and including it, so
`src/server/modules/example.luam` is written as `server/modules/example.lua`.
The generated tree therefore does not match the tree the developer authored,
and the rule breaks outright when a path repeats the segment, as in
`src/server/src/example.luam`.

Milestone 6 lets a developer organize files freely under `src/server`,
`src/client`, and `src/shared`, so the mapping between what is authored and
what is generated is now something developers read while debugging a running
resource. Runtime helpers add a second problem: they are written to
`helperDir`, which defaults to `runtime`, a name that now collides with the
word used for the authored resource itself.

Assets are a third gap. `resourceFiles` emits helpers, scripts, and `meta.xml`
and copies nothing, while `generateManifest` already accepts `<file>` entries
that `assembleResource` never passes.

**Options considered:**
- Mirror the full relative path — the generated resource repeats the authored
  tree exactly, changing only the extension. Pros: one rule, no segment search,
  a stack trace in MTA points at a path that exists in the editor. Cons: paths
  in `meta.xml` grow a `src/` prefix that carries no meaning for MTA.
- Keep stripping the source root — no change. Cons: the generated tree diverges
  from the authored one, and `lastIndexOf('src')` stays wrong for nested paths.
- Flatten every script to the resource root — Cons: guarantees name collisions
  and destroys the organization the developer chose.

**Decision:**
The generated resource mirrors the authored tree relative to the project root,
replacing `.luam` with `.lua` and changing nothing else.
`src/server/modules/example.luam` becomes `src/server/modules/example.lua`.
`outputPath` stops searching for a source-root segment.

Runtime helpers follow the same principle instead of a dedicated directory.
Each helper is written to `src/<environment>/lib/<name>.lua`, where the
environment is the one `collectHelpers` already computes from usage: a helper
used on both sides lands in `src/shared/lib`, a server-only helper in
`src/server/lib`. The `helperDir` default of `runtime` is retired.

Non-source files are copied verbatim, preserving their relative path, and
directories under `assets` gain `<file>` entries in the manifest.

Script order in `meta.xml` becomes explicit in `manifestScripts` rather than a
side effect of alphabetical sorting: libraries first, then the resource
configuration, then the developer's scripts.

`pruneResource` currently deletes only `.lua` and `meta.xml`, so it tracks the
files it copies and removes copied files whose source has disappeared.

This supersedes the sentence in [ADR-002](002-luam-source-file-extension.md)
stating that `src/server/main.luam` becomes `main.lua`; it now becomes
`src/server/main.lua`. The rest of ADR-002 stands.

**Consequences:**
- Positive: the path in a runtime error maps to an authored file by changing
  one extension, with no mental transformation.
- Positive: `outputPath` loses the `lastIndexOf('src')` search and the nested
  `src` bug with it.
- Positive: a helper's directory and its `meta.xml` `type` attribute agree, so
  a server-only helper is no longer downloaded by every client.
- Positive: load order stops depending on the names developers happen to give
  their files.
- Negative: `<script src>` paths in `meta.xml` gain a `src/` prefix, which is
  longer and means nothing to MTA.
- Negative: `findDuplicateOutputs` still has to run, because two entries in
  `sourceDirs` can still produce the same relative path.
- Negative: pruning grows a bookkeeping requirement it did not have when it
  could assume every removable file ended in `.lua`.
