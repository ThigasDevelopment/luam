# Security boundaries

MTA runs part of your resource on machines you do not control. Luam enforces some
of that boundary at build time; the rest is a design decision that stays yours.

## What the client receives

Everything declared `client` or `shared` in `meta.xml` is **downloaded to the
player's machine** and can be read there:

| File | Downloaded |
| --- | --- |
| `src/client/**` | yes |
| `src/shared/**` | yes |
| `config.lua` | **yes** — it is a shared script |
| `assets/**` | yes |
| `src/server/**` | no |
| `lib/*.lua` | only the helpers declared `client` or `shared` in `meta.xml` |
| `env.lua` | no — it is declared a server script |

Assume anything downloaded is public. Obfuscation is not a boundary.

## What the compiler enforces

- A server-only API in a client or shared file is `check-environment-api`.
- A server global is invisible to client files, and the reverse, through
  `project-environment-import`.
- `process` is declared `server`, so `.env` values cannot be read from a client
  or shared file.
- Every runtime helper is written flat to `lib/`, and its `meta.xml` entry
  carries the environment.
- Deployment values are compiled into `env.lua`, which is declared a server
  script and never sent to a client. Keys whose name looks sensitive are written
  blank, so a secret never travels in a build artifact.

## What stays your decision

The compiler cannot know which of your own values are sensitive.

- **Never put a secret in `config.lua`.** It is a shared script; every player has
  it.
- **Validate every argument that arrives from a client.** A `triggerServerEvent`
  handler receives whatever the client chose to send, and the type annotation on
  the handler is erased at build time — it is a compile-time contract, not a
  runtime guard.
- **Keep authority on the server.** A client-side check is a convenience for the
  honest player, never an enforcement.

## Secrets in `.env`

`.env` is committed, so it declares keys and safe defaults rather than storing
secrets. The first build writes `<outDir>/<name>/env.lua` and **blanks** any key
whose name looks sensitive: `password`, `secret`, `token`, `key`, `credential`,
`dsn`, `private`. The administrator fills them in on the server, and no rebuild
overwrites that file.

`.env.local` never reaches the generated file, so a value you set to work locally
cannot be deployed by accident.

## Reaching a running server

The CLI never opens a connection to an MTA server. `ensure` writes files into
`serverPath`, and `dev --start-server` drives the console of the process it
started itself — there is no HTTP interface to configure, no credential to store,
and nothing to keep off a shared network.

A server the CLI does not own is refreshed by hand, in its console, so no
password ever enters the manifest.

## Network access

A build makes exactly one kind of outbound request: the `min_mta_version` lookup,
which is cached and optional. `--offline` or `LUAM_OFFLINE` skips it, and a build
with no network still succeeds. The compiler packages themselves make no network
calls at all.

## Development logs

`luam dev` adds a client-to-server log relay **only** to the resource it
synchronizes. The server helper validates types and length, and rate-limits each
client to `rateLimit` records per `rateWindowMs`. These helpers are never written
by `build` or `ensure`, cannot be selected through `helpers`, and are removed by
the next normal sync — so they never reach production.
