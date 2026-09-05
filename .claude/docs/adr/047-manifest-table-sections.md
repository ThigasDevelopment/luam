# ADR-047: The manifest is one table of ordered sections

**Status:** Proposed

**Supersedes or amends:**
[ADR-008](008-generated-manifest-standard.md) (load order, section comments, the
root element, the helper directory, and the no-blank-line rule),
[ADR-015](015-luam-manifest-language.md) (the statement allowlist), and
[ADR-017](017-manifest-domain-contract.md) (the `sources` and `assets` shapes,
`loadOrder`, and the domain split).

**Context:**

The manifest answers "which files, on which side" with `sources` — a record of
three unordered lists — and answers "in what order" with `loadOrder`, a separate
list of pinned exceptions. Two fields, one question, and they must agree.

A production resource shows what that costs. Its `meta.xml` is an ordered
sequence of eight blocks that interleave sides: a core server file, then shared
libraries, then a shared/client utility pair, then a server/client service pair,
then the entry points, then the models, then the interface. To express it today
every path is written twice, and the result still would not match: the emitter
orders globally `shared`, `server`, `client`, so the last five blocks collapse
into one. The interleaving is unreachable, not merely inconvenient.

The same file shows three smaller gaps. Its scripts sit outside `src/` —
`config.lua` and `items.lua` at the resource root, helpers under `src/utils/`.
Its assets are one wildcard line, where `manifestFiles` emits one `<file>` per
resolved file, so a directory of images becomes hundreds of entries. And its
section comments are the author's words, where the generator has four fixed
strings.

**Decision:**

*The manifest is one table constructor, and nothing else.* The file is an
expression, not a sequence of statements. There is no `local`, so ADR-015's
`local password = env.LUAM_MTA_PASSWORD` idiom is gone: an intermediate value is
written where it is used, or is not written. The rule is worth the loss because
it is the whole specification — a manifest is one object, and there is nothing
else in the file to describe, check or explain.

```luam
{
    info = {
        author = { name = 'dracoN*', discord = 'draconzx' },

        version = '1.0.0',
        description = 'BCG assets resources.',

        dependencies = {
            'bcg_core',
            'bcg_example',
        },
    },

    environment = {
        secret = '.env',

        oop = false,
        strict = true,

        version = {
            server = '1.6.0',
            client = '1.6.0',
        },

        libraries = {
            '@luam-example/collections',

            '@infobox',
        },
    },

    scripts = {
        { path = 'config.lua', type = 'shared' },

        { path = 'src/index.luam', type = 'server' },

        { path = 'src/server/**/*.luam', type = 'server' },
        { path = 'src/client/**/*.luam', type = 'client' },
    },

    files = {
        'list.xml',

        'assets/images/**/*.png',
        'assets/shader/**/*.fx',
    },

    build = {
        output = 'build',

        details = {
            bundle = true,
            minify = true,
            map = true,
        },
    },
}
```

ADR-015 allowed two statements — a `local` declaration and an assignment to a
field — and excluded everything else, `return` included. This replaces that
allowlist with no statements at all. The purity guarantee is untouched and is now
visible in the shape of the file rather than asserted about a list of permitted
statements: that ADR's reasoning rests on the absence of calls and loops, and a
table constructor has neither. `mode`, `env` and `root` stay in scope as free
identifiers inside the table.

What is lost is the closed global scope, which is how a misspelled field gets a
caret under it today. It is replaced, not dropped: an unknown key in a table
checked against a record descriptor is the same diagnostic, from the machinery
that already backs table-literal key completion (41.01).

*The resource has no `name` field; the folder is the name.* MTA already resolves
a resource by the directory that contains its manifest, so a `name` beside it is
a second answer to a question the platform has already answered, and the two can
disagree. `build.output` names the directory the artifact is written under, and
the resource name is the project folder — which is also what `ensure` restarts
and what the generated root element carries.

*The root element is the resource name.* MTA reads the children of the root node
and does not check its name — confirmed by the project owner from production use,
the same way ADR-008 confirmed that MTA expands a wildcard. ADR-008 assumed
`<meta>` and this reverses that assumption. The generated file therefore names
the resource it belongs to, which is the one thing a generated manifest could not
previously say about itself.

*Order is position.* `scripts` and `files` are ordered lists, and the order in
the table is the order in the generated file. `loadOrder` is removed rather than
deprecated: it exists only to reorder a bag, and there is no bag left to reorder.

*A blank line between entries is a group boundary, and it survives into the
generated file.* This is the one place the manifest's whitespace is semantic. It
is what lets the author group entries without inventing a nesting level, and it
is why the blank-line rule in ADR-008 is reversed. The formatter
([ADR-042](042-formatter-configuration-file.md)) must preserve blank runs between
entries and must neither introduce nor collapse them beyond a run of one.

*`scripts` replaces `sources` and `loadOrder`, and each entry declares its own
side.* An entry is `{ path, type }`; `path` is a literal file, a `*` pattern or a
`**` pattern, and `type` is `server`, `client` or `shared`. Classification stops
being recovered from the path, so a resource may lay itself out however it likes.
A `#!server`, `#!client` or `#!shared` directive remains a per-file override with
the existing disagreement warning. A file matched by two entries is
`config-script-side-conflict`, as `config-source-side-conflict` is today.

*`files` replaces `assets`, and an entry is a bare path.* Source path and
destination path are the same, so an entry is a string rather than a `from`/`to`
record, and the string reaches `<file src>` exactly as written. Renaming a file
on the way into the resource is removed: a build whose output path differs from
the path in the manifest is a build whose generated file cannot be read against
the tree.

