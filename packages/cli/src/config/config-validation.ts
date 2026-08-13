import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import type { PositionLookup } from '@compiler/manifest/manifest-rules';
import type { ManifestObject } from '@compiler/manifest/manifest-value';
import { isRuntimeHelperName, type RuntimeHelperName } from '@runtime/helpers';

import type { LuamConfig, DevelopmentConfig, OutputConfig } from '@cli/config/config-schema';
import { validateTransport } from '@cli/config/transport-validation';
import { ValidationContext, type Environment } from '@cli/config/validation-context';
import { readBoolean, readNumber, readString, readStrings, readTable } from '@cli/config/value-readers';

export interface ValidatedConfig {
    config: LuamConfig | null;
    diagnostics: Diagnostic[];
}

const EMPTY: ManifestObject = {};

function readOutput(source: ManifestObject | null): OutputConfig {
    const table = source ?? EMPTY;

    return { bundle: readBoolean(table, 'bundle') ?? true, map: readBoolean(table, 'map') ?? true };
}

function readDevelopment(source: ManifestObject | null): DevelopmentConfig {
    const logs = readTable(source ?? EMPTY, 'logs') ?? EMPTY;

    return {
        logs: {
            enabled: readBoolean(logs, 'enabled') ?? false,
            maxMessageLength: readNumber(logs, 'maxMessageLength') ?? 0,
            rateLimit: readNumber(logs, 'rateLimit') ?? 0,
            rateWindowMs: readNumber(logs, 'rateWindowMs') ?? 0,
        },
    };
}

function readHelpers(source: ManifestObject): RuntimeHelperName[] {
    return [...new Set(readStrings(source, 'helpers').filter(isRuntimeHelperName))].sort();
}

export function validateConfig(value: ManifestObject, positions: PositionLookup, env: Environment): ValidatedConfig {
    const context = new ValidationContext(positions, env);
    const config: LuamConfig = {
        name: readString(value, 'name') ?? '',
        author: readString(value, 'author'),
        version: readString(value, 'version'),
        description: readString(value, 'description'),
        sourceDirs: readStrings(value, 'sourceDirs'),
        assetDirs: readStrings(value, 'assetDirs'),
        outDir: readString(value, 'outDir') ?? '',
        loadOrder: readStrings(value, 'loadOrder'),
        oop: readBoolean(value, 'oop') ?? false,
        helpers: readHelpers(value),
        serverPath: readString(value, 'serverPath'),
        resourcesDir: readString(value, 'resourcesDir') ?? '',
        output: readOutput(readTable(value, 'output')),
        transport: validateTransport(readTable(value, 'transport'), context),
        development: readDevelopment(readTable(value, 'development')),
    };

    return { config, diagnostics: context.diagnostics };
}
