# ADR-041: A fork pull request runs verification only, with no secret and no write

**Status:** Accepted

**Context:**
The repository has never accepted an outside contribution, and nothing in the
pipeline was written for one. Before [36.05](../../plans/36.05-fork-pull-request-pipeline.md)
runs a stranger's code on the project's runners, the boundary has to be
designed. A community pipeline is not a feature with a security section; it is a
security decision with a workflow attached.

*What a fork pull request controls.* Everything in the head commit, and the head
commit is the contributor's.

- **The workflow files themselves.** A `pull_request` run uses the workflows
  from the merge commit, so a contributor can edit `ci.yml`, any `unit-*.yml`,
  and `.github/actions/setup` in the same pull request the pipeline is about.
  Nothing in the file can be trusted to be what the maintainer wrote.
- **The dependency manifests and the lockfile.** A pull request may add a
  dependency. `pnpm install --frozen-lockfile` refuses a lockfile that does not
  match the manifest, and a contributor can update both.
- **Install-time execution.** `pnpm-workspace.yaml` carries `allowBuilds`, today
  naming `esbuild` alone, and that file is on the head too. A contributor can
  widen it and run a dependency's build script on the runner.
- **Test fixtures and generated output.** The typecheck unit regenerates the MTA
  catalog and compares it with `git diff --exit-code`. A contributor can commit
  output that matches whatever they generated. That defeats a check; it gains no
  privilege.

The honest summary is that a fork pull request executes arbitrary code on an
ephemeral runner. That is not a defect to be fixed — it is what running CI on a
contribution means. What must be bounded is what that code can reach.

*What the pipeline holds.*

| Asset | Where it lives | Reachable from a fork run? |
|---|---|---|
| `GITHUB_TOKEN` | Every job | Yes, and GitHub forces it read-only for a `pull_request` from a fork regardless of what the workflow declares. |
| `NPM_TOKEN` and the npm provenance identity | `release.yml` `npm`, environment `pipeline` | No. Tag push only, and secrets are not served to a fork `pull_request`. |
| `VSCE_PAT` | `release.yml` `marketplace`, environment `pipeline` | No, by the same two reasons. |
| The Pages deployment identity | `docs.yml` `deploy`, environment `github-pages` | No. `docs.yml` triggers on a `main` push and on dispatch; it has no pull request trigger. |
| `contents: write` and `pull-requests: write` | `catalog-refresh.yml` | No. Schedule and dispatch only, and the ref is `develop`. |
| `issues: write` | `dependency-audit.yml` `report` | No. The reporting job is guarded on the event not being a pull request. |
| The pnpm store cache | Every job, through `actions/setup-node` | Write yes, into the pull request's own cache scope. Read of a base-branch cache yes; write into one no, because GitHub scopes a cache write to the ref that created it. |

*The dangerous repair.* `pull_request_target` runs the workflow from the base
branch with a writable token and access to secrets. It is the documented way to
give a fork run a token, and it is a full compromise the moment the job checks
out the head, because the code it then runs holds both. The project has no need
that would justify it and every reason to refuse it before someone reaches for
it during an afternoon of triage.

**Options considered:**

- **Refuse fork pull requests entirely.** The status quo by omission. It has no
  attack surface and no contributors. Rejected: the milestone exists to open the
  project.
- **`pull_request_target` with a head checkout, so fork runs can label, comment
  and cache like a trusted run.** Convenient, and it hands an attacker a write
  token and the secret store. Rejected outright.
- **`pull_request_target` restricted to jobs that never check out the head.**
  The narrow, defensible version: a labeller reading only the event payload. It
  is genuinely safer, and it is still one careless `actions/checkout` away from
  the first option, in a repository where the reviewer and the author are the
  same person. Rejected on the maintenance argument rather than the technical
  one.
- **`pull_request` only, with nothing a fork cannot satisfy in the gate.**
  Everything a contributor needs — typecheck, tests, build, smoke, docs — needs
  no token beyond reading the checkout. Anything that does need one is a
  publication and does not belong on a pull request. Accepted.

**Decision:**
**A fork pull request runs verification and nothing else: the read-only
`GITHUB_TOKEN`, no secret, no write to the repository, and no cache a trusted
run will read. `pull_request_target` is forbidden in this repository.**

*The invariants.* Each is written so [36.07](../../plans/36.07-pipeline-verification.md)
can assert it against the workflow files rather than against intent.

