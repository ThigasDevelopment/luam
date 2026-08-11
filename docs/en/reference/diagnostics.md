# Diagnostics

Every diagnostic carries a location, a severity and a code:

```
src/client/hud.luam:1:1 error check-environment-api: API "kickPlayer" is server-only and is not available in a "client" file.
```

The prefix names the stage that produced it.

| Prefix | Stage |
| --- | --- |
| `lex-` | Reading characters. |
| `parse-` | Reading structure. |
| `env-` | Resolving the file's environment. |
| `check-` | Type checking. |
| `project-` | Assembling the resource from several modules. |
| `build-` | Discovering sources and reading files. |
| `config-` | Loading `luam.json`. |

A **warning** never fails a build. An **error** does, and a build with any error
writes nothing.

## Lexer

| Code | Meaning |
| --- | --- |
| `lex-foreign-comment` | A `--` or `//` comment. Use `#` or `#* ... *#`. |
| `lex-foreign-operator` | `!=` was used. Inequality is `~=`. |
| `lex-unexpected-character` | A character that starts no token. |
| `lex-unterminated-comment` | A block comment with no closing `*#`. |
| `lex-unterminated-string` | A string literal with no closing quote. |
| `lex-unterminated-template` | A template string with no closing backtick. |
| `lex-unterminated-interpolation` | A `${` with no closing `}`. |

## Parser

| Code | Meaning |
| --- | --- |
| `parse-error` | The file could not be parsed at this point. |
| `parse-unexpected-token` | A token the grammar does not allow here. |
| `parse-invalid-statement` | The construct is not a statement. |
| `parse-invalid-type` | The type annotation could not be parsed. |
| `parse-invalid-increment` | `++` or `--` used as an expression. Both are statements. |
| `parse-export-local` | `export` applied to a `local function`. |
| `parse-invalid-optional` | A `?` on a name with no type annotation after it. |
| `parse-optional-position` | The `?` was written on the type. It attaches to the name. |
| `parse-duplicate-key` | An object type declares the same key more than once. |
| `parse-unexpected-decorator` | A decorator where none may appear. |
| `parse-decorator-arguments` | A decorator was given arguments. It takes none. |

## Environment

| Code | Severity | Meaning |
| --- | --- | --- |
| `env-conflicting-directive` | error | Two different `#!` environment directives in one file. |
| `env-path-directive-conflict` | warning | The directive disagrees with the path. The directive wins. |

## Checker — types

| Code | Meaning |
| --- | --- |
| `check-type-mismatch` | A value does not match the declared type. |
| `check-return-mismatch` | A `return` does not match the declared return type. |
| `check-argument-count` | Too few or too many arguments. |
| `check-invalid-operand` | An operator cannot be applied to that type. |
| `check-unknown-member` | The member does not exist on the receiver. |
| `check-unknown-record-key` | The key is not declared by the object type. Also used by `process.env`. |

## Checker — control flow

| Code | Meaning |
| --- | --- |
| `check-invalid-break` | A `break` outside a loop, or not last in its block. |
| `check-invalid-continue` | A `continue` outside a loop, not last in its block, or one that would jump over a local the `until` condition reads. |

## Checker — declarations

| Code | Meaning |
| --- | --- |
| `check-unknown-class` | `new` or `extends` names a class that is not declared. |
| `check-duplicate-class` | Two classes with the same name in one file. |
| `check-unknown-interface` | `implements` or interface `extends` names an interface that is not declared. |
| `check-duplicate-interface` | Two interfaces with the same name in one file. |
| `check-duplicate-interface-parent` | An interface extends the same parent more than once. |
| `check-duplicate-interface-member` | An interface declares the same member more than once. |
| `check-conflicting-interface-member` | Parent interfaces declare one member incompatibly. |
| `check-interface-cycle` | An interface inheritance cycle is declared. |
| `check-unimplemented-interface` | A member the interface requires is missing. |
| `check-explicit-self-parameter` | A class method explicitly declares the automatically injected `self`. |
| `check-duplicate-enum` | Two enums with the same name in one file. |
| `check-unknown-enum-member` | The enum has no such member. |
| `check-invalid-super` | `self:super(...)` outside a class. |
| `check-unknown-super-method` | The parent has no method of that name. |
| `check-declare-outside-declaration-file` | `declare` outside a `.d.luam` file. |
| `check-declaration-file-statement` | A `.d.luam` file contains a statement. |

