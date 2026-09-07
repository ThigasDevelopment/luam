import { BOOLEAN_TYPE, createArray, createOptional, createStringLiteral, createUnion, NUMBER_TYPE, STRING_TYPE, type Type } from '@compiler/checker/types';
import type { Diagnostic, SourcePosition } from '@compiler/diagnostics/diagnostic';
import { ALL_ENVIRONMENTS, type Environment } from '@compiler/environment/environment';
import { RUNTIME_HELPERS } from '@runtime/helpers';

import { DEFAULT_CONTRACTS_DIR, DEFAULT_ENVIRONMENT_FILE, DEFAULT_OUT_DIR, LATEST_ENGINE_VERSION } from './manifest-defaults';
import { manifestWarning } from './manifest-diagnostics';
import { field, recordType, table, type ManifestField } from './manifest-field';
import { matchesPattern, normalizePattern } from '@compiler/project/path-pattern';

import { normalizeFields, positionAt, type PositionLookup } from './manifest-rules';
import { readBoolean, readString, readStrings, readTable, readTables } from './manifest-readers';
import { isManifestObject, type ManifestObject, type ManifestValue } from './manifest-value';

export const MANIFEST_FORM = 'config-manifest-form';

export const RESOURCE_NAME_MOVED = 'config-resource-name-moved';

export const MIGRATION_REFUSED = 'config-migration-refused';

export const MIGRATE_COMMAND = 'luam migrate';

const OPTIONAL_STRING = createOptional(STRING_TYPE);

const STRING_LIST = createArray(STRING_TYPE);

const HELPER_LIST = createArray(createUnion(Object.keys(RUNTIME_HELPERS).map((name) => createStringLiteral(name))));

function legacy(name: string, type: Type, options: Partial<ManifestField> = {}): ManifestField {
    return field(name, type, 'A field of the manifest form ADR-047 replaced.', { owner: 'legacy', ...options });
}

const LEGACY_COMPILER_FIELDS: readonly ManifestField[] = [
    legacy('strict', BOOLEAN_TYPE),
    legacy('oop', BOOLEAN_TYPE),
    legacy('noUnusedLocals', BOOLEAN_TYPE),
    legacy('noImplicitGlobals', BOOLEAN_TYPE),
    legacy('noUnusedParameters', BOOLEAN_TYPE),
    legacy('warningsAsErrors', BOOLEAN_TYPE),
];

const LEGACY_SOURCE_FIELDS: readonly ManifestField[] = ALL_ENVIRONMENTS.map((environment) =>
    legacy(environment, STRING_LIST, { defaultValue: [], allowEmpty: true }),
);

const LEGACY_ASSET_FIELDS: readonly ManifestField[] = [legacy('from', STRING_TYPE, { required: true }), legacy('to', STRING_TYPE, { defaultValue: '.' })];

const LEGACY_ENGINE_FIELDS: readonly ManifestField[] = [legacy('minVersion', STRING_TYPE, { defaultValue: LATEST_ENGINE_VERSION })];

const LEGACY_ENVIRONMENT_FIELDS: readonly ManifestField[] = [
    legacy('file', STRING_TYPE, { defaultValue: DEFAULT_ENVIRONMENT_FILE }),
    legacy('localFile', STRING_TYPE, { defaultValue: '.env.local' }),
];

const LEGACY_OUTPUT_FIELDS: readonly ManifestField[] = [
    legacy('bundle', BOOLEAN_TYPE, { defaultValue: true }),
    legacy('map', BOOLEAN_TYPE, { defaultValue: true }),
    legacy('minify', BOOLEAN_TYPE, { defaultValue: true }),
];

const LEGACY_LOG_FIELDS: readonly ManifestField[] = [
    legacy('enabled', BOOLEAN_TYPE, { defaultValue: false }),
    legacy('maxMessageLength', NUMBER_TYPE, { defaultValue: 4096 }),
    legacy('rateLimit', NUMBER_TYPE, { defaultValue: 30 }),
    legacy('rateWindowMs', NUMBER_TYPE, { defaultValue: 1000 }),
];

const LEGACY_DEVELOPMENT_FIELDS: readonly ManifestField[] = [
    table('logs', 'Removed.', LEGACY_LOG_FIELDS, { defaultValue: {}, owner: 'legacy' }),
    table('server', 'Removed.', [legacy('executable', OPTIONAL_STRING)], { defaultValue: {}, owner: 'legacy' }),
];