1. **No workflow file contains `pull_request_target`.** Not guarded, not
   commented out, not for a labeller. A `pull_request_target` in a diff is a
   review stop, and the assertion is a string match.
2. **No job reachable from a `pull_request` event references `secrets.`**, other
   than `secrets.GITHUB_TOKEN`. Reachable means the workflow has a
   `pull_request` trigger, or is a reusable workflow called by one.
3. **No job reachable from a `pull_request` event declares a write
   permission.** Every such job declares `permissions` explicitly, and every
   scope in it is `read` or `none`.
4. **Every job declares `permissions`.** An inherited permission is not a
   reviewed permission.
5. **No workflow reachable from a `pull_request` event writes a cache under a
   key a trusted workflow reads.** The pnpm store cache is left to
   `actions/setup-node`, whose scoping GitHub enforces per ref; no workflow adds
   an explicit `actions/cache` save with a hand-written key.
6. **A required check is one a fork run can satisfy.** A check that needs a
   token or a secret is a publication step, and a publication never gates.

*Approval before the first run.* The repository currently requires approval for
first-time contributors. It is raised to **all outside contributors**: every
pull request from a fork waits for the maintainer to approve the run, on every
push to it, not only the first. The volume that makes this expensive — many
contributors, many pushes — does not exist, and the setting is the only control
that stands between an opportunistic pull request and free compute on the
project's runners. The approver is the maintainer; there is one.

*The cache, precisely.* GitHub scopes a cache entry to the ref that wrote it. A
fork pull request writes into the scope of its own `refs/pull/N/merge` and can
read the base branch's entries, which is the direction that is safe: reading a
cache the maintainer produced cannot poison anything, while writing one the
maintainer later reads would. The project therefore adds no cache step of its
own on the fork path, and the platform's scoping is the whole control. A future
workflow that wants a custom cache key on a pull request path is a change to
this record, not an implementation detail.

*The one elevated path, and its conditions.* Work that needs a write token on a
pull request runs on `workflow_run`, never on `pull_request_target`. The two
look similar and differ in the only way that matters: `workflow_run` starts
after the gate has finished, from the default branch, with no contributed code
in the workspace and nothing from the head on the runner. A `workflow_run`
workflow in this repository obeys three rules, and 36.07 asserts the first two.

- It checks out the default branch explicitly, never the head ref, never the
  head repository, and never an artifact produced by the untrusted run.
- It runs no script, dependency, or command that came from the head. The
  contribution is data it reads through the API, not code it executes.
- It holds the narrowest write scope that does the job, and nothing else.

`triage.yml` is the only such workflow today. It labels by path and size, and
the strongest thing an attacker gains by crafting a pull request is a wrong
label on their own pull request.
*What a fork run cannot do, and who does it instead.* Publishing to npm and to
the Marketplace, deploying Pages, opening the catalog refresh proposal, and
filing the audit issue are all trusted-path work triggered by a tag, a `main`
push, or a schedule. None of them has a pull request trigger, so none of them is
reachable from a fork. Labelling and triage that would need a write token are
not worth a `pull_request_target`; the maintainer labels.

*The project invariant is restated and preserved.* The compiler packages make no
network calls, and a build with no network still succeeds. A contribution is
verified by building and testing it offline, exactly as a maintainer branch is.
Nothing in the fork pipeline adds an outbound call, and a pull request that
introduced one to a compiler package would be a review failure rather than a
pipeline failure.

**Consequences:**

- Positive: the compromise path with real consequences — a fork run holding a
  publish token — is closed by construction, not by review vigilance.
- Positive: every rule above is a string or a structure in a YAML file, so the
  boundary is testable and a regression is a failing test rather than an
  incident.
- Positive: a contributor gets the same verification a maintainer gets, because
  both call the same reusable units.
- Positive: approving every fork run costs one click and buys certainty about
  what is running.
- Negative: labelling happens after the gate finishes rather than when the pull
  request opens, and the `workflow_run` workflow has to be on the default branch
  before it triggers at all. Anything richer than a label — commenting, closing,
  assigning — is a new elevated job and a change to this record.
- Negative: requiring approval on every push, not only the first, means a
  contributor pushing a fix waits for the maintainer. The delay is documented in
  `CONTRIBUTING.md` so it does not read as a broken pipeline.
- Negative: a fork run installs from the contributor's lockfile and may execute
  a dependency's build script. The runner is ephemeral and holds nothing, which
  is the mitigation; there is no attempt to sandbox further.
