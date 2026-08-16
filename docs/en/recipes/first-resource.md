# First resource

The smallest resource that starts, logs, and stops cleanly.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- An MTA:SA 1.5+ server you can restart.

## File tree

```
luam-docs-first-resource/
├── .luam.manifest
└── src/
    └── server/
        └── main.luam
```

## Source

<<< @/snippets/first-resource/.luam.manifest{js}

<<< @/snippets/first-resource/src/server/main.luam

`resourceRoot` scopes both handlers to this resource, so they do not fire for
other resources starting on the same server.

Note the second handler: `${uptime}` interpolates a **local**, because an
interpolation takes a name or a member path and never an expression. See
[Template strings](/en/language/template-strings).

## Commands

```bash
mkdir luam-docs-first-resource
cd luam-docs-first-resource
luam init --name luam-docs-first-resource
mkdir -p src/server
# create src/server/main.luam with the source above
luam check
luam build
```

## Expected result

Every block below is captured from a real run and re-checked on every
documentation build.

<<< @/snippets/output/first-resource.check.txt{text}

`luam build` reports each phase and where it wrote:

<<< @/snippets/output/first-resource.build.txt{text}

It produced exactly two files:

<<< @/snippets/output/first-resource.tree.txt{text}

The template strings pulled in `string.lua`, the helper behind `` ` ` ``
interpolation, so even this one-file resource needs a runtime helper. This build
bundles, so the helper is inlined at the top of `src/server.lua`. A tree build
writes it to `lib/string.lua` instead — never into your source tree.

There is no `env.lua` in the output, because the project has no `.env` to declare
keys from. Add one and the build compiles its keys into `env.lua`; see
[Environment configuration](/en/recipes/environment-configuration).

The generated manifest:

<<< @/snippets/output/first-resource.meta.xml{xml}

Note what the compiler did on its own: the `<info>` attributes come from
`.luam.manifest`, the helper is listed before your code, and the server entry carries
neither `type` nor `cache` because both equal the MTA default. `min_mta_version`
is absent because this capture runs with `--offline`.

## Run it

Copy `build/luam-docs-first-resource` into
`<MTA Server>/mods/deathmatch/resources/`, then in the server console:

```
refresh
start luam-docs-first-resource
```

`<MTA Server>/mods/deathmatch/logs/server.log` gains:

```
luam-docs-first-resource started at 1234567
```

## Cleanup

```
stop luam-docs-first-resource
```

Delete the resource folder from the server, and delete `build/` locally.
