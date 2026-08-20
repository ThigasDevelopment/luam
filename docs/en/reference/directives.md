# Directives

A directive is a `#!` line at the top of a file, before the first statement. It
configures **that file only**.

```luam env=client
#!client
#!nonstrict
```

Several directives may appear together, in any order. A `#!` line after the first
statement is not a directive.

## Environment directives

| Directive | Effect |
| --- | --- |
| `#!server` | The file is server-side. |
| `#!client` | The file is client-side. |
| `#!shared` | The file runs on both sides and may use only shared declarations. |

A directive **overrides the folder**, which is what lets a file live outside
`src/server`, `src/client` or `src/shared`:

```luam env=client
#!client

dxDrawText('hud', 10, 10)
```

With no directive, the environment comes from the first path segment under a
source directory. See [Environments](/en/mta/environments).

The environment also decides the `type` attribute the compiled file receives in
`meta.xml`.

## Strictness directives

| Directive | Effect |
| --- | --- |
| `#!strict` | Default. Every type rule is enforced. |
| `#!nonstrict` | Unannotated values are `any`; annotations you wrote are still checked. |
| `#!nocheck` | The file is parsed and compiled, but not type checked. |

`#!strict` never needs to be written — it is what a file without a strictness
directive gets. See [Strictness](/en/language/strictness).

::: warning Strictness does not relax the environment rule
Even under `#!nocheck`, a client-only API in a server file is
`check-environment-api`. The environment decides which API exists at all, which
is not a type question.
:::

## Combining directives

```luam
#!shared
#!nocheck
```

One environment directive and one strictness directive is the useful combination.
Two **different** environment directives in one file is
`env-conflicting-directive`: a file declares a single environment.

A directive that disagrees with the file's path is allowed — the directive wins —
but it reports `env-path-directive-conflict` as a **warning**, so a file that
drifted out of its folder is visible without failing the build.

## What a directive is not

- Not a shebang. The compiler never executes a file.
- Not a project setting. Use [`.luam.manifest`](/en/tooling/luam-manifest) for anything
  that spans files.
- Not a build instruction. Directives that configured `meta.xml` — `#!setting`
  and `#!depends` — were removed; the manifest is generated from the project
  instead. See [Resources and meta.xml](/en/mta/resources).

## Quick reference

| Directive | Category | Default when absent |
| --- | --- | --- |
| `#!server` | Environment | From the folder |
| `#!client` | Environment | From the folder |
| `#!shared` | Environment | From the folder |
| `#!strict` | Strictness | `#!strict` |
| `#!nonstrict` | Strictness | `#!strict` |
| `#!nocheck` | Strictness | `#!strict` |
