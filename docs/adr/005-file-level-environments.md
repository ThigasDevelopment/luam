# ADR-005: Assign one environment per file

**Status:** Accepted

**Context:**
MTA assigns a side to each script entry of `meta.xml`: `<script src="..." type="server"/>` or `type="client"/>`, and a file that is listed for both sides is what Luam calls `shared`. The unit the platform loads, and the unit it decides a side for, is the file. Luam mirrors that: `sources` maps path patterns to `server`, `client`, and `shared`, a file directive may override the path, and a disagreement between the two is reported as `env-path-directive-conflict` instead of being resolved silently. The recurring request is a block-level form — a `client do ... end` inside a server file — and this records why the answer is no.

**Options considered:**
- **One environment per file, split the file to change sides.** Matches what MTA loads, keeps every generated script a whole file with its own top-level effects, and makes the side of any line answerable by looking at its path or its directive.
- **Block-level environments compiled into two generated scripts.** The block would have to be lifted into a separate file, and everything it shares with its surroundings breaks at that seam. A `local` read by both halves would have to become a global to survive, which changes visibility and collision behaviour. A closure over a surrounding local cannot be lifted at all, because the upvalue does not exist in the other chunk. Control flow crossing the seam — a block inside an `if`, a loop, or a function body — has no meaning once the two halves load as separate chunks in separate processes. Top-level effect order is not preserved either: the server chunk runs when the resource starts, the client chunk when a player joins. Rejected: the construct would look like a language feature while silently changing the semantics of the code inside it.
- **Per-function environment annotations.** Same seam as the block form, with the additional problem that the side of a line stops being visible from the file that holds it.
- **A single shared file plus runtime side checks.** Already expressible today by writing a `shared` file and branching on the environment at runtime. It costs a runtime branch and ships both halves to both sides, which is the author's call to make, not a compiler feature.

**Decision:**
The environment is a property of the file. A file is `server`, `client`, or `shared` as a whole, resolved from its `sources` pattern unless a file directive overrides it. There is no per-block or per-function environment, and Luam does not promise to split locals, closures, control flow, or side effects across MTA scripts. Code that needs to run on the other side goes in another file, and the two communicate the way MTA resources already do — events, exports, or a `shared` module both sides load.

**Consequences:**
- Positive: what the compiler emits maps one-to-one onto what MTA loads, so a generated `meta.xml` entry has one obvious source file.
- Positive: environment validation of MTA APIs and cross-file references has a single, decidable answer per file, which is what makes `check-environment-api` reliable.
- Positive: no construct can quietly change the visibility of a local or the order of a top-level effect.
- Negative: a small piece of client code inside a mostly server-side feature needs its own file, which makes some features span more files than the author would like.
- Negative: authors arriving from single-file Lua resources have to learn the split before writing anything that touches both sides.
