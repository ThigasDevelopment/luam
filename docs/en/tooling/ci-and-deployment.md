# CI and deployment

## Checking in CI

`luam check` compiles everything, prints diagnostics, writes nothing, and exits
`1` when anything is an error. That is the whole integration.

```yaml
name: Resource

on:
    push:
    pull_request:

permissions:
    contents: read

jobs:
    check:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: '20'
            - run: npx --yes @thigasdevelopment/luam check
```

`npx` needs no global install and caches the download. `check` performs no
release lookup, so it never reaches the network and owns no `--offline` flag.
`build` does look one up, and its `--offline` skips it — a build with no network
still succeeds, but skipping the lookup deliberately keeps the log clean.

Output drops every escape sequence when the stream is not a terminal, so the CI
transcript carries no control characters. `--no-color` forces that anywhere.

## Exit codes

| Code | Meaning | In a pipeline |
| --- | --- | --- |
| `0` | Succeeded | The job passes. |
| `1` | Diagnostics reported | The job fails. |
| `2` | Command line or configuration invalid | Fix the workflow or `.luam.manifest`. |

## Producing a resource artifact

```bash
npx --yes @thigasdevelopment/luam build --offline
```

The resource lands in `<outDir>/<name>` — upload that directory as the build
artifact. A build that reports any error writes nothing, so an artifact is either
complete or absent.

```yaml
            - run: npx --yes @thigasdevelopment/luam build --offline
            - uses: actions/upload-artifact@v4
              with:
                  name: resource
                  path: build/my-resource
                  if-no-files-found: error
```

## Deploying

Two shapes work well.

**Copy the artifact.** Unpack `build/<name>` into
`<MTA Server>/mods/deathmatch/resources/<name>` with whatever your host provides
— rsync, SFTP, a deploy script — then `refresh` and `restart <name>` in the
server console.

**Run the loop once.** On a machine that can reach the server directly,
`ensure --no-watch` performs build and sync exactly once.

```bash
npx --yes @thigasdevelopment/luam ensure --no-watch
```

That is the deploy-script form of the development loop. Loading the synced files
is a separate step: `refresh` and `restart <name>` in the server console — see
[Security boundaries](/en/mta/security).

## Secrets

- Never commit a password. Read one from `env` in the manifest, which is what a
  CI secret store provides.
- `.env` is committed and declares keys and safe defaults; the deployed
  `<outDir>/<name>/env.lua` is written once, with sensitive-looking keys blanked, and
  is never overwritten by a rebuild.
- The CLI never opens a connection to a running server. A runner that has to
  reach one needs its own transfer step — SSH or SFTP — outside Luam.

## A pre-commit hook

```bash
#!/bin/sh
npx --yes @thigasdevelopment/luam check --no-color || exit 1
```

## Caching

The `min_mta_version` lookup caches into `.luam/mta-version.json`. Caching that
directory between runs removes the only outbound request a build makes; with
`--offline` you do not need it at all.
