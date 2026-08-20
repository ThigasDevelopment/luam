import { BOOLEAN_TYPE, createArray, createOptional, createStringLiteral, createUnion, NUMBER_TYPE, STRING_TYPE, type Type } from '@compiler/checker/types';
import { RUNTIME_HELPERS } from '@runtime/helpers';

import { elementField, field, findField, recordType, table, type ManifestField } from './manifest-field';
import {
    DEFAULT_ASSET_DESTINATION,
    DEFAULT_COMPILER_OPTIONS,
    DEFAULT_ENGINE,
    DEFAULT_ENVIRONMENT_FILES,
    DEFAULT_OUT_DIR,
    DEFAULT_OUTPUT,
    DEFAULT_RESOURCES_DIR,
    DEFAULT_SOURCE_MAPPING,
} from './manifest-defaults';

export const HELPER_NAMES: readonly string[] = Object.keys(RUNTIME_HELPERS).sort();

export const MANIFEST_MODES: readonly string[] = ['development', 'production'];

const OPTIONAL_STRING = createOptional(STRING_TYPE);

const STRING_LIST = createArray(STRING_TYPE);

const HELPER_LIST = createArray(createUnion(HELPER_NAMES.map((name) => createStringLiteral(name))));

const COMPILER_OPTION_FIELDS: readonly ManifestField[] = [
    field('strict', BOOLEAN_TYPE, 'Checks the project under the strict rules unless a file directive says otherwise.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.strict,
    }),
    field('oop', BOOLEAN_TYPE, 'Enables the MTA OOP API in the checker and the generated meta.xml.', { defaultValue: DEFAULT_COMPILER_OPTIONS.oop }),
    field('noUnusedLocals', BOOLEAN_TYPE, 'Reports local declarations that are never read.', { defaultValue: DEFAULT_COMPILER_OPTIONS.noUnusedLocals }),
    field('noUnusedParameters', BOOLEAN_TYPE, 'Reports function and method parameters that are never read.', {
        defaultValue: DEFAULT_COMPILER_OPTIONS.noUnusedParameters,
    }),
    field('warningsAsErrors', BOOLEAN_TYPE, 'Promotes every compiler warning to an error.', { defaultValue: DEFAULT_COMPILER_OPTIONS.warningsAsErrors }),
];

function side(name: string, summary: string, defaultValue: readonly string[]): ManifestField {
    return field(name, STRING_LIST, summary, { defaultValue: [...defaultValue], rule: 'source-pattern', owner: 'sources', allowEmpty: true });
}

const SOURCE_FIELDS: readonly ManifestField[] = [
    side('server', 'Paths and patterns compiled as server sources.', DEFAULT_SOURCE_MAPPING.server),
    side('client', 'Paths and patterns compiled as client sources.', DEFAULT_SOURCE_MAPPING.client),
    side('shared', 'Paths and patterns compiled as shared sources.', DEFAULT_SOURCE_MAPPING.shared),
];

const ASSET_FIELDS: readonly ManifestField[] = [
    field('from', STRING_TYPE, 'File, directory, or pattern copied from the project.', { required: true, rule: 'source-pattern', owner: 'assets' }),
    field('to', STRING_TYPE, 'Destination inside the generated resource.', { defaultValue: DEFAULT_ASSET_DESTINATION, rule: 'static-path', owner: 'assets' }),
];

const ASSET_LIST = createArray(recordType('Asset', ASSET_FIELDS));

const ENGINE_FIELDS: readonly ManifestField[] = [
    field('minVersion', STRING_TYPE, 'Lowest MTA version the resource declares support for.', {
        defaultValue: DEFAULT_ENGINE.minVersion,
        rule: 'engine-version',
        owner: 'engine',
    }),
];

const ENVIRONMENT_FIELDS: readonly ManifestField[] = [
    field('file', STRING_TYPE, 'File that declares the environment keys and their types.', {
        defaultValue: DEFAULT_ENVIRONMENT_FILES.file,
        rule: 'static-path',
        owner: 'environment',
    }),
    field('localFile', STRING_TYPE, 'File that overrides declared values without adding keys.', {
        defaultValue: DEFAULT_ENVIRONMENT_FILES.localFile,
        rule: 'static-path',
        owner: 'environment',
    }),
];

const OUTPUT_FIELDS: readonly ManifestField[] = [
    field('bundle', BOOLEAN_TYPE, 'Writes one Lua file per side instead of mirroring the source tree.', { defaultValue: DEFAULT_OUTPUT.bundle, owner: 'output' }),
    field('map', BOOLEAN_TYPE, 'Writes a resource map that traces generated lines back to their source.', { defaultValue: DEFAULT_OUTPUT.map, owner: 'output' }),
    field('minify', BOOLEAN_TYPE, 'Shrinks the generated Lua before it is written.', { defaultValue: DEFAULT_OUTPUT.minify, owner: 'output' }),
];

const LOG_FIELDS: readonly ManifestField[] = [
    field('enabled', BOOLEAN_TYPE, 'Streams server and client logs into "luam dev".', { defaultValue: false, owner: 'development' }),
    field('maxMessageLength', NUMBER_TYPE, 'Longest log message kept before it is truncated.', { defaultValue: 4096, rule: 'positive-integer', owner: 'development' }),
    field('rateLimit', NUMBER_TYPE, 'Log messages accepted inside one window.', { defaultValue: 30, rule: 'positive-integer', owner: 'development' }),
    field('rateWindowMs', NUMBER_TYPE, 'Length of the rate window in milliseconds.', { defaultValue: 1000, rule: 'positive-integer', owner: 'development' }),
];

