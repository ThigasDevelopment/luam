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
| `config-` | Loading `.luam.manifest`. |

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
| `parse-class-method-form` | A class member was written as `name(...) { ... }`. It is `name = function (...) ... end`. |

## Environment

| Code | Severity | Meaning |
| --- | --- | --- |
| `env-conflicting-directive` | error | Two different `#!` environment directives in one file. |
| `env-path-directive-conflict` | warning | The directive disagrees with the path. The directive wins. |

## Checker — types

| Code | Severity | Meaning |
| --- | --- | --- |
| `check-type-mismatch` | error | A value does not match the declared type. |
| `check-return-mismatch` | error | A `return` does not match the declared return type. |
| `check-argument-count` | error | Too few or too many arguments. |
| `check-invalid-operand` | error | An operator cannot be applied to that type. |
| `check-unknown-member` | error | The member does not exist on the receiver. |
| `check-not-callable` | error | A call on a value that is not a function. |
| `check-extension-form` | error | An object extension used in the other form: a property extension called, or a call extension only read. |
| `check-unknown-record-key` | error | The key is not declared by the object type. Also used by `process.env`. |
| `check-unknown-union-key` | error | The key is missing from at least one member of the union. |
| `check-invalid-intersection` | error | A part of an intersection is not an object type, an interface, or a class. |
| `check-conflicting-intersection-member` | error | Two parts of an intersection declare the same key with different types. |
| `check-unknown-type` | warning | The type name is not declared anywhere the file can reach. |

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
| `check-class-cycle` | A class extends itself, directly or through its parents. |
| `check-class-before-declaration` | A top-level effect instantiates a class declared further down the file. |
| `check-duplicate-class-member` | One name is declared as both a static and an instance member. |
| `check-static-receiver` | A static read through an instance, or called with a colon. |
| `check-unknown-interface` | `implements` or interface `extends` names an interface that is not declared. |
| `check-duplicate-interface` | Two interfaces with the same name in one file. |
| `check-duplicate-interface-parent` | An interface extends the same parent more than once. |
| `check-duplicate-interface-member` | An interface declares the same member more than once. |
| `check-conflicting-interface-member` | Parent interfaces declare one member incompatibly. |
| `check-interface-cycle` | An interface inheritance cycle is declared. |
| `check-unimplemented-interface` | A member the interface requires is missing. |
| `check-explicit-self-parameter` | A class method explicitly declares the automatically injected `self`. |
| `check-invalid-self` | `self` outside a class method or a `function Name:method()` declaration. |
| `check-invalid-constructor` | A class declares `constructor` as a field instead of a method. |
| `check-duplicate-enum` | Two enums with the same name in one file. |
| `check-unknown-enum-member` | The enum has no such member. |
| `check-invalid-super` | `super(...)` outside a class or the invalid `self:super(...)` syntax. |
| `check-unknown-super-method` | The parent has no method of that name. |
| `check-declare-outside-declaration-file` | `declare` outside a `.d.luam` file. |
| `check-declaration-file-statement` | A `.d.luam` file contains a statement. |
| `check-unused-local` | A local is never read, with `compiler.noUnusedLocals` on, or anywhere in the manifest. |
| `check-unused-parameter` | A parameter is never read, with `compiler.noUnusedParameters` on. |

## Checker — decorators

| Code | Meaning |
| --- | --- |
| `check-unknown-decorator` | The name is not one of the known decorators. |
| `check-decorator-target` | A decorator on something that cannot carry one. |
| `check-duplicate-decorator` | The same decorator twice on one target. |
| `check-decorator-conflict` | The combination cannot be satisfied. |
| `check-lazy-initializer` | A `@Lazy` field with no initializer. |
| `check-readonly-assignment` | A write to a `@ReadOnly` field outside the declaring class. |
| `check-deprecated-use` | A use of a `@Deprecated` member. |
| `check-invalid-override` | An `@Override` method the superclass does not declare with the same signature. |

## Checker — MTA

| Code | Meaning |
| --- | --- |
| `check-environment-api` | The API belongs to another environment. |
| `check-environment-event` | The event belongs to another environment. |
| `check-oop-disabled` | An OOP call with `compiler.oop` off. |
| `check-not-callable-class` | A class used as a constructor that MTA does not make callable. |
| `check-native-constructor` | Wrong arguments to a native constructor. |
| `check-native-class-inheritance` | A project class tried to extend a native class. |

## Checker — event contracts

| Code | Meaning |
| --- | --- |
| `check-duplicate-event` | Two `declare event` declarations for one name. |
| `check-invalid-event-name` | `declare event ''`, with an empty name. |
| `check-duplicate-event-parameter` | Two parameters of one event share a name. |
| `check-invalid-event-parameter` | The variadic parameter of an event is not last. |
| `check-event-return-type` | An event declared a return type other than `void`. |

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
| `build-source-unreadable` | A source file could not be read. |
| `build-asset-unreadable` | An asset could not be read. |
| `build-env-malformed` | `.env` could not be parsed. |
| `build-empty-configuration` | The configuration produced nothing to build. |

## Configuration

| Code | Meaning |
| --- | --- |
| `config-not-found` | No `.luam.manifest` in the directory. |
| `config-unsupported-manifest` | The selected file is not a `.luam.manifest` file. |
| `config-unreadable-manifest` | The file could not be read. |
| `config-invalid-statement` | A statement the manifest dialect does not allow. Only `local` declarations and assignments to configuration fields. |
| `config-invalid-expression` | A value the manifest expression language does not allow — a call, a function, an index by anything but a name. |
| `config-missing-field` | A required field — `name`, or `from` inside an `assets` entry — is absent. |
| `config-invalid-name` | `name` is not a valid MTA resource name. |
| `config-invalid-type` | A field has the wrong type. |
| `config-unknown-field` | A name is not a configuration field. Includes the removed `helperDir`. |
| `config-removed-field` | A name that used to be a field. The message names its replacement. |
| `config-escaping-path` | A path is absolute or contains a `..` segment. |
| `config-invalid-pattern` | A pattern uses something the glob grammar does not allow. |
| `config-missing-source` | A literal `sources` entry names a file that does not exist. |
| `config-no-sources` | No `.luam` file matched `sources`. |
| `config-source-side-conflict` | One file is matched by more than one side of `sources`. |
| `config-missing-asset` | A literal `assets` entry names a file that does not exist. |
| `config-output-collision` | Two assets land on the same destination, or one would overwrite a generated path. |
| `config-invalid-dependency` | A `dependencies` entry is not a valid resource name, or names this resource. |
| `config-invalid-engine-version` | `engine.minVersion` is neither `'latest'` nor a version. |
| `config-missing-env-file` | A configured `environment` file does not exist. |
| `config-unknown-helper` | `helpers` names a helper that does not exist. |
