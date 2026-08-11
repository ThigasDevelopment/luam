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
| `lib/server/**` | no |
| `.env` | no — it never gets a `<file>` entry |

Assume anything downloaded is public. Obfuscation is not a boundary.

## What the compiler enforces

- A server-only API in a client or shared file is `check-environment-api`.
- A server global is invisible to client files, and the reverse, through
  `project-environment-import`.
- `process` is declared `server`, so `.env` values cannot be read from a client
  or shared file.
- Server-only runtime helpers are written to `lib/server/`, never to a location
  clients download.

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
secrets. The first build writes `<outDir>/<name>/.env` and **blanks** any key
whose name looks sensitive: `password`, `secret`, `token`, `key`, `credential`,
`dsn`, `private`. The administrator fills them in on the server, and no rebuild
overwrites that file.

## The `ensure` transport

`ensure` restarts a resource over MTA's HTTP interface, which has **no TLS**.
Basic authentication therefore travels in the clear.

```json
{
    "transport": {
        "kind": "http",
        "host": "127.0.0.1",
        "port": 22005,
        "resource": "luam-sync",
        "username": "luam",
        "passwordEnv": "LUAM_MTA_PASSWORD"
    }
}
```

- Use `passwordEnv`, which names an environment variable. An inline `password`
  is accepted but reports `config-plaintext-password`. No log line or diagnostic
  ever prints the value either way.
- Keep `host` on a loopback address and tunnel the port over SSH. A non-loopback
  host reports `config-remote-plaintext-transport`.
- `resource`, `refreshFunction`, `restartFunction` and `host` become part of the
  request URL, so they are validated before any request is sent. A value
  containing `/`, `?`, `#` or `..` is `config-invalid-url-segment` and the
  configuration fails to load.

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
