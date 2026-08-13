# Reference

Lookup material. Every table here is derived from compiler behaviour rather than
from prose, so it is the place to settle a question about what the language
actually accepts.

| Page | What it lists |
| --- | --- |
| [Keywords](/en/reference/keywords) | The 21 reserved Lua keywords and the 10 Luam adds. |
| [Operators](/en/reference/operators) | Every operator and every piece of type punctuation, with precedence. |
| [Directives](/en/reference/directives) | `#!strict`, `#!nonstrict`, `#!nocheck`, `#!server`, `#!client`, `#!shared`. |
| [Configuration fields](/en/reference/configuration-fields) | Every `.luam.manifest` field, its default, and its validation. |
| [Output layouts and source maps](/en/reference/output-layouts) | Production bundles, development trees, map files, and trace resolution. |
| [Diagnostics](/en/reference/diagnostics) | Every diagnostic code, grouped by the stage that produces it. |
| [Limitations](/en/reference/limitations) | What the compiler deliberately does not do. |
| [Compatibility](/en/reference/compatibility) | Lua 5.1, MTA, Node.js, and editor support. |

## Which version does this describe?

The banner at the top of every page names the Luam version this manual documents.
Changes to the documentation itself are recorded in the
[documentation changelog](/en/changelog); changes to the compiler are in the
repository's [CHANGELOG](https://github.com/ThigasDevelopment/luam/blob/main/CHANGELOG.md).

## Reading a diagnostic code

The prefix names the stage that rejected the file:

| Prefix | Stage |
| --- | --- |
| `lex-` | Reading characters. |
| `parse-` | Reading structure. |
| `check-` | Type checking. |
| `project-` | Assembling the resource from several modules. |
| `build-` | Discovering sources and reading files. |
| `config-` | Loading `.luam.manifest`. |
