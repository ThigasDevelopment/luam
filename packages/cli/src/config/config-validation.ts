import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import {
    readAuthor,
    readBuild,
    readCompilerOptions,
    readDependencies,
    readEngineVersions,
    readFiles,
    readLibraries,
    readScripts,
    readSecret,
    type GroupBreaks,
} from '@compiler/manifest/manifest-contract';
import { DEFAULT_CONTRACTS_DIR } from '@compiler/manifest/manifest-defaults';
import { DUPLICATE_LIBRARY, INVALID_DEPENDENCY } from '@compiler/manifest/manifest-diagnostics';
import { readString, readTable } from '@compiler/manifest/manifest-readers';
import type { PositionLookup } from '@compiler/manifest/manifest-rules';
import type { ManifestObject } from '@compiler/manifest/manifest-value';

import type { LuamConfig, OrderedName } from '@cli/config/config-schema';
import { ValidationContext } from '@cli/config/validation-context';

export interface ValidatedConfig {
    config: LuamConfig | null;
    diagnostics: Diagnostic[];
}

const DUPLICATE_DEPENDENCY = 'config-duplicate-dependency';

function checkDependencies(name: string, dependencies: readonly OrderedName[], context: ValidationContext): void {
    const seen = new Set<string>();

    for (const [index, dependency] of dependencies.entries()) {
        if (dependency.name === name) {
            context.error(INVALID_DEPENDENCY, `"info.dependencies" lists "${dependency.name}", which is this resource. Remove the entry.`, `info.dependencies.${index}`);
        }

        if (seen.has(dependency.name)) {
            context.error(
                DUPLICATE_DEPENDENCY,
                `"info.dependencies" lists "${dependency.name}" more than once. Keep one entry, in the position it should load.`,
                `info.dependencies.${index}`,
            );
        }

        seen.add(dependency.name);
    }
}

function checkLibraries(libraries: readonly OrderedName[], context: ValidationContext): void {
    const seen = new Set<string>();

    for (const [index, library] of libraries.entries()) {
        if (seen.has(library.name)) {
            context.error(DUPLICATE_LIBRARY, `"environment.libraries" lists "${library.name}" more than once. Keep one entry.`, `environment.libraries.${index}`);
        }

        seen.add(library.name);
    }
}

function isWritten(positions: PositionLookup, key: string): boolean {
    return positions.has(key);
}

export function validateConfig(name: string, value: ManifestObject, positions: PositionLookup, groups: GroupBreaks = new Set()): ValidatedConfig {
    const context = new ValidationContext(positions);
    const dependencies = readDependencies(value, groups);
    const libraries = readLibraries(value, groups);
    const build = readBuild(value);
    const info = readTable(value, 'info') ?? {};
    const config: LuamConfig = {
        name,
        author: readAuthor(value),
        version: readString(info, 'version'),
        description: readString(info, 'description'),
        dependencies,
        secret: readSecret(value),
        compilerOptions: readCompilerOptions(value),
        oopDeclared: isWritten(positions, 'environment.oop'),
        engine: readEngineVersions(value),
        libraries,
        scripts: readScripts(value, groups),
        files: readFiles(value, groups),
        contracts: DEFAULT_CONTRACTS_DIR,
        outDir: build.output,
        output: build.details,
    };

    checkDependencies(name, dependencies, context);
    checkLibraries(libraries, context);

    return { config, diagnostics: context.diagnostics };
}
