# ADR-017: The manifest is a closed set of typed domains, each with one owner

**Status:** Accepted

**Extends:** [ADR-015](015-luam-manifest-language.md). ADR-015 decided what the
manifest *is* — a restricted, pure, total Luam dialect evaluated in process
against one field catalog. It did not decide what the manifest *says*. This ADR
decides that: the catalog stops being a flat list of settings and becomes a set
of domains, each of which owns one question and answers it completely.

**Context:**
The manifest works. `name`, `sourceDirs`, `assetDirs`, `outDir`, `loadOrder`,
`oop`, `helpers`, `serverPath`, `resourcesDir`, `output`, `transport`, and
`development` all evaluate, validate, and complete. The problem is not any one
of those fields. It is that they sit in one flat namespace where a compiler
setting, a deployment credential, and a file-system layout are indistinguishable
neighbours, so nothing tells a reader — or a cache — which of them changes the
generated Lua and which only changes where it is copied afterwards.

Three concrete gaps follow from that.

`sourceDirs` says *where to look*. It does not say *what a file is*. The
environment of a source is recovered afterwards by `environmentRoot`, which walks
the path looking for the literal segments `src/server`, `src/client`, and
`src/shared`. A project that puts its jobs in `workers/` or its interface in
`ui/` can list those directories in `sourceDirs` and have every file in them
silently classified `shared`. Discovery and classification are the same question
asked twice, in two places, with two answers.

`assetDirs` copies whole directories to the same relative path. It cannot ship
one file, cannot ship a glob, and cannot put a file anywhere but where it already
is. Worse, `readProjectInputs` also walks `sourceDirs` and copies every non-Luam
file it finds there, so whether a file ends up in the resource depends on which
directory it happens to share with a `.luam` file.

`oop` is a compiler setting that changes checking, rewriting, and `meta.xml`. It
sits at top level beside `serverPath`, which changes nothing about compilation at
all. Any cache keyed on "the manifest changed" must therefore recompile after a
password edit.

There is also a bootstrap problem the flat model hides. The manifest may read
`env`, and `env` comes from `.env`, whose path is currently hard-coded in three
places — `project-inputs.ts` in the CLI, `project-environment.ts` in the LSP, and
`ENVIRONMENT_FILE` in `resource.ts`. The LSP additionally searches parent
directories for the nearest `.env`, so the editor and the CLI can disagree about
which file declares `process.env`.

**Options considered:**

- **Keep the flat catalog and add fields to it.** Cheapest change, and it is what
  the catalog already supports. It also makes every problem above permanent:
  `sources` cannot both replace `sourceDirs` and stay a sibling of `outDir`
  without the flat list growing a second implicit grouping that only the
  documentation knows about. Cache identity stays "the whole manifest".
- **A generic, plugin-oriented build file.** Give the manifest a way to name a
  module that computes values, transforms files, or runs at phase boundaries.
  This is what most build tools converge on, and it answers every future request
  at once. It also unwinds ADR-015 completely: a manifest that can name a plugin
  is a manifest that executes code, which reintroduces the child process, the
  trust boundary, the editor's inability to evaluate it, and the snapshot channel
  that ADR-015 deleted. It also makes the catalog non-authoritative, so
  completion, hover, and the manual can no longer be derived from it.
- **Typed domain tables.** Group the fields by the question they answer, give
  each group a record type in the same catalog, and require every field to have a
  built-in consumer. Costs a migration of three existing fields and a nested
  catalog model. Keeps the dialect pure, keeps the catalog authoritative, and
  makes cache identity expressible per phase because the phases now line up with
  the domains.

**Decision:**

*The manifest is a closed set of domains, and every field belongs to exactly
one.* A domain owns one question, names one owner, and has at least one built-in
consumer that observably changes behaviour.

