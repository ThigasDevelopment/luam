import {
    DEFAULT_ASSET_DIRS,
    DEFAULT_OOP,
    DEFAULT_OUT_DIR,
    DEFAULT_RESOURCES_DIR,
    DEFAULT_SOURCE_DIRS,
    isValidResourceName,
    type LuamConfig,
} from '@cli/config/config-schema';
import { validateDevelopment } from '@cli/config/development-validation';
import { validateTransport, type Environment } from '@cli/config/transport-validation';
import {
    isRawObject,
    readBoolean,
    readObject,
    readString,
    readStringArray,
    rejectUnknownFields,
    describe,
    type RawObject,
} from '@cli/config/value-readers';
import { cliError, hasCliErrors, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import { isRuntimeHelperName, RUNTIME_HELPERS, type RuntimeHelperName } from '@runtime/helpers';

export interface ValidatedConfig {
    config: LuamConfig | null;
    diagnostics: CliDiagnostic[];
}

const KNOWN_FIELDS = [
    'name',
    'author',
    'version',
    'description',
    'sourceDirs',
    'assetDirs',
    'outDir',
    'loadOrder',
    'oop',
    'helpers',
    'serverPath',
    'resourcesDir',
    'transport',
    'development',
];

const INVALID_ROOT = 'config-invalid-root';

const MISSING_FIELD = 'config-missing-field';

const INVALID_NAME = 'config-invalid-name';

const ESCAPING_PATH = 'config-escaping-path';

const UNKNOWN_HELPER = 'config-unknown-helper';

function isContainedPath(value: string): boolean {
    const normalized = value.replace(/\\/g, '/');

    return !normalized.startsWith('/') && !/^[A-Za-z]:/.test(normalized) && !normalized.split('/').includes('..');
}

function readContainedPath(source: RawObject, field: string, fallback: string, diagnostics: CliDiagnostic[]): string {
    const value = readString(source, field, diagnostics);

    if (value === null) {
        return fallback;
    }

    if (!isContainedPath(value)) {
        diagnostics.push(cliError(ESCAPING_PATH, `"${field}" must stay inside the project directory but received "${value}".`));

        return fallback;
    }

    return value.replace(/\\/g, '/').replace(/\/+$/, '');
}

function readContainedPaths(source: RawObject, field: string, fallback: readonly string[], diagnostics: CliDiagnostic[]): string[] {
    const values = readStringArray(source, field, diagnostics);

    if (values === null) {
        return [...fallback];
    }

    const contained = values.filter((value) => isContainedPath(value));

    for (const value of values.filter((entry) => !contained.includes(entry))) {
        diagnostics.push(cliError(ESCAPING_PATH, `"${field}" must stay inside the project directory but received "${value}".`));
    }

    return contained.map((value) => value.replace(/\\/g, '/').replace(/\/+$/, ''));
}

function readHelpers(source: RawObject, diagnostics: CliDiagnostic[]): RuntimeHelperName[] {
    const values = readStringArray(source, 'helpers', diagnostics);

    if (values === null) {
        return [];
    }

    const known = Object.keys(RUNTIME_HELPERS).sort().join('", "');

    for (const value of values.filter((entry) => !isRuntimeHelperName(entry))) {
        diagnostics.push(cliError(UNKNOWN_HELPER, `"helpers" received "${value}", which is not a runtime helper. Known helpers: "${known}".`));
    }

    return [...new Set(values.filter(isRuntimeHelperName))].sort();
}

function readName(source: RawObject, diagnostics: CliDiagnostic[]): string | null {
    const name = readString(source, 'name', diagnostics);

    if (name === null) {
        diagnostics.push(cliError(MISSING_FIELD, 'The configuration requires a "name" field with the resource name.'));

        return null;
    }

    if (!isValidResourceName(name)) {
        diagnostics.push(cliError(INVALID_NAME, `"name" must be a valid MTA resource name but received "${name}".`));

        return null;
    }

    return name;
}

export function validateConfig(raw: unknown, env: Environment): ValidatedConfig {
    const diagnostics: CliDiagnostic[] = [];

    if (!isRawObject(raw)) {
        diagnostics.push(cliError(INVALID_ROOT, `The configuration must be a JSON object but received ${describe(raw)}.`));

        return { config: null, diagnostics };
    }

    rejectUnknownFields(raw, KNOWN_FIELDS, '', diagnostics);

    const name = readName(raw, diagnostics);
    const config: LuamConfig = {
        name: name ?? '',
        author: readString(raw, 'author', diagnostics),
        version: readString(raw, 'version', diagnostics),
        description: readString(raw, 'description', diagnostics),
        sourceDirs: readContainedPaths(raw, 'sourceDirs', DEFAULT_SOURCE_DIRS, diagnostics),
        assetDirs: readContainedPaths(raw, 'assetDirs', DEFAULT_ASSET_DIRS, diagnostics),
        outDir: readContainedPath(raw, 'outDir', DEFAULT_OUT_DIR, diagnostics),
        loadOrder: readContainedPaths(raw, 'loadOrder', [], diagnostics),
        oop: readBoolean(raw, 'oop', diagnostics) ?? DEFAULT_OOP,
        helpers: readHelpers(raw, diagnostics),
        serverPath: readString(raw, 'serverPath', diagnostics),
        resourcesDir: readContainedPath(raw, 'resourcesDir', DEFAULT_RESOURCES_DIR, diagnostics),
        transport: validateTransport(readObject(raw, 'transport', diagnostics), diagnostics, env),
        development: validateDevelopment(readObject(raw, 'development', diagnostics), diagnostics),
    };

    if (hasCliErrors(diagnostics)) {
        return { config: null, diagnostics };
    }

    return { config, diagnostics };
}
