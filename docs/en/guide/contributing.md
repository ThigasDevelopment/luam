# Contributing

Luam is developed in the open at
[ThigasDevelopment/luam](https://github.com/ThigasDevelopment/luam). The rules
live in the repository, next to the code they govern, so this page points at
them rather than repeating them where they would go stale.

| Document | What it answers |
| --- | --- |
| [CONTRIBUTING.md](https://github.com/ThigasDevelopment/luam/blob/main/CONTRIBUTING.md) | How to set the workspace up, which commands reproduce every check, and what a reviewer enforces. |
| [SECURITY.md](https://github.com/ThigasDevelopment/luam/blob/main/SECURITY.md) | How to report a vulnerability privately, and what is in scope. |
| [CODE_OF_CONDUCT.md](https://github.com/ThigasDevelopment/luam/blob/main/CODE_OF_CONDUCT.md) | The standard of behaviour in issues, pull requests and reviews. |

## What to open

- **A bug** — the compiler, the CLI, the language server or the generated Lua
  gets something wrong. The form asks for the Luam and Node versions, the MTA
  side, and the smallest source that reproduces it, because a report without
  those costs a round trip.
- **A proposal** — new syntax, new semantics, or a change to what the compiler
  emits. These are decided in writing first, and "not planned" is a possible
  answer with a recorded reason.
- **A documentation problem** — a page that is wrong, out of date, or where the
  two locales disagree.
- **A vulnerability** — never an issue. Use the private channel in
  [SECURITY.md](https://github.com/ThigasDevelopment/luam/blob/main/SECURITY.md).

## What the pipeline expects

Four checks must pass before a change can merge: the typecheck, the test suites
on Node 22 and Node 24, the build with its production smoke test, and the manual
verification. Every one of them is a command you can run locally, listed in
`CONTRIBUTING.md`.

Two more jobs run and never block: the compiler benchmark, and the dependency
audit. A red advisory job is information, not a rejection.

A pull request from a fork waits for the maintainer to approve its run before
anything starts, on every push. That is deliberate — a fork run executes its own
code on the project's runners — and a run marked as waiting for approval is not
a broken pipeline.

## Two things that surprise people

**The MTA catalog is generated and committed.** The typecheck regenerates it
offline and fails if the committed files differ, so a catalog change is committed
together with whatever produced it. See
[MTA APIs and events](/en/mta/apis-and-events).

**English is the source locale.** Every page exists in `en` and `pt-br`, and the
manual build fails when one is missing. A page that only makes sense in one
language does not belong in the manual.
