import { BOOLEAN_TYPE, createArray, createOptional, STRING_TYPE, type Type } from '@compiler/checker/types';

import {
    DEFAULT_BUILD_DETAILS,
    DEFAULT_COMPILER_OPTIONS,
    DEFAULT_ENGINE_VERSIONS,
    DEFAULT_ENVIRONMENT_FILE,
    DEFAULT_OUT_DIR,
    SCRIPT_SIDES,
} from './manifest-defaults';
import { elementField, field, findField, openField, recordType, table, type ManifestField } from './manifest-field';

export const MANIFEST_MODES: readonly string[] = ['development', 'production'];

export const MANIFEST_SECTIONS: readonly string[] = ['info', 'environment', 'scripts', 'files', 'build'];

const OPTIONAL_STRING = createOptional(STRING_TYPE);

const STRING_LIST = createArray(STRING_TYPE);

const AUTHOR_FIELDS: readonly ManifestField[] = [
    field('name', STRING_TYPE, 'Author written to the info element, which MTA reads back through getResourceInfo.', { required: true, owner: 'info' }),
    field('discord', OPTIONAL_STRING, 'Discord handle written as an info attribute, read at runtime with getResourceInfo(resource, \'discord\').', { owner: 'info' }),
    field('github', OPTIONAL_STRING, 'GitHub handle written as an info attribute, read at runtime with getResourceInfo(resource, \'github\').', { owner: 'info' }),
    field('email', OPTIONAL_STRING, 'Contact address written as an info attribute, read at runtime with getResourceInfo(resource, \'email\').', { owner: 'info' }),
];

const INFO_FIELDS: readonly ManifestField[] = [
    table('author', 'Who wrote the resource. Every extra key is emitted as an info attribute.', AUTHOR_FIELDS, { open: true, owner: 'info' }),
    field('version', OPTIONAL_STRING, 'Version written to the generated info element.', { owner: 'info' }),
    field('description', OPTIONAL_STRING, 'Description written to the generated info element.', { owner: 'info' }),
    field('dependencies', STRING_LIST, 'Resources that must be present, emitted as includes in the order they are written.', {
        defaultValue: [],
        rule: 'dependency-name',
        owner: 'dependencies',
        allowEmpty: true,
        ordered: true,
    }),
];

const VERSION_FIELDS: readonly ManifestField[] = [
    field('server', STRING_TYPE, 'Lowest MTA server version the resource declares support for.', {
        defaultValue: DEFAULT_ENGINE_VERSIONS.server,
        rule: 'engine-version',
        owner: 'engine',
    }),
    field('client', STRING_TYPE, 'Lowest MTA client version the resource declares support for.', {
        defaultValue: DEFAULT_ENGINE_VERSIONS.client,
        rule: 'engine-version',
        owner: 'engine',
    }),
];

const ENVIRONMENT_FIELDS: readonly ManifestField[] = [
    field('secret', STRING_TYPE, 'File that declares the environment keys and their types.', {
        defaultValue: DEFAULT_ENVIRONMENT_FILE,
        rule: 'static-path',
        owner: 'secret',
    }),
    field('oop', BOOLEAN_TYPE, 'Enables the MTA OOP API in the checker and states it in the generated file.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.oop,
        owner: 'compiler',
    }),
    field('strict', BOOLEAN_TYPE, 'Checks the project under the strict rules unless a file directive says otherwise.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.strict,
        owner: 'compiler',
    }),
    field('noUnusedLocals', BOOLEAN_TYPE, 'Reports local declarations that are never read.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.noUnusedLocals,
        owner: 'compiler',
    }),
    field('noImplicitGlobals', BOOLEAN_TYPE, 'Reports an assignment that creates a global the project never declares.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.noImplicitGlobals,
        owner: 'compiler',
    }),
    field('noUnusedParameters', BOOLEAN_TYPE, 'Reports function and method parameters that are never read.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.noUnusedParameters,
        owner: 'compiler',
    }),
    field('warningsAsErrors', BOOLEAN_TYPE, 'Promotes every compiler warning to an error.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.warningsAsErrors,
        owner: 'compiler',
    }),
    table('version', 'Lowest MTA version the resource declares support for, per side.', VERSION_FIELDS, { defaultValue: {}, owner: 'engine' }),
    field('libraries', STRING_LIST, 'Luam library packages compiled into the resource, in the order they are emitted.', {
        defaultValue: [],
        rule: 'package-name',
        owner: 'libraries',
        allowEmpty: true,
        ordered: true,
    }),
];

const SCRIPT_FIELDS: readonly ManifestField[] = [
    field('path', STRING_TYPE, 'File or pattern the entry names, relative to the project.', { required: true, rule: 'source-pattern', owner: 'scripts' }),
    field('type', STRING_TYPE, 'Side the matched files run on.', {
        required: true,
        values: SCRIPT_SIDES,
        valueCode: 'config-unknown-script-type',
        owner: 'scripts',
    }),
];

const SCRIPT_LIST = createArray(recordType('Script', SCRIPT_FIELDS));

const BUILD_DETAIL_FIELDS: readonly ManifestField[] = [
    field('bundle', BOOLEAN_TYPE, 'Writes one Lua file per side instead of mirroring the source tree.', {
        defaultValue: DEFAULT_BUILD_DETAILS.bundle,
        owner: 'output',
    }),
    field('map', BOOLEAN_TYPE, 'Writes a resource map that traces generated lines back to their source.', { defaultValue: DEFAULT_BUILD_DETAILS.map, owner: 'output' }),
    field('minify', BOOLEAN_TYPE, 'Shrinks the generated Lua before it is written.', { defaultValue: DEFAULT_BUILD_DETAILS.minify, owner: 'output' }),
    field('obfuscate', BOOLEAN_TYPE, 'Compiles the generated Lua to bytecode with "luac", which MTA loads.', {
        defaultValue: DEFAULT_BUILD_DETAILS.obfuscate,
        owner: 'output',
        unimplemented: 'Milestone 52 compiles the generated Lua to bytecode with "luac" and is what will honour it.',
    }),
];

