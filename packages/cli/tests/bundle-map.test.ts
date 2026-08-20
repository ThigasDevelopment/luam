import { statSync, utimesSync } from 'node:fs';

import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '@cli/cli/run';
import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, MANIFEST_FILE, manifestSource, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function project(output: { bundle: boolean; map: boolean }, serverPath?: string): ProjectFixture {
    const fixture = createProjectFixture(defaultProjectFiles({ output, ...(serverPath === undefined ? {} : { serverPath }) }));

    fixtures.push(fixture);

    return fixture;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('bundle and map output', () => {
    it('uses config defaults and materializes helper bytes into bundles', async () => {
        const fixture = createProjectFixture(defaultProjectFiles({ output: undefined }));
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/src/server.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/client.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/lib/string.lua')).toBe(false);
        expect(fixture.read('build/luam-demo/src/client.lua')).toContain('function string.template');
        expect(JSON.parse(fixture.read('build/luam-demo.luam-map.json'))).toMatchObject({ resource: 'luam-demo', layout: 'bundle', version: 1 });
        expect(logger.text()).toContain('(bundle layout)');
    });

    it('writes nothing on an identical second bundle build and keeps deterministic map bytes', async () => {
        const fixture = project({ bundle: true, map: true });
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_OK);

        const firstMap = fixture.read('build/luam-demo.luam-map.json');
        const outputs = ['src/shared.lua', 'src/server.lua', 'src/client.lua', 'meta.xml'].map((path) => `${fixture.root}/build/luam-demo/${path}`);
        const mapPath = `${fixture.root}/build/luam-demo.luam-map.json`;
        const timestamp = new Date('2000-01-01T00:00:00.000Z');

        for (const path of [...outputs, mapPath]) {
            utimesSync(path, timestamp, timestamp);
        }

        logger.lines.length = 0;

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_OK);
        expect(logger.text()).toContain('Wrote 0 files');
        expect(fixture.read('build/luam-demo.luam-map.json')).toBe(firstMap);
        expect([...outputs, mapPath].map((path) => statSync(path).mtime.toISOString())).toEqual(Array.from({ length: 5 }, () => timestamp.toISOString()));
    });

    it('uses fixed bundle paths for custom source directories and omits an empty client bundle', async () => {
        const fixture = createProjectFixture({
            [MANIFEST_FILE]: manifestSource({ name: 'luam-demo', sources: { server: ['code/server/**/*.luam'], client: ['code/client/**/*.luam'], shared: ['code/shared/**/*.luam'] }, output: { bundle: true, map: true } }),
            'code/shared/config.luam': "#!shared\nlocal name: string = 'demo'\n",
            'code/server/main.luam': '#!server\nprint(1)\n',
        });
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/src/shared.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/server.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/code/shared.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/src/client.lua')).toBe(false);
        expect(fixture.read('build/luam-demo/meta.xml')).not.toContain('client.lua');
        expect(JSON.parse(fixture.read('build/luam-demo.luam-map.json')).files.map((file: { path: string }) => file.path)).toEqual([
            'src/shared.lua',
            'src/server.lua',
        ]);
    });

    it('applies flags over config and prunes files when layouts switch', async () => {
        const fixture = project({ bundle: false, map: true });
        const logger = createMemoryLogger();

        fixture.write('build/luam-demo/src/notes.txt', 'keep\n');

        await runCli(['build', '--bundle'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists('build/luam-demo/src/server.lua')).toBe(true);

        await runCli(['build', '--no-bundle'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists('build/luam-demo/src/server.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/src/client.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/src/shared.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/src/server/main.lua')).toBe(true);
        expect(fixture.read('build/luam-demo/src/notes.txt')).toBe('keep\n');
        expect(JSON.parse(fixture.read('build/luam-demo.luam-map.json'))).toMatchObject({ layout: 'tree' });
    });

    it('prunes exact bundle files with a custom source directory without owning src', async () => {
        const fixture = project({ bundle: false, map: true });
        const logger = createMemoryLogger();

        fixture.write('code/shared/config.luam', fixture.read('src/shared/config.luam'));
        fixture.write('code/server/main.luam', `#!server\n${fixture.read('src/server/main.luam')}`);
        fixture.write('code/client/hud.luam', `#!client\n${fixture.read('src/client/hud.luam')}`);
        fixture.remove('src');
        fixture.write(MANIFEST_FILE, manifestSource({ name: 'luam-demo', sources: { server: ['code/server/**/*.luam'], client: ['code/client/**/*.luam'], shared: ['code/shared/**/*.luam'] }, output: { bundle: false, map: true } }));

        await runCli(['build', '--bundle'], { cwd: fixture.root, env: OFFLINE, logger });

        fixture.write('build/luam-demo/src/owned-by-user.txt', 'keep\n');

        await runCli(['build', '--no-bundle'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists('build/luam-demo/src/server.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/code/server/main.lua')).toBe(true);
        expect(fixture.read('build/luam-demo/src/owned-by-user.txt')).toBe('keep\n');
    });

    it('removes a previous map after a successful no-map build', async () => {
        const fixture = project({ bundle: false, map: true });
        const logger = createMemoryLogger();

        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists('build/luam-demo.luam-map.json')).toBe(true);

        await runCli(['build', '--no-map'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists('build/luam-demo.luam-map.json')).toBe(false);
    });

    it.each([
        {
            name: 'top-level return',
            source: 'print(1)\nreturn\n',
            message: 'contains a top-level return and cannot be included in a bundle. Remove the return or build the tree layout with "--no-bundle"',
        },
        {
            name: 'authored output collision',
            source: '#!server\nprint(1)\n',
            path: 'src/server.luam',
            sources: { server: ['src/*.luam'], client: [], shared: [] },
            message: 'produces "src/server.lua", which is reserved for the server bundle. Rename the source output or build the tree layout with "--no-bundle".',
        },
    ])('reports the $name and leaves no build output', async ({ message, path = 'src/server/main.luam', source, sources = undefined }) => {
        const fixture = createProjectFixture({
            [MANIFEST_FILE]: manifestSource({ name: 'luam-demo', sources, output: { bundle: true, map: true } }),
            [path]: source,
        });
        const logger = createMemoryLogger();

        fixtures.push(fixture);

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).not.toBe(EXIT_OK);
        expect(logger.text()).toContain(message);
        expect(fixture.exists('build')).toBe(false);
    });

    it('keeps ensure tree by default and allows an explicit bundle override', async () => {
        const fixture = project({ bundle: true, map: true }, 'mta-server');
        const logger = createMemoryLogger();
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        await runCli(['ensure', '--no-watch'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists(`${resource}/src/server/main.lua`)).toBe(true);
        expect(fixture.exists(`${resource}/src/server.lua`)).toBe(false);

        await runCli(['ensure', '--no-watch', '--bundle'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists(`${resource}/src/server/main.lua`)).toBe(false);
        expect(fixture.exists(`${resource}/src/server.lua`)).toBe(true);
    });

    it('keeps dev tree even when bundle output is configured', async () => {
        const fixture = project({ bundle: true, map: true }, 'mta-server');
        const logger = createMemoryLogger();
        const resource = 'mta-server/mods/deathmatch/resources/luam-demo';

        await runCli(['dev', '--no-watch'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists(`${resource}/src/server/main.lua`)).toBe(true);
        expect(fixture.exists(`${resource}/src/server.lua`)).toBe(false);
    });

    it('rejects a layout flag on dev instead of ignoring it', async () => {
        const fixture = project({ bundle: true, map: true }, 'mta-server');
        const logger = createMemoryLogger();

        expect(await runCli(['dev', '--no-watch', '--bundle'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain("unknown option '--bundle'");
    });
});
