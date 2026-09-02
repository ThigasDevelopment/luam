import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

const REGISTRY = fileURLToPath(new URL('./fixtures/class-registry', import.meta.url));

const FRAMEWORK = fileURLToPath(new URL('../../../examples/framework', import.meta.url));

const REGISTRY_ORDER: readonly string[] = ['adapters.luam', 'events.luam', 'listeners.luam', 'core.luam'];

function read(root: string, names: readonly string[], side: string): ProjectFile[] {
    return names.map((name) => ({ path: `src/${side}/${name}`, source: readFileSync(join(root, name), 'utf8') }));
}

function codes(files: readonly ProjectFile[]): string[] {
    return compileProject(files).diagnostics.map((entry) => entry.diagnostic.code);
}

describe('the class registry replaces a runtime-named instantiation', () => {
    it('compiles the three loading modules the port needed', () => {
        expect(codes(read(REGISTRY, REGISTRY_ORDER, 'server'))).toEqual([]);
    });

    it('checks the constructor of every registered class', () => {
        const source = readFileSync(join(REGISTRY, 'core.luam'), 'utf8').replace('new RedisAdapter(self)', 'new RedisAdapter()');
        const files = [...read(REGISTRY, REGISTRY_ORDER.slice(0, 3), 'server'), { path: 'src/server/core.luam', source }];

        expect(codes(files)).toEqual(['check-argument-count']);
    });

    it('types the value a registry entry holds', () => {
        const source = `${readFileSync(join(REGISTRY, 'core.luam'), 'utf8')}\nlocal core = new Core()\n\nprint(core.adapters['redis']:reconnect())\n`;
        const files = [...read(REGISTRY, REGISTRY_ORDER.slice(0, 3), 'server'), { path: 'src/server/core.luam', source }];

        expect(codes(files)).toEqual(['check-unknown-member']);
    });
});

describe('the framework sketches', () => {
    it('compile as a shared project', () => {
        const names = readdirSync(FRAMEWORK).filter((name) => name.endsWith('.luam') && !name.startsWith('bootstrap-'));
        const found = codes(read(FRAMEWORK, names, 'shared'));

        expect(found).toEqual([]);
    });

    it('keeps getClass as the untyped escape hatch', () => {
        expect(compile("local definition = getClass('Listener')\n\nprint(definition)\n").diagnostics).toEqual([]);
    });
});
