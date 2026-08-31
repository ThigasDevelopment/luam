# @luam/conventions

The mechanical half of [code-conventions.md](../../.claude/docs/code-conventions.md),
turned into a check. It verifies nothing about what the code means; it verifies
the rules the project already wrote down and, until now, enforced only by a
reviewer's memory.

Milestone 36 deferred this because "the workspace has no linter or formatter".
Half of that stopped being true when `luam format --check` shipped. The other
half is this package.

## Why a script rather than a linter

A standard linter brings its own opinion set, a configuration file to reconcile
it with, and a reformatting commit across every file in the workspace. The rules
here are already written, already mechanical, and already satisfied — a tool that
enforces them is a script; one that brings its own is a negotiation. The
rejection is recorded so a future task that wants broader coverage knows what it
is choosing against.

The cost is that the script owns its own scanner. That is deliberate: the comment
and quote rules cannot be decided by a regular expression, because a `//` inside
a URL and a `/*` inside a glob are not comments. `source-scan.ts` walks the file
once, tracking string literals, template literals with their `${}` expressions,
and regular expressions, and reports only what is really code.

## What it checks

See [code-conventions.md](../../.claude/docs/code-conventions.md#what-the-gate-enforces)
for the enforced rules, the ones deliberately left out, and why.

## Running it

```bash
pnpm conventions
```

The `.luam` half needs the bundled CLI:

```bash
pnpm conventions:all
```

Both together are the **Conventions** check in the merge gate. It reports; it
never fixes.
