# ADR-014: The project manifest is a `.luam.manifest` ESM module evaluated out of process

**Status:** Accepted, amended by
[ADR-015](015-luam-manifest-language.md). The file name, the `--manifest` flag,
the `mode`/`env`/`root` context, and the no-fallback policy toward `luam.json`
all stand. The decision that the file is an ES module does not: ADR-015 replaces
it with a restricted Luam dialect and deletes the child process, the stdout
protocol, and the `.luam/settings.json` channel this ADR introduced.

**Amends:** [ADR-004](004-resource-configuration-and-environment-files.md), which
named `luam.json` as the versioned project file and rejected it as a home for
per-machine secrets. That rejection stands. This ADR replaces the file itself
and gives it a way to *read* a per-machine value without ever *storing* one.

**Context:**
`luam.json` is a static document. Every value in it is the same on every machine
and for every command, so a project that wants a different `outDir` for a
development build, or an `http` transport only when a password is present in the
environment, has to keep two files and remember which one to pass to `--config`.
The CLI reads the file with `JSON.parse` and hands the result to
`validateConfig`, which is the only authority on defaults, unknown fields, path
safety, helper names, and transport credentials.

The language server reads the same file a second time, independently, with its
own `JSON.parse`, to discover one boolean: `oop`. Two readers of one file with
two notions of what a valid file is.

Anything that makes the manifest dynamic makes it code, and code in a project
directory is a trust decision. The CLI already runs project code in the sense
that it compiles it, and a developer who runs `luam build` has chosen to trust
the checkout. The language server has made no such choice: it starts when a
folder is opened, before anyone has read a line of it.

**Options considered:**
- **Keep JSON, add a second file for overrides.** No new execution risk, and it
  answers "which value wins" with a merge algorithm the user has to learn, plus
  a second file to keep in sync. Environment-sensitive values still cannot be
  expressed; only environment-sensitive *files* can.
- **A dotenv-style key/value manifest.** Flat, safe, and unable to express
  `sourceDirs`, `output`, `development.logs`, or `transport` without inventing
  an escaping convention for nesting and arrays — a DSL, badly.
- **An ESM module with a default export.** The workspace is already `"type":
  "module"` end to end, so the syntax is one a Luam developer already reads. A
  static object covers the common project unchanged, and a function covers the
  environment-sensitive one without a second file. The cost is that the manifest
  is executable.
- **TypeScript manifests.** Would need a transpiler in the CLI's runtime path
  and a resolution story for the project's own `tsconfig`. Out of scope.

**Decision:**

*The file is exactly `.luam.manifest` in the project root.* Not a glob, not a
search up the directory tree, not a JSON sibling. `--manifest <path>` selects an
alternate file for a deployment profile, resolved against `--cwd`.

*Its default export is a plain object or a synchronous function.* The function
receives one frozen context and nothing else:

| Value | Meaning |
| --- | --- |
| `mode` | `development` for `dev` and `ensure`, `production` for `build`, otherwise the command name — `check`, `trace`. |
| `env` | Read-only copy of the environment the CLI was given, so a manifest selects values by explicit variable name. |
| `root` | Absolute project root, for deterministic path composition. |

*Synchronous only.* A `Promise` — from an `async` function, or exported
directly — is rejected rather than awaited. Configuration resolution sits in
front of every command, including the synchronous ones, and an async manifest
would either force the whole CLI entry path to become asynchronous or invite a
manifest to perform I/O the compiler has promised not to perform.

*It is evaluated in a short-lived child process, never in the CLI process.* The
child is `node --input-type=module -e <evaluator>`; it receives the manifest
path and the context as JSON on stdin, imports the manifest through a module
`load` hook registered for the `.luam.manifest` extension, and writes one JSON
envelope on stdout. The parent reads only that envelope. Nothing else crosses
the boundary: not the module's exports, not its closures, not the child's own
environment. A watching `luam dev` therefore never accumulates manifest state,
and a manifest that throws cannot unwind the watcher.

