import { builtinSymbols } from '@compiler/checker/globals';
import { createDiagnostic, type SourcePosition } from '@compiler/diagnostics/diagnostic';
import { canReference, type Environment } from '@compiler/environment/environment';

import { occupiedSides, sidesOf, type ManifestContribution } from './manifest';
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

interface GlobalOwner {
    module: CompiledModule;
    position: SourcePosition;
}

const LIBRARY_COLLISION = 'project-library-collision';

const LIBRARY_SHADOWS_API = 'project-library-shadows-api';

function describeOwner(owner: GlobalOwner): string {
    return owner.module.origin === null ? `the project file "${owner.module.path}"` : `the library "${owner.module.origin.package}"`;
}

interface Collision {
    name: string;
    intruder: GlobalOwner;
    other: GlobalOwner;
    sides: Environment[];
}

function describeSides(sides: readonly Environment[]): string {
    return sides.length > 1 ? '"shared"' : `"${sides[0] ?? 'shared'}"`;
}

function collisionDiagnostic(collision: Collision): FileDiagnostic {
    const { name, intruder, other } = collision;
    const subject = `"${name}" is declared by ${describeOwner(intruder)} and by ${describeOwner(other)} on the ${describeSides(collision.sides)} side`;
    const message = `${subject}. MTA keeps one global per name, so one silently replaces the other. Stop using one of them.`;

    return { path: intruder.module.path, diagnostic: createDiagnostic('project', LIBRARY_COLLISION, message, intruder.position) };
}

function recordCollision(collisions: Map<string, Collision>, name: string, side: Environment, first: GlobalOwner, next: GlobalOwner): void {
    if (first.module.origin === null && next.module.origin === null) {
        return;
    }

    const intruder = next.module.origin === null ? first : next;
    const other = intruder === next ? first : next;
    const key = `${name}:${intruder.module.path}:${other.module.path}`;
    const found = collisions.get(key);

    if (found === undefined) {
        collisions.set(key, { name, intruder, other, sides: [side] });

        return;
    }

    found.sides.push(side);
}

export function validateLibraryGlobals(modules: readonly CompiledModule[]): FileDiagnostic[] {
    const owners = new Map<string, GlobalOwner>();
    const collisions = new Map<string, Collision>();

    if (!modules.some((module) => module.origin !== null)) {
        return [];
    }

    for (const module of modules) {
        for (const [name, position] of module.declaredGlobals) {
            for (const side of sidesOf(module.environment)) {
                const key = `${side}:${name}`;
                const first = owners.get(key);

                if (first === undefined) {
                    owners.set(key, { module, position });

                    continue;
                }

                recordCollision(collisions, name, side, first, { module, position });
            }
        }
    }

    return [...collisions.values()].map(collisionDiagnostic);
}

function shadowsApi(name: string, sides: readonly Environment[]): Environment | null {
    return sides.find((side) => builtinSymbols(side).has(name)) ?? null;
}

export function validateLibraryApiShadowing(modules: readonly CompiledModule[]): FileDiagnostic[] {
    const diagnostics: FileDiagnostic[] = [];

    for (const module of modules) {
        if (module.origin === null) {
            continue;
        }

        for (const [name, position] of module.declaredGlobals) {
            const side = shadowsApi(name, sidesOf(module.environment));

            if (side === null) {
                continue;
            }

            const subject = `The library "${module.origin.package}" declares "${name}", which the MTA API defines for the "${side}" side`;
            const message = `${subject}. Every file in the resource sees the library's version. Keep it only if the library means to wrap it.`;

            diagnostics.push({ path: module.path, diagnostic: createDiagnostic('project', LIBRARY_SHADOWS_API, message, position, 'warning') });
        }
    }

    return diagnostics;
}

function projectReferenceDiagnostic(module: CompiledModule, symbol: ModuleSymbol, position: SourcePosition): FileDiagnostic {
    const subject = `"${symbol.name}" is declared by the project file "${symbol.path}" and cannot be used from the library "${module.origin?.package ?? ''}"`;
    const message = `${subject}. A library sees only its own files and the libraries it requires.`;

    return { path: module.path, diagnostic: createDiagnostic('project', 'project-library-project-reference', message, position) };
}

export function validateModuleReferences(modules: readonly CompiledModule[]): FileDiagnostic[] {
    const symbols = buildSymbolTable(modules);
    const libraries = new Set(modules.filter((module) => module.origin !== null).map((module) => module.path));
    const diagnostics: FileDiagnostic[] = [];

    for (const module of modules) {
        for (const [name, position] of module.externalReferences) {
            const symbol = symbols.get(name);

            if (symbol === undefined || symbol.path === module.path) {
                continue;
            }

            if (module.origin !== null && !libraries.has(symbol.path)) {
                diagnostics.push(projectReferenceDiagnostic(module, symbol, position));

                continue;
            }

            if (canReference(module.environment, symbol.environment)) {
                continue;
            }

            diagnostics.push(referenceDiagnostic(module, symbol, position));
        }
    }

    return diagnostics;
}
