# Formatter file

`.luam.formatter` chooses the formatter's whitespace decisions for everything
below it. Without one, the formatter behaves exactly as
[the formatting reference](/en/reference/formatting) describes — every field
below defaults to that behaviour, so adding the file changes nothing until you
change a field.

It is written in the [manifest dialect](/en/tooling/luam-manifest), so the syntax,
the completion and the hover are the ones you already know:

```luam
indent = 'space'
indentWidth = 4
keywordParenSpace = true
maxBlankLines = 1
lineEnding = 'infer'
```

## Fields

| Field | Type | Default | What it controls |
| --- | --- | --- | --- |
| `indent` | `'space'` or `'tab'` | `'space'` | The indent character. |
| `indentWidth` | number, 1 to 8 | `4` | Spaces per indent level. Ignored when `indent` is `'tab'`. |
| `keywordParenSpace` | boolean | `true` | Whether a `(` after a keyword gets a space — `function (` against `function(`. A call stays tight either way. |
| `maxBlankLines` | number, 0 to 4 | `1` | Consecutive blank lines kept. `0` removes blank-line runs. |
| `lineEnding` | `'infer'`, `'lf'` or `'crlf'` | `'infer'` | `'infer'` follows the file; the others pin it. |

Anything not in this table is not configurable. The formatter reprints the token
stream and verifies the result against the original, so an option that changed a
quote, a name or a construct would produce **no output** rather than wrong
output — see [limitations](/en/reference/limitations).

## Which file applies

The **nearest** `.luam.formatter` above the file being formatted wins, entirely.
There is no merging: a file further up has no effect once a nearer one exists,
so the effective style is something you read rather than compute.

The lookup does not need a project. A `.luam` file opened outside any project
directory still finds the `.luam.formatter` above it, which is why the
configuration is its own file rather than a manifest field — see
[ADR-042](https://github.com/ThigasDevelopment/luam/blob/main/.claude/docs/adr/042-formatter-configuration-file.md).

A `.luam.formatter` inside an installed [library](/en/tooling/libraries) is never
read. Library sources are never formatted, so a library's style is not your
project's business.

## When it is wrong

| Code | When |
| --- | --- |
| `formatter-unknown-field` | A field this table does not define. |
| `formatter-invalid-value` | A value outside the field's type or range. |
| `formatter-parse-error` | The file does not parse as the manifest dialect. |

Any of these **stops the run**. `luam format` exits `2` and writes nothing, and
the editor offers no edits. Falling back to the defaults would format your
project against a style it explicitly rejected, which is worse than refusing.

## Both surfaces agree

[`luam format`](/en/tooling/cli#luam-format) and the language server read the same
file and call the same formatter, so a project formats identically whether it was
formatted from the terminal or on save. Every configuration is idempotent: a
second run changes nothing.