## Checker — decorators

| Code | Meaning |
| --- | --- |
| `check-unknown-decorator` | The decorator name is not `@Getter` or `@Setter`. |
| `check-decorator-target` | A decorator on something that cannot carry one. |
| `check-duplicate-decorator` | The same decorator twice on one target. |
| `check-decorator-conflict` | The combination cannot be satisfied. |

## Checker — MTA

| Code | Meaning |
| --- | --- |
| `check-environment-api` | The API belongs to another environment. |
| `check-environment-event` | The event belongs to another environment. |
| `check-oop-disabled` | An OOP call with `"oop": false`. |
| `check-not-callable-class` | A class used as a constructor that MTA does not make callable. |
| `check-native-constructor` | Wrong arguments to a native constructor. |
| `check-native-class-inheritance` | A project class tried to extend a native class. |

## Checker — templates and exports

| Code | Meaning |
| --- | --- |
| `check-unknown-template-root` | An interpolation refers to a name that is not in scope. It takes a name or a member path, never an expression. |
| `check-empty-interpolation` | `${}` with nothing inside. |
| `check-export-not-top-level` | `export` on a function that is not top level. |
| `check-export-member` | `export` on a function declared on a table. |
| `check-export-in-declaration-file` | `export` in a `.d.luam` file, which emits nothing. |

## Project

| Code | Meaning |
| --- | --- |
| `project-environment-import` | A global from an incompatible environment was used. |
| `project-duplicate-export` | Two files export the same name. |
| `project-duplicate-output` | Two sources would produce the same output path. |
| `project-load-order-missing` | A `loadOrder` entry matches no file or asset. |
| `project-bundle-toplevel-return` | A bundled module ends with a top-level `return`. Remove it or select tree output. |
| `project-bundle-output-collision` | A source or asset produces a reserved bundle path. Rename it or select tree output. |

## Build

| Code | Meaning |
| --- | --- |
| `build-no-sources` | No `.luam` file was found under `sourceDirs`. |
| `build-source-dir-missing` | A configured source directory does not exist. |
| `build-source-dir-outside-root` | A source directory resolves outside the project root. |
| `build-source-unreadable` | A source file could not be read. |
| `build-asset-unreadable` | An asset could not be read. |
| `build-env-malformed` | `.env` could not be parsed. |
| `build-empty-configuration` | The configuration produced nothing to build. |

## Configuration

| Code | Meaning |
| --- | --- |
| `config-not-found` | No `luam.json` in the directory. |
| `config-unreadable` | The file exists but could not be read. |
| `config-invalid-json` | The file is not valid JSON. |
| `config-missing-field` | A required field — `name` — is absent. |
| `config-invalid-name` | `name` is not a valid MTA resource name. |
| `config-invalid-type` | A field has the wrong type. |
| `config-unknown-field` | A field is not recognized. Includes the removed `helperDir`. |
| `config-invalid-root` | The project root could not be resolved. |
| `config-escaping-path` | A path is absolute or contains a `..` segment. |
| `config-unknown-helper` | `helpers` names a helper that does not exist. |
| `config-invalid-transport` | The transport block has an invalid shape. |
| `config-invalid-url-segment` | A transport value contains `/`, `?`, `#` or `..`. |
| `config-missing-secret` | `passwordEnv` names an environment variable that is not set. |
| `config-plaintext-password` | An inline `password` was used. Prefer `passwordEnv`. |
| `config-remote-plaintext-transport` | `host` is not a loopback address, and the interface has no TLS. |
