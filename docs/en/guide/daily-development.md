# Daily development

`build` is for producing a resource. `ensure` and `dev` are the commands you
leave running while you work.

## `luam ensure`

One command builds the resource, mirrors it into your MTA server, restarts it,
and repeats all of that on every save.

```bash
luam ensure
```

How much it does depends on what `.luam.manifest` gives it:

| Configured | What `ensure` does |
| --- | --- |
| nothing | Reports a diagnostic. `serverPath` is required. |
| `serverPath` | Writes the resource into the server. You restart it. |
| `serverPath` + `transport` | Also refreshes and restarts the resource for you. |

`ensure` never writes to `<outDir>/<name>`. Use `luam build` when you want a
local copy of the generated resource.

### Getting the restart

Add an `http` transport pointing at a resource on your server that exports
`refreshResources` and `restartResource`:

<<< @/snippets/local-development/luam.server.json

```bash
set LUAM_MTA_PASSWORD=...       # Windows
export LUAM_MTA_PASSWORD=...    # macOS and Linux
luam ensure
```

Use `passwordEnv`, which names an environment variable, rather than an inline
`password`: no log line and no diagnostic ever prints the value. MTA's HTTP
interface has no TLS, so keep `host` on `127.0.0.1` and tunnel over SSH instead
of exposing the port. See [Security boundaries](/en/mta/security).

### What happens on each save

1. **Rebuild.** Only files whose source changed are parsed and checked again, and
   only files whose declarations changed invalidate the files that see them.
2. **Stop on error.** If anything is an error, it is reported and nothing else
   runs. No sync, no restart, and the previous resource stays on the server.
3. **Sync.** Write `<serverPath>/<resourcesDir>/<name>`, skipping identical files
   and deleting generated files the project no longer produces.
4. **Restart** — but only when the sync actually changed a file.

### Reading the output

Each run is separated by a timestamped rule, and every phase reports what it did
and what it cost. This one is an illustration of a warm rebuild on a 42-file
project rather than a capture, because the numbers only appear once a watch has
something to reuse:

```
---------------------------------------- rebuild at 14:22:07
Discovery: done in 1 ms.
Compile: 42 files in 2 ms.
Assembly: done in 0 ms.
Manifest: done in 0 ms.
Build passed: 42 files, 41 reused, 0 errors, 0 warnings in 3 ms.
Sync: 18 files in 1 ms.
Synced 1 file to "C:/MTA Server/mods/deathmatch/resources/gamemode-race" (0 removed).
Restart: done in 24 ms.
Restarted "gamemode-race" through the "http" transport.
```

`reused` is the incremental cache at work: 41 of 42 files came back from cache
and only the file you saved was recompiled. It appears only once a rebuild has
something to reuse, so the first build never shows it.

A rebuild that fails leaves the server untouched:

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
Skipping sync and restart because the build reported errors.
```

## `luam dev`

`dev` runs the complete `ensure` workflow and also follows
`<serverPath>/mods/deathmatch/logs/server.log`. It starts at the end of the file,
so existing history is not printed.

```bash
luam dev
```

Server records attributed to the active resource and relayed client
`outputDebugString` calls share one stable stream:

```
[14:22:07][server][info] Resource started
[14:22:09][client][warn] Missing vehicle model
```

The client call still reaches the MTA debug console. `dev` adds a validated,
rate-limited MTA event relay **only** to the synchronized server resource.
`build` and `ensure` never include these development helpers, and the next
normal sync removes them.

Engine output with no resource identity can appear as plain server output;
records attributed to other resources are ignored.

Tune the relay in `.luam.manifest`:

```luam
development = {
    logs = {
        maxMessageLength = 2048,
        rateLimit = 20,
        rateWindowMs = 1000,
    },
}
```

## Stopping and one-shot runs

`Ctrl+C` ends the watch. `--no-watch` runs the whole cycle exactly once, which is
what an editor task or a deploy script wants:

```bash
luam ensure --no-watch
```

## From the editor

The VS Code extension binds **Luam: Ensure Resource** to `Ctrl+Alt+E`
(`Cmd+Alt+E`), which runs `luam ensure` in a dedicated terminal for the current
project. See [Editors](/en/tooling/editors).