| Domain | Question it answers | Owner |
| --- | --- | --- |
| `name`, `author`, `version`, `description` | Who is this resource? | Resource identity and generated `<info>` |
| `compilerOptions` | How is the source checked and emitted? | Compiler |
| `sources` | Which files are source, and which side is each one? | Compiler, via source discovery |
| `assets` | Which files are copied, and where do they land? | Resource assembly |
| `dependencies` | Which other resources must be present? | Generated `<include>` |
| `engine` | Which MTA version is required? | CLI, at the generated XML boundary |
| `environment` | Which files declare `process.env`? | CLI and LSP, before analysis |
| `helpers`, `loadOrder` | What is bundled, and in what order? | Resource assembly |
| `outDir`, `output` | Where do artifacts go, and in what shape? | Local artifact layout |
| `development` | What is enabled only while developing? | `luam dev` |
| `serverPath`, `resourcesDir`, `transport` | How is the resource deployed? | Deployment |

*Every domain except `name` is optional, and every omitted domain normalizes to a
complete default before any consumer sees it.* A consumer never asks whether a
field was authored. `compilerOptions = { }` and an absent `compilerOptions`
produce the same normalized value.

*`compilerOptions` holds only what changes checking or emission.* `strict`,
`oop`, `noUnusedLocals`, `noUnusedParameters`, `warningsAsErrors`. Strictness
resolves in a fixed order: a file's `#!strict`, `#!nonstrict`, or `#!nocheck`
directive first, then `compilerOptions.strict`, then the built-in default `true`.
Project-wide `nocheck`, `target`, `noEmit`, and arbitrary diagnostic suppression
are rejected: the first three describe a compiler Luam does not have, and the
fourth turns a diagnostic into a negotiation.

*The manifest is always checked in its own strict restricted mode.*
`compilerOptions.strict = false` weakens the project, never the manifest. The
manifest is the file that decides what the settings are; it cannot be checked
under settings it has not finished producing.

*`sources` replaces `sourceDirs` and owns classification.* Each side is a list of
literal paths and globs, and a file's mapped side is the side whose patterns
matched it. `environmentRoot`'s path-sniffing stops being how a project is laid
out and becomes only the default mapping, expressed as ordinary patterns:

```
sources = {
    server = { 'src/server/**/*.luam' },
    client = { 'src/client/**/*.luam' },
    shared = { 'src/shared/**/*.luam' },
}
```

A `#!server`, `#!client`, or `#!shared` directive remains a per-file override and
keeps the existing warning when it disagrees with the mapped side. A file matched
by two sides is a configuration error reported before compilation, naming the
file and every conflicting pattern. Order does not establish precedence, because
a rule that depends on declaration order is a rule that breaks when a list is
sorted.

*The glob grammar is `*`, `**`, and `?`, and nothing else.* No regex, no
negation, no brace expansion, no extglobs. `/` is the canonical separator on
every platform, absolute paths and `..` are rejected, and a static root that
resolves inside a generated or dependency directory is rejected before traversal.
The exclusion of regex is deliberate and permanent: a pattern language with
backtracking is a pattern language with a pathological case, and a build that
matches files must terminate.

*Non-Luam files are no longer copied because of where they sit.* A file reaches
the resource because `assets` says so. `assets` is an ordered list of `from`/`to`
records; `from` is a literal file, a directory, or a glob, and `to` defaults to
`.`. A directory or glob preserves the relative suffix below its static root; a
literal file may be renamed. Every destination — sources, helpers, the generated
`meta.xml`, and assets — goes into one index, and two mappings producing the same
output are an error even when the bytes match. Nothing is resolved by
last-write-wins, because a build whose result depends on iteration order is a
build that cannot be reproduced.

*`dependencies` is a list of required resource names and nothing more.* Each
entry produces one `<include resource="..." />` in deterministic order. Optional
dependencies are excluded until Luam has a checking or runtime semantic for them:
a field that documents a name but changes no artifact is a field that teaches
users to trust something that is not enforced.

*Engine requirements live under `engine`, not `mta`.* `engine.minVersion` is a
pinned version or `'latest'`. A pinned version is validated and emitted with no
network request; `'latest'` keeps the existing lookup, 24-hour cache, and
offline fallback from [ADR-008](008-generated-manifest-standard.md). Only the CLI
resolves `'latest'`; the compiler, runtime, catalog, and LSP packages import no
HTTP client, and a build with no network still succeeds. `mta.minVersion` is
rejected rather than aliased — the generated XML keeps MTA's
`<min_mta_version>` spelling at the boundary where it belongs, and the authored
vocabulary describes the role, not the vendor.