export const LEGACY_MANIFEST_FIELDS: readonly ManifestField[] = [
    legacy('name', STRING_TYPE),
    legacy('author', OPTIONAL_STRING),
    legacy('version', OPTIONAL_STRING),
    legacy('description', OPTIONAL_STRING),
    table('compiler', 'Replaced by "environment".', LEGACY_COMPILER_FIELDS, { defaultValue: {}, owner: 'legacy' }),
    table('sources', 'Replaced by "scripts".', LEGACY_SOURCE_FIELDS, { defaultValue: {}, owner: 'legacy' }),
    legacy('assets', createArray(recordType('LegacyAsset', LEGACY_ASSET_FIELDS)), { defaultValue: [], elements: LEGACY_ASSET_FIELDS, allowEmpty: true }),
    legacy('dependencies', STRING_LIST, { defaultValue: [], allowEmpty: true }),
    legacy('libraries', STRING_LIST, { defaultValue: [], allowEmpty: true }),
    legacy('contracts', STRING_TYPE, { defaultValue: DEFAULT_CONTRACTS_DIR }),
    table('engine', 'Replaced by "environment.version".', LEGACY_ENGINE_FIELDS, { defaultValue: {}, owner: 'legacy' }),
    table('environment', 'Replaced by "environment.secret".', LEGACY_ENVIRONMENT_FIELDS, { defaultValue: {}, owner: 'legacy' }),
    legacy('outDir', STRING_TYPE, { defaultValue: DEFAULT_OUT_DIR }),
    legacy('loadOrder', STRING_LIST, { defaultValue: [], allowEmpty: true }),
    legacy('helpers', HELPER_LIST, { defaultValue: [], allowEmpty: true }),
    legacy('serverPath', OPTIONAL_STRING),
    legacy('resourcesDir', STRING_TYPE, { defaultValue: 'mods/deathmatch/resources' }),
    table('output', 'Replaced by "build.details".', LEGACY_OUTPUT_FIELDS, { defaultValue: {}, owner: 'legacy' }),
    table('development', 'Removed.', LEGACY_DEVELOPMENT_FIELDS, { defaultValue: {}, owner: 'legacy' }),
];

export interface LegacyConversion {
    value: ManifestObject;
    refusals: string[];
    notes: string[];
}

const SIDE_DIRECTORIES: readonly (readonly [string, Environment])[] = [
    ['src/server/', 'server'],
    ['src/client/', 'client'],
    ['src/shared/', 'shared'],
];

function patternRootOf(pattern: string): string {
    const segments = pattern.split('/');
    const index = segments.findIndex((segment) => segment.includes('*') || segment.includes('?'));

    return index === -1 ? pattern : segments.slice(0, index).join('/');
}

function sideOf(path: string): Environment {
    return SIDE_DIRECTORIES.find(([prefix]) => path.startsWith(prefix))?.[1] ?? 'shared';
}

function scriptEntry(path: string, type: Environment): ManifestObject {
    return { path, type };
}

const HISTORICAL_SOURCES: Readonly<Record<Environment, string>> = {
    shared: 'src/shared/**/*.luam',
    server: 'src/server/**/*.luam',
    client: 'src/client/**/*.luam',
};

const SIDES: readonly Environment[] = ['shared', 'server', 'client'];

function declaredPatterns(sources: ManifestObject | null, environment: Environment): string[] {
    if (sources === null) {
        return [HISTORICAL_SOURCES[environment]];
    }

    return sources[environment] === undefined ? [HISTORICAL_SOURCES[environment]] : readStrings(sources, environment);
}

function convertScripts(raw: ManifestObject, refusals: string[]): ManifestValue[] {
    const sources = readTable(raw, 'sources');
    const patterns = SIDES.flatMap((environment) => declaredPatterns(sources, environment).map((pattern) => ({ pattern, environment })));
    const entries: ManifestValue[] = [];

    for (const path of readStrings(raw, 'loadOrder')) {
        const covered = patterns.find((entry) => matchesPattern(normalizePattern(entry.pattern), normalizePattern(path)));

        if (covered !== undefined) {
            refusals.push(
                `"loadOrder" pins "${path}", which "sources.${covered.environment}" already reaches through "${covered.pattern}". Position in "scripts" is load order and one file belongs to one entry, so move "${path}" out of "${covered.pattern}" — a directory of its own, listed first — and list it as its own entry.`,
            );

            continue;
        }

        entries.push(scriptEntry(path, sideOf(path)));
    }

    for (const { pattern, environment } of patterns) {
        entries.push(scriptEntry(pattern, environment));
    }

    return entries;
}

function convertFiles(raw: ManifestObject, refusals: string[]): ManifestValue[] {
    const files: ManifestValue[] = [];

    for (const entry of readTables(raw, 'assets')) {
        const from = readString(entry, 'from') ?? '';
        const to = readString(entry, 'to') ?? '.';
        const root = patternRootOf(from);

        if (to === '.' || to === root) {
            files.push(from);

            continue;
        }

        refusals.push(
            `"assets" maps "${from}" to "${to}", and a file that lands somewhere other than the path the manifest names has no replacement. Move "${from}" to "${to}" in the project, then list "${to}" under "files".`,
        );
    }

    return files;
}

