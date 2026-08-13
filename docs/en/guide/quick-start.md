# Quick start

Five steps, from an empty folder to a resource running on your server. Every
command here assumes the CLI is installed — see
[Installation](/en/guide/installation).

## 1. Scaffold

```bash
mkdir my-resource
cd my-resource
luam init
```

`init` writes exactly one file, `.luam.manifest`. No framework, no example tree,
nothing to delete.

```luam
name = 'my-resource'
```

An existing `.luam.manifest` is kept and reported; pass `--force` to overwrite it.

## 2. Write some Luam

Create the source tree yourself. **The folder decides the environment**:
`src/server` is server-side, `src/client` is client-side, `src/shared` is both.

```
my-resource/
├── .luam.manifest
└── src/
    ├── shared/labels.luam
    ├── server/greet.luam
    └── client/greet.luam
```

<<< @/snippets/shared-function/src/shared/labels.luam

<<< @/snippets/shared-function/src/server/greet.luam

<<< @/snippets/shared-function/src/client/greet.luam

The compiler already knows `formatPlayerLabel` is shared, so both files may call
it — and that `dxDrawText` from `src/server` would be an error.

## 3. Check and build

```bash
luam check   # diagnostics only, writes nothing
luam build   # writes build/my-resource
```

A successful build reports every phase:

<<< @/snippets/output/shared-function.build.txt{text}

An error names the file, the line, the column and the rule:

```
src/server/greet.luam:4:5 error check-environment-api: API "dxDrawText" is client-only and is not available in a "server" file.
```

A build that reports any error writes nothing, so a resource that worked is never
replaced with partial output.

## 4. Run it

Copy `build/my-resource` into `<MTA Server>/mods/deathmatch/resources/`, then in
the server console:

```
refresh
start my-resource
```

## 5. Iterate

Point `.luam.manifest` at your server and let `ensure` build, sync and restart on
every save:

```luam
name = 'my-resource'
serverPath = 'C:/MTA Server'
```

```bash
luam ensure
```

With a transport configured as well, `ensure` also restarts the resource for you,
and `luam dev` adds a live stream of the server log. See
[Daily development](/en/guide/daily-development).
