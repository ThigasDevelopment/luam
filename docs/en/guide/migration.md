# Migration

Every release that needs you to change something has a section below, oldest
first. Find the version you are on, then apply each section under it in order.
A release that is not listed needs no action: install it and rebuild.

`0.2.0` is the oldest published release, so the path starts at the first change
after it. Every entry links to the reference page that documents the current
form, and the full history is in the
[changelog](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).

| Release | What it asks of you |
| --- | --- |
| `0.6.0` | Rewrite the project file as a manifest, and rename one CLI option |
| `0.7.0` | Write class methods in one form; read the note on bundle scope |
| `0.11.1` | Rename four manifest fields |
| `0.12.0` | Drop the `env` helper and the `Dotenv` class |
| `0.13.0` | Read `env` instead of `process.env` |
| `0.14.0` | Call `super(...)` directly |
| `0.16.0` | Remove the `transport` table and reload the resource yourself |
| `0.18.0` | Rename `compilerOptions` to `compiler` |
| `0.19.0` | Re-read one template-string behaviour; no source change |

## 0.6.0 - 2026-08-12

**The project file became a manifest.** The JSON project file is no longer read,
merged, or reported, even when it sits beside a `.luam.manifest`. Rename the file
to `.luam.manifest`, drop the outer braces and the quotes around field names, and
write `=` instead of `:`.

Before, in `luam.json`:

```json
{
    "name": "my-resource",
    "compilerOptions": { "oop": false }
}
```

After, in `.luam.manifest`:

```luam static
name = 'my-resource'

compiler = {
    oop = false,
}
```

The manifest is Luam, restricted to a local declaration and a field assignment,
and it is parsed and checked by the same compiler — a mistake reports with a
file, a line and a caret. See [`.luam.manifest`](/en/tooling/luam-manifest).

**`--config` became `--manifest`** on `build`, `check`, `dev`, `ensure` and
`trace`. The path has to end in `.luam.manifest`.

**Every option now belongs to the commands that read it.** An option outside that
set exits `2` instead of being ignored, so `luam dev --bundle` and
`luam check --offline` fail rather than pretending to work. The migration table
in the [CLI reference](/en/tooling/cli) lists each one.

**The editor settings snapshot is gone.** There is no snapshot file and no child
process that evaluates the manifest; the language server reads the manifest
directly, so a change to `compiler.oop` takes effect on save.

## 0.7.0 - 2026-08-12

**One class method form.** A member written `name(...) { ... }` reports
`parse-class-method-form`. Write the form the manual documents:

```luam static
class Round {
    start = function (self): void
        print('start')
    end
}
```

Interface methods are unchanged: they have no body and keep
`name(parameters): type`. See [Classes](/en/language/classes).

**A bundle is flat.** Each member used to be emitted inside `do ... end`; it is
now the load-ordered concatenation of the helpers and the modules, with no
wrapper. Nothing to rewrite, but two consequences are worth knowing: every module
in a bundle shares the bundle chunk scope, so a file-level `local` is visible to
every module after it in the same environment, and Lua 5.1's limit of 200 active
locals applies to the bundle rather than to each module. Neither is checked by
the compiler. A resource that relies on per-file scoping builds correctly with
`--no-bundle` or the `tree` layout — see
[Output layouts](/en/reference/output-layouts).

## 0.11.1 - 2026-08-15

**Four manifest fields were replaced.** Each is rejected with
`config-removed-field` naming its replacement, rather than quietly aliased, so a
stale manifest fails instead of building something other than what it says:

| Removed | Write instead |
| --- | --- |
| `oop` | `compiler = { oop = true }` |
| `sourceDirs` | `sources = { server = { ... }, client = { ... }, shared = { ... } }`, listing paths or patterns per side |
| `assetDirs` | `assets = { { from = 'assets/**/*', to = 'assets' } }`, naming a destination for each entry |
| `mta` | `engine = { minVersion = '1.6.0' }` |

Three diagnostics moved with them, because the manifest is where the mistake is:
`build-no-sources` is now `config-no-sources`, `build-source-dir-missing` is
`config-missing-source`, and `build-source-dir-outside-root` is
`config-escaping-path`. See
[Configuration fields](/en/reference/configuration-fields).

## 0.12.0 - 2026-08-15

**The `env` and `dotenv` runtime helpers were removed.** `helpers = { 'env' }`
in a manifest is now `config-unknown-helper`. Drop the entry: the values are
published by the generated `env.lua`, and their types still come from `.env`
through the checker, so a key the file does not declare is still
`check-unknown-record-key`.

**The `Dotenv` native class was removed**, with its constructor and members.
Reading a second environment file at run time is no longer part of the language.

**A resource no longer ships a `.env`.** The values live in `env.lua`, and an
already deployed `.env` is still protected from pruning. See
[config.lua and .env](/en/mta/configuration).

## 0.13.0 - 2026-08-15

**`process` and `process.env` were removed.** Read `env` instead:

```luam static
local port: number = env.SERVER_PORT
```

A file still naming `process` compiles — an undeclared global is legal Lua — but
it reads `nil` at run time, so this one does not fail loudly. Search your sources
for the name.

`env.lua` is regenerated on every build, so a key added to the project can never
leave a stale reader behind on the server.

## 0.14.0 - 2026-08-15

**`super` is called directly.** The former spelling that called it through
`self` reports `check-invalid-super`:

```luam static
class Timed extends Round {
    constructor = function (self, seconds: number): void
        super(seconds)
    end
}
```

The same applies to an overridden method: call `super:method(...)` in the body of
the method that overrides it. See [Classes](/en/language/classes).

## 0.16.0 - 2026-08-25

**The `transport` table was removed**, along with the `http` transport and every
field, diagnostic and environment variable that served it. A manifest that still
writes `transport` reports `config-removed-field`. Delete the table.

The removed diagnostics are `config-invalid-transport`,
`config-invalid-url-segment`, `config-missing-secret`,
`config-plaintext-password` and `config-remote-plaintext-transport`.

**Reloading is yours again.** `luam ensure` builds and syncs the resource, and
stops there; load the sync with `refresh` and `restart <name>` in the server
console. `luam dev --start-server` is the one path that restarts a resource for
you, because it owns the process it writes those commands to. The CLI no longer
opens a connection to an MTA server. See
[Daily development](/en/guide/daily-development).

## 0.18.0 - 2026-08-25

**`compilerOptions` is now `compiler`.** The members and their defaults are
unchanged — `strict`, `oop`, `noUnusedLocals`, `noUnusedParameters` and
`warningsAsErrors`. The old name is not aliased: it reports
`config-removed-field` and names `compiler` as its replacement, so a stale
manifest fails loudly instead of building with the defaults.

```luam static
compiler = {
    strict = true,
    oop = false,
}
```

## 0.19.0 - 2026-08-27

**No source change, one behaviour to know.** A deeper `self` path inside a
template string is now read at the call site. A `nil` segment in the middle
raises `attempt to index a nil value` where the runtime helper used to stop and
return the fallback. If you relied on the fallback to absorb a missing
intermediate field, guard the path instead. See
[Template strings](/en/language/template-strings).
