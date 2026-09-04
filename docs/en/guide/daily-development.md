# Daily development

`build` is for producing a resource. `ensure` and `dev` are the commands you
leave running while you work.

## `luam ensure`

One command builds the resource, mirrors it into your MTA server, and repeats
both on every save.

```bash
luam ensure
```

How much it does depends on what `.luam.manifest` gives it:

| Configured | What `ensure` does |
| --- | --- |
| nothing | Reports a diagnostic. `serverPath` is required. |
| `serverPath` | Writes the resource into the server. You restart it. |

`ensure` never writes to `<outDir>/<name>`. Use `luam build` when you want a
local copy of the generated resource.

### Getting the restart

`ensure` writes files and stops there. There are two arrangements that make the
restart happen for you, and which one you want depends on how many resources you
are working on.

**One resource.** Run `luam dev --start-server` in the resource directory: the
CLI owns the MTA process and writes `refresh`, `stop <name>`, and `start <name>`
to its console after a sync that changed something. Without the flag, type those
commands in the server console yourself.

**A folder of resources.** An MTA installation binds one port, so two
`luam dev --start-server` loops cannot both run against it. Put a
[`.luam.server`](/en/reference/server-file) at the root of the folder and run
`luam dev` **there** instead — see [A workspace of resources](#a-workspace-of-resources)
below.

### What happens on each save

1. **Rebuild.** Only files whose source changed are parsed and checked again, and
   only files whose declarations changed invalidate the files that see them.
2. **Stop on error.** If anything is an error, it is reported and nothing else
   runs. No sync, no restart, and the previous resource stays on the server.
3. **Sync.** Write `<serverPath>/<resourcesDir>/<name>`, skipping identical files
   and deleting generated files the project no longer produces.
4. **Restart** — only under `dev --start-server`, and only when the sync actually
   changed a file.

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
luam dev --start-server
```

Use `luam server` in a second terminal when you want the interactive MTA console,
or `luam dev --start-server` for one command. The integrated form waits for MTA
readiness before syncing, refreshes and starts or restarts the resource through
the owned console, and stops its process on `Ctrl+C`.

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

Tune the relay in `.luam.manifest`, or once for a whole workspace in
`.luam.server`:

```luam
development = {
    logs = {
        maxMessageLength = 2048,
        rateLimit = 20,
        rateWindowMs = 1000,
    },
}
```

## A workspace of resources

A directory that holds a [`.luam.server`](/en/reference/server-file) and a
resource per subdirectory is a **workspace**:

```
resources/
  .luam.server
  gamemode-race/
    .luam.manifest
  scoreboard/
    .luam.manifest
```

The file names the installation once, so no manifest repeats `serverPath` and
moving the server is one edit. `luam dev` run at that root starts **one** MTA
server, waits for readiness, follows the log, and attaches nothing:

```
Started the MTA server at "C:/MTA Server" and waited for readiness in 4.20 s.
Watching nothing yet. Type "ensure <resource>" to attach one, "help" for the rest.
Resources here: "gamemode-race", "scoreboard".
[14:22:09][server][info] Server started and is ready to accept connections
```

That block is an illustration rather than a capture — the timings and the log
line come from a real server, which the documentation build does not run.

From inside that session you name what you are touching. `ensure gamemode-race`
builds it, syncs it, starts it, and hangs it on the watch; `drop` takes it off
again and leaves the deployed copy alone; `rebuild` forces a cycle; `list` says
what is attached and how each one's last build went; `help` names the five verbs.
Every other line — `refresh`, `stop`, a gamemode command of your own — reaches
the MTA console unchanged, and a line that begins with a space is forwarded even
when its first word is a verb.

The set of resources under development is discovered at the speed the work
changes and is never written down. See
[the CLI reference](/en/tooling/cli#the-workspace-session) for the whole
vocabulary.

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
