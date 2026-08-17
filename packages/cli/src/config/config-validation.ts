import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import {
    readAssetMappings,
    readCompilerOptions,
    readDependencies,
    readEngine,
    readEnvironmentFiles,
    readOutputSettings,
    readSourceMapping,
} from '@compiler/manifest/manifest-contract';
import { INVALID_DEPENDENCY } from '@compiler/manifest/manifest-diagnostics';
import { readBoolean, readNumber, readString, readStrings, readTable } from '@compiler/manifest/manifest-readers';
import type { PositionLookup } from '@compiler/manifest/manifest-rules';
import type { ManifestObject } from '@compiler/manifest/manifest-value';
import { isRuntimeHelperName, type RuntimeHelperName } from '@runtime/helpers';

import type { LuamConfig, DevelopmentConfig } from '@cli/config/config-schema';
import { validateTransport } from '@cli/config/transport-validation';
import { ValidationContext, type Environment } from '@cli/config/validation-context';

export interface ValidatedConfig {
    config: LuamConfig | null;
    diagnostics: Diagnostic[];
}

const EMPTY: ManifestObject = {};

function readDevelopment(source: ManifestObject | null): DevelopmentConfig {
    const logs = readTable(source ?? EMPTY, 'logs') ?? EMPTY;
    const server = readTable(source ?? EMPTY, 'server') ?? EMPTY;

    return {
        logs: {
            enabled: readBoolean(logs, 'enabled') ?? false,
            maxMessageLength: readNumber(logs, 'maxMessageLength') ?? 0,
            rateLimit: readNumber(logs, 'rateLimit') ?? 0,
            rateWindowMs: readNumber(logs, 'rateWindowMs') ?? 0,
        },
        server: {
            executable: readString(server, 'executable'),
        },
    };
}

function readHelpers(source: ManifestObject): RuntimeHelperName[] {
    return [...new Set(readStrings(source, 'helpers').filter(isRuntimeHelperName))].sort();
}

function checkDependencies(name: string, dependencies: readonly string[], context: ValidationContext): void {
    for (const [index, dependency] of dependencies.entries()) {
        if (dependency === name) {
            context.error(INVALID_DEPENDENCY, `"dependencies" lists "${dependency}", which is this resource. Remove the entry.`, `dependencies.${index}`);
        }
    }
}

export function validateConfig(value: ManifestObject, positions: PositionLookup, env: Environment): ValidatedConfig {
    const context = new ValidationContext(positions, env);
    const name = readString(value, 'name') ?? '';
    const dependencies = readDependencies(value);
    const config: LuamConfig = {
        name,
        author: readString(value, 'author'),
        version: readString(value, 'version'),
        description: readString(value, 'description'),
        compilerOptions: readCompilerOptions(value),
        sources: readSourceMapping(value),
        assets: readAssetMappings(value),
        dependencies,
        engine: readEngine(value),
        environment: readEnvironmentFiles(value),
        outDir: readString(value, 'outDir') ?? '',
        loadOrder: readStrings(value, 'loadOrder'),
        helpers: readHelpers(value),
        serverPath: readString(value, 'serverPath'),
        resourcesDir: readString(value, 'resourcesDir') ?? '',
        output: readOutputSettings(value),
        transport: validateTransport(readTable(value, 'transport'), context),
        development: readDevelopment(readTable(value, 'development')),
    };

    checkDependencies(name, dependencies, context);

    return { config, diagnostics: context.diagnostics };
}
