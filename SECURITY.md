# Security Policy

## Supported versions

Luam is pre-1.0 and ships from one line. Only the latest published release
receives fixes; there is no backport branch.

| Version | Supported |
|---|---|
| Latest `0.x` release | Yes |
| Any earlier release | No — upgrade to the latest |

## Reporting a vulnerability

**Do not open an issue, a discussion, or a pull request for a vulnerability.**
An issue is public from the moment it is filed, and it tells everyone about the
problem before there is a fix.

Report it privately through GitHub:

1. Open the repository's **Security** tab.
2. Choose **Report a vulnerability**.
3. Describe what you found, what an attacker gains, and how to reproduce it.

That form is private between you and the maintainer, and it is the channel this
project supports.

Include, where you can:

- The Luam version (`luam --version`) and the Node version.
- Whether the code runs on the `server`, the `client`, or `shared`.
- The smallest `.luam` source, manifest, or command that reproduces it.
- What you expected to happen and what happened instead.

## What is in scope

The compiler, the runtime helpers, the CLI, the language server, the editor
extension, the published npm package, and the generated Lua a build produces.

A finding is more interesting to this project when it involves code the compiler
*emits* rather than code the compiler *is*: generated Lua that escapes its
resource, a manifest value that reaches a shell, a `.env` value that lands in a
built artifact, or a build that writes outside its output directory.

## What is out of scope

- Vulnerabilities in Multi Theft Auto itself. Report those to
  [Multi Theft Auto](https://multitheftauto.com/).
- Vulnerabilities in an upstream dependency with no Luam-specific impact. Report
  those upstream; the scheduled dependency audit already tracks advisories here.
- A resource written in Luam that is insecure because of what it does. The
  compiler emits what the author wrote.
- Anything requiring an attacker who already controls the developer's machine or
  the MTA server process.

## What happens next

The maintainer acknowledges the report, works the fix privately, and publishes it
with a release. You are credited in the advisory unless you ask not to be. This
is a single-maintainer project and no response time is promised, because a
promise it cannot keep is worth less than an honest note that it cannot.
