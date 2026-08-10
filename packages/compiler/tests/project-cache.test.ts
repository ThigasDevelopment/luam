import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { createProjectCache } from '@compiler/project/project-cache';
import { compileProject } from '@compiler/project/project';

const SHARED_CLASS = `class Config {
    name: string = ''

    constructor(name: string) {
        self.name = name
    }

    label(): string {
        return self.name
    }
}
`;

const SERVER_USE = `local config = new Config('demo')

print(config:label())
`;

const CLIENT_USE = `local title: string = 'Luam'

print(title)
`;

function project(shared: string, server: string, client: string): ProjectFile[] {
    return [
        { path: 'src/client/hud.luam', source: client },
        { path: 'src/server/main.luam', source: server },
        { path: 'src/shared/config.luam', source: shared },
    ];
}

function baseProject(): ProjectFile[] {
    return project(SHARED_CLASS, SERVER_USE, CLIENT_USE);
}

describe('project cache', () => {
    it('compiles everything on the first pass', () => {
        const cache = createProjectCache();
        const result = cache.compile(baseProject());

        expect(result.diagnostics).toEqual([]);
        expect(result.stats).toEqual({ files: 3, declarationsReused: 0, modulesReused: 0 });
    });

    it('reuses every module when nothing changed', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());

        const second = cache.compile(baseProject());

        expect(second.stats).toEqual({ files: 3, declarationsReused: 3, modulesReused: 3 });
        expect(second.diagnostics).toEqual([]);
    });

    it('rebuilds only the file that changed', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());

        const edited = cache.compile(project(SHARED_CLASS, SERVER_USE, `${CLIENT_USE}\nprint('edited')\n`));

        expect(edited.stats).toEqual({ files: 3, declarationsReused: 2, modulesReused: 2 });
        expect(edited.modules.find((module) => module.path === 'src/client/hud.luam')?.code).toContain('edited');
    });

    it('keeps dependents cached when an upstream body changes but declarations do not', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());

        const shared = SHARED_CLASS.replace('return self.name', "return self.name .. '!'");
        const edited = cache.compile(project(shared, SERVER_USE, CLIENT_USE));

        expect(edited.stats).toEqual({ files: 3, declarationsReused: 2, modulesReused: 2 });
    });

    it('invalidates dependents when an upstream declaration changes', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());

        const shared = SHARED_CLASS.replace("name: string = ''", "name: string = ''\n    level: number = 1");
        const edited = cache.compile(project(shared, SERVER_USE, CLIENT_USE));

        expect(edited.stats.declarationsReused).toBe(2);
        expect(edited.stats.modulesReused).toBe(0);
    });

    it('reports the same diagnostics as a cold compile after an edit', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());

        const server = `${SERVER_USE}\nlocal broken: number = 'text'\n`;
        const files = project(SHARED_CLASS, server, CLIENT_USE);
        const warm = cache.compile(files);
        const cold = compileProject(files);

        expect(warm.diagnostics).toEqual(cold.diagnostics);
        expect(warm.hasErrors).toBe(true);
    });

    it('produces the same modules as a cold compile once a diagnostic is fixed', () => {
        const cache = createProjectCache();
        const broken = project(SHARED_CLASS, `${SERVER_USE}\nlocal broken: number = 'text'\n`, CLIENT_USE);

        cache.compile(broken);

        const warm = cache.compile(baseProject());
        const cold = compileProject(baseProject());

        expect(warm.diagnostics).toEqual([]);
        expect(warm.modules.map((module) => module.code)).toEqual(cold.modules.map((module) => module.code));
    });

    it('drops cached entries for files that disappeared', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());

        const reduced = cache.compile(baseProject().filter((file) => file.path !== 'src/client/hud.luam'));

        expect(reduced.stats).toEqual({ files: 2, declarationsReused: 2, modulesReused: 2 });

        const restored = cache.compile(baseProject());

        expect(restored.stats.modulesReused).toBe(2);
        expect(restored.diagnostics).toEqual([]);
    });

    it('recompiles everything after the cache is cleared', () => {
        const cache = createProjectCache();

        cache.compile(baseProject());
        cache.clear();

        expect(cache.compile(baseProject()).stats).toEqual({ files: 3, declarationsReused: 0, modulesReused: 0 });
    });
});
