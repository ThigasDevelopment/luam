# @luam/pipeline

The assertions that keep `.github` honest. It verifies nothing about the
product; it verifies the workflows that verify the product.

A workflow change is normally checked by watching it run once, which catches a
syntax error and nothing else. It does not catch a check that quietly stopped
running, a permission that widened, an action that drifted back to a floating
tag, or a secret that became reachable from a fork pull request. This package
catches those, and it runs inside the merge gate so an edit that reopens one of
them cannot land.

## What it asserts

- **The permission budget** — every job declares `permissions`, and no job holds
  a write scope outside the budget [ADR-040](../../.claude/docs/adr/040-pipeline-contract.md)
  records.
- **The supply chain** — every third-party action is pinned to a full commit SHA
  with its version named beside the pin. A first-party `./` reference is exempt.
- **One definition per verification** — a `pnpm` verification command appears in
  exactly one workflow file. Preparation commands shared across runners are
  listed explicitly rather than assumed.
- **The untrusted boundary** — the invariants of
  [ADR-041](../../.claude/docs/adr/041-untrusted-contribution-boundary.md): no
  `pull_request_target` anywhere, no secret and no write permission on any
  workflow a fork pull request reaches, no cache written under a key of the
  project's own on that path, and a `workflow_run` workflow that checks out the
  default branch rather than the contributed head.
- **The rulesets** — the JSON in `.github/rulesets` is the source of truth for
  what GitHub enforces. Every required check name resolves to a job that really
  reports, no advisory job is required, no bypass actor exists, and every
  required check is one a fork run can satisfy.

## Reported check names

A caller job that runs a reusable workflow reports as
`<caller job> / <called job>`, and a matrix inside the called workflow expands
into one name per value. `check-names.ts` computes those names from the
workflows so the ruleset can be checked against them without a network call.
Renaming a job therefore means updating `.github/rulesets`, and this suite is
what says so.

## Running it

```bash
pnpm --filter @luam/pipeline test
```

It reads only files in the repository. No token, no network.
