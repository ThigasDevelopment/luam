import { EMPTY_AMBIENT, mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import type { ProjectDeclarations } from '@compiler/checker/project-declarations';
import { ALL_ENVIRONMENTS, canReference, type Environment } from '@compiler/environment/environment';
import type { CompilerOptions } from '@compiler/manifest/manifest-defaults';

import { createDependencyGraph, type DependencyGraph } from './dependency-graph';
import { serializeAbi, type ResourceAbi } from './export-abi';
import { hashString } from './fingerprint';

export interface DeclarationEntry {
    path: string;
    hash: string;
    environment: Environment;
    declarations: AmbientDeclarations;
    externalReferences: readonly string[];
    fingerprint: string;
    provides: ReadonlyMap<string, string>;
    requires: ReadonlySet<string>;
}

export interface ScopeContext {
    project: ProjectDeclarations;
    contracts: readonly ResourceAbi[];
    references: ReadonlySet<string>;
    options: CompilerOptions;
    development: boolean;
}

export interface AmbientScope {
    graph: DependencyGraph;
    keyFor(entry: DeclarationEntry): string;
    resolve(entry: DeclarationEntry): AmbientDeclarations;
}

export function optionsKey(options: CompilerOptions): string {
    return `${options.strict ? 'strict' : ''}|${options.oop ? 'oop' : ''}|${options.noUnusedLocals ? 'nul' : ''}|${options.noUnusedParameters ? 'nup' : ''}`;
}

export function declaresNothing(declarations: AmbientDeclarations): boolean {
    const { classes, interfaces, enums, globals, events } = declarations;

    return classes.length === 0 && interfaces.length === 0 && enums.length === 0 && globals.length === 0 && events.length === 0;
}

export function sharedEnums(collected: readonly DeclarationEntry[]): ReadonlySet<string> {
    const declared = new Set(collected.flatMap((entry) => entry.declarations.enums.map((enumeration) => enumeration.name)));

    if (declared.size === 0) {
        return declared;
    }

    return new Set(collected.flatMap((entry) => entry.externalReferences.filter((name) => declared.has(name))));
}

function baseKey(context: ScopeContext): string {
    const mode = context.development ? 'development' : 'release';

    const contracts = context.contracts.map((contract) => serializeAbi(contract)).join(';');

    return `${optionsKey(context.options)}|${mode}|${JSON.stringify(context.project.globals)}|${[...context.references].sort().join(',')}|${hashString(contracts)}`;
}

function environmentKeys(collected: readonly DeclarationEntry[]): Readonly<Record<Environment, string>> {
    const keys: Partial<Record<Environment, string>> = {};

    for (const environment of ALL_ENVIRONMENTS) {
        const visible = collected.filter((entry) => canReference(environment, entry.environment));

        keys[environment] = hashString(visible.map((entry) => `${entry.path}=${entry.fingerprint}`).join(';'));
    }

    return keys as Readonly<Record<Environment, string>>;
}

function createResolver(collected: readonly DeclarationEntry[]): (entry: DeclarationEntry) => AmbientDeclarations {
    const visible = new Map<Environment, DeclarationEntry[]>();
    const merged = new Map<Environment, AmbientDeclarations>();

    for (const environment of ALL_ENVIRONMENTS) {
        const entries = collected.filter((entry) => canReference(environment, entry.environment) && !declaresNothing(entry.declarations));

        visible.set(environment, entries);
        merged.set(environment, mergeAmbient(entries.map((entry) => entry.declarations)));
    }

    return (entry: DeclarationEntry): AmbientDeclarations => {
        if (declaresNothing(entry.declarations)) {
            return merged.get(entry.environment) ?? EMPTY_AMBIENT;
        }

        const entries = visible.get(entry.environment) ?? [];

        return mergeAmbient(entries.filter((candidate) => candidate.path !== entry.path).map((candidate) => candidate.declarations));
    };
}

export function createAmbientScope(collected: readonly DeclarationEntry[], context: ScopeContext): AmbientScope {
    const graph = createDependencyGraph(collected);
    const base = baseKey(context);
    const fallback = environmentKeys(collected);

    return {
        graph,
        keyFor: (entry: DeclarationEntry): string => hashString(`${base}|${graph.keyOf(entry.path) ?? fallback[entry.environment]}`),
        resolve: createResolver(collected),
    };
}
