## What changed

<!-- What this does, and why. The diff already shows what; explain the reason. -->

## Which plan it belongs to

<!--
The task id and its plan file, for example 36.05 and .claude/plans/36.05-fork-pull-request-pipeline.md.
Write "none" for a fix, a documentation change, or a catalog correction — those need no plan.
If there is one, its status and its roadmap row move in this pull request.
-->

## How it was verified

<!--
The commands you ran and what they reported. Name the fixture or snapshot that
would fail if this change were reverted. "CI is green" is not a verification.
-->

## Checklist

- [ ] `pnpm -r typecheck` passes, and the regenerated MTA catalog is committed.
- [ ] `pnpm test` passes.
- [ ] `pnpm -r build && pnpm --filter @luam/cli bundle` passes.
- [ ] `pnpm docs:verify` passes, if this touches the manual or anything it checks.
- [ ] New language behaviour arrives with a fixture and a snapshot.
- [ ] Everything a user reads is in English, and the generated Lua is Lua 5.1.
- [ ] No compiler package gained a network call.
