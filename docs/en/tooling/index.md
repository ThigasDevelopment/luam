# Tooling

Everything around the language: the CLI that compiles and deploys, the manifest
that configures a project, and the editor support that runs the same checker.

| Page | What it covers |
| --- | --- |
| [CLI commands](/en/tooling/cli) | `init`, `check`, `build`, `ensure`, `dev`, `setup`, `doctor`, all options and exit codes. |
| [luam.json](/en/tooling/luam-json) | Every configuration field, with defaults and validation rules. |
| [Editors](/en/tooling/editors) | The VS Code extension, supported forks, commands and settings. |
| [Language server](/en/tooling/language-server) | Running the editor-agnostic LSP from any client. |
| [CI and deployment](/en/tooling/ci-and-deployment) | Checking in a pipeline and shipping a resource. |

## The pieces

| Package | What it is |
| --- | --- |
| `@thigasdevelopment/luam` | The published CLI. One command, `luam`. |
| `@luam/compiler` | Lexer, parser, binder, checker, emitter, project assembly. |
| `@luam/lsp` | The language server, built on the same frontend. |
| `luam` (VS Code) | The extension: grammar, client, commands. |
| `@luam/mta-types` | The generated MTA catalog. |
| `@luam/runtime` | The Lua runtime helpers a build may copy. |
| `@luam/template` | The starter `luam.json` that `luam init` writes. |

The editor and the build share the compiler frontend, which is why they never
disagree about a file.
