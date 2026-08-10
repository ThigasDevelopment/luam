import { createDiagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { canReference, type Environment } from '@compiler/environment/environment';

import { occupiedSides, type ManifestContribution } from './manifest';
import type { CompiledModule, FileDiagnostic } from './module';

export interface ModuleSymbol {
    name: string;
    path: string;
    environment: Environment;
    position: SourcePosition;
}

export function buildSymbolTable(modules: readonly CompiledModule[]): Map<string, ModuleSymbol> {
    const symbols = new Map<string, ModuleSymbol>();

    for (const module of modules) {
        for (const [name, position] of module.declaredGlobals) {
            if (!symbols.has(name)) {
                symbols.set(name, { name, path: module.path, environment: module.environment, position });
            }
        }
    }

    return symbols;
}

function referenceDiagnostic(module: CompiledModule, symbol: ModuleSymbol, position: SourcePosition): FileDiagnostic {
    const subject = `"${symbol.name}" is declared in the "${symbol.environment}" module "${symbol.path}"`;
    const message = `${subject} and cannot be used from a "${module.environment}" file.`;

    return { path: module.path, diagnostic: createDiagnostic('project', 'project-environment-import', message, position) };
}

function exportConflict(contribution: ManifestContribution, side: Environment, owner: string): FileDiagnostic['diagnostic'] {
    const subject = `"${contribution.name}" is already exported for the "${side}" side by "${owner}"`;
    const message = `${subject}. MTA keeps one export per name and silently drops the other.`;

    return createDiagnostic('project', 'project-duplicate-export', message, contribution.position);
}

export function validateContributions(modules: readonly CompiledModule[]): FileDiagnostic[] {
    const owners = new Map<string, string>();
    const diagnostics: FileDiagnostic[] = [];

    for (const module of modules) {
        for (const contribution of module.contributions) {
            for (const side of occupiedSides(contribution)) {
                const key = `${side}:${contribution.name}`;
                const owner = owners.get(key);

                if (owner === undefined) {
                    owners.set(key, module.path);

                    continue;
                }

                diagnostics.push({ path: module.path, diagnostic: exportConflict(contribution, side, owner) });
            }
        }
    }

    return diagnostics;
}

export function validateModuleReferences(modules: readonly CompiledModule[]): FileDiagnostic[] {
    const symbols = buildSymbolTable(modules);
    const diagnostics: FileDiagnostic[] = [];

    for (const module of modules) {
        for (const [name, position] of module.externalReferences) {
            const symbol = symbols.get(name);

            if (symbol === undefined || symbol.path === module.path || canReference(module.environment, symbol.environment)) {
                continue;
            }

            diagnostics.push(referenceDiagnostic(module, symbol, position));
        }
    }

    return diagnostics;
}