const BUILD_FIELDS: readonly ManifestField[] = [
    field('output', STRING_TYPE, 'Directory the built resource is written to. It may be absolute and may leave the project.', {
        defaultValue: DEFAULT_OUT_DIR,
        rule: 'output-path',
        owner: 'output',
    }),
    table('details', 'Switches for the generated output.', BUILD_DETAIL_FIELDS, { defaultValue: {}, owner: 'output' }),
];

export const MANIFEST_FIELDS: readonly ManifestField[] = [
    table('info', 'What the resource is, who wrote it, and what it needs beside it.', INFO_FIELDS, { defaultValue: {}, owner: 'info' }),
    table('environment', 'The environment the resource runs in and is checked against.', ENVIRONMENT_FIELDS, { defaultValue: {}, owner: 'environment' }),
    field('scripts', SCRIPT_LIST, 'Scripts the resource loads, in the order it loads them, each declaring its own side.', {
        defaultValue: [],
        elements: SCRIPT_FIELDS,
        owner: 'scripts',
        allowEmpty: true,
        ordered: true,
    }),
    field('files', STRING_LIST, 'Files the resource ships, emitted as written, in the order they are listed.', {
        defaultValue: [],
        rule: 'source-pattern',
        owner: 'files',
        allowEmpty: true,
        ordered: true,
    }),
    table('build', 'Where the resource is written and what the build writes there.', BUILD_FIELDS, { defaultValue: {}, owner: 'output' }),
];

export const MANIFEST_RECORD: Type = recordType('Manifest', MANIFEST_FIELDS);

export const ENV_MEMBER_TYPE: Type = OPTIONAL_STRING;

const SERVER_FILE = 'Move it to ".luam.server", which answers it for every resource in the directory.';

export const REMOVED_FIELDS: Readonly<Record<string, string>> = {
    name: 'Remove it. The resource name is the folder that holds this manifest, and "build.output" names the directory the artifact is written under.',
    author: 'Move it to "info = { author = { name = \'you\' } }".',
    version: 'Move it to "info = { version = \'1.0.0\' }".',
    description: 'Move it to "info = { description = \'...\' }".',
    dependencies: 'Move it to "info = { dependencies = { \'other-resource\' } }".',
    compiler: 'Move its fields to "environment", which now holds "oop", "strict", and the remaining compiler options.',
    compilerOptions: 'Move its fields to "environment", which now holds "oop", "strict", and the remaining compiler options.',
    oop: 'Move it to "environment = { oop = true }".',
    sources: 'Replace it with an ordered "scripts" list of "{ path = \'src/server/**/*.luam\', type = \'server\' }" entries.',
    sourceDirs: 'Replace it with an ordered "scripts" list of "{ path = \'src/server/**/*.luam\', type = \'server\' }" entries.',
    loadOrder: 'Remove it. Position in "scripts" is load order, so move the entry instead of pinning it.',
    assets: 'Replace it with a "files" list of bare paths. A "to" that renames a file has no replacement: move the file in the project instead.',
    assetDirs: 'Replace it with a "files" list of bare paths.',
    helpers: 'Remove it. Helper selection follows the code that needs them.',
    contracts: 'Remove it. The export contract directory is part of the build layout and is no longer configured.',
    engine: 'Move it to "environment = { version = { server = \'1.6.0\', client = \'1.6.0\' } }".',
    mta: 'Move it to "environment = { version = { server = \'1.6.0\', client = \'1.6.0\' } }".',
    outDir: 'Move it to "build = { output = \'build\' }".',
    output: 'Move it to "build = { details = { bundle = true, minify = true, map = true } }".',
    libraries: 'Move it to "environment = { libraries = { \'@scope/package\' } }".',
    development: 'Remove it. Log capture belongs to ".luam.server", and the position mapping replaced the log relay.',
    serverPath: SERVER_FILE,
    resourcesDir: SERVER_FILE,
    transport: 'Remove it. "luam ensure" only syncs files, and "luam dev --start-server" restarts the server it owns.',
    'environment.file': 'Rename it to "environment.secret".',
    'environment.localFile': 'Remove it. A resource reads one environment file, named by "environment.secret".',
    'build.details.contracts': 'Remove it. The export contract directory is part of the build layout and is no longer configured.',
};

export const CONVERTER_REMOVED_IN = '2.0.0';

export function findManifestField(path: readonly string[]): ManifestField | null {
    let fields: readonly ManifestField[] | null = MANIFEST_FIELDS;
    let found: ManifestField | null = null;

    for (const segment of path) {
        if (found !== null && found.elements !== null && /^[0-9]+$/.test(segment)) {
            found = elementField(found, found.type);
            fields = found.members;

            continue;
        }

        const declared = fields === null ? null : findField(fields, segment);
        const extra: ManifestField | null = declared === null && found !== null && found.open ? openField(found, segment) : null;

        found = declared ?? extra;

        if (found === null) {
            return null;
        }

        fields = found.members;
    }

    return found;
}

export { defaultText, findField, requiredFields, ruleText, type ManifestField, type ManifestRuleKind } from './manifest-field';
