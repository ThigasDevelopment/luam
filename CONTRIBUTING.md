# Contributing to Luam

Thank you for considering a contribution. This page is the whole contract: what
to install, what the pipeline will check, how the review works, and what the
project will not accept. If something here is wrong or missing, that is itself
worth a pull request.

## Before you start

Open an issue first when the change adds syntax, changes what the compiler
emits, or changes a CLI contract. Those decisions are recorded as ADRs and a
plan before code is written, and a pull request that arrives without one has to
wait for that conversation anyway.

Fixes, documentation, tests, and MTA catalog corrections need no issue. Send the
pull request.

## Set the workspace up

You need:

- **Node.js.** The pipeline runs the suites on **22** and **24**. The oldest
  version a built resource is proven on is **20**, so nothing may use a syntax
  or API newer than what 20 provides at runtime.
- **pnpm.** The version is pinned by `packageManager` in `package.json`; run
  `corepack enable` and pnpm picks it up.
- **Lua 5.1.** The CLI suite and the production smoke test load generated Lua
  through a real interpreter. On Debian or Ubuntu: `sudo apt-get install lua5.1`.
  Without it those two checks fail locally and pass in CI, which is the worst
  way to find out.

```bash
corepack enable
pnpm install --frozen-lockfile
```

## Reproduce every required check

Four checks must be green before a pull request can merge. Each one is a command
you can run:

```bash
pnpm -r typecheck
pnpm --filter @luam/mta-types generate
pnpm --filter @luam/theme themes:check
git diff --exit-code
```

```bash
pnpm test
```

```bash
pnpm -r build
pnpm --filter @luam/cli bundle
```

```bash
pnpm --filter @luam/cli bundle
pnpm docs:verify
```

The first block is **Typecheck**: it also regenerates the MTA catalog offline and
fails if the committed output differs, so a catalog change must be committed
along with whatever produced it. The second is the **test matrix**, run twice in
CI, once per Node version. The third is **Build**, which then packages a resource
with the bundled CLI and loads the generated Lua in Lua 5.1. The fourth is
**Docs**, which checks locale parity, the limitation and version contracts, the
documented snippets and captured outputs, and builds the site.

Two more jobs run and cannot block you. **Benchmark** measures the compiler after
a merge to `develop`, and **Dependency audit** reports advisories on a schedule
and re-runs when a pull request changes a dependency manifest. Both are advisory
on purpose: an advisory published upstream on a Tuesday is not something your
change caused, and a benchmark with no baseline cannot say a change is worse.

## Branches, commits, and where a change is recorded

The repository has two permanent branches and no feature branches. `develop` is
where work integrates; `main` is stable and is only ever updated by a pull
request from `develop`. Releases are git tags on `main`, never branches.

As an outside contributor you work on a fork and open the pull request against
`develop`.

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):
`<type>(<scope>): <description>`, with the description in lowercase, imperative,
no trailing period, and at most 72 characters. Allowed types are `feat`, `fix`,
`chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `style` and
`revert`. A breaking change carries `!` before the colon and a
`BREAKING CHANGE:` paragraph in the body.

Substantial work is planned before it is written. A milestone lives in the
roadmap and each task has a plan file; the task status in the plan and the status
in its roadmap row move in the same commit as the change. If your contribution
belongs to a planned task, say which one in the pull request.

## What a reviewer will enforce

- **English everywhere.** Source, comments, commit messages, documentation, and
  everything a user reads — CLI output, diagnostics and their hints, language
  server text, scaffolded files. There is no locale switch in the product.
- **Lua 5.1 and MTA compatibility.** Generated code runs inside MTA on Lua 5.1.
  No 5.2 or later construct reaches the output.
- **No network call from the compiler packages.** A build with no network still
  succeeds. The two outbound calls a shipped build may make both live in the CLI
  and are already recorded; a third is a decision, not a patch.
- **No new UI, backend, database, or authentication surface.** Luam is a
  compiler, a CLI, and a language server.
- **The source conventions.** TypeScript only, strict, no `any`, no comments
  inside code, four-space indentation, single quotes, kebab-case file names, path
  aliases instead of `../` imports, no barrel files.
- **New language behaviour arrives with a fixture and a snapshot.** A change to
  what the compiler emits that no test would notice is a change nobody can
  defend later.

## What the pipeline does with your pull request

The first thing you will see is that **your run waits for approval**. Every
workflow run from a fork is held until the maintainer approves it, on every push,
not only your first. This is deliberate: a fork pull request executes its own
code on the project's runners, so someone looks before it starts. A run sitting
in "waiting for approval" is not a broken pipeline.

Your run is then the same run a maintainer branch gets. It holds a read-only
token, reads no secret, and can write nothing. Nothing about publishing, the
package registry, or the documentation site is reachable from a pull request, so
there is no check you are unable to satisfy.

`main` and `develop` reject a force-push and cannot be deleted, and published
`v*` tags cannot be moved. A merge into `main` requires a pull request whose
required checks passed. **No human approval is required to merge today** — the
project has one maintainer, and GitHub does not count a self-approval, so the
checks are the gate rather than a review count. That changes the moment a second
maintainer exists.

A red required check means your change broke something the pipeline can attribute
to it. Open the job, find the failing step, and reproduce it with the command
above; the job names match the sections in this file.

## Reporting a vulnerability

Do not open an issue. [SECURITY.md](SECURITY.md) has the private channel.

## Conduct

Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
