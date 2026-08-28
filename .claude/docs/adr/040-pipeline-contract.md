# ADR-040: One role per workflow, one gate, and a pinned supply chain

**Status:** Accepted

**Context:**
The repository has four workflows and one composite action, all grown one task
at a time. Nothing states what a workflow is for, what a red check means, or
what a job is allowed to touch. Before the pipelines are reorganized, and long
before an outside contributor's code runs on the project's runners, those rules
have to exist in writing. This record is the inventory and the contract; the
tasks after it move code against it.

*The surface, as it stands.* Wall-clock is taken from the most recent successful
run of each workflow.

| Workflow | Job | Triggers | `needs` | `permissions` | Secrets | Wall-clock |
|---|---|---|---|---|---|---|
| `ci.yml` | Typecheck | push and pull request on `main`, `develop` | — | inherited `contents: read` | none | 42s |
| `ci.yml` | Test on Node 22 / 24 | same | `typecheck` | inherited `contents: read` | none | 85s |
| `ci.yml` | Build | same | `test` | inherited `contents: read` | none | 43s |
| `ci.yml` | Benchmark | same | `test` | inherited `contents: read` | none | 38s |
| `ci.yml` | Audit | same | — | inherited `contents: read` | none | 17s |
| `docs.yml` | Validate | push on `main` and pull request on `main`, `develop`, both filtered by ten paths; `workflow_dispatch` | — | inherited `contents: read` | none | 41s |
| `docs.yml` | Deploy | same, `main` push only | `validate` | `pages: write`, `id-token: write` | Pages OIDC identity | 9s |
| `release.yml` | Verify | `v*` tag push; `workflow_dispatch` | — | inherited `contents: read` | none | 88s |
| `release.yml` | Package | same | `verify` | inherited `contents: read` | none | 31s |
| `release.yml` | Publish to npm | tag push only | `package` | `contents: read`, `id-token: write` | `NPM_TOKEN`, npm provenance identity | 16s |
| `release.yml` | Publish to the VS Code Marketplace | tag push, and `vars.PUBLISH_MARKETPLACE` | `package` | inherited `contents: read` | `VSCE_PAT` | 30s |
| `release.yml` | Publish | tag push only | `package` | `contents: write` | `github.token` | 21s |
| `catalog-refresh.yml` | Propose an MTA catalog refresh | weekly cron; `workflow_dispatch` | — | `contents: write`, `pull-requests: write` | `github.token` | no run yet |
| `.github/actions/setup` | composite | called by every job above except the Marketplace publish | — | inherits the caller | inherits the caller | — |

*Steps written more than once.* Each is a place where two workflows can drift
apart while both stay green.

- **Bundling the CLI** — `ci.yml` Build, `docs.yml` Validate, and three jobs of
  `release.yml`. Five copies of one command.
- **Installing Lua 5.1** — `ci.yml` Test and `ci.yml` Build, as two `apt-get`
  steps a minute apart.
- **Typechecking** — `ci.yml` Typecheck, `release.yml` Verify, and
  `catalog-refresh.yml`.
- **Running the tests** — spelled three different ways: eight package filters in
  `ci.yml`, and `pnpm -r test` in both `release.yml` and `catalog-refresh.yml`.
  The recursive form is not the same set the gate runs, and nothing notices.
- **The release tooling suite** — `ci.yml` Test and `docs.yml` Validate.
- **The version contract** — `release.yml` Verify and `release.yml` Package.
- **The environment setup itself** — `catalog-refresh.yml` re-implements
  `./.github/actions/setup` inline rather than calling it, which is why it is
  the only file whose pins are current.
- **The ten-entry `paths` list** — repeated verbatim between `push` and
  `pull_request` in `docs.yml`.

*Actions not pinned to a commit.* `catalog-refresh.yml` pins all three of its
references. Every other file floats on a tag: `actions/checkout@v7` in three
workflows, `actions/setup-node@v7` in `ci.yml` and in the composite,
`pnpm/action-setup@v6` in the composite, `actions/upload-pages-artifact@v5` and
`actions/deploy-pages@v5` in `docs.yml`, and `actions/upload-artifact@v7` with
`actions/download-artifact@v8` in `release.yml`. A tag is a moving pointer the
project does not control, and one of these jobs holds a publish token.

*Two roles in one file.* `docs.yml` both verifies the manual on a pull request
and deploys the site to Pages on `main`. The verification half belongs to the
gate and the deployment half does not, and today they share a trigger, a path
filter and a `needs` edge.

*A path-filtered check cannot be a required check.* This is the trap the
required set has to be designed around. GitHub holds a required check as pending
when its workflow does not run, so requiring `docs.yml` Validate — filtered to
ten paths — would block every pull request that touches none of them.

**Options considered:**

- **Leave the pipelines as they are and write only the rules.** Cheapest, and it
  documents the duplication instead of removing it. Rejected: the contract would
  describe a pipeline nobody can satisfy, since `docs.yml` serves two roles by
  construction.
- **One workflow per trigger, jobs copied where needed.** What the repository
  has. It is readable file by file and wrong across files: five copies of the
  bundle step drift independently, and the release path already tests a
  different set than the gate does.
