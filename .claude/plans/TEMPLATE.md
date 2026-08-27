---
id: <MM>.<TT>
title: <short title>
agent: architecture-engineer | test-engineer | performance-engineer | security-engineer | github-engineer | documentation-engineer
status: todo | doing | done | superseded
depends-on: []
superseded-by: <MM>.<TT>
---

# <MM>.<TT> - <title>

> File: `.claude/plans/<MM>.<TT>-<slug>.md`
> Both segments are zero-padded to two digits so the directory sorts in numeric
> order instead of lexicographic order. The responsible agent is recorded in the
> `agent` field above, never in the filename.
> Drop `superseded-by` unless `status` is `superseded`.
> Update `status` in the frontmatter as work advances and reflect it in the
> [roadmap](../docs/roadmap.md).

## Objective

One sentence describing what this task delivers and why it matters.

## Scope

- **In:** Define the work covered by this task.
- **Out:** Define what is intentionally excluded to prevent scope creep.

## Steps

- [ ] Step 1
- [ ] Step 2

## Acceptance Criteria

- [ ] Verifiable condition 1
- [ ] Verifiable condition 2

## References

- Docs: Links to relevant files in `.claude/docs/`.
- Skills: Links to relevant files in `.claude/skills/`, when applicable.
- code-graph: Existing node IDs consulted and node IDs to create or update.