*`environment` selects the project environment files, and the paths are static.*
`environment.file` defaults to `.env` and owns the declared key set and inferred
types; `environment.localFile` defaults to `.env.local` and may override values
only for keys the base file declared. Neither may be a glob, an absolute path, a
parent traversal, or an expression that reads `env`, `mode`, or another manifest
field. That restriction exists to break a cycle: Luam must know which file to
read before the values in it can participate in evaluating the manifest that
selects it. The loader therefore resolves these two paths first, loads the files,
and only then completes analysis. The LSP stops searching parent directories; the
selected files are authoritative for the CLI and the editor alike, and their
values never appear in diagnostics, logs, traces, hover, completion detail, or
source maps.

*Cache identity is per domain, at the phase that consumes it.* Compiler options
and each file's assigned side join the declaration and module cache keys. Source
patterns invalidate discovery. Assets, dependencies, engine, helpers, load order,
and output invalidate assembly. Identity, `development`, and the deployment
domain invalidate nothing about compilation. Editing `description` must not
recompile a file, and moving a file between sides must recompile that file and
its dependents and no one else.

*A field is added only with an implemented consumer.* This is the rule that keeps
the domain model from decaying back into a flat list: without it, `engine`
becomes a vendor drawer and `compilerOptions` becomes a settings bag. Any future
plugin, hook, configuration inheritance, optional dependency, regex, multiple
manifest, or diagnostic ignore list requires its own decision record.

*Removed fields fail; they are not aliased.* `oop`, `sourceDirs`, and `assetDirs`
produce a positioned error naming the exact replacement. Accepting both spellings
would create two sources of truth for one value, which is the specific failure
this ADR exists to prevent.

**Diagnostics.** The codes below are specified before implementation so the
messages, not the implementation, decide what is an error.

| Code | Raised when |
| --- | --- |
| `config-invalid-pattern` | A pattern uses regex syntax, negation, braces, or a malformed `**` segment. |
| `config-escaping-path` | A pattern or path is absolute, contains `..`, or resolves outside the project. |
| `config-missing-source` | A literal source path does not exist or does not end in `.luam`. |
| `config-no-sources` | The complete `sources` mapping matched no file. |
| `config-source-side-conflict` | One file matched patterns from more than one side. |
| `config-output-collision` | Two outputs — source, helper, manifest, or asset — claim one destination. |
| `config-invalid-dependency` | A dependency is not a valid resource name, or names this resource. |
| `config-invalid-engine-version` | `engine.minVersion` is neither `'latest'` nor a valid version. |
| `config-missing-env-file` | An explicitly configured environment file does not exist. |
| `config-removed-field` | `oop`, `sourceDirs`, or `assetDirs` is assigned. |

**Consequences:**

- Positive: a file's side is declared where the file is declared, so a project
  can lay itself out however it likes and still get correct MTA API availability
  and a correct `<script type>`.
- Positive: what ships in the resource is stated, not inferred from directory
  adjacency, so adding a `.luam` file to a folder can no longer change which
  unrelated files are copied.
- Positive: cache identity becomes expressible. Formatting-only and
  deployment-only manifest edits reuse compilation because the domains say which
  phase cares.
- Positive: the CLI and the LSP read one environment file, chosen in one place,
  so `process.env` cannot differ between the terminal and the editor.
- Positive: completion never offers a field from another domain, and hover can
  state an owner, because the catalog now knows both.
- Negative: three fields are removed, and every template, example, fixture,
  snippet, and page that uses them is rewritten. Projects relying on incidental
  copying from source directories must now declare those files.
- Negative: source discovery gets more expensive to reason about. A missing file
  used to be silence; it is now an error, and a mistyped glob that matches
  nothing is only caught when the whole project matches nothing.
- Negative: the catalog model grows nesting and list-of-record fields, so the
  evaluator, the normalizer, completion, and hover each handle one more shape.
- Negative: `engine` and `compilerOptions` are attractive drawers. Only the
  consumer rule keeps them closed, and that rule is a convention this ADR
  asserts, not something the type system enforces.