const DEVELOPMENT_SERVER_FIELDS: readonly ManifestField[] = [
    field('executable', OPTIONAL_STRING, 'Executable path relative to serverPath used by "luam server" and "luam dev --start-server".', {
        rule: 'server-contained-path',
        owner: 'development',
    }),
];

const DEVELOPMENT_FIELDS: readonly ManifestField[] = [
    table('logs', 'Log capture used by "luam dev".', LOG_FIELDS, { defaultValue: {}, owner: 'development' }),
    table('server', 'Local MTA server process settings.', DEVELOPMENT_SERVER_FIELDS, { defaultValue: {}, owner: 'development' }),
];

export const MANIFEST_FIELDS: readonly ManifestField[] = [
    field('name', STRING_TYPE, 'The MTA resource name.', { required: true, rule: 'resource-name', owner: 'identity' }),
    field('author', OPTIONAL_STRING, 'Author written to the generated meta.xml.', { owner: 'identity' }),
    field('version', OPTIONAL_STRING, 'Version written to the generated meta.xml.', { owner: 'identity' }),
    field('description', OPTIONAL_STRING, 'Description written to the generated meta.xml.', { owner: 'identity' }),
    table('compilerOptions', 'Settings that change how the source is checked and emitted.', COMPILER_OPTION_FIELDS, { defaultValue: {}, owner: 'compiler' }),
    table('sources', 'Paths and patterns that make up the project, grouped by the side each file runs on.', SOURCE_FIELDS, {
        defaultValue: {},
        owner: 'sources',
    }),
    field('assets', ASSET_LIST, 'Files copied into the generated resource, each with a destination.', {
        defaultValue: [],
        elements: ASSET_FIELDS,
        owner: 'assets',
        allowEmpty: true,
    }),
    field('dependencies', STRING_LIST, 'Resources that must be present, written as includes in the generated meta.xml.', {
        defaultValue: [],
        rule: 'dependency-name',
        owner: 'dependencies',
        allowEmpty: true,
    }),
    table('engine', 'Requirements the MTA server and client must meet.', ENGINE_FIELDS, { defaultValue: {}, owner: 'engine' }),
    table('environment', 'Files that declare and override the project environment.', ENVIRONMENT_FIELDS, { defaultValue: {}, owner: 'environment' }),
    field('outDir', STRING_TYPE, 'Directory the built resource is written to.', { defaultValue: DEFAULT_OUT_DIR, rule: 'static-path', owner: 'output' }),
    field('loadOrder', STRING_LIST, 'Files listed first in the generated meta.xml.', {
        defaultValue: [],
        rule: 'static-path',
        owner: 'assembly',
        allowEmpty: true,
    }),
    field('helpers', HELPER_LIST, 'Runtime helpers bundled into the resource.', {
        defaultValue: [],
        values: HELPER_NAMES,
        valueCode: 'config-unknown-helper',
        owner: 'assembly',
        allowEmpty: true,
    }),
    field('serverPath', OPTIONAL_STRING, 'Path to the MTA server installation used by "luam dev".', { owner: 'deployment' }),
    field('resourcesDir', STRING_TYPE, 'Resource directory inside the server installation.', {
        defaultValue: DEFAULT_RESOURCES_DIR,
        rule: 'contained-path',
        owner: 'deployment',
    }),
    table('output', 'Switches for the generated output.', OUTPUT_FIELDS, { defaultValue: {}, owner: 'output' }),
    table('development', 'Behaviour that only applies while developing.', DEVELOPMENT_FIELDS, { defaultValue: {}, owner: 'development' }),
];

export const MANIFEST_RECORD: Type = recordType('Manifest', MANIFEST_FIELDS);

export const ENV_MEMBER_TYPE: Type = OPTIONAL_STRING;

export const REMOVED_FIELDS: Readonly<Record<string, string>> = {
    oop: 'Move it to "compilerOptions = { oop = true }".',
    sourceDirs: 'Replace it with "sources = { server = { ... }, client = { ... }, shared = { ... } }", listing paths or patterns per side.',
    assetDirs: 'Replace it with "assets = { { from = \'assets/**/*\', to = \'assets\' } }", naming a destination for each entry.',
    mta: 'Replace it with "engine = { minVersion = \'1.6.0\' }".',
    transport: 'Remove it. "luam ensure" only syncs files, and "luam dev --start-server" restarts the server it owns.',
};

export function findManifestField(path: readonly string[]): ManifestField | null {
    let fields: readonly ManifestField[] | null = MANIFEST_FIELDS;
    let found: ManifestField | null = null;

    for (const segment of path) {
        if (found !== null && found.elements !== null && /^[0-9]+$/.test(segment)) {
            found = elementField(found, found.type);
            fields = found.members;

            continue;
        }

        found = fields === null ? null : findField(fields, segment);

        if (found === null) {
            return null;
        }

        fields = found.members;
    }

    return found;
}

export { defaultText, findField, requiredFields, ruleText, type ManifestField, type ManifestRuleKind } from './manifest-field';
