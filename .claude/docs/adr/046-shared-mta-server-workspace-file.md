# ADR-046: A shared MTA server is a workspace, described by `.luam.server` and driven from its console

**Status:** Accepted

**Context:**
[ADR-017](017-manifest-domain-contract.md) made `.luam.manifest` the project
contract and gave every configuration domain one owner. The `deployment` domain —
`serverPath` and `resourcesDir` — and the `development` domain — the log relay
and `development.server.executable` — went to the resource manifest, because at
the time a project was one resource and the server it deployed into was that
resource's business.

[ADR-020](020-cli-owned-mta-server-process.md) then let the CLI own an MTA
process, and [ADR-042](042-formatter-configuration-file.md) opened the one
exception to the one-project-file rule with a test attached: a configuration
leaves the manifest only when it answers a question the manifest cannot be
asked. This record argues that the deployment domain now fails that test, and
that the failure is not only about where a field lives.

*What broke it.* An MTA server binds port 22003. One installation runs one
process, so a developer working on two resources at once cannot run two
`luam dev --start-server` loops — the second server refuses to start. The only
path today is `luam ensure` in each resource directory, syncing into a console
neither invocation owns, restarting nothing; the CLI documentation already has
to explain that `ensure` cannot write to a console another process owns.

Meanwhile `serverPath` is copied into every manifest that deploys into that
installation. Moving the server means editing all of them, and two manifests
that disagree sync into two places with no diagnostic, because neither file can
see the other.

*The test from ADR-042.* The formatter file earned its exception because a
`.luam` file outside any project still has a style. The deployment fields earn
theirs for the mirror-image reason: **the installation is shared by resources
that do not know about each other.** "Where does this deploy" has one answer for
a whole directory of resources, and no single resource's manifest is entitled to
give it.

*The second question.* Where the fields live does not by itself fix the
workflow. A developer does not want to declare, ahead of time, the set of
resources they are about to touch — that set changes hourly, and a file that has
to be edited to change it is a file that will be wrong. What they want is a
running server and a way to say, right then, "also watch this one".

**Decision:**
A directory of resources is a *workspace*, described by a `.luam.server` file at
its root, and worked on through a session that the CLI owns.

- **`.luam.server` is written in the manifest dialect**
  ([ADR-015](015-luam-manifest-language.md)) with its own schema, exactly as
  `.luam.formatter` is. `analyzeManifest` takes a `ManifestSchema`, so the pass,
  the type checking, the closed-set checking, the unknown-field diagnostics, the
  editor hover and the completion are reused rather than rewritten.
- **It is found by walking up** from the working directory to the nearest one,
  stopping at a `node_modules` segment — the walk `findFormatterFile` already
  performs. One walk serves both entry points: at the workspace root it describes
  the directory, and inside a single resource it is the server that resource
  deploys into.
- **A workspace's resources are its direct children that hold a
  `.luam.manifest`.** One level, never recursive, so a build output tree or a
  vendored copy cannot join by accident and `node_modules` is never walked.
- **The deployment fields stay readable in the manifest, and lose.** When a
  `.luam.server` is found its values win, and a manifest that still sets
  `serverPath`, `resourcesDir` or `development.server` warns once, naming the
  file to move the line into. A project with no `.luam.server` behaves exactly as
  it does today. The fields join `REMOVED_FIELDS` in a future major, not here.
- **`luam dev` at a workspace root opens a session.** It starts one MTA process,
  waits for readiness, follows the log, and attaches **nothing**. A session with
  no resource attached compiles nothing and watches nothing; the cost of opening
  one does not scale with the size of the directory.
- **Resources are attached from inside that session, by name.** `ensure
  <resource>` builds it, syncs it, starts watching it and starts it on the
  server. `drop` reverses the watch, `rebuild` forces a cycle, `list` says what
  is attached, `help` names the vocabulary. The set is discovered and changed at
  the speed the work changes, and never written down.
- **The session terminal carries two vocabularies, split by reserved first
  words.** The console input layer becomes line-oriented: it buffers to the
  newline, and a line whose first word is a session verb is executed by the CLI
  while every other line is forwarded verbatim to the MTA console. A leading
  space forwards a line unchanged, so a server command that collides with a
  session verb stays reachable.
- **A workspace root needs no manifest of its own.** `luam dev`, `luam server`
  and `luam ensure <resource>` accept a directory that holds a `.luam.server` and
  no `.luam.manifest`. Inside a resource directory every command behaves as it
  does today.

**Consequences:**

- The owned console stops being a pipe. Today `connectServerConsoleInput` sets
  raw mode and forwards bytes, intercepting only `Ctrl+C`; a session that reads
  commands has to own the line buffer, the echo and the erase. That is the real
  cost of this record, and it is paid once.
- Reserved verbs are a namespace taken from the MTA console. The mitigation is
  narrow — a verb is only a verb as the first word of a line, and a leading space
  escapes it — but the collision is real, and every verb added later takes
  another name from a vocabulary this project does not own. The list stays short
  for that reason.
- The CLI grows a second context. `createProjectContext` loads one manifest and
  fails without it; a workspace context loads a `.luam.server`, discovers the
  resources under it, and produces a command context per resource on demand.
  Commands stay registry entries ([ADR-012](012-cli-command-registry.md)); what
  changes is how many contexts an invocation can carry.
- The language server's single-project assumption becomes a defect users hit
  rather than one they cannot reach. `WorkspaceIndex` keeps one settings object,
  one environment and one library index for a whole workspace, taken from the
  first manifest it happens to analyse, and merges every file's declarations into
  every other file's ambient scope filtered only by side. The directory this
  record blesses is the directory a developer opens in the editor, so per-project
  scoping is no longer deferrable.
- The exception list is now two entries long, produced by one rule: a file leaves
  the manifest when the question it answers is not the resource's to answer.
  `.luam.formatter` because the file may have no project; `.luam.server` because
  the server has many.
- One workspace, one server. Two installations are two ports and two
  `mods/deathmatch` trees, so they are two workspace directories. Letting one
  file describe both would move the port collision inside the CLI.
