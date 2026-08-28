# ADR-037: Run tests on a discovered Lua 5.1 interpreter with recorded MTA stubs

**Status:** Accepted

**Context:**
Luam has never shipped a way for a developer to test the resource they wrote. The
constraint that shapes any answer is the one the product has held since milestone 1:
the compiler emits Lua text and never executes it, and a build never runs project
code. A test runner is by definition an execution surface, so the question is not
whether to break that rule but where to draw the line, and what host runs the Lua.

**Options considered:**

- **Bundle a Lua 5.1 interpreter with the CLI.** Makes `luam test` self-contained
  and removes every question about the developer's machine. It also adds a native
  dependency to a package that declares none, turns a pure-TypeScript publish into
  a per-platform binary publish, and makes the CLI's install size and supply chain
  a function of a C toolchain. Rejected: the cost lands on every user of every
  command to serve one.
- **Drive the MTA server's own Lua headlessly.** Tests would run against the real
  runtime with the real API surface, which is the only way to be sure a call
  behaves as MTA behaves. It also requires a server installation before the first
  test runs, needs a protocol to start a resource, collect results, and stop again,
  turns every unit test into a game-loop round trip, and overlaps the remote
  execution surface that [35.01](../../plans/35.01-debugging-decision.md) exists to
  decide. The plan for this milestone puts a live server explicitly out of scope.
  Rejected here, not forever: it is the natural shape of an integration runner, and
  this decision does not block one.
- **Use a Lua 5.1 interpreter the developer already has.** Costs no dependency,
  runs the exact language version the compiler targets, and starts in milliseconds.
  The command's availability depends on the machine, which is a real cost and is
  paid in a diagnostic rather than in silence.

**Decision:**
`luam test` compiles the project together with its test files and runs the result
on a **Lua 5.1 interpreter discovered on `PATH`** — `lua5.1`, `lua51`, `lua`, then
`luajit`, each accepted only when it reports `_VERSION` as `Lua 5.1`. `--lua <path>`
and the `LUAM_LUA` variable pin a specific one. When none is found the command
fails with the list of names it tried and how to fix it, and `luam doctor` reports
the same fact before a developer ever writes a test. The published CLI's dependency
count is unchanged.

**MTA APIs are not present in that host, and Luam does not pretend otherwise.** The
harness installs a recording stub for every MTA function the catalog declares for
the file's environment. A stub records its arguments and returns `nil` unless the
test configures it through `mta.returns` or `mta.stub`; `mta.calls` reads back what
was recorded, and every stub is reset before each test. Non-function MTA globals —
`root` and its kind — are absent rather than stubbed, so reaching for one fails
loudly instead of yielding a value that means nothing. **Stubs record calls; they do
not simulate MTA behaviour.** What can be tested is the logic a developer wrote and
the calls it makes. What cannot be tested is whether MTA does the right thing in
response, and that stays true until an integration runner exists.

**The boundary is explicit:** `luam test` is a command a person runs. It is never a
step inside `build`, `check`, `ensure`, or `dev`, and those four continue to execute
no project code.

A test file is any file ending in `.test.luam`. It is excluded from `sources`
discovery, so it never reaches the assembled resource or `meta.xml`, and listing one
in `sources` is a manifest error rather than a silent inclusion. Its environment is
resolved exactly like any other file — from the `sources` patterns, overridable by a
file directive — and falls back to `shared` when no pattern matches, so a test always
resolves to something. The assertion surface (`describe`, `test`, `beforeEach`,
`afterEach`, `expect`, `mta`) is declared to the checker for test files only, so the
editor understands a test the way it understands any other module and a non-test file
that calls `test` is still an unknown global.

A failure is reported at a `path:line:column` position in the `.luam` source. The
line comes from the resource map of milestone 18, which maps the generated line of
the frame that failed back to the file and line that produced it. The map records
lines, not columns, so the column points at the mapped symbol on that line when the
map names one and at the first character of the statement otherwise.

**Consequences:**

- Positive: the published CLI gains no dependency, and `build`, `check` and `ensure`
  are untouched.
- Positive: tests run on the exact Lua version the compiler targets, so a `%` on a
  negative number or a `#` on a sparse table behaves in a test the way it will in the
  resource.
- Positive: a test file is invisible to a build by construction, not by a filter
  somebody has to remember to apply.
- Negative: `luam test` does not run on a machine with no Lua, and CI has to install
  one. The failure says so and says what to install.
- Negative: a test cannot observe what MTA does in response to a call. It can only
  observe that the call was made with the arguments it expected.
- Negative: the reported column is the statement's, not the expression's, until the
  line map carries columns.