The hook is what makes an extensionless-looking file importable. Node resolves
`.luam.manifest` to no known format, and `--experimental-default-type` only
covers files with no extension at all. The evaluator's own `load` hook returns
the file's bytes as `format: 'module'`, so relative imports and `node_modules`
resolution inside the manifest keep working from the project root.

*The language server never evaluates the manifest.* It reads a generated
snapshot instead — `.luam/settings.json` in the project root, written atomically
by the CLI after validation, carrying a schema version and the settings the
editor needs. The path is fixed relative to the root rather than placed under
`outDir`, because `outDir` is a manifest value and the editor is the one process
that may not read the manifest. No snapshot means defaults, and a snapshot the
server cannot parse means defaults. `oop` therefore cannot be enabled by a file the editor has not been
told about, and a malformed manifest degrades the editor to defaults instead of
crashing it. The VS Code extension activates on `.luam.manifest` and watches it,
but likewise never imports it.

*Validation is unchanged and remains the sole authority.* The child returns an
unknown value; `validateConfig` decides whether it is a `LuamConfig`. Discovery
and evaluation gained the `manifest` vocabulary; the validated internal model
keeps the name `LuamConfig`.

*Diagnostics keep the `config-` prefix* so the reference stays one namespace:

| Code | Raised when |
| --- | --- |
| `config-not-found` | No `.luam.manifest` at the default or explicit path. |
| `config-unsupported-manifest` | The selected file is not named `.luam.manifest`. |
| `config-manifest-failed` | The module could not be read, imported, or evaluated. |
| `config-invalid-export` | No default export, or a default that is neither object nor function. |
| `config-async-manifest` | The default export or its result is a `Promise`. |
| `config-invalid-result` | The function returned something that is not an object. |

`config-invalid-json` and `config-unreadable` are removed with the JSON reader.
No diagnostic carries a stack trace, the module source, or an environment value:
the child reports `error.message` alone, and the parent prints the manifest path
plus that message.

*`luam.json` is not a fallback.* It is not read, not merged, and not reported —
even when it sits beside a `.luam.manifest`. Two sources of truth for one
setting is the failure this ADR exists to prevent, and a silent fallback would
make "my change did nothing" the first migration experience. The missing-file
diagnostic names `.luam.manifest`, and the migration guide is three lines:
rename the file, wrap the object in `export default`, rename `--config` to
`--manifest`.

**Consequences:**
- Positive: one project file expresses every deployment profile, and the
  environment reaches it by explicit variable name rather than by file swap.
- Positive: the editor stops parsing project files on its own. There is exactly
  one validator, in the CLI, and the editor consumes its output.
- Positive: a manifest cannot execute in the editor process, which is the
  process that starts without the developer having read the checkout.
- Positive: `passwordEnv` remains the only path from an environment variable to
  a credential. A manifest may branch on `env.X` being present; the secret
  itself is still resolved by validation, and the context never returns to the
  parent.
- Negative: every command that loads a manifest now spawns a Node process. It is
  one spawn per load, on the order of tens of milliseconds, paid once per
  build and once per configuration reload under `--watch`.
- Negative: the manifest is executable code in the project directory. A hostile
  checkout that a developer builds runs that code — the same exposure a
  `package.json` `postinstall` or a `vite.config.ts` already carries, and the
  reason the editor is excluded.
- Negative: the editor's `oop` view is only as fresh as the last CLI run. A
  developer who flips `oop` and never runs a Luam command sees stale
  diagnostics until they do.
- Negative: a breaking rename strands every existing project until it is
  migrated by hand, and the CLI cannot migrate it automatically without reading
  the file it just promised not to read.
- Negative: the manifest must not write to stdout. The evaluator's protocol is
  the child's stdout, so a stray `console.log` is reported as an invalid
  manifest rather than silently ignored.
