import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { createProjectCache } from '@compiler/project/project-cache';

import { editBody, editLeafDeclaration, editRootDeclaration, generateProject, removeFile } from '../bench/project-generator';

const CONFIG = `class Config {
    name: string = ''

    label = function (): string
        return self.name
    end
}
`;

const HELPER = `function describeConfig(config: Config): string
    return config:label()
end
`;

const SERVER = `local config = new Config()

print(describeConfig(config))
`;

const CLIENT = `local title: string = 'Luam'

print(title)
`;

function files(overrides: Readonly<Record<string, string | null>> = {}): ProjectFile[] {
    const sources: Record<string, string> = {
        'src/client/hud.luam': CLIENT,
        'src/server/main.luam': SERVER,
        'src/shared/config.luam': CONFIG,
        'src/shared/helper.luam': HELPER,
    };

    for (const [path, source] of Object.entries(overrides)) {
        if (source === null) {
            delete sources[path];

            continue;
        }

        sources[path] = source;
    }

    return Object.entries(sources).map(([path, source]) => ({ path, source }));
}

function shapeOf(result: ReturnType<typeof compileProject>): unknown {
    return {
        diagnostics: result.diagnostics,
        modules: result.modules.map((module) => [module.path, module.environment, module.code]),
    };
}

function replay(sequence: readonly ProjectFile[][]): void {
    const cache = createProjectCache();

    for (const step of sequence) {
        expect(shapeOf(cache.compile(step))).toEqual(shapeOf(compileProject(step)));
    }
}

describe('incremental analysis', () => {
    it('matches a clean analysis across an edit sequence', () => {
        replay([
            files(),
            files({ 'src/shared/config.luam': CONFIG.replace("name: string = ''", "name: string = ''\n    level: number = 1") }),
            files({ 'src/client/hud.luam': `${CLIENT}\nprint('more')\n` }),
            files({ 'src/shared/config.luam': CONFIG.replace('class Config', 'class Setup') }),
            files(),
        ]);
    });

    it('matches a clean analysis when a declaration disappears and comes back', () => {
        replay([files(), files({ 'src/shared/config.luam': null }), files(), files({ 'src/shared/helper.luam': null }), files()]);
    });

    it('matches a clean analysis when a declaration changes environment', () => {
        replay([
            files(),
            files({ 'src/shared/config.luam': `#!client\n\n${CONFIG}` }),
            files(),
            files({ 'src/shared/config.luam': null, 'src/client/config.luam': CONFIG }),
            files(),
        ]);
    });

    it('matches a clean analysis when a second file declares the same name', () => {
        replay([files(), files({ 'src/shared/duplicate.luam': CONFIG }), files({ 'src/shared/duplicate.luam': null }), files()]);
    });

    it('clears a diagnostic in a dependent once the declaration is restored', () => {
        const cache = createProjectCache();

        cache.compile(files());

        const broken = cache.compile(files({ 'src/shared/config.luam': null }));

        expect(broken.diagnostics.some((entry) => entry.path === 'src/shared/helper.luam')).toBe(true);

        const restored = cache.compile(files());

        expect(restored.diagnostics).toEqual([]);
    });

    it('reuses every module across repeated create and delete cycles', () => {
        const cache = createProjectCache();

        for (let round = 0; round < 5; round += 1) {
            cache.compile(files({ 'src/shared/extra.luam': 'function extraHelper(): void\nend\n' }));
            cache.compile(files({ 'src/shared/extra.luam': null }));
        }

        expect(cache.compile(files()).stats).toEqual({ files: 4, declarationsReused: 4, modulesReused: 4 });
    });

    it('keeps the generated fixtures free of diagnostics', () => {
        expect(compileProject(generateProject(3, 'sparse').files).diagnostics).toEqual([]);
        expect(compileProject(generateProject(3, 'dense').files).diagnostics).toEqual([]);
    });

    it('rechecks only the reverse closure of a generated project edit', () => {
        const project = generateProject(20, 'sparse');
        const cache = createProjectCache();

        cache.compile(project.files);

        expect(cache.compile(editLeafDeclaration(project)).stats.modulesReused).toBe(project.files.length - 1);
        expect(cache.compile(project.files).stats.modulesReused).toBe(project.files.length - 1);
        expect(cache.compile(editBody(project, project.clientPath)).stats.modulesReused).toBe(project.files.length - 1);
        expect(cache.compile(removeFile(project, project.leafPath)).stats.modulesReused).toBe(project.files.length - 2);
    });

    it('rechecks every dependent of a shared root in a dense project', () => {
        const project = generateProject(10, 'dense');
        const cache = createProjectCache();

        cache.compile(project.files);

        const edited = cache.compile(editRootDeclaration(project));

        expect(edited.stats.modulesReused).toBeLessThan(project.files.length - 1);
        expect(edited.diagnostics).toEqual([]);
    });
});
