# .luam.manifest

`.luam.manifest` sits at the project root and **is one table constructor**. The
file is a value, not a program: there is no statement in it, nothing before the
opening `{`, and nothing after the closing `}`.

The resource is named by the folder that holds the manifest. There is no `name`
field, because MTA already resolves a resource by its directory and two answers
to one question can disagree.

```luam manifest
{
    info = {
        author = { name = 'dracoN*', discord = 'draconzx' },

        version = '1.0.0',
        description = 'Heaven Roleplay.',

        dependencies = {
            'hr_core',

            'hr_admin',
        },
    },

    environment = {
        oop = false,
        strict = true,

        version = {
            server = '1.6.0',
            client = '1.6.0',
        },
    },

    scripts = {
        { path = 'config.lua', type = 'shared' },
        { path = 'items.lua', type = 'shared' },

        { path = 'src/utils/lib/*.luam', type = 'shared' },

        { path = 'src/utils/format.luam', type = 'shared' },
        { path = 'src/utils/render.luam', type = 'client' },

        { path = 'src/services/**/*.server.luam', type = 'server' },
        { path = 'src/services/**/*.client.luam', type = 'client' },

        { path = 'src/index.luam', type = 'server' },
        { path = 'src/interface.luam', type = 'client' },
    },

    files = {
        'list.xml',

        'assets/images/**/*.png',
    },

    build = {
        output = 'build',

        details = {
            bundle = false,
            minify = false,
            map = false,
        },
    },
}
```

That manifest, in a folder called `heaven-roleplay`, generates this `meta.xml`:

```xml
<heaven-roleplay>
    <!-- INFO -->
    <info author="dracoN*" type="script" version="1.0.0" description="Heaven Roleplay." discord="draconzx" />
    <include resource="hr_core" />

    <include resource="hr_admin" />
    <!-- ENVIRONMENT -->
    <oop>false</oop>
    <min_mta_version server="1.6.0" client="1.6.0" />
    <!-- SCRIPTS -->
    <script src="config.lua" type="shared" cache="false" />
    <script src="items.lua" type="shared" cache="false" />

    <script src="src/utils/lib/*.lua" type="shared" cache="false" />

    <script src="src/utils/format.lua" type="shared" cache="false" />
    <script src="src/utils/render.lua" type="client" cache="false" />

    <script src="src/services/**/*.server.lua" />
    <script src="src/services/**/*.client.lua" type="client" cache="false" />

    <script src="src/index.lua" />
    <script src="src/interface.lua" type="client" cache="false" />
    <!-- FILES -->
    <file src="list.xml" />

    <file src="assets/images/**/*.png" />
</heaven-roleplay>
```

Read the two side by side and the rule is visible: **order is position**, and a
blank line between two entries is a blank line between their elements.

## The five sections

| Section | What it answers |
| --- | --- |
| `info` | What the resource is, who wrote it, and what has to be present beside it |
| `environment` | The environment the resource runs in and is checked against |
| `scripts` | Which scripts load, in which order, on which side |
| `files` | Which files the resource ships |
| `build` | Where the build writes and what it writes there |

Every field of every section is in
[configuration fields](/en/reference/configuration-fields).

## Order is position

`scripts`, `files`, `environment.libraries` and `info.dependencies` are ordered
lists. The order in the table is the order in the generated file, so moving an
entry up moves its element up and changes nothing else.

There is no separate load order to keep in step with a separate list of sources,
because there is no separate list: a path is written once, where it loads.

## A blank line is a group boundary

A blank line between two entries of an ordered list reaches the generated file at
the same place. This is the one construct in the manifest whose whitespace
carries meaning.

- One or more blank lines are one boundary, and the generated file gets one.
- A blank line before the first entry, or after the last, is not a boundary.
- A comment line between two entries is neither a boundary nor carried across.

`luam format` preserves a blank run between entries, collapses a longer run to
one line, and never introduces one. The rule does not read `maxBlankLines` from
[.luam.formatter](/en/reference/formatter-file): a manifest whose layout depended on a
formatter setting would generate a different file on two machines.

## `scripts`

An entry is `{ path, type }`. `path` is a file or a `*`, `**` or `?` pattern;
`type` is `'server'`, `'client'` or `'shared'`.

The side is declared where the path is declared, so the project is free to lay
itself out however it likes — `src/utils/` is typed by its entry, not by the
directory it sits in. A `#!server`, `#!client` or `#!shared` directive stays a
per-file override and still warns when it disagrees with the entry.

A `<script src>` carries the entry's own text with `.luam` rewritten to `.lua`,
so a directory of scripts is one line in the manifest and one line in `meta.xml`.
MTA expands the wildcard itself.

A `.lua` path is legal: a native script is copied verbatim and loads at the
position the list gives it, ahead of or behind the compiled ones.

One file matched by two entries is `config-script-side-conflict`, whatever their
sides: the file would be written once and loaded twice. Narrow the patterns so
each file belongs to one entry.

A literal path that names no file is `config-missing-script` and fails the build.
A pattern whose directory exists and that still matched nothing is
`config-empty-script-entry`, a warning — an entry naming a directory the project
has not written yet says nothing at all.

## `files`

An entry is a bare path. Source and destination are the same, so the path reaches
`<file src>` exactly as written and the generated list reads against the tree.

```luam manifest
{
    files = {
        'list.xml',

        'assets/images/**/*.png',
        'assets/shader/**/*.fx',
    },
}
```

