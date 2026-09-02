import { EMPTY_AMBIENT, mergeAmbient, type AmbientDeclarations } from '@compiler/checker/ambient';
import type { ProjectDeclarations } from '@compiler/checker/project-declarations';
import { ALL_ENVIRONMENTS, canReference, type Environment } from '@compiler/environment/environment';
import type { CompilerOptions } from '@compiler/manifest/manifest-defaults';

import { createDependencyGraph, type DependencyGraph } from './dependency-graph';
import { serializeAbi, type ResourceAbi } from './export-abi';
import { hashString } from './fingerprint';

export interface DeclarationEntry {
    path: string;
    isLibrary: boolean;
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
    const flags = [options.strict ? 'strict' : '', options.oop ? 'oop' : '', options.noUnusedLocals ? 'nul' : '', options.noUnusedParameters ? 'nup' : ''];

    return `${flags.join('|')}|${options.noImplicitGlobals ? 'nig' : ''}`;
}

export function declaresNothing(declarations: AmbientDeclarations): boolean {
    const { classes, interfaces, enums, aliases, globals, events } = declarations;

    return classes.length === 0 && interfaces.length === 0 && enums.length === 0 && aliases.length === 0 && globals.length === 0 && events.length === 0;
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

function isVisible(environment: Environment, isLibrary: boolean, provider: DeclarationEntry): boolean {
    return canReference(environment, provider.environment) && (!isLibrary || provider.isLibrary);
}

function scopeKey(environment: Environment, isLibrary: boolean): string {
    return `${environment}|${isLibrary ? 'library' : 'project'}`;
}

const SCOPES: readonly boolean[] = [false, true];

function environmentKeys(collected: readonly DeclarationEntry[]): ReadonlyMap<string, string> {
    const keys = new Map<string, string>();

    for (const environment of ALL_ENVIRONMENTS) {
        for (const isLibrary of SCOPES) {
            const visible = collected.filter((entry) => isVisible(environment, isLibrary, entry));

            keys.set(scopeKey(environment, isLibrary), hashString(visible.map((entry) => `${entry.path}=${entry.fingerprint}`).join(';')));
        }
    }

    return keys;
}

function createResolver(collected: readonly DeclarationEntry[]): (entry: DeclarationEntry) => AmbientDeclarations {
    const visible = new Map<string, DeclarationEntry[]>();
    const merged = new Map<string, AmbientDeclarations>();

    for (const environment of ALL_ENVIRONMENTS) {
        for (const isLibrary of SCOPES) {
            const key = scopeKey(environment, isLibrary);
            const entries = collected.filter((entry) => isVisible(environment, isLibrary, entry) && !declaresNothing(entry.declarations));

            visible.set(key, entries);
            merged.set(key, mergeAmbient(entries.map((entry) => entry.declarations)));
        }
    }

    return (entry: DeclarationEntry): AmbientDeclarations => {
        const key = scopeKey(entry.environment, entry.isLibrary);

        if (declaresNothing(entry.declarations)) {
            return merged.get(key) ?? EMPTY_AMBIENT;
        }

        const entries = visible.get(key) ?? [];

        return mergeAmbient(entries.filter((candidate) => candidate.path !== entry.path).map((candidate) => candidate.declarations));
    };
}

export function createAmbientScope(collected: readonly DeclarationEntry[], context: ScopeContext): AmbientScope {
    const graph = createDependencyGraph(collected);
    const base = baseKey(context);
    const fallback = environmentKeys(collected);

    return {
        graph,
        keyFor: (entry: DeclarationEntry): string =>
            hashString(`${base}|${graph.keyOf(entry.path) ?? fallback.get(scopeKey(entry.environment, entry.isLibrary)) ?? ''}`),
        resolve: createResolver(collected),
    };
}