*A section is emitted as written, and the section comments are fixed.* The
generated file carries `INFO`, `ENVIRONMENT`, `SCRIPTS`, `FILES` and `EXPORTS`,
in that order, and a section with no entry emits no comment — the orphan rule
from ADR-008 stands.

*`environment` describes the environment the resource runs in, and holds four
questions on purpose.* Whether the resource is object-oriented, whether it is
checked strictly, which MTA version it requires, and which libraries it is built
with are all properties of the environment it executes in, and the generated
`<oop>` and `<min_mta_version>` elements sit together under one comment because
of it. This is a deliberate departure from ADR-017's one-question-per-domain
rule, taken by the project owner.

The property that rule protected is kept by other means: **cache identity is
per field, not per section.** `environment.secret` invalidates environment
loading, `oop` and `strict` invalidate checking, `version` invalidates only the
generated file, and `libraries` invalidates vendoring. Editing `.env` must not
recompile because `strict` shares its table, and keying on fields rather than on
the table is what guarantees it.

| Section | Fields |
| --- | --- |
| `info` | `author` (record: `name`, plus extra keys emitted as attributes), `version`, `description`, `dependencies` |
| `environment` | `secret`, `oop`, `strict`, `version.server`, `version.client`, `libraries` |
| `scripts` | ordered list of `{ path, type }` |
| `files` | ordered list of paths |
| `build` | `output`, `details.bundle`, `details.minify`, `details.map` |

*`info.author` is a record, and its extra keys reach the info element.* MTA reads
those attributes back through `getResourceInfo`, so `author.discord` is not
decoration — it is emitted and is readable at runtime. `name` is the attribute
MTA itself uses.

**Still open:**

- *The compiler option vocabulary.* `oop` and `strict` are settled and stay in
  `environment`. `noUnusedLocals`, `noImplicitGlobals`, `noUnusedParameters` and
  `warningsAsErrors` stay manifest fields — that much is decided — but their
  spelling and their arrangement are not. The project owner's note is that the
  language server has more to offer here than a list of booleans, so the shape
  waits on what the editor answers.
- *How a library reaches the resource.* [ADR-038](038-library-distribution.md)
  vendors a library's code into the consuming resource. The project owner is
  considering the opposite — a library is its own MTA resource on the server, and
  a consumer names it in `<include>` — because a library that ships a lot of code
  and a lot of images is copied into, and downloaded by, every resource that uses
  it. That is a distribution decision, not a manifest decision: it changes
  deployment, versioning and whether a library's surface crosses a resource
  boundary at all. `environment.libraries` therefore keeps its ADR-038 meaning
  unchanged in this milestone, and the model is decided in its own record.
- *The helper directory.* The sketch places helpers at `libs/class.lua` and
  `libs/env.lua`, flat, where ADR-008 places them at `lib/<environment>/`. The
  per-environment subdirectory keeps a shared and a server helper of one name
  apart; helper names are unique today, so flat works, but that is a fact about
  the current set, not a rule.
- *The comment wording.* The sketch writes `INFO's`, `SCRIPT's`, `FILE's` — the
  possessive-plural style ADR-008 rejected in favour of plain English. Cosmetic,
  and the owner's call.
- *`build.details.obfuscate`.* Present in the sketch with no consumer. ADR-017
  forbids adding a field before its consumer exists, so it is excluded until Lua
  obfuscation has its own decision.

**Removed with their reasons:**

- `name` — the folder answers it, and two answers can disagree.
- `loadOrder` — position in `scripts` answers it.
- `helpers` — helper selection follows the code that needs them.
- `assets[].to` — a destination that differs from the manifest path is what made
  the generated file unreadable against the tree.
- `environment.localFile` — one environment file, named by `secret`.
- `development.logs` and the log relay behind it — the position mapping is exact
  enough to debug against the authored file, which is what the relay existed to
  work around. Removing it also removes generated code from the resource.
- `contracts` — folded into the build layout rather than configured.

**Consequences:**

- Positive: the interleaved, ordered manifest a real resource needs is
  expressible, and it is expressible once — the file says the order because the
  order is where the entry sits.
- Positive: a directory of assets is one line in the manifest and one line in the
  generated file, instead of one line per image.
- Positive: side classification is declared where the path is declared, so a
  project is free of the `src/server`, `src/client`, `src/shared` layout without
  losing correct MTA API availability or a correct script type.
- Positive: the manifest is one expression, so "pure and total" is visible in the
  shape of the file rather than asserted about a statement allowlist.
- Positive: the generated file names the resource it belongs to.
- Negative: every manifest in existence is rewritten, including the one
  `luam init` scaffolds. The change is mechanical and tooled, but it is total.
- Negative: whitespace becomes load-bearing in two lists, which the parser, the
  emitter and the formatter must all agree about. A blank line is now the only
  manifest construct with no value of its own.
- Negative: the generated file is no longer recognisable as an MTA manifest by
  its root element, so any tool that keys on `<meta>` — none in this repository,
  possibly some in the wild — stops recognising it. The permissiveness it relies
  on is observed MTA behaviour, not documented behaviour, so it is verified
  against a real server in this milestone's tests.
- Negative: `environment` holds four questions, so the rule that kept ADR-017's
  domains from decaying no longer applies to it. Per-field cache identity keeps
  the consequence out of the build, but nothing structural stops the table from
  growing.