function set(target: ManifestObject, name: string, value: ManifestValue | undefined): void {
    if (value !== undefined) {
        target[name] = value;
    }
}

function convertInfo(raw: ManifestObject): ManifestObject {
    const info: ManifestObject = {};
    const author = readString(raw, 'author');
    const dependencies = readStrings(raw, 'dependencies');

    if (author !== null) {
        info['author'] = { name: author };
    }

    set(info, 'version', readString(raw, 'version') ?? undefined);
    set(info, 'description', readString(raw, 'description') ?? undefined);

    if (dependencies.length > 0) {
        info['dependencies'] = [...dependencies];
    }

    return info;
}

function convertEnvironment(raw: ManifestObject, notes: string[]): ManifestObject {
    const environment: ManifestObject = {};
    const compiler = readTable(raw, 'compiler') ?? {};
    const files = readTable(raw, 'environment') ?? {};
    const minVersion = readString(readTable(raw, 'engine') ?? {}, 'minVersion');
    const libraries = readStrings(raw, 'libraries');
    const secret = readString(files, 'file');
    const localFile = readString(files, 'localFile');

    if (secret !== null) {
        environment['secret'] = secret;
    }

    for (const option of LEGACY_COMPILER_FIELDS) {
        set(environment, option.name, readBoolean(compiler, option.name) ?? undefined);
    }

    if (minVersion !== null) {
        environment['version'] = { server: minVersion, client: minVersion };
    }

    if (libraries.length > 0) {
        environment['libraries'] = [...libraries];
    }

    if (localFile !== null && localFile !== '.env.local') {
        notes.push(`"environment.localFile" is removed. A resource reads one environment file, named by "environment.secret".`);
    }

    return environment;
}

function convertBuild(raw: ManifestObject): ManifestObject {
    const build: ManifestObject = {};
    const output = readTable(raw, 'output') ?? {};
    const details: ManifestObject = {};
    const outDir = readString(raw, 'outDir');

    for (const option of LEGACY_OUTPUT_FIELDS) {
        set(details, option.name, readBoolean(output, option.name) ?? undefined);
    }

    if (outDir !== null) {
        build['output'] = outDir;
    }

    if (Object.keys(details).length > 0) {
        build['details'] = details;
    }

    return build;
}

const DROPPED: readonly (readonly [string, string])[] = [
    ['helpers', '"helpers" is removed. Helper selection follows the code that needs them.'],
    ['contracts', '"contracts" is removed. The export contract directory is part of the build layout.'],
    ['serverPath', '"serverPath" belongs in ".luam.server".'],
    ['resourcesDir', '"resourcesDir" belongs in ".luam.server".'],
    ['development', '"development" is removed. Log capture belongs to ".luam.server".'],
];

export function convertLegacyManifest(raw: ManifestObject): LegacyConversion {
    const refusals: string[] = [];
    const notes: string[] = [];
    const value: ManifestObject = {};
    const info = convertInfo(raw);
    const environment = convertEnvironment(raw, notes);
    const scripts = convertScripts(raw, refusals);
    const files = convertFiles(raw, refusals);
    const build = convertBuild(raw);

    for (const [name, note] of DROPPED) {
        if (raw[name] !== undefined) {
            notes.push(note);
        }
    }

    if (Object.keys(info).length > 0) {
        value['info'] = info;
    }

    if (Object.keys(environment).length > 0) {
        value['environment'] = environment;
    }

    if (scripts.length > 0) {
        value['scripts'] = scripts;
    }

    if (files.length > 0) {
        value['files'] = files;
    }

    if (Object.keys(build).length > 0) {
        value['build'] = build;
    }

    return { value, refusals, notes };
}

export function legacyName(raw: ManifestObject): string | null {
    return readString(raw, 'name');
}

export function manifestFormWarning(position: SourcePosition): Diagnostic {
    return manifestWarning(
        MANIFEST_FORM,
        `This manifest is written as a list of assignments. A manifest is now one table of sections. Run "${MIGRATE_COMMAND}" to rewrite it; the assignment form is read for one minor and then removed.`,
        position,
    );
}

export function resourceNameWarning(name: string, folder: string, position: SourcePosition): Diagnostic {
    return manifestWarning(
        RESOURCE_NAME_MOVED,
        `"name" is removed and this resource is now called "${folder}" after the folder that holds its manifest, not "${name}". Rename the folder to keep the name.`,
        position,
    );
}

export function refusalDiagnostics(refusals: readonly string[], positions: PositionLookup): Diagnostic[] {
    return refusals.map((message) => manifestWarning(MIGRATION_REFUSED, message, positionAt(positions, 'assets')));
}

export function normalizeConverted(value: ManifestObject, fields: readonly ManifestField[], positions: PositionLookup): { value: ManifestObject; diagnostics: Diagnostic[] } {
    return normalizeFields(fields, isManifestObject(value) ? value : {}, positions);
}
