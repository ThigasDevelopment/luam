# Environment configuration

Deployment values declared in `.env`, typed from their literals, and read on the
server through `process.env`.

## Prerequisites

- The `luam` CLI ([Installation](/en/guide/installation)).

## File tree

```
luam-docs-environment-configuration/
├── .luam.manifest
├── .env
└── src/
    └── server/
        └── startup.luam
```

## Source

<<< @/snippets/environment-configuration/.luam.manifest{js}

<<< @/snippets/environment-configuration/.env{ini}

<<< @/snippets/environment-configuration/src/server/startup.luam

## What to notice

- **`.env` is the source of truth for the types.** `MAX_PLAYERS=32` is a
  `number`, `DEBUG=false` is a `boolean`, and the quoted `SERVER_NAME` is a
  `string`. The annotations in the Luam file are checked against those.
- **`.env` is committed.** It declares keys and safe defaults, not secrets. The
  naming is inverted from Vite and Next: here `.env.local` is the ignored one.
- **`process` is server-only.** Reading `process.env` from a client or shared
  file is `check-environment-api`.
- **An undeclared key is an error.** `process.env.MISSING` is
  `check-unknown-record-key`, and the message lists the declared keys.

## Commands

```bash
luam check
luam build
```

## Expected result

<<< @/snippets/output/environment-configuration.check.txt{text}

The build turns the declared keys into a server script:

```
build/luam-docs-environment-configuration/
├── meta.xml
├── env.lua                   ← written once, never overwritten
└── src/server/startup.lua
```

`env.lua` holds the values as a Lua table and publishes them as `env` and
`process.env`. It is declared a server script, so a client never downloads it.
There is no runtime parser and no `.env` in the resource — the compiler reads
your `.env` at build time and writes the table.

The generated file is owned by the server administrator: the build writes it
once and never overwrites it, and `ensure` leaves it alone. That is what keeps a
deploy from replacing production values with the ones on your machine. Keys
whose name looks sensitive — `password`, `secret`, `token`, `key`, `credential`,
`dsn`, `private` — are written blank for the administrator to fill in:

```lua
local values = {
    DEBUG = false,
    MAX_PLAYERS = 32,
    SERVER_NAME = 'Luam Docs Server',
    WEBHOOK_TOKEN = '',
}
```

Reading a key the file does not declare raises an error naming the key, and the
table is read-only.

On start, `server.log` gains:

```
Luam Docs Server accepts 32 players
```

## Overriding on one machine

Create `.env.local`, which is never committed:

```ini
SERVER_NAME="Thigas dev"
DEBUG=true
```

Types still come from `.env`, so a key that exists only in `.env.local` is still
unknown to the checker.

## Security note

The generated `<outDir>/<name>/.env` **blanks** any key whose name looks
sensitive — `password`, `secret`, `token`, `key`, `credential`, `dsn`, `private`
— which is why `WEBHOOK_TOKEN` ships empty. The administrator fills it in on the
server, and no rebuild overwrites that file. Delete it to regenerate the
skeleton.

Never put a secret in `config.lua`: it is a shared script and every player
downloads it. See [Security boundaries](/en/mta/security).
