# config.lua and .env

A resource carries two settings files, and they have **different owners**.

| File | Owner | Versioned | Reaches the client |
| --- | --- | --- | --- |
| `config.lua` | The resource author | yes | **yes** |
| `.env` | The deployment | yes | no |
| `.env.local` | One developer's machine | no | no |
| `<outDir>/<name>/.env` | The server administrator | no | no |

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

```luam
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

Values reach Luam through `process.env`, built on the server by the `env` runtime
helper:

<<< @/snippets/environment-configuration/src/server/startup.luam

`process` is declared `server`, so using it from a client or a shared file is
`check-environment-api`. A key `.env` does not declare is
`check-unknown-record-key`, and the message lists the declared keys.

`.env` never receives a `<file>` entry, so it is never transmitted to a player.

## `.env.local`

`.env.local` overrides values on one machine and is never committed. Types still
come from `.env`, so a key that only exists in `.env.local` is still unknown to
the checker.

::: warning The naming is inverted from Vite and Next
Here `.env` is **committed** and `.env.local` is ignored. `.env` is a declaration
of keys and safe defaults, not a secret store.
:::

## The deployed `.env`

The first build writes `<outDir>/<name>/.env` from the declared keys, blanking any
key whose name looks sensitive — `password`, `secret`, `token`, `key`,
`credential`, `dsn`, or `private`.

It is **never overwritten afterwards**, so an administrator's edits survive every
rebuild. Delete it to regenerate the skeleton.

## Choosing between the two

| The value is | Put it in |
| --- | --- |
| Gameplay tuning a player may read | `config.lua` |
| A server name, a limit, a feature flag | `.env` |
| A password, a token, an API key | `.env` on the server, blanked in the committed file |
| Different per machine while developing | `.env.local` |
