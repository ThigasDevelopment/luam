import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { writeResource } from '@cli/build/resource-writer';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';


import { createMemoryLogger } from './support/memory-logger';
import { createMockTransport } from './support/mock-transport';
import { parsesAsLua51, tokenTexts } from './support/lua-check';
import { BROKEN_SERVER, createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

import type { ResourceBuild } from '@compiler/project/resource';

const OFFLINE = { LUAM_OFFLINE: '1' };

const DEPLOYED = 'mta-server/mods/deathmatch/resources/luam-demo';

const ASSET = 'assets/logo.png';

const fixtures: ProjectFixture[] = [];

function projectFiles(bundle: boolean): Record<string, string> {
    return {
        ...defaultProjectFiles({
            serverPath: 'mta-server',
            output: { bundle, map: true },
            loadOrder: ['src/shared/config.luam'],
        }),
        'config.lua': 'Config = { greeting = "hi" } -- authored\n',
        '.env': 'TOKEN=secret\n',
        [ASSET]: 'binary-bytes\n',
    };
}

function project(bundle: boolean): ProjectFixture {
    const fixture = createProjectFixture(projectFiles(bundle));

    fixtures.push(fixture);

    return fixture;
}

function walk(root: string, directory = root, found: string[] = []): string[] {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const absolute = join(directory, entry.name);

        if (entry.isDirectory()) {
            walk(root, absolute, found);

            continue;
        }

        found.push(relative(root, absolute).replace(/\\/g, '/'));
    }

    return found.sort((left, right) => left.localeCompare(right));
}

function scripts(root: string, paths: readonly string[]): string[] {
    return paths.filter((path) => path.endsWith('.lua')).map((path) => readFileSync(resolve(root, path), 'utf8'));
}

async function build(fixture: ProjectFixture): Promise<number> {
    return runCli(['build', '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE });
}

async function ensure(fixture: ProjectFixture): Promise<number> {
    return runCli(['ensure', '--no-watch', '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE, transport: createMockTransport() });
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('production output', () => {
    it.each([
        ['tree', false],
        ['bundle', true],
    ])('writes every %s script on one line and leaves the rest untouched', async (_layout, bundle) => {
        const fixture = project(bundle);

        expect(await build(fixture)).toBe(EXIT_OK);

        const root = resolve(fixture.root, 'build/luam-demo');
        const paths = walk(root);

        expect(paths.filter((path) => path.endsWith('.lua')).length).toBeGreaterThan(0);

        for (const content of scripts(root, paths)) {
            expect(content).not.toContain('\n');
            expect(parsesAsLua51(content)).toBe(true);
        }

        expect(fixture.read('build/luam-demo/meta.xml')).toContain('\n');
        expect(fixture.read('build/luam-demo/.env')).toContain('\nTOKEN=');
        expect(fixture.read(`build/luam-demo/${ASSET}`)).toBe('binary-bytes\n');
    });

    it('covers all three environments, helpers, and config.lua in the tree layout', async () => {
        const fixture = project(false);

        expect(await build(fixture)).toBe(EXIT_OK);

        const paths = walk(resolve(fixture.root, 'build/luam-demo'));

        expect(paths).toContain('src/shared/config.lua');
        expect(paths).toContain('src/server/main.lua');
        expect(paths).toContain('src/client/hud.lua');
        expect(paths).toContain('config.lua');
        expect(paths.some((path) => path.startsWith('lib/'))).toBe(true);
        expect(fixture.read('build/luam-demo/config.lua')).toBe('Config={greeting="hi"}');
    });

    it('writes one bundle per environment and no mirrored tree', async () => {
        const fixture = project(true);

        expect(await build(fixture)).toBe(EXIT_OK);

        const paths = walk(resolve(fixture.root, 'build/luam-demo'));

        expect(paths).toContain('src/shared.lua');
        expect(paths).toContain('src/server.lua');
        expect(paths).toContain('src/client.lua');
        expect(paths).not.toContain('src/server/main.lua');
        expect(paths.some((path) => path.startsWith('lib/'))).toBe(false);
    });

    it('keeps the manifest, load order, and token stream of the readable tree', async () => {
        const fixture = project(false);

        expect(await ensure(fixture)).toBe(EXIT_OK);

        const readable = walk(resolve(fixture.root, DEPLOYED));
        const readableManifest = fixture.read(`${DEPLOYED}/meta.xml`);

        expect(await build(fixture)).toBe(EXIT_OK);

        const production = walk(resolve(fixture.root, 'build/luam-demo'));

        expect(production).toEqual(readable);
        expect(fixture.read('build/luam-demo/meta.xml')).toBe(readableManifest);

        for (const path of readable.filter((entry) => entry.endsWith('.lua'))) {
            const before = fixture.read(`${DEPLOYED}/${path}`);
            const after = fixture.read(`build/luam-demo/${path}`);

            expect(before, path).toContain('\n');
            expect(tokenTexts(after, path), path).toEqual(tokenTexts(before, path));
        }
    });

    it('marks the production map and leaves the readable output source-mappable', async () => {
        const fixture = project(false);

        expect(await build(fixture)).toBe(EXIT_OK);
        expect(JSON.parse(fixture.read('build/luam-demo.luam-map.json'))).toMatchObject({ minified: true });
        expect(await ensure(fixture)).toBe(EXIT_OK);
        expect(fixture.exists(`${DEPLOYED}/src/server/main.lua`)).toBe(true);
    });

    it('rewrites nothing when the sources have not changed', async () => {
        const fixture = project(true);

        expect(await build(fixture)).toBe(EXIT_OK);

        const root = resolve(fixture.root, 'build/luam-demo');
        const before = walk(root).map((path) => [path, statSync(resolve(root, path)).mtimeMs] as const);
        const logger = createMemoryLogger();

        expect(await runCli(['build', '--cwd', fixture.root], { logger, env: OFFLINE })).toBe(EXIT_OK);
        expect(logger.text()).toContain('Wrote 0 files');

        for (const [path, mtime] of before) {
            expect(statSync(resolve(root, path)).mtimeMs, path).toBe(mtime);
        }
    });

    it('writes and prunes nothing when the compilation fails', async () => {
        const fixture = project(false);

        expect(await build(fixture)).toBe(EXIT_OK);

        const before = walk(resolve(fixture.root, 'build/luam-demo'));

        fixture.write('src/server/main.luam', BROKEN_SERVER);
        fixture.write('src/server/extra.luam', 'local unused: number = 1\n');

        expect(await build(fixture)).toBe(EXIT_DIAGNOSTICS);
        expect(walk(resolve(fixture.root, 'build/luam-demo'))).toEqual(before);
    });

    it('writes and prunes nothing when a script does not scan as Lua 5.1', () => {
        const fixture = project(false);
        const target = resolve(fixture.root, 'build/luam-demo');

        fixture.write('build/luam-demo/stale.lua', 'print(1)\n');

        const broken: ResourceBuild = {
            manifest: '<meta />\n',
            scripts: [{ path: 'src/server.lua', source: 'src/server.luam', environment: 'server', content: 'local s = "open\n', lines: [] }],
            helpers: [],
            configuration: null,

            assets: [],
            bundles: [],
            layout: 'tree',
            map: null,
        };

        expect(() => writeResource(target, broken, { root: fixture.root, generatedFiles: [], generatedRoots: [], environmentTemplate: null, minify: true })).toThrow(
            'is not valid Lua 5.1',
        );
        expect(walk(target)).toEqual(['stale.lua']);
        expect(fixture.read('build/luam-demo/stale.lua')).toBe('print(1)\n');
    });
});
