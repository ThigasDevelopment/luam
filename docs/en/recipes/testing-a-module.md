# Testing a module

A shared module, a server module, and the two test files that cover them. The
test files run under `luam test` and never reach the built resource.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- A **Lua 5.1** interpreter on `PATH`. `luam doctor` says whether you have one.

```bash
luam doctor
```

## File tree

```
luam-docs-testing-a-module/
├── .luam.manifest
└── src/
    ├── shared/scoreboard.luam
    ├── shared/scoreboard.test.luam
    ├── server/announce.luam
    └── server/announce.test.luam
```

## Source

<<< @/snippets/testing-a-module/.luam.manifest{js}

<<< @/snippets/testing-a-module/src/shared/scoreboard.luam

<<< @/snippets/testing-a-module/src/shared/scoreboard.test.luam

<<< @/snippets/testing-a-module/src/server/announce.luam

<<< @/snippets/testing-a-module/src/server/announce.test.luam

## Why this works

A file ending in `.test.luam` is a test file. It is excluded from `sources`, so
`luam build` never sees it, and `describe`, `test` and `expect` exist only inside
one — a non-test file that calls `test` still reports an unknown global.

`scoreboard.test.luam` sits in `src/shared`, so it resolves to the `shared`
environment and sees everything a shared file sees. `announce.test.luam` sits in
`src/server` and resolves to `server`, so it runs after the shared bundle has
loaded and can call `announceScore`.

`announceScore` calls `outputChatBox`, which does not exist outside MTA. The
harness replaces every MTA function with a stub that records what it was called
with and returns `nil`, which is what `mta.calls('outputChatBox')` reads back.
The stub records the call; it does not deliver a chat message. To make a stub
answer with something, use `mta.returns(name, value)` or `mta.stub(name, fn)`.

## Commands

```bash
luam test
luam check
luam build
```

## Expected result

`luam test` prints one line per test and a summary:

```
  + shared · formatScore > joins the name and the points
  + shared · rankOf > returns gold at one hundred points
  + shared · rankOf > returns bronze below fifty points
  + server · sends one chat message for one score
Tests passed: 4 tests passed, 0 failed in 78 ms.
```

`luam check` compiles the resource, not the tests:

<<< @/snippets/output/testing-a-module.check.txt{text}

And the built resource contains no test file at all:

<<< @/snippets/output/testing-a-module.tree.txt{text}

## A failing test

Change the expected rank and run `luam test` again. The position is in the
`.luam` source, not in the generated Lua:

```
  x shared · rankOf > returns gold at one hundred points
      src/shared/scoreboard.test.luam:9:9 expected "silver", got "gold"
Tests failed: 3 tests passed, 1 failed in 74 ms.
```

The command exits `1`, so a CI job fails on it. See
[CI and deployment](/en/tooling/ci-and-deployment).

## What a test cannot do

A stub records the calls your code made. It does not run MTA, so a test cannot
show that a player actually received the message, that an element was created, or
that an event fired. Those need a running server — `luam test` never opens one.
