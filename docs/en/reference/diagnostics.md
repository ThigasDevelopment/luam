# Diagnostics

Every diagnostic carries a location, a severity and a code:

```
src/client/hud.luam:1:1 error check-environment-api: API "kickPlayer" is server-only and is not available in a "client" file.
```

The prefix names the stage that produced it. Six codes have exactly one correct
repair, and the editor offers it as a quick fix — see
[Quick fixes](/en/tooling/editors#quick-fixes).

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
| `parse-reserved-name` | A reserved word in a name position — `function f(type: T)`, `local enum = 3` — or read as a value. The word stays legal as a property, so `value.type` keeps working. The parser recovers at the word, so the surrounding declaration still registers. |
| `parse-invalid-statement` | The construct is not a statement. |
| `parse-invalid-type` | The type annotation could not be parsed. |
| `parse-invalid-increment` | `++` or `--` used as an expression. Both are statements. |
| `parse-export-local` | `export` applied to a `local function`. |
| `parse-invalid-optional` | A `?` on a name with no type annotation after it. |
| `parse-optional-position` | The `?` was written on the type. It attaches to the name. |
| `parse-redundant-optional` | The name and the type both carry a `?`. One marker is enough. |
| `parse-duplicate-key` | An object type declares the same key more than once. |
| `parse-unexpected-decorator` | A decorator where none may appear. |
| `parse-decorator-arguments` | A decorator was given arguments. It takes none. |
| `parse-class-method-form` | A class member was written as `name(...) { ... }`. It is `name = function (...) ... end`. |

## Environment

| Code | Severity | Meaning |
| --- | --- | --- |
| `env-conflicting-directive` | error | Two different `#!` environment directives in one file. |
| `env-path-directive-conflict` | warning | The directive disagrees with the path. The directive wins. |
| `env-library-directive` | error | A `#!` directive inside a library file disagrees with the side the library declares. |

## Checker — types

| Code | Severity | Meaning |
| --- | --- | --- |
| `check-type-mismatch` | error | A value does not match the declared type. |
| `check-return-mismatch` | error | A `return` does not match the declared return type. |
| `check-tuple-position` | error | A parenthesised return list — `(number, number)` — in a parameter, a variable, a field, an interface member, or an alias body. A tuple is a return shape only. |
| `check-missing-return` | error | A function that declares a return type can end without returning a value. |
| `check-argument-count` | error | Too few or too many arguments. A final argument that is a call of unknown return arity — `f(unpack(t))` — spreads into the rest of the list, so the minimum is not checked and the maximum counts only the arguments before it. Those spread positions are unchecked, because there is no arity to check them against. |
| `check-invalid-operand` | error | An operator cannot be applied to that type. |
| `check-unknown-member` | error | The member does not exist on the receiver. |
| `check-not-callable` | error | A call on a value that is not a function. |
| `check-extension-form` | error | An object extension used in the other form: a property extension called, or a call extension only read. |
| `check-unknown-record-key` | error | The key is not declared by the object type. Also used by `process.env`. |
| `check-unknown-union-key` | error | The key is missing from at least one member of the union. |
| `check-incomplete-record` | error | A table literal that later statements were completing is used, or the block ends, with a required key still unassigned. |
| `check-invalid-intersection` | error | A part of an intersection is not an object type, an interface, or a class. |
| `check-conflicting-intersection-member` | error | Two parts of an intersection declare the same key with different types. |
| `check-generic-arity` | error | A type alias or a class received the wrong number of type arguments. |
| `check-generic-constraint` | error | A type argument does not satisfy the constraint its parameter declares. |
| `check-generic-depth` | error | A specialization is nested past the depth the checker expands. |
| `check-unknown-type` | warning | The type name is not declared anywhere the file can reach. |

## Checker — control flow

| Code | Meaning |
| --- | --- |
| `check-invalid-break` | A `break` outside a loop, or not last in its block. |
| `check-invalid-continue` | A `continue` outside a loop, not last in its block, or one that would jump over a local the `until` condition reads. |

## Checker — async

| Code | Severity | Meaning |
| --- | --- | --- |
| `check-await-outside-async` | error | `await` read as a value outside an async function. The word is an operator only inside one; elsewhere it is an ordinary identifier and reads a global that is `nil`. |
| `check-await-non-promise` | error | `await` applied to something that is not a promise. The message names the type it found. |
| `check-async-return-annotation` | error | An async function annotated `Promise` directly. The annotation is the **inner** type: `async function f(): number` already has the signature `f(): Promise<number>`. |
| `check-sleep-outside-async` | warning | A `sleep` call with no coroutine to suspend — at the top level of a file, or inside a plain named function. A function **expression** is exempt, because it may be a `Threads` job. |

## Checker — declarations

| Code | Meaning |
| --- | --- |
| `check-unknown-resource-export` | A literal call names an export the dependency contract does not declare. |
| `check-resource-export-side` | An export is called from a side it does not run on. |
| `check-unknown-class` | `new` or `extends` names a class that is not declared. |
| `check-duplicate-class` | Two classes with the same name in one file. |
| `check-class-cycle` | A class extends itself, directly or through its parents. |
| `check-class-before-declaration` | A top-level effect instantiates a class declared further down the file. |
| `check-duplicate-class-member` | One name is declared as both a static and an instance member. |
| `check-static-receiver` | A static read through an instance, or called with a colon. |
| `check-class-receiver` | A colon call on the class itself for a member that is **not** static, e.g. `RedisAdapter:connect()`. Instantiate with `new`, or read the member from a value of that class; where a class and its single instance share one name, give the instance its own name. |
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
| `check-duplicate-type` | Two files, or one file twice, declare the same `type` alias. An alias reaches the whole project, like a class, an interface, and an enum. |
| `check-duplicate-global` | Two annotated declarations of the same global. A `.d.luam` `declare` is not a duplicate: it wins, and the assignment is checked against it. |
| `check-global-annotation-scope` | A type on a global assignment outside the top level of a file. |
| `check-unknown-enum-member` | The enum has no such member. |
| `check-invalid-super` | `super(...)` outside a class or the invalid `self:super(...)` syntax. |
| `check-unknown-super-method` | The parent has no method of that name. |
| `check-declare-outside-declaration-file` | `declare` outside a `.d.luam` file. |
| `check-declaration-file-statement` | A `.d.luam` file contains a statement. |
| `check-unused-local` | A local is never read, with `compiler.noUnusedLocals` on, or anywhere in the manifest. |
| `check-shadowed-api` | warning | A top-level declaration overwrites an API this environment declares, e.g. `function dxDrawText(...)`. Later calls keep the declared signature. Rename it, or record the new signature in a `.d.luam` file. |
| `check-shadowed-helper` | warning | A top-level declaration overwrites a standard-library member the build models, e.g. `function math.clamp(...)`. The message names the object extension that lowers to it. |
| `check-implicit-global` | warning | An assignment creates a global nothing declares, with `compiler.noImplicitGlobals` on. Off by default. |
| `check-unused-parameter` | A parameter is never read, with `compiler.noUnusedParameters` on. |

## Checker — decorators

| Code | Meaning |
| --- | --- |
| `check-blocked-metamethod` | A class method names a metamethod Luam does not expose. |
| `check-invalid-metamethod` | A metamethod declares the wrong parameter count or return type. |
| `check-unreifiable-type` | `@Validated` names a field type that has no runtime shape. |
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
| `check-unknown-template-root` | An interpolation is not a name or a member path, or it refers to a name that is not in scope and carries no fallback. |
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
| `project-load-order-library` | A `loadOrder` entry names a library file. Library scripts load in the order `libraries` declares. |
| `project-library-collision` | Two libraries, or a library and a project file, declare one global on one side. |
| `project-library-shadows-api` | A library declares a name the MTA API defines. Reported as a warning. |
| `project-library-project-reference` | A library file uses a global the project declares. A library sees only its own files. |
| `project-bundle-toplevel-return` | A bundled module ends with a top-level `return`. Remove it or select tree output. |
| `project-bundle-output-collision` | A source or asset produces a reserved bundle path. Rename it or select tree output. |

## Build

| Code | Meaning |
| --- | --- |
| `build-source-unreadable` | A source file could not be read. |
| `build-asset-unreadable` | An asset could not be read. |
| `build-env-malformed` | `.env` could not be parsed. |
| `build-empty-configuration` | The configuration produced nothing to build. |
| `build-invalid-contract` | A dependency export contract was unreadable or named another resource, and was ignored. |

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
| `config-no-sources` | The project has no `.luam` file at all. |
| `config-unmatched-source` | No `sources` pattern matched, and the project does hold `.luam` files. The message names them and the three ways out. |
| `config-source-side-conflict` | One file is matched by more than one side of `sources`. |
| `config-missing-asset` | A literal `assets` entry names a file that does not exist. |
| `config-empty-asset` | An `assets` pattern copied nothing — its root is not a directory, or nothing under it matched. A warning. |
| `config-output-collision` | Two assets land on the same destination, or one would overwrite a generated path. |
| `config-invalid-dependency` | A `dependencies` entry is not a valid resource name, or names this resource. |
| `config-library-missing` | A `libraries` entry names a package that is not installed. The message names the install command. |
| `config-library-invalid` | A `libraries` entry is not a package name, or the package declares no usable `luam` field. |
| `config-library-duplicate` | The same package is listed twice in `libraries`. |
| `config-library-escape` | A library source pattern resolves outside the package directory. |
| `config-library-requirement-missing` | A resolved library requires a package `libraries` does not list. |
| `config-invalid-engine-version` | `engine.minVersion` is neither `'latest'` nor a version. |
| `config-missing-env-file` | A configured `environment` file does not exist. |
| `config-unknown-helper` | `helpers` names a helper that does not exist. |

## Formatter file

Reported for [`.luam.formatter`](/en/reference/formatter-file). Any of them stops
the run: `luam format` exits `2` and writes nothing, and the editor offers no
edits.

| Code | Meaning |
| --- | --- |
| `formatter-unknown-field` | A name the formatter field table does not define. |
| `formatter-invalid-value` | A value outside the field's type or range — an unknown `indent`, an `indentWidth` outside 1 to 8, a `maxBlankLines` outside 0 to 4. |
| `formatter-parse-error` | The file does not parse as the manifest dialect. |
