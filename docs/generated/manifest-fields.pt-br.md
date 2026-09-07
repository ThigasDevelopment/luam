| Campo | Tipo | Obrigatório | Padrão | Significado |
| --- | --- | --- | --- | --- |
| `info.author.name` | `string` | sim | `—` | Author written to the info element, which MTA reads back through getResourceInfo. |
| `info.author.discord` | `string?` | não | `sem valor` | Discord handle written as an info attribute, read at runtime with getResourceInfo(resource, 'discord'). |
| `info.author.github` | `string?` | não | `sem valor` | GitHub handle written as an info attribute, read at runtime with getResourceInfo(resource, 'github'). |
| `info.author.email` | `string?` | não | `sem valor` | Contact address written as an info attribute, read at runtime with getResourceInfo(resource, 'email'). |
| `info.version` | `string?` | não | `sem valor` | Version written to the generated info element. |
| `info.description` | `string?` | não | `sem valor` | Description written to the generated info element. |
| `info.dependencies` | `string[]` | não | `{ }` | Resources that must be present, emitted as includes in the order they are written. The name of another MTA resource, which cannot be this resource. |
| `environment.secret` | `string` | não | `'.env'` | File that declares the environment keys and their types. A relative path with no wildcards that stays inside the project directory. |
| `environment.oop` | `boolean` | não | `false` | Enables the MTA OOP API in the checker and states it in the generated file. |
| `environment.strict` | `boolean` | não | `true` | Checks the project under the strict rules unless a file directive says otherwise. |
| `environment.noUnusedLocals` | `boolean` | não | `false` | Reports local declarations that are never read. |
| `environment.noImplicitGlobals` | `boolean` | não | `false` | Reports an assignment that creates a global the project never declares. |
| `environment.noUnusedParameters` | `boolean` | não | `false` | Reports function and method parameters that are never read. |
| `environment.warningsAsErrors` | `boolean` | não | `false` | Promotes every compiler warning to an error. |
| `environment.version.server` | `string` | não | `'latest'` | Lowest MTA server version the resource declares support for. A version such as "1.6.0", or "latest" to follow the newest published release. |
| `environment.version.client` | `string` | não | `'latest'` | Lowest MTA client version the resource declares support for. A version such as "1.6.0", or "latest" to follow the newest published release. |
| `environment.libraries` | `string[]` | não | `{ }` | Luam library packages compiled into the resource, in the order they are emitted. The name of an installed npm package that ships a Luam library. |
| `scripts` | `Script[]` | não | `{ }` | Scripts the resource loads, in the order it loads them, each declaring its own side. |
| `scripts[].path` | `string` | sim | `—` | File or pattern the entry names, relative to the project. A relative path or a "*", "**", and "?" pattern that stays inside the project directory. |
| `scripts[].type` | `string` | sim | `—` | Side the matched files run on. |
| `files` | `string[]` | não | `{ }` | Files the resource ships, emitted as written, in the order they are listed. A relative path or a "*", "**", and "?" pattern that stays inside the project directory. |
| `build.output` | `string` | não | `'build'` | Directory the built resource is written to. It may be absolute and may leave the project. A path with no wildcards. It may be absolute and may leave the project directory. |
| `build.details.bundle` | `boolean` | não | `true` | Writes one Lua file per side instead of mirroring the source tree. |
| `build.details.map` | `boolean` | não | `true` | Writes a resource map that traces generated lines back to their source. |
| `build.details.minify` | `boolean` | não | `true` | Shrinks the generated Lua before it is written. |
| `build.details.obfuscate` | `boolean` | não | `false` | Compiles the generated Lua to bytecode with "luac", which MTA loads. |

| Campo removido | Para onde foi |
| --- | --- |
| `assetDirs` | Replace it with a "files" list of bare paths. |
| `assets` | Replace it with a "files" list of bare paths. A "to" that renames a file has no replacement: move the file in the project instead. |
| `author` | Move it to "info = { author = { name = 'you' } }". |
| `build.details.contracts` | Remove it. The export contract directory is part of the build layout and is no longer configured. |
| `compiler` | Move its fields to "environment", which now holds "oop", "strict", and the remaining compiler options. |
| `compilerOptions` | Move its fields to "environment", which now holds "oop", "strict", and the remaining compiler options. |
| `contracts` | Remove it. The export contract directory is part of the build layout and is no longer configured. |
| `dependencies` | Move it to "info = { dependencies = { 'other-resource' } }". |
| `description` | Move it to "info = { description = '...' }". |
| `development` | Remove it. Log capture belongs to ".luam.server", and the position mapping replaced the log relay. |
| `engine` | Move it to "environment = { version = { server = '1.6.0', client = '1.6.0' } }". |
| `environment.file` | Rename it to "environment.secret". |
| `environment.localFile` | Remove it. A resource reads one environment file, named by "environment.secret". |
| `helpers` | Remove it. Helper selection follows the code that needs them. |
| `libraries` | Move it to "environment = { libraries = { '@scope/package' } }". |
| `loadOrder` | Remove it. Position in "scripts" is load order, so move the entry instead of pinning it. |
| `mta` | Move it to "environment = { version = { server = '1.6.0', client = '1.6.0' } }". |
| `name` | Remove it. The resource name is the folder that holds this manifest, and "build.output" names the directory the artifact is written under. |
| `oop` | Move it to "environment = { oop = true }". |
| `outDir` | Move it to "build = { output = 'build' }". |
| `output` | Move it to "build = { details = { bundle = true, minify = true, map = true } }". |
| `resourcesDir` | Move it to ".luam.server", which answers it for every resource in the directory. |
| `serverPath` | Move it to ".luam.server", which answers it for every resource in the directory. |
| `sourceDirs` | Replace it with an ordered "scripts" list of "{ path = 'src/server/**/*.luam', type = 'server' }" entries. |
| `sources` | Replace it with an ordered "scripts" list of "{ path = 'src/server/**/*.luam', type = 'server' }" entries. |
| `transport` | Remove it. "luam ensure" only syncs files, and "luam dev --start-server" restarts the server it owns. |
| `version` | Move it to "info = { version = '1.0.0' }". |
