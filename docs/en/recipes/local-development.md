# Local development

The loop you leave running: build, sync into the server, stream the log, repeat
on every save.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).
- An MTA server on the same machine.
- For the automatic restart: `luam dev --start-server`, so the CLI owns the
  server process and can write to its console.

## File tree

```
luam-docs-local-development/
├── .luam.manifest
└── src/
    └── server/
        └── main.luam
```

## Source

<<< @/snippets/local-development/.luam.manifest{js}

<<< @/snippets/local-development/src/server/main.luam

## Wiring the server

Add `serverPath`. This is the manifest the loop actually uses:

<<< @/snippets/local-development/luam.server.json

## Commands

```bash
luam ensure            # build, sync, watch
luam dev               # the same loop, plus a live server log stream
luam dev --start-server # also owns the server and restarts the resource
```

## Expected result

Each save prints a timestamped rule and a per-phase report:

```
---------------------------------------- rebuild at 14:22:07
Discovery: done in 1 ms.
Compile: 42 files in 2 ms.
Build passed: 42 files, 41 reused, 0 errors, 0 warnings in 3 ms.
Sync: 18 files in 1 ms.
Synced 1 file to "C:/MTA Server/mods/deathmatch/resources/luam-docs-local-development" (0 removed).
```

`reused` is the incremental cache: only the file you saved was recompiled.

With `luam dev`, server records for this resource and relayed client
`outputDebugString` calls share one stream:

```
[14:22:07][server][info] resource started (1)
[14:22:09][client][info] ping answered
```

## When a build fails

```
src/server/main.luam:11:23 error check-type-mismatch: Variable "total" expects "number" but received "string".
Build failed: 1 error, 0 warnings in 4 ms.
Skipping sync and restart because the build reported errors.
```

Nothing is synced and nothing is restarted, so the running game keeps the last
version that compiled.

## Loading the sync

`ensure` mirrors the files and stops. Restart the resource yourself:

```
refresh
restart luam-docs-local-development
```

## Stopping

`Ctrl+C` ends the watch. `--no-watch` runs the cycle exactly once, which is what
an editor task or a deploy script wants:

```bash
luam ensure --no-watch
```

In VS Code, **Luam: Ensure Resource** (`Ctrl+Alt+E`) runs the same loop in a
terminal.

## Cleanup

`luam dev` adds development-only log helpers to the **synchronized** resource.
They are never written by `build` or `ensure`, and the next normal sync removes
them — so run `luam ensure --no-watch` once before shipping, or build a fresh
resource with `luam build`.

## Security note

The CLI never opens a connection to a running server: `ensure` only writes files
into `serverPath`, and `dev --start-server` writes to a console it owns. No
credential belongs in the manifest. See [Security boundaries](/en/mta/security).
