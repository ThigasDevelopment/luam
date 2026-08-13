# Recipes

Complete, task-oriented examples. Every source file on these pages is a real file
in this repository, and every project is verified with `luam check` on each
documentation build — so nothing here can drift away from the compiler.

| Recipe | You get |
| --- | --- |
| [First resource](/en/recipes/first-resource) | The smallest resource that starts and logs. |
| [Shared function](/en/recipes/shared-function) | One function the server and the client both call. |
| [Client HUD](/en/recipes/client-hud) | Text drawn every frame, with a toggle key. |
| [Server command](/en/recipes/server-command) | A chat command with an argument. |
| [Event handler](/en/recipes/event-handler) | Server and client handlers for built-in events. |
| [Typed class](/en/recipes/typed-class) | A class with inheritance, an interface and accessors. |
| [OOP API](/en/recipes/oop-api) | `player:getName()` behind the `oop` flag. |
| [Exported function](/en/recipes/exported-function) | A function another resource can call. |
| [Environment configuration](/en/recipes/environment-configuration) | `.env` values typed and read on the server. |
| [Local development](/en/recipes/local-development) | The build, sync, restart and log loop. |

## How to use a recipe

Each page gives you prerequisites, the file tree, the complete source, the
commands to run, and the result to expect. Create the tree, paste the files, and
run the commands — nothing is elided.

Prerequisites are the same everywhere unless a recipe says otherwise:

```bash
node --version   # v20 or newer
luam --version
```

See [Installation](/en/guide/installation) if either command fails.

## Naming

Recipe projects are named `luam-docs-<recipe>` so they never collide with a
resource you already run. Rename `name` in `.luam.manifest`, and the output folder
follows.