- **One reusable unit per verification, composed by thin callers.** A caller
  declares triggers, concurrency and permissions and nothing else; the units are
  called by the gate, by the release path, and — after the threat model — by the
  fork path. It costs one indirection when reading a workflow, and it is the
  only shape in which a fork run and a maintainer run can be proven to verify
  the same thing.
- **Require every job, so red always blocks.** Rejected on evidence: `audit`
  fails when an advisory is published upstream against a branch that changed no
  dependency, and `benchmark` produces a number with no baseline. Requiring
  either teaches a contributor that red is noise.

**Decision:**
**Every workflow has exactly one role, every verification is defined once and
called, the gate contains only checks a change can cause to fail, and every
third-party action is pinned to a commit.**

*Roles.* Each workflow is a merge gate, a publication, scheduled maintenance,
or an advisory signal — never two.

| Workflow | Role |
|---|---|
| `ci.yml` | Merge gate. The only workflow whose result may block a merge. |
| `docs.yml` | Publication. Builds and deploys the site from `main`. Its validation moves to the gate. |
| `release.yml` | Publication. Runs on a `v*` tag, packages, and publishes. |
| `catalog-refresh.yml` | Scheduled maintenance. Proposes a change as a pull request; never edits a permanent branch. |
| `benchmark.yml` | Advisory signal. Measures the compiler after a merge to `develop`, and on demand. Never gates. Introduced by 36.03. |
| `triage.yml` | Advisory signal. Labels a pull request after the gate reports, from the default branch, without ever checking out contributed code. Never gates. Introduced by 36.05. |
| `dependency-audit.yml` | Advisory signal. Files advisories as an issue on a schedule, and re-runs on a pull request that changes a dependency manifest. Never gates. Introduced by 36.03. |

*The gate.* The required checks are the deterministic ones: **Typecheck**, the
**test matrix on Node 22 and Node 24**, **Build**, and **Docs validation**,
which joins the gate unconditionally so it always reports. Everything else is
advisory: **Benchmark**, which has no baseline to compare against and therefore
cannot say a change is worse, and the **dependency audit**, whose result depends
on the date rather than on the diff. An advisory job never appears in a
ruleset's required list.

*A required check must report on every pull request that targets a protected
branch.* A path filter, a `workflow_dispatch`-only trigger, and a job-level `if`
that can evaluate false all disqualify a check from being required. This is why
docs validation is moved into the gate rather than required where it lives:
`docs.yml` keeps its path filter and loses its role in the gate.

*Required names are exact, and renaming is a two-file change.* A required check
is matched by the string GitHub reports, which for a called workflow is the
caller's job name followed by the called job's name. The names are recorded from
a real run, and a change to a job name updates the ruleset in the same commit
that renames it. A required check that no job reports blocks the branch as
surely as a failing one.

*Permission budget.* Every job declares `permissions` explicitly, even when the
value equals the workflow default. Inheriting is not declaring: it survives one
edit of the file header and then means something else.

| Scope | Who may hold it |
|---|---|
| `contents: read` | The default, and the whole budget for every verification job. |
| `contents: write` | The release publication job, and the catalog refresh, which pushes its proposal branch. |
| `pull-requests: write` | The catalog refresh, to open its proposal, and the scheduled audit, to file its issue. |
| `pages: write`, `id-token: write` | The Pages deployment only. |
| `id-token: write` | The npm publication, for provenance. |
| Any secret | A job on the trusted path only. No job reachable from a fork pull request reads one. 36.04 rules on the boundary; this contract records the budget it enforces. |

*Pinning.* A third-party action is referenced by full 40-character commit SHA
with the version in a trailing comment. A first-party action is referenced by
path. A floating tag is a review failure, not a preference, and Dependabot's
`github-actions` ecosystem keeps the pins current.

*What a check may not do.* A verification job installs, builds, and asserts. It
does not write to the repository, publish, deploy, or read a secret. A workflow
that needs one of those is a publication, and publications do not gate merges.

*The network invariant is untouched.* The compiler packages make no network
calls and a build with no network still succeeds. The pipeline's own downloads —
the runner image, the registry, the pinned actions — are the development-time
access that already existed. No reorganization here adds an exception.

**Consequences:**

- Positive: a red check means the change is broken. The two jobs that could fail
  for reasons a change did not cause are named advisory and moved off the gate.
- Positive: a verification exists once, so the gate, the release path and the
  future fork path cannot silently verify different things.
- Positive: the supply chain stops moving under the publish tokens. A pinned SHA
  changes when Dependabot opens a pull request, which is reviewable.
- Positive: the permission budget is a table a test can assert against, which is
  what 36.07 does.
- Negative: reading one workflow now means reading two files. The caller says
  when it runs; the unit says what it does.
- Negative: docs validation runs on every pull request, including one that
  touches no documentation. It costs about forty seconds in parallel with the
  test matrix, and it buys a check that can be required.
- Negative: the required-check names are coupled to job names, and the coupling
  is enforced by review rather than by the platform.
