# luam-resource

A Luam resource scaffolded by `luam init`. Write `.luam` sources under `src`, run
`luam build`, and MTA gets a plain Lua 5.1 resource in `build/luam-resource`.

## Commands

| Command | Behavior |
| ------- | -------- |
| `luam check` | Compiles and reports diagnostics. Writes nothing. |
| `luam build` | Writes the resource into `build/luam-resource`. |
| `luam ensure` | Builds, syncs into the MTA server, restarts, and watches sources. |

Set `serverPath` in `.luam.manifest` before running `luam ensure`.

## Layout

```
.env                         Declares deployment keys and safe defaults
config.lua                   Structural settings the resource owns
assets/                      Files copied verbatim and downloaded by clients
src/
  shared/
    config.luam              Constants and helpers both sides use
    framework/               Core, Event, Listener, Command, Loader, ThreadPool
  server/
    main.luam                Creates the server Core and starts it
    handlers/                One file per server listener
    commands/                One file per server command
  client/
    main.luam                Creates the client Core and starts it
    commands/                One file per client command
```

The generated resource mirrors this tree. `src/server/main.luam` becomes
`src/server/main.lua`, and runtime helpers land in `src/<environment>/lib`, so a
server-only helper is never downloaded by a client.

## Configuration

Two files hold settings, and they have different owners.

`config.lua` belongs to the resource author. It is plain Lua, copied verbatim,
listed in `meta.xml` as a shared script, and readable by clients. Anything a
player may see belongs here.

`.env` belongs to the deployment. It declares the keys and safe defaults, and it
is the source of truth for their types: an unquoted number is a number, `true`
and `false` are booleans, and quoting forces a string. Override values locally in
`.env.local`, which is never committed.

The first `luam build` writes `build/<resource>/.env` from those keys, leaving
sensitive values blank, and never overwrites it again — that file belongs to the
server administrator.

Values reach Luam through `process.env`, which exists only on the server:

```lua
outputServerLog(tostring(process.env.SERVER_NAME))
```

A key that `.env` does not declare is a compile error, and `process` in a client
or shared file is a compile error too.

## Framework

`Core` owns the resource lifecycle. `main.luam` creates it with the side it runs
on and calls `start()` once the resource has finished loading. `start()` scans
the class registry, instantiates every `Listener` and `Command` subclass with the
`Core` instance, and registers them.

### Listeners

A listener declares the MTA event it handles and overrides `handle`. Nothing
registers it by hand — being a `Listener` subclass is enough.

```lua
class PlayerQuitListener extends Listener {
    event: string = 'onPlayerQuit'

    handle(...): void {
        outputDebugString(getPlayerName(source) .. ' left.')
    }
}
```

`element` defaults to `root`. Set it to narrow the handler to one element.

### Commands

A command declares its name, optional aliases, and overrides `execute`. Every
name and alias is registered.

```lua
class KickCommand extends Command {
    name: string = 'kick'
    aliases: string[] = { 'k' }
    description: string = 'Kicks a player by name.'

    execute(player: any, ...): void {
        local args: any = { ... }

        kickPlayer(getPlayerFromName(args[1]), player, 'kicked')
    }
}
```

On the server `execute` receives the calling player; on the client the first
parameter is `nil`.

### Threads

`ThreadPool` wraps the `threads.lua` runtime helper, which is opt-in. Add it to
`.luam.manifest` before using the class:

```luam
helpers = { 'threads' }
```
