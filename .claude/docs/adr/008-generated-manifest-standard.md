# ADR-008: The generated `meta.xml` follows an authored standard

**Status:** Accepted

**Context:**
Milestone 3 made the compiler the sole owner of `meta.xml`, and milestone 10
added the build directives that contribute `<export>`, `<setting>`, and
`<include>` entries to it. Everything in the file is derived: the script list
from the module set, the environment from the path, the info block from
`luam.json`.

The project owner then wrote the manifest the way a resource author actually
wants to read it, kept in `examples/meta.xml`. It differs from what the
generator produces in ways that are not cosmetic: it groups entries under
section comments, it collapses a directory into one wildcard entry instead of
one line per file, it omits attributes that equal the MTA default, and it
carries elements the generator does not emit at all.

This ADR records what that standard is, so the generator can be brought to it.

**Decisions:**

*Wildcards are emitted literally.* `src/shared/**/*.lua` is one `<script>` entry,
not one entry per file. MTA expands the pattern; this is confirmed by the
project owner from production use, and it contradicts the assumption the
generator was built on. The cost is that the compiler stops enumerating scripts
into the manifest, so a stale path or a missing file is no longer caught at
build time from the manifest side.

*`<info>` carries no `name`.* MTA takes the resource name from the containing
folder. `name` in `luam.json` still names the output directory and the resource
`ensure` restarts, but it never reaches the manifest. Attribute order is
`author`, `type`, `version`, `description`.

*An attribute equal to the MTA default is omitted.* `type="server"` is the
default for `<script>` and `<export>`, so a server entry carries no `type`.

*`cache="false"` is unconditional on every `client` and `shared` script*, in
development and in production alike, with no exception and no build mode. The
`isCached` field leaves `ManifestScript`. The bandwidth cost in production is
accepted deliberately.

*Runtime helpers move out of `src/`.* They land in `lib/<environment>/` and are
emitted as explicit entries ahead of the wildcards. A helper inside `src/` would
be matched by the source wildcard as well as by its own explicit entry, and
loading `class.lua` twice resets the class registry. This supersedes the helper
location decided in
[ADR-003](003-mirror-source-tree-in-generated-resource.md); the environment
separation that decision established is preserved, only the directory changes.

*A shared export is one entry.* `<export type="shared" />` replaces the pair of
`server` and `client` entries milestone 10 emits, reversing that part of
[ADR-007](007-build-directives.md).

*`<oop>true</oop>` sits above `<info>`* when `luam.json` carries `"oop": true`.
It is the first manifest element with text content rather than attributes.
Milestone 11 covers the typing this flag gates.

*`<file>` order is meaningful.* A shader that depends on another relies on it,
per the project owner. Asset ordering is therefore a real requirement, not
presentation.

*Formatting stays as generated today* — four spaces, double quotes,
`attr="value"`, self-closing with a leading space — with section comments added
between groups and no blank lines. A section comment is emitted only when its
section has at least one entry, so an empty group leaves no orphan. The comment
wording is plain English — `Resource information`, `Runtime library`,
`Configuration`, `Source scripts`, `Exported functions`, `Assets`,
`Minimum MTA version` — rather than the possessive-plural style of
`examples/meta.xml`, because everything a user reads is one wording in English.
The entries themselves follow the authored file exactly.

*Load order is a deterministic default plus an explicit `loadOrder`.* The
default is helpers, then `config.lua`, then the pinned entries, then the
wildcards in shared, server, client order. An ordered `loadOrder` array in
`luam.json` pins exceptions ahead of their group; each entry is a source path
relative to the project root, and an entry matching no file is
`project-load-order-missing`, which fails the build before a manifest is
written. The same list orders `<file>` entries.

*A directory whose files do not all match the environment their path implies is
enumerated rather than collapsed.* A file under `src/shared/` carrying an
`#!server` directive needs `type="server"`, which the `src/shared/**/*.lua`
wildcard cannot express. Rather than emit a wrong type, the compiler falls back
to explicit entries for that directory alone and keeps the wildcard for the
others. This is the same fallback shape the double-load question would need.

*`min_mta_version` is resolved at build time from the MTA release feed.* The
build queries the GitHub releases of `multitheftauto/mtasa-blue` and writes the
latest release into `server` and `client`. That repository ships both sides from
a single release, so unless a separate feed per side is identified, both
attributes carry the same value.

The lookup must never be able to fail a build. On any failure — offline, rate
limited, feed unreachable — the build falls back to the last value it resolved
successfully, cached in the project; with no cached value it warns and omits the
element. This keeps an offline build working and keeps the network out of the
compiler packages, which make no requests of their own. The rule in `CLAUDE.md`
is amended to allow this and the `ensure` transport, and nothing else.

The consequence is accepted deliberately: the manifest stops being a pure
function of the source. The same commit built on two days can differ in this one
element, so the reproducibility guarantee now reads "identical for a given
resolved MTA version".

*The `setting` and `depends` directives are removed from the language.* Parser,
checker, manifest, editor, and tests, leaving `export` as the only build
directive. This reverts that part of [ADR-007](007-build-directives.md). The
contribution channel itself stays: it carries `export` today and is what a
future directive would reuse. Both words are ordinary identifiers again.

**Still open:**

- *Whether MTA runs a file twice when an explicit entry and a wildcard both
  match it.* Milestone 13 shipped without verifying this on a real server, so
  the design rests on the project owner's production manifest, which places an
  `index`/`main` entry ahead of the wildcard. Nothing the compiler generates by
  default relies on the answer: the default order emits no overlapping entry, so
  only a project that sets `loadOrder` is exposed. If a real server does
  double-load, the fix is the fallback already implemented for the environment
  mismatch above — enumerate the environment a `loadOrder` entry touches and
  keep the wildcard for the others.
- *What the production artifact contains.* `build/<name>/.env` is generated with
  sensitive keys blank and never overwritten, which invites local edits; copying
  the folder to production would carry them. This is not a manifest concern and
  is out of scope for milestone 13.

**Consequences:**
- Positive: the generated manifest reads like the one a resource author would
  write, and a directory of scripts is one line rather than fifty.
- Positive: the helper move removes a real double-load hazard that the wildcard
  would otherwise introduce.
- Negative: it supersedes part of ADR-003 and part of ADR-007, and rewrites
  every manifest snapshot in the suite.
- Negative: pruning can no longer use "every entry of the previous `meta.xml`"
  as part of its removable set, because an entry becomes a pattern rather than a
  path. That falls back to the source directory walk.
- Negative: with the script list no longer enumerated, the manifest stops being
  a place where the compiler can catch a stale path. `loadOrder` is the one
  place a path is still named, and it is checked.
- Negative: the CLI gains a second outbound HTTP call and an on-disk cache at
  `.luam/mta-version.json`, which the scaffolded `.gitignore` excludes.
