# config.lua and .env

A resource carries two settings files, and they have **different owners**.

| File | Owner | Versioned | Reaches the client |
| --- | --- | --- | --- |
| `config.lua` | The resource author | yes | **yes** |
| `.env` | The deployment | yes | no |
| `.env.local` | One developer's machine | no | no |
| `<outDir>/<name>/env.lua` | The server administrator | no | no |

## `config.lua`

`config.lua` at the project root belongs to the resource author. It is plain Lua
5.1, copied verbatim, never parsed by the compiler, and declared in `meta.xml` as
a **shared** script — which means clients download it.

```lua
Config = {
    greeting = 'Welcome to the server.',
    limit = 32,
}
```

Anything a player may see belongs here. Nothing secret does.

Because the compiler never parses it, give it a
[declaration file](/en/language/declaration-files) to get types:

```luam decl
interface ConfigShape {
    greeting: string
    limit: number
}

declare Config: ConfigShape
```

## `.env`

`.env` at the project root belongs to the deployment. It declares the keys, the
safe defaults, and — this is the important part — **the types**:

<<< @/snippets/environment-configuration/.env{ini}

| Value | Type |
| --- | --- |
| `MAX_PLAYERS=32` | `number` |
| `DEBUG=false` | `boolean` |
| `SERVER_NAME="Luam Docs Server"` | `string` |

An unquoted number is a `number`, `true` and `false` are `boolean`, and quoting
forces a `string`.

## Reading values

Values reach Luam through `env` and `process.env`, published on the server by the
generated `env.lua`:

<<< @/snippets/environment-configuration/src/server/startup.luam

`process` is declared `server`, so using it from a client or a shared file is
`check-environment-api`. A key `.env` does not declare is
`check-unknown-record-key`, and the message lists the declared keys.

Nothing is parsed at run time. The compiler reads `.env` during the build and
writes the keys as a Lua table, so the values a resource ships are fixed when it
is built and the types the checker knows are the types the resource carries.

## `.env.local`

`.env.local` overrides values on one machine and is never committed. Types still
come from `.env`, so a key that only exists in `.env.local` is still unknown to
the checker.

::: warning The naming is inverted from Vite and Next
Here `.env` is **committed** and `.env.local` is ignored. `.env` is a declaration
of keys and safe defaults, not a secret store.
:::

## The deployed `env.lua`

The first build writes `<outDir>/<name>/env.lua` from the declared keys, blanking
any key whose name looks sensitive — `password`, `secret`, `token`, `key`,
`credential`, `dsn`, or `private`:

```lua
local values = {
    DEBUG = false,
    MAX_PLAYERS = 32,
    SERVER_NAME = 'Luam Docs Server',
    WEBHOOK_TOKEN = '',
}
```

It is **never overwritten afterwards** and never pruned, so an administrator's
edits survive every rebuild and every `ensure`. That is what keeps a deploy from
replacing a running server's configuration with the values on your machine.
Delete the file to regenerate the skeleton.

Values are edited in place, so they follow Lua syntax: text stays quoted, numbers
and booleans do not. Below the table the file publishes `env` and `process.env`
behind a metatable that raises on an undeclared key and refuses assignment.

The resource ships no `.env` of its own. `.env.local` never reaches the generated
file — its overrides are for the checker on your machine only.

## Choosing between the two

| The value is | Put it in |
| --- | --- |
| Gameplay tuning a player may read | `config.lua` |
| A server name, a limit, a feature flag | `.env` |
| A password, a token, an API key | `env.lua` on the server, blanked in the committed `.env` |
| Different per machine while developing | `.env.local` |
