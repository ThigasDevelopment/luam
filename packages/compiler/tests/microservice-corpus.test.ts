import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

import { runResource } from './support/resource-vm';

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url));

function readProject(name: string): ProjectFile[] {
    const root = join(fixtures, name);
    const files: ProjectFile[] = [];

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.luam')) {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        files.push({ path: relative(root, absolute).split(sep).join('/'), source: readFileSync(absolute, 'utf8') });
    }

    return files.sort((left, right) => left.path.localeCompare(right.path));
}

const project = compileProject(readProject('microservice'));

function run(source: string): string | null {
    const outcome = runResource(project, source);

    if (outcome.error !== null) {
        throw new Error(outcome.error);
    }

    return outcome.result;
}

describe('the microservice corpus', () => {
    it('compiles the resource with no diagnostics', () => {
        expect(project.diagnostics).toEqual([]);
        expect(project.hasErrors).toBe(false);
    });

    it('names the promise helper and nothing it does not use', () => {
        expect([...new Set(project.modules.flatMap((module) => module.requiredHelpers))].sort()).toEqual(['promise']);
    });

    it('loads the emitted Lua under Lua 5.1', () => {
        expect(run("result = tostring(type(request)) .. ':' .. tostring(type(serve))")).toBe('function:function');
    });

    it('resolves a request that an event handler answers on the same tick', () => {
        expect(
            run(`
                local task = readGarage('thigas')

                result = tostring(task.state) .. ':' .. tostring(task.values[1].owner) .. ':' .. tostring(task.values[1].slots)
            `),
        ).toBe('fulfilled:thigas:4');
    });

    it('rejects instead of hanging when the handler refuses', () => {
        expect(
            run(`
                local task = readOrReport('garage.fail')

                result = tostring(task.state) .. ':' .. tostring(task.values[1])
            `),
        ).toBe('fulfilled:the garage is closed');
    });

    it('rejects a request no handler serves', () => {
        expect(
            run(`
                local task = readOrReport('garage.missing')

                result = tostring(task.values[1])
            `),
        ).toBe('no handler answers "garage.missing"');
    });

    it('leaves a request nobody answers suspended and holds nothing for it', () => {
        expect(
            run(`
                local task = readOrReport('garage.silent')
                local held = 'none'

                for key, value in pairs(task) do
                    if type(value) == 'thread' then
                        held = tostring(key)
                    end
                end

                result = tostring(task.state) .. ':' .. held .. ':' .. tostring(task.values.n)
            `),
        ).toBe('pending:none:0');
    });
});
