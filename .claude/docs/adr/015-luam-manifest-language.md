# ADR-015: The manifest is a restricted Luam dialect, evaluated in process

**Status:** Accepted

**Amends:** [ADR-014](014-luam-manifest-module.md). ADR-014 keeps the file name
`.luam.manifest`, the `--manifest` flag, the `mode`/`env`/`root` context, and the
no-fallback policy toward `luam.json`. It loses the decision that the file is an
ES module, and with it the child process, the stdout protocol, the
`.luam/settings.json` channel, and the rule that the language server may never
evaluate the manifest. Nothing built on ADR-014 has been published, so this
replaces it inside the same unreleased cycle rather than migrating users twice.

**Context:**
ADR-014 made the manifest dynamic by making it JavaScript. That worked, and
every expensive thing about it descends from one property: the file is
executable code the project did not write a runtime for. Because it is
executable, it needs a child process. Because it needs a child process, it needs
a serialization protocol, and because the protocol owns stdout, a stray
`console.log` in the manifest is a build failure. Because it is executable, the
editor must not run it, so `oop` reaches the language server through a generated
snapshot that is only as fresh as the last CLI run.

There is a second cost that has nothing to do with security. `validateConfig`
receives a plain object with no provenance, so every configuration diagnostic is
positionless: `"outDir" must be a string but received a number` names the field
and cannot point at it. Every other file in a Luam project gets a caret under the
offending token, an excerpt, and an enclosing symbol. The manifest was the one
file the diagnostic machinery could not reach.

The project owns a lexer, a parser, a checker, a type descriptor model with
records, and a diagnostic renderer with spans. The manifest was the only project
file that used none of it.

**Options considered:**
- **Keep the ESM module.** Ships nothing new and keeps the child process, the
  snapshot channel, and positionless configuration diagnostics. The manifest
  stays the one file in the project the compiler cannot see into.
- **A standalone manifest DSL with its own grammar.** Buys a reading experience
  tuned to configuration — keywords and blocks rather than assignments and
  tables. Costs a second front end: another lexer, another parser, another set
  of syntax diagnostics, another editor grammar, all of which have to stay
  correct forever in parallel with the real one.
- **A restricted dialect of Luam.** Top-level assignments and table
  constructors, parsed by `AssignmentStatement` and `TableExpression`, which the
  parser already produces, and checked against a `RecordDescriptor`, which the
  type model already has. No second front end, and the audience already writes
  Lua tables.

**Decision:**

*The manifest is a Luam file with most of the language removed.* Two statements
are legal: a `local` declaration, and an assignment whose target is a manifest
field. Nothing else — no function declarations, no control flow, no `class`, no
`export`, no build directives, no `return`. There is no `#!` directive either;
the file name is the identity, the way `src/server` is the identity of a server
file.

```
local password = env.LUAM_MTA_PASSWORD

name = 'luam-demo'
version = '1.0.0'

sourceDirs = { 'src' }
outDir = mode == 'production' and 'build' or 'build-dev'

output = {
    bundle = true,
    map = true,
}

transport = {
    kind = password and 'http' or 'none',
    resource = 'luam-sync',
    username = 'luam',
    passwordEnv = 'LUAM_MTA_PASSWORD',
}
```

*`local` is a value, a bare assignment is a field.* Lua already teaches this
distinction, and it gives intermediate values a home without inventing syntax
for them. A `local` that is never read is dead configuration and says so.

*The expression language is pure and total.* Literals, table constructors,
`and`, `or`, `not`, comparison, arithmetic, concatenation, member and index
access, and parentheses. **No calls and no function expressions.** That single
exclusion is what does the work: an expression grammar with no calls and no
loops cannot diverge, cannot perform I/O, and cannot observe anything but the
values it was handed. It is therefore safe to evaluate anywhere, including in
the editor process, which is the whole point.

*There is no conditional expression, and none is added.* The parser has
`BinaryExpression` and `UnaryExpression` and no ternary. `a and b or c` is the
Lua idiom, the audience already reads it, and adding an `if` expression to the
language to serve the manifest would be the manifest's tail wagging the
language's dog.

*One field catalog is the single source of truth.* A table of field name, type,
default, required flag, and validation rule, living in the compiler. From it are
derived the `Manifest` record descriptor the checker validates against, the
semantic validator that replaces `config-validation.ts`, the completion items
the language server offers, the hover text, and the reference table in the
manual. A field is added in one place or it is inconsistent.

*Checking is a closed-scope mode.* Ordinary Luam has an open global scope: an
assignment to an unbound name is how a shared file publishes a global, and the
checker does not object. Manifest mode closes it. The global scope contains
exactly the manifest fields, `mode`, `env`, and `root`, so `outdir = 'build'` is
an unknown field with a caret under it rather than a global nobody reads.

*`env` is a table of optional strings.* Its keys come from the machine, so the
checker cannot enumerate them. Member access on `env` yields `string?` and
nothing else, which is enough to make `env.X and 'http' or 'none'` check and
enough to reject `env.PORT + 1`.

*The CLI and the language server run the same evaluator, in process.* No child,
no serialization boundary, no snapshot. The editor reads `oop` from the manifest
directly and rechecks when it changes, so the setting stops being stale between
CLI runs. `.luam/settings.json` and the `editor-settings` contract are deleted.

*Diagnostics gain positions and lose the evaluator codes.* `config-missing-field`,
`config-invalid-type`, `config-unknown-field`, `config-escaping-path`,
`config-unknown-helper`, and the transport codes survive and carry a span.
`config-manifest-failed`, `config-invalid-export`, `config-async-manifest`, and
`config-invalid-result` described an evaluator that no longer exists and are
removed. `config-unsupported-manifest` survives for a `--manifest` pointed at
the wrong file. Two codes are added for the subset: one for a statement the
manifest does not allow, one for an expression it does not allow — each naming
what is allowed instead.

**Consequences:**
- Positive: the trust boundary disappears rather than being defended. A pure
  total expression language is safe to evaluate in the editor because there is
  nothing for it to do that is unsafe, not because a process wall stops it.
- Positive: configuration diagnostics look like every other Luam diagnostic —
  caret, excerpt, and line — and arrive as you type rather than on the next
  build.
- Positive: the editor's `oop` is exact instead of a snapshot's age.
- Positive: completion, hover, and the manual all read from the field catalog,
  so a field cannot be documented as one type and validated as another.
- Positive: the audience writes Lua tables already.
- Negative: arbitrary computation is gone. No reading `package.json`, no
  importing a shared module, no deriving a value from the file system. A project
  that needs any of that generates a manifest or picks one with `--manifest`.
- Negative: the checker grows a mode. Closed global scope, an injected ambient
  scope, and a statement and expression allowlist are conditions that every
  future change to the checker has to keep in mind.
- Negative: two syntaxes now describe one thing during the unreleased window,
  and every sample, snippet, fixture, and page written for the ESM manifest is
  rewritten a second time.
- Negative: the manifest can no longer be read by a non-Luam tool. A CI script
  that wants the resource name runs `luam` instead of parsing JSON, and an
  editor without the extension shows plain text.
