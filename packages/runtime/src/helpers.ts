export type RuntimeHelperName = 'async' | 'class' | 'env' | 'math' | 'string' | 'table' | 'threads';

export type DevelopmentRuntimeHelperName = 'development-logs-client' | 'development-logs-server';

export type RuntimeInjection = 'automatic' | 'manual' | 'reference';

export type RuntimeHelperEnvironment = 'server' | 'client' | 'shared';

export type RuntimeFeature =
    | 'class-declaration'
    | 'class-inheritance'
    | 'class-instantiation'
    | 'super-call'
    | 'enum-declaration'
    | 'number-extension'
    | 'string-extension'
    | 'table-extension'
    | 'template-string'
    | 'thread';

export interface RuntimeHelperModule {
    name: RuntimeHelperName;
    file: string;
    injection: RuntimeInjection;
    features: RuntimeFeature[];
    globals?: string[];
    requires?: RuntimeHelperName[];
    environment?: RuntimeHelperEnvironment;
}

export interface DevelopmentRuntimeHelperModule {
    name: DevelopmentRuntimeHelperName;
    file: string;
    environment: 'server' | 'client';
}

export const RUNTIME_HELPERS: Readonly<Record<RuntimeHelperName, RuntimeHelperModule>> = {
    async: {
        name: 'async',
        file: 'async.lua',
        injection: 'reference',
        features: [],
        globals: ['Async'],
        requires: ['threads'],
    },
    class: {
        name: 'class',
        file: 'class.lua',
        injection: 'automatic',
        features: ['class-declaration', 'class-inheritance', 'class-instantiation', 'super-call', 'enum-declaration'],
    },
    env: { name: 'env', file: 'env.lua', injection: 'manual', features: [], environment: 'server' },
    math: { name: 'math', file: 'math.lua', injection: 'automatic', features: ['number-extension'] },
    string: { name: 'string', file: 'string.lua', injection: 'automatic', features: ['string-extension', 'template-string'] },
    table: { name: 'table', file: 'table.lua', injection: 'automatic', features: ['table-extension'] },
    threads: { name: 'threads', file: 'threads.lua', injection: 'reference', features: ['thread'], globals: ['sleep', 'Threads'] },
};

export const DEVELOPMENT_RUNTIME_HELPERS: Readonly<Record<DevelopmentRuntimeHelperName, DevelopmentRuntimeHelperModule>> = {
    'development-logs-client': {
        name: 'development-logs-client',
        file: 'development-logs-client.lua',
        environment: 'client',
    },
    'development-logs-server': {
        name: 'development-logs-server',
        file: 'development-logs-server.lua',
        environment: 'server',
    },
};

export const FEATURE_HELPERS: Readonly<Record<RuntimeFeature, RuntimeHelperName>> = {
    'class-declaration': 'class',
    'class-inheritance': 'class',
    'class-instantiation': 'class',
    'super-call': 'class',
    'enum-declaration': 'class',
    'number-extension': 'math',
    'string-extension': 'string',
    'table-extension': 'table',
    'template-string': 'string',
    thread: 'threads',
};

export function isRuntimeHelperName(value: string): value is RuntimeHelperName {
    return Object.hasOwn(RUNTIME_HELPERS, value);
}

export function manualHelpers(): RuntimeHelperName[] {
    return Object.values(RUNTIME_HELPERS)
        .filter((helper) => helper.injection === 'manual')
        .map((helper) => helper.name)
        .sort();
}

export function helperForFeature(feature: RuntimeFeature): RuntimeHelperName {
    return FEATURE_HELPERS[feature];
}

const GLOBAL_HELPERS: ReadonlyMap<string, RuntimeHelperName> = new Map(
    Object.values(RUNTIME_HELPERS).flatMap((helper) => (helper.globals ?? []).map((global): [string, RuntimeHelperName] => [global, helper.name])),
);

export function helperForGlobal(name: string): RuntimeHelperName | null {
    return GLOBAL_HELPERS.get(name) ?? null;
}

export function runtimeGlobals(): string[] {
    return [...GLOBAL_HELPERS.keys()].sort();
}

export function expandHelpers(names: Iterable<RuntimeHelperName>): RuntimeHelperName[] {
    const resolved = new Set<RuntimeHelperName>();

    function visit(name: RuntimeHelperName): void {
        if (resolved.has(name)) {
            return;
        }

        resolved.add(name);

        for (const required of RUNTIME_HELPERS[name].requires ?? []) {
            visit(required);
        }
    }

    for (const name of names) {
        visit(name);
    }

    return [...resolved];
}

export function helperDepth(name: RuntimeHelperName): number {
    const requires = RUNTIME_HELPERS[name].requires ?? [];

    return requires.length === 0 ? 0 : 1 + Math.max(...requires.map(helperDepth));
}

export function resolveHelperUrl(name: RuntimeHelperName): URL {
    return new URL(`../lua/${RUNTIME_HELPERS[name].file}`, import.meta.url);
}

export function resolveDevelopmentHelperUrl(name: DevelopmentRuntimeHelperName): URL {
    return new URL(`../lua/${DEVELOPMENT_RUNTIME_HELPERS[name].file}`, import.meta.url);
}

export function referenceHelpers(): RuntimeHelperName[] {
    return Object.values(RUNTIME_HELPERS)
        .filter((helper) => helper.injection === 'reference')
        .map((helper) => helper.name)
        .sort();
}

export function automaticHelpers(): RuntimeHelperName[] {
    return Object.values(RUNTIME_HELPERS)
        .filter((helper) => helper.injection === 'automatic')
        .map((helper) => helper.name)
        .sort();
}
