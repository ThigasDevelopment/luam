# Plans

One file per task. The [roadmap](../docs/roadmap.md) is the index: it groups
tasks into milestones, records their status, and links each row to the file
here. This directory holds no second index, so the two never disagree.

## Naming

```
<MM>.<TT>-<slug>.md
```

`MM` is the milestone and `TT` is the task, **both zero-padded to two digits**.
The padding is not cosmetic: without it a directory listing sorts `10.01` before
`02.01` and `24.10` before `24.02`, because GitHub and most tools sort file
names as text rather than as numbers.

The responsible agent belongs in the `agent` field of the frontmatter, never in
the file name. It changes; the file name should not.

## Frontmatter

| Field | Required | Notes |
|---|---|---|
| `id` | yes | Matches the file name, e.g. `24.06`. |
| `title` | yes | Same wording as the roadmap row. |
| `agent` | yes | Who executes the task. |
| `status` | yes | `todo`, `doing`, `done`, or `superseded`. |
| `depends-on` | yes | Padded ids, e.g. `[24.05]`. Empty list when none. |
| `superseded-by` | only when superseded | The padded id that replaced this task. |

Start from [TEMPLATE.md](TEMPLATE.md).

## Working across two machines

Both the number and the status live in two places — this file and its roadmap
row — so both have to move together. Before starting a task:

1. Pull first. A milestone number claimed on the other machine is invisible
   until you do, and two machines claiming the same number is what produced the
   duplicate ADRs this repository already had to repair.
2. Claim the next free `MM.TT` by reading the roadmap, not this directory. The
   roadmap is the only place that lists every task, including the handful
   delivered before the plan file existed.
3. Update `status` here and in the roadmap row in the same commit.
