# Server file

`.luam.server` names the MTA installation that a directory of resources shares.
One file answers "where does this deploy" for every resource under it, so no
`.luam.manifest` has to repeat it and no two of them can disagree.

It is written in the [manifest dialect](/en/tooling/luam-manifest), so the syntax,
the completion and the hover are the ones you already know:

```luam
serverPath = 'C:/MTA Server'
resourcesDir = 'mods/deathmatch/resources'
```

## Fields

| Field | Type | Required | Default | What it names |
| --- | --- | --- | --- | --- |
| `serverPath` | `string` | **yes** | — | The MTA server installation. Relative paths resolve against the directory holding this file; an absolute path is allowed. |
| `resourcesDir` | `string` | no | `'mods/deathmatch/resources'` | The resource directory inside that installation. Stays inside `serverPath`. |
| `executable` | `string?` | no | platform probe | The server executable, relative to and contained by `serverPath`. |
| `logs.enabled` | `boolean` | no | `false` | Whether the session streams server and client logs. |
| `logs.maxMessageLength` | `number` | no | `4096` | Longer relayed records are rejected. |
| `logs.rateLimit` | `number` | no | `30` | Records allowed per client per window. |
| `logs.rateWindowMs` | `number` | no | `1000` | Length of that window, in milliseconds. |

`serverPath` is required here where it is optional in the manifest: a
`.luam.server` that does not name a server describes nothing.

The manifest's `development.server.executable` flattens to `executable` and its
`development.logs` flattens to `logs`. The `development` wrapper exists in the
manifest to separate development behaviour from the resource contract; this whole
file is development deployment, so the wrapper would name the file twice.

## Which file applies

The **nearest** `.luam.server` above the working directory wins, entirely. The
walk stops at a `node_modules` segment and at the filesystem root, and there is no
merging.

One walk serves both entry points. At the root of a resources folder the file
describes the directory; inside a single resource it is the server that resource
deploys into.

## What makes a child a resource

A workspace's resources are its **direct children that hold a `.luam.manifest`** —
one level, never recursive:

```
resources/
  .luam.server
  gamemode-race/
    .luam.manifest
  scoreboard/
    .luam.manifest
  notes/            not a resource: no manifest
  node_modules/     never walked
```

One level is what stops a build output tree or a vendored copy from joining by
accident. The list is sorted by name, and it is what `luam ensure` at the root and
the session's `list` and `ensure` verbs resolve a name against.

## Precedence over the manifest

The deployment fields still work in `.luam.manifest`. When a `.luam.server` is
found above a resource, its values win:

| Field | With a `.luam.server` above | With none |
| --- | --- | --- |
| `serverPath` | The workspace wins. The manifest warns once. | The manifest, as before. |
| `resourcesDir` | The workspace wins. The manifest warns once. | The manifest, as before. |
| `development.server` | The workspace wins. The manifest warns once. | The manifest, as before. |
| `development.logs` | The workspace is the **default**. The manifest overrides it, silently. | The manifest, as before. |

`logs` is the one row that is not deployment. It tunes a relay injected into one
resource's generated code, so a resource is entitled to its own value; the
workspace file only supplies the default for resources that state none.

A manifest that still sets any of the first three reports
`config-deployment-moved` **once**, naming every overridden field in one message
and the `.luam.server` that won. It is a warning: nothing breaks, and deleting
the lines is the whole fix. A project with `compiler.warningsAsErrors` set turns
it into a build failure, which is what that option means.

A project with no `.luam.server` anywhere above it behaves exactly as it did
before the file existed.

## When it is wrong

| Code | When |
| --- | --- |
| `server-unknown-field` | A field this table does not define. The message lists the fields there are. |
| `server-invalid-value` | A value outside the field's type, or a path that leaves its boundary. |
| `server-parse-error` | The file does not parse as the manifest dialect. |
| `config-missing-field` | No `serverPath`. The message names this file, not a manifest. |

Any of these **stops the command**. `luam dev`, `luam ensure` and `luam server`
exit `2` at a workspace root and do nothing. A workspace whose file does not parse
is not a workspace, and guessing at a server path is worse than refusing.

## In the editor

`.luam.server` is its own language — `luam-server` — with its own icon,
highlighting, hover and completion, all driven by the same field table this page
is derived from. See [Editors](/en/tooling/editors).

## Why it is its own file

[ADR-046](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/046-shared-mta-server-workspace-file.md)
records the decision. The short version: an MTA installation binds one port, so
the resources that share it are resources that do not know about each other, and
"where does this deploy" has one answer for a whole directory that no single
resource's manifest is entitled to give.
