# ADR-012: The CLI is a declarative command registry, not a global parser

**Status:** Accepted

**Context:**
`luam` grew one flag at a time. `parseArguments` walks `argv` once and writes
every flag it recognises into a single flat record, and `runCli` then decides
what any of it meant with a chain of conditionals. The record has no notion of
which command owns which option, so the parser accepts every option on every
command.

That is not a cosmetic problem. `luam doctor --bundle --no-map --config x.json`
succeeds today and silently does nothing. `luam dev --bundle` reaches a warning
that has to be written by hand at the dispatch site because the parser had no
way to reject it. `luam trace --name foo` is accepted and ignored. Each of those
is a user who believes an option took effect.

The help text is a hand-maintained string constant in `usage.ts`. Nothing ties
it to the options the parser actually reads, and there is no per-command help at
all, so a user cannot ask what `luam build` accepts.

The dispatcher owns root resolution, config loading, capability detection,
transport construction, editor services, prompt injection, and the option
translation for eight commands in one function. Every new command widens it, and
every test that wants one command has to construct the whole thing.

**Options considered:**
- Keep the hand-written parser and add per-command validation tables. No
  dependency, and the option matrix becomes explicit. It also means writing and
  maintaining option parsing, negation pairs, value handling, help rendering,
  and error messages by hand, which is the code that already went wrong.
- Adopt `yargs`. It covers the ground, and it brings a large dependency
  surface, a middleware and configuration model far wider than eight commands
  need, and a habit of calling `process.exit` that has to be fought.
- Adopt `commander`. Small, no transitive dependencies, declarative
  `.command().option().action()` registration, generated per-command help,
  `exitOverride()` so the process boundary stays ours, and `configureOutput()`
  so its writes go through the existing reporter.

**Decision:**

*Commander owns parsing; the CLI owns exits and output.* `exitOverride()` turns
every parse failure into a thrown `CommanderError` that `runCli` maps to an exit
code and returns. `configureOutput()` routes Commander's stdout and stderr
through the reporter, so `NO_COLOR`, `--no-color`, and an injected logger keep
working. No command calls `process.exit`; `index.ts` assigns `process.exitCode`
and nothing else.

*Options are declared where they apply.* Each option has exactly one owning set
of commands:

| Option | Commands |
|---|---|
| `--cwd <path>` | all |
| `--no-color` | all |
| `-h, --help` | all |
| `-v, --version` | root |
| `--config <path>` | `build`, `check`, `dev`, `ensure`, `trace` |
| `--bundle` / `--no-bundle` | `build`, `ensure` |
| `--watch` / `--no-watch` | `dev`, `ensure` |
| `--no-map` | `build`, `dev`, `ensure` |
| `--offline` | `build`, `dev`, `ensure` |
| `--map <path>` | `trace` |
| `--name <name>` | `init` |
| `--force` | `init` |
| `-y, --yes` | `init`, `setup` |

An option used outside its owning set is a usage error, not a warning and not
silence. `luam dev --bundle` therefore exits `2` instead of warning that it was
ignored, and `luam doctor --config x.json` exits `2` instead of succeeding.

*Exit codes are unchanged.* `0` succeeded, `1` reported diagnostics or could not
complete, `2` the command line or the configuration is invalid. `--help` and
`--version` exit `0`. `luam` with no command prints help and exits `2`, as it
did before.

*One context factory.* `createProjectContext` resolves the root, loads the
config, reports configuration diagnostics, and builds the `CommandContext`.
Command modules receive it and translate their own parsed options into the
existing command implementation. The implementations in `src/commands/` are
untouched by this decision; only their callers move.

*The registry is a list.* `src/cli/registry.ts` holds the command registrars and
`src/cli/program.ts` applies them. Adding a command is adding a file and a line,
and its help text is generated from its own declaration rather than from a
string constant that has to be remembered.

**Consequences:**
- Positive: an option that does not apply is rejected at parse time, so a user
  never believes an ignored flag took effect.
- Positive: `luam <command> --help` exists and cannot drift from the options the
  command actually reads.
- Positive: a command can be tested through its own registrar with an injected
  logger, transport, and prompt, without constructing the whole dispatcher.
- Negative: the CLI gains a runtime dependency. It is bundled by esbuild, so the
  published artifact stays a single file, but it is a dependency to audit.
- Negative: previously accepted invocations now fail. `luam dev --bundle`,
  `luam check --offline`, and every other irrelevant-flag combination is a
  breaking change for scripts that used them, and the migration is documented in
  the CLI reference.
- Negative: Commander's parse-error wording replaces the hand-written messages,
  so tests assert exit codes and the error stream rather than exact strings.