Adding an image to `assets/images/` changes no line of `meta.xml`. Renaming a file
on the way into the resource is not possible: move the file in the project
instead.

An entry that matches nothing is `config-empty-file-entry` and fails the build.
Two entries claiming one file are `config-output-collision`. An entry that would
reach `.env` is `config-environment-file-entry`: a client that can download the
environment file is a resource that leaks its secrets.

## `info`

`author` is a record. `name` is required and is the attribute MTA itself uses.
The catalog also names `discord`, `github` and `email`, so the editor offers them,
but the record is **open**: any other key you write is accepted too.

```luam manifest
{
    info = {
        author = { name = 'dracoN*', discord = 'draconzx', twitch = 'draconzx' },

        version = '1.0.0',
        description = 'Heaven Roleplay.',
    },
}
```

Every key but `name` is written as an info attribute, in the order you wrote it,
and each is readable at runtime by its own name:

```lua
getResourceInfo(getThisResource(), 'discord')   --> 'draconzx'
getResourceInfo(getThisResource(), 'twitch')    --> 'draconzx'
getResourceInfo(getThisResource(), 'nothing')   --> false
```

`getResourceInfo` reads one attribute at a time and returns `false` for one that
is not there, so an open record costs nothing: a key the catalog does not name
reaches the resource exactly like one it does.

`dependencies` names other MTA resources and emits one `<include>` each, in the
order they are written. A repeated entry is `config-duplicate-dependency` rather
than a silent collapse, and naming this resource is `config-invalid-dependency`.

## `environment`

`environment` describes the environment the resource executes in, and holds four
questions on purpose: whether it is object-oriented, whether it is checked
strictly, which MTA version it needs, and which libraries it is built with.

```luam manifest
{
    environment = {
        secret = '.env',

        oop = false,
        strict = true,

        version = {
            server = '1.6.0',
            client = 'latest',
        },

        libraries = {
            '@luam-example/collections',
        },
    },
}
```

`secret` names the one file that declares the environment keys. See
[environment configuration](/en/recipes/environment-configuration).

`oop` reaches the generated file whenever it is written: `true` emits
`<oop>true</oop>` and `false` emits `<oop>false</oop>`, because a resource that
says `false` is stating a decision. An absent `oop` emits nothing.

`version.server` and `version.client` are resolved per side. `'latest'` follows
the newest published MTA release, cached for a day; an offline build with no cache
leaves the element out and warns.

`libraries` names installed npm packages that ship Luam sources. See
[libraries](/en/tooling/libraries).

Cache identity is per field, not per section: editing `secret` does not recompile,
editing `strict` does, and editing `version` changes only the generated file.

## `build`

```luam manifest
{
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

`output` names the directory the artifact is written under, and the resource
lands in `<output>/<folder>`. It may be absolute and it may leave the project: a
build written to another disk is a legitimate thing to want.

The guard is on the other side. The build writes a `.luam-build` marker when it
creates a resource directory, prunes only inside a directory carrying that marker,
and says so and removes nothing anywhere else. A stale-file cleanup pointed at a
directory the build did not create is how an output path becomes data loss.

`details.bundle` writes one Lua file per side instead of mirroring the tree, and
the ordered `scripts` list then decides the order of the members inside each
bundle rather than the order of `<script>` elements. Both shapes are ordered by
position; only the artifact the position orders changes. See
[output layouts](/en/reference/output-layouts).

`details.obfuscate` is declared and is not honoured yet. Setting it to `true`
reports `config-unimplemented-option` naming the milestone that will compile the
generated Lua to bytecode, so the field never silently does nothing.

## The dialect

A manifest value is a literal, a table, or those combined with `and`, `or`, `not`,
comparison, arithmetic and concatenation. There are no calls, no loops and no
function expressions, so the file cannot diverge, cannot read a file and cannot
observe anything but the values it was handed. That is what lets the editor
evaluate it in process on every keystroke.

### Injected values

Three names are in scope inside the table:

| Name | Type | What it is |
| --- | --- | --- |
| `mode` | `string` | `'production'` for `luam build`, `'development'` for `luam dev`, `'check'` for `luam check` |
| `env` | `Env` | The process environment, every key an optional string |
| `root` | `string` | The absolute project directory |

```luam manifest
{
    build = { output = mode == 'production' and 'build' or 'build-dev' },
}
```

There is no `local`. An intermediate value is written where it is used, so
`env.SOME_KEY` may appear once per use.

### In the editor

The language server completes the sections at the top level, the fields of a
section inside it, and the three sides at `type =`. Hover names the field's full
path, its type, its default and its rule. A misspelled key puts the caret on the
key rather than on its value.

## When the file is wrong

| Code | Meaning |
| --- | --- |
| `config-manifest-not-a-table` | The file is not one table constructor |
| `config-trailing-content` | Something is written after the table |
| `config-unexpected-statement` | The file starts with a statement, `local` included |
| `config-unknown-field` | A key no section declares, with the caret on the key |
| `config-duplicate-field` | One key written twice, rather than last-write-wins |
| `config-missing-field` | A required field of a record is absent |
| `config-invalid-type` | A value of the wrong type |
| `config-removed-field` | A field this manifest no longer has, naming where it went |
| `config-manifest-form` | The file is still a list of assignments |

## The assignment form

A manifest written as a list of assignments still loads for one minor, is
converted internally, and reports `config-manifest-form` once. Run
[`luam migrate`](/en/guide/migration) to rewrite it, or take the same rewrite as an
editor code action. The converter is removed in the next major.
