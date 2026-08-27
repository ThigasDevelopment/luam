# How Luam works

A build takes the files you author and writes a resource folder MTA can start.
Between those two ends there is one compiler, and the same compiler answers your
editor and the playground. This page follows the path once, so that a result you
see in one tool is never a surprise in another.

## The path a build takes

<div class="luam-diagram">
<svg viewBox="0 0 760 132" role="img" aria-labelledby="pipeline-title pipeline-description">
<title id="pipeline-title">The Luam build pipeline</title>
<desc id="pipeline-description">Five stages in order: read the project, resolve each file's environment, parse and check, emit Lua 5.1, assemble the resource. The list below the diagram repeats the same stages.</desc>
<rect class="luam-diagram-box" x="4" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="20" y="55">1. Read</text>
<text class="luam-diagram-detail" x="20" y="73">.luam.manifest</text>
<text class="luam-diagram-detail" x="20" y="88">src/**/*.luam</text>
<path class="luam-diagram-flow" d="M136 66 h20" />
<path class="luam-diagram-head" d="M156 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="168" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="184" y="55">2. Environment</text>
<text class="luam-diagram-detail" x="184" y="73">server / client</text>
<text class="luam-diagram-detail" x="184" y="88">shared</text>
<path class="luam-diagram-flow" d="M300 66 h20" />
<path class="luam-diagram-head" d="M320 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="332" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="348" y="55">3. Check</text>
<text class="luam-diagram-detail" x="348" y="73">types, classes</text>
<text class="luam-diagram-detail" x="348" y="88">MTA catalog</text>
<path class="luam-diagram-flow" d="M464 66 h20" />
<path class="luam-diagram-head" d="M484 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="496" y="30" width="132" height="72" rx="8" />
<text class="luam-diagram-stage" x="512" y="55">4. Emit</text>
<text class="luam-diagram-detail" x="512" y="73">Lua 5.1</text>
<text class="luam-diagram-detail" x="512" y="88">runtime helpers</text>
<path class="luam-diagram-flow" d="M628 66 h20" />
<path class="luam-diagram-head" d="M648 61 l10 5 -10 5 z" />
<rect class="luam-diagram-box" x="660" y="30" width="96" height="72" rx="8" />
<text class="luam-diagram-stage" x="676" y="55">5. Assemble</text>
<text class="luam-diagram-detail" x="676" y="73">meta.xml</text>
<text class="luam-diagram-detail" x="676" y="88">assets</text>
</svg>
</div>

The same five stages, in words:

1. **Read.** The [`.luam.manifest`](/en/tooling/luam-manifest) is parsed and
   checked like any other Luam file. Its `sources` patterns decide which files
   are part of the build, and its `assets` mappings decide what is copied.
   Generated `.lua` output is never an input.
2. **Environment.** Every file resolves to `server`, `client` or `shared` before
   anything is checked — from its path, or from a `#!` directive on the first
   line. See [Environments](/en/mta/environments).
3. **Check.** Parsing and type checking run against the globals that environment
   declares: your own modules on the compatible sides, plus the pinned MTA
   catalog scoped to that side. A name the catalog does not know stays `any`
   rather than failing.
4. **Emit.** Each module becomes Lua 5.1, annotations and Luam-only syntax are
   erased, and the emitter records which [runtime
   helpers](/en/reference/output-layouts) the output requires.
5. **Assemble.** The helpers, the modules, `config.lua`, `env.lua` and the
   declared assets are written to the output directory, and `meta.xml` is
   generated from what the build actually produced — script entries per
   environment, `<export>` entries, `<file>` entries for downloaded assets.

## The environment is decided first

Environment resolution is not a late check — it comes before the type checker
looks at a single call. That ordering is what makes `dxDrawText` in a server
file an error instead of a runtime surprise, and what keeps a `server` module
from seeing a global a `client` module declared.

## An error writes nothing

A build that reports an error writes no files at all. There is no partial
resource, so the server directory never holds half of a change. This is why
`luam check` and `luam build` report the same diagnostics: the first is the
second without the writing.

## Annotations never reach the server

Types, classes, enums, interfaces and directives are compile-time constructs.
The generated Lua carries no annotation and no implicit guard derived from one —
what is checked at build time is not re-checked at run time:

```lua
local health = 100

function heal(player, amount)
    health = health + amount
end
```

See [Types](/en/language/types) for the rule, and
[Limitations](/en/reference/limitations) for what erasure deliberately does not
give you.

## One compiler behind three tools

| Where | What runs | What you get |
| --- | --- | --- |
| `luam check` and `luam build` | The compiler, in Node | Diagnostics, and the resource on success |
| Your editor | The [language server](/en/tooling/language-server), which calls the compiler | The same diagnostics as you type, plus completion, hover and rename |
| The [playground](/en/playground) | The compiler and the language server, in a browser worker | The same diagnostics and the same emitted Lua, for one file |

There is one parser, one checker and one emitter. That is why a diagnostic code
you read in the terminal is the code your editor underlines and the code the
playground lists, and why the Lua in the playground is the Lua a build writes for
the same source.

## What the pipeline never does

- It does not execute your code. `config.lua` is copied verbatim and never
  parsed or evaluated by a build.
- It does not run generated Lua in the browser. The playground compiles; MTA
  runs.
- It does not need the network. The one outbound request a build can make is the
  `min_mta_version` lookup, and a build with no network still succeeds.
- It does not send your source anywhere. The playground compiles in a worker on
  your machine.

## For contributors

This page describes what the pipeline means for a resource author. The package
boundaries, the incremental cache and the emitter internals live in the
repository's [architecture
document](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/architecture.md).
