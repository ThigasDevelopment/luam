import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
    automaticHelpers,
    DEVELOPMENT_RUNTIME_HELPERS,
    expandHelpers,
    FEATURE_HELPERS,
    helperDepth,
    helperForFeature,
    helperForGlobal,
    isRuntimeHelperName,
    manualHelpers,
    referenceHelpers,
    resolveHelperUrl,
    resolveDevelopmentHelperUrl,
    runtimeGlobals,
    RUNTIME_HELPERS,
    type RuntimeFeature,
    type RuntimeHelperName,
} from '@runtime/helpers';

const names = Object.keys(RUNTIME_HELPERS) as RuntimeHelperName[];

const features = Object.keys(FEATURE_HELPERS) as RuntimeFeature[];

const BEYOND_LUA_51: readonly RegExp[] = [/\bgoto\b/, /::[A-Za-z_]\w*::/, /[^-]\/\//, /<<|>>/, /\\z/, /\btable\.(pack|unpack)\b/, /\bmath\.type\b/];

function read(name: RuntimeHelperName): string {
    return readFileSync(fileURLToPath(resolveHelperUrl(name)), 'utf8');
}

describe('runtime helpers', () => {
    it.each(names)('ships %s as a standalone Lua file', (name) => {
        expect(existsSync(fileURLToPath(resolveHelperUrl(name)))).toBe(true);
        expect(read(name).length).toBeGreaterThan(0);
    });

    it('ships development helpers outside the configurable runtime catalog', () => {
        const development = Object.values(DEVELOPMENT_RUNTIME_HELPERS);

        expect(development.map((helper) => helper.environment).sort()).toEqual(['client', 'server']);
        expect(development.every((helper) => existsSync(fileURLToPath(resolveDevelopmentHelperUrl(helper.name))))).toBe(true);
        expect(isRuntimeHelperName('development-logs-client')).toBe(false);
        expect(isRuntimeHelperName('development-logs-server')).toBe(false);
    });

    it.each(names)('keeps %s free of require calls', (name) => {
        expect(read(name)).not.toContain('require(');
    });

    it('maps every feature to a helper that exists', () => {
        for (const feature of features) {
            expect(RUNTIME_HELPERS[helperForFeature(feature)]).toBeDefined();
        }
    });

    it('maps every class and enum feature to the class helper', () => {
        expect(helperForFeature('class-declaration')).toBe('class');
        expect(helperForFeature('class-inheritance')).toBe('class');
        expect(helperForFeature('class-instantiation')).toBe('class');
        expect(helperForFeature('super-call')).toBe('class');
        expect(helperForFeature('enum-declaration')).toBe('class');
    });

    it('lists every feature declared by a helper in the feature map', () => {
        for (const helper of Object.values(RUNTIME_HELPERS)) {
            for (const feature of helper.features) {
                expect(FEATURE_HELPERS[feature]).toBe(helper.name);
            }
        }
    });

    it('injects a helper from a language feature, a referenced global, or an opt-in', () => {
        expect(automaticHelpers()).toEqual(['class', 'math', 'string', 'table', 'validate']);
        expect(manualHelpers()).toEqual(['env']);
        expect(referenceHelpers()).toEqual(['async', 'promise', 'threads']);
    });

    it('names the globals that pull a library in', () => {
        expect(runtimeGlobals()).toEqual(['Async', 'Promise', 'Threads', 'delay', 'sleep']);
        expect(helperForGlobal('sleep')).toBe('promise');
        expect(helperForGlobal('delay')).toBe('promise');
        expect(helperForGlobal('Promise')).toBe('promise');
        expect(helperForGlobal('Threads')).toBe('threads');
        expect(helperForGlobal('Async')).toBe('async');
        expect(helperForGlobal('outputChatBox')).toBeNull();
    });

    it('pulls in what a library depends on', () => {
        expect(expandHelpers(['async']).sort()).toEqual(['async', 'promise', 'threads']);
        expect(expandHelpers(['threads']).sort()).toEqual(['promise', 'threads']);
        expect(expandHelpers(['promise'])).toEqual(['promise']);
        expect(expandHelpers([])).toEqual([]);
    });

    it('loads a library after everything it requires', () => {
        expect(helperDepth('promise')).toBeLessThan(helperDepth('threads'));
        expect(helperDepth('threads')).toBeLessThan(helperDepth('async'));
        expect(helperDepth('class')).toBe(0);
    });

    it('pins the environment helper to the server so deployment values never reach a client', () => {
        const pinned = Object.values(RUNTIME_HELPERS).filter((helper) => helper.environment !== undefined);

        expect(pinned.map((helper) => helper.name)).toEqual(['env']);
        expect(RUNTIME_HELPERS.env.requires).toBeUndefined();
        expect(names).not.toContain('dotenv');
    });

    it('recognizes only the helpers it ships', () => {
        expect(names.every(isRuntimeHelperName)).toBe(true);
        expect(isRuntimeHelperName('async')).toBe(true);
        expect(isRuntimeHelperName('promise')).toBe(true);
        expect(isRuntimeHelperName('coroutine')).toBe(false);
        expect(isRuntimeHelperName('toString')).toBe(false);
    });

    it('defines the class registry the framework loader scans', () => {
        const source = read('class');

        expect(source).toContain('function getClasses ()');
        expect(source).toContain('function bind (func, self)');
        expect(source).toContain('__super');
        expect(source).toContain('__name');
    });

    it('defines the global entry points the generated Lua calls', () => {
        const source = read('class');

        expect(source).toContain('function class (name)');
        expect(source).toContain('function new (name)');
        expect(source).toContain('function enum (names)');
    });

    it('extends the standard libraries the emitter rewrites to', () => {
        expect(read('table')).toContain('function table.size (');
        expect(read('string')).toContain('function string.template (');
        expect(read('math')).toContain('function math.clamp (');
    });

    it.each(names)('keeps %s free of syntax newer than Lua 5.1', (name) => {
        const source = read(name);

        for (const pattern of BEYOND_LUA_51) {
            expect(source).not.toMatch(pattern);
        }
    });

    it('builds one instance metatable and one constructor per class', () => {
        const source = read('class');

        expect(source).toContain('local constructors = { }');
        expect(source).toContain('constructors[definition] = constructor');
        expect(source).not.toMatch(/setmetatable\(\{\}, instanceMetatable\(/);
    });
});
