import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_OK } from '@cli/cli/exit-codes';

import { asyncPackage, collectionsPackage, consumerFiles, libraryProject, ASYNC, COLLECTIONS } from './support/library-fixture';
import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const COLLECTIONS_ROOT = 'libs/luam-fixture-collections';

interface Harness {
    fixture: ProjectFixture;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, context: { root: fixture.root, config, logger: createMemoryLogger() } };
}

function output(fixture: ProjectFixture, path: string): string {
    return fixture.read(`build/luam-demo/${path}`);
}

function exists(fixture: ProjectFixture, path: string): boolean {
    return fixture.exists(`build/luam-demo/${path}`);
}

function scriptOrder(manifest: string): string[] {
    return [...manifest.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1] ?? '');
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('library output', () => {
    it('compiles a library into the resource and lets the project extend its class', async () => {
        const { context, fixture } = harness(libraryProject());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(exists(fixture, `${COLLECTIONS_ROOT}/shared/src/list.lua`)).toBe(true);
        expect(exists(fixture, `${COLLECTIONS_ROOT}/client/client/hud.lua`)).toBe(true);
        expect(exists(fixture, 'libs/mta-async-fixture/shared/src/async.lua')).toBe(true);
        expect(output(fixture, 'src/shared/main.lua')).toContain('BigList');
    });

    it('copies verbatim Lua and emits nothing for a declaration file', async () => {
        const { context, fixture } = harness(libraryProject());

        await runBuildCommand(context);

        expect(output(fixture, `${COLLECTIONS_ROOT}/shared/src/legacy.lua`)).toContain('function fixtureLegacy()');
        expect(exists(fixture, `${COLLECTIONS_ROOT}/shared/src/legacy.d.lua`)).toBe(false);
    });

    it('enumerates library scripts after the runtime library and before the source wildcards', async () => {
        const { context, fixture } = harness(libraryProject());

        await runBuildCommand(context);

        const manifest = output(fixture, 'meta.xml');

        expect(manifest).toContain('<!-- Libraries -->');
        expect(scriptOrder(manifest)).toEqual([
            'lib/class.lua',
            'lib/string.lua',
            `${COLLECTIONS_ROOT}/shared/src/list.lua`,
            `${COLLECTIONS_ROOT}/shared/src/legacy.lua`,
            `${COLLECTIONS_ROOT}/client/client/hud.lua`,
            'libs/mta-async-fixture/shared/src/async.lua',
            'src/shared/**/*.lua',
            'src/client/**/*.lua',
        ]);
    });

    it('emits a helper only a library needs once and ahead of everything', async () => {
        const { context, fixture } = harness(libraryProject());

        await runBuildCommand(context);

        const manifest = output(fixture, 'meta.xml');

        expect(exists(fixture, 'lib/string.lua')).toBe(true);
        expect(manifest.indexOf('lib/string.lua')).toBeLessThan(manifest.indexOf(COLLECTIONS_ROOT));
        expect(manifest.match(/lib\/string\.lua/g)).toHaveLength(1);
    });

    it('concatenates library modules ahead of project modules in the bundle layout', async () => {
        const { context, fixture } = harness(libraryProject([COLLECTIONS, ASYNC], { output: { bundle: true, map: false } }));

        await runBuildCommand(context);

        const bundle = output(fixture, 'src/shared.lua');

        expect(bundle.indexOf('FixtureList')).toBeLessThan(bundle.indexOf('BigList'));
        expect(bundle.indexOf('function fixtureLegacy()')).toBeLessThan(bundle.indexOf('BigList'));
    });

    it('removes the output of a library the manifest no longer lists', async () => {
        const { context, fixture } = harness(libraryProject());

        await runBuildCommand(context);
        expect(exists(fixture, `${COLLECTIONS_ROOT}/shared/src/list.lua`)).toBe(true);

        fixture.write('.luam.manifest', consumerFiles([ASYNC])['.luam.manifest'] ?? '');
        fixture.write('src/shared/main.luam', "function report(): number\n    return fixtureDelay(1)\nend\n");
        fixture.write('src/client/hud.luam', "dxDrawText('hud', 10, 10)\n");

        const reloaded = loadManifest(fixture.root).config;

        expect(reloaded).not.toBeNull();
        expect(await runBuildCommand({ ...context, config: reloaded ?? context.config })).toBe(EXIT_OK);
        expect(exists(fixture, `${COLLECTIONS_ROOT}/shared/src/list.lua`)).toBe(false);
        expect(exists(fixture, 'libs/mta-async-fixture/shared/src/async.lua')).toBe(true);
    });

    it('leaves an installed package the manifest does not list out of the resource', async () => {
        const files = { ...consumerFiles([]), ...collectionsPackage(), ...asyncPackage() };
        const { context, fixture } = harness({
            ...files,
            'src/shared/main.luam': "function report(): string\n    return 'plain'\nend\n",
            'src/client/hud.luam': "dxDrawText('hud', 10, 10)\n",
        });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(exists(fixture, 'libs')).toBe(false);
        expect(output(fixture, 'meta.xml')).not.toContain('Libraries');
    });
});
