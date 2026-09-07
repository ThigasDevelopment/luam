import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { BUILD_MARKER_FILE } from '@cli/build/resource-prune';
import { EXIT_OK } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { formatManifestSource } from '@compiler/format/format';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, MANIFEST_FILE, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function project(files: Readonly<Record<string, string>> = defaultProjectFiles()): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the pruning guard', () => {
    it('marks the directory it creates', async () => {
        const fixture = project();

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger: createMemoryLogger() })).toBe(EXIT_OK);
        expect(fixture.exists(`build/luam-demo/${BUILD_MARKER_FILE}`)).toBe(true);
    });

    it('refuses to prune a directory the build did not create and removes nothing', async () => {
        const fixture = project();
        const logger = createMemoryLogger();

        fixture.write('build/luam-demo/family-photos.lua', 'print(1)\n');

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_OK);
        expect(logger.warnings.join('\n')).toContain(BUILD_MARKER_FILE);
        expect(logger.warnings.join('\n')).toContain('removed nothing from it');
        expect(fixture.exists('build/luam-demo/family-photos.lua')).toBe(true);
    });

    it('prunes once the directory carries the marker', async () => {
        const fixture = project();
        const logger = createMemoryLogger();

        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger });
        fixture.write('build/luam-demo/stale.lua', 'print(1)\n');
        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.exists('build/luam-demo/stale.lua')).toBe(false);
    });

    it('keeps the marker out of every prune', async () => {
        const fixture = project();

        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger: createMemoryLogger() });
        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger: createMemoryLogger() });

        expect(readdirSync(resolve(fixture.root, 'build/luam-demo'))).toContain(BUILD_MARKER_FILE);
    });
});

describe('an output the build cannot write to', () => {
    it('names the absolute path and the relative form it was probably meant to be', async () => {
        const fixture = project({ ...defaultProjectFiles({ build: { output: '/build' } }) });
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).not.toBe(EXIT_OK);

        const reported = logger.errors.join('\n');

        expect(reported).toContain('Build wrote nothing to');
        expect(reported).toContain('"build.output" is "/build"');
        expect(reported).toContain('without the leading separator');
    });

    it('says nothing about a separator when the output is relative', async () => {
        const fixture = project(defaultProjectFiles({ build: { output: 'build' } }));
        const logger = createMemoryLogger();

        expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger })).toBe(EXIT_OK);
        expect(logger.errors.join('\n')).not.toContain('leading separator');
    });
});

describe('the formatter and the manifest', () => {
    it('leaves the generated file byte identical after a round trip', async () => {
        const fixture = project();
        const logger = createMemoryLogger();

        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger });

        const generated = fixture.read('build/luam-demo/meta.xml');
        const formatted = formatManifestSource(fixture.read(MANIFEST_FILE));

        expect(formatted).not.toBeNull();

        fixture.write(MANIFEST_FILE, formatted ?? '');

        await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger });

        expect(fixture.read('build/luam-demo/meta.xml')).toBe(generated);
    });

    it('keeps a blank run between entries and collapses a longer one to a single line', () => {
        const source = ['{', '    files = {', "        'a.png',", '', '', "        'b.png',", '    },', '}', ''].join('\n');
        const formatted = formatManifestSource(source) ?? '';

        expect(formatted).toContain("'a.png',\n\n        'b.png',");
    });

    it('never introduces a blank line between entries that had none', () => {
        const source = ['{', '    files = {', "        'a.png',", "        'b.png',", '    },', '}', ''].join('\n');

        expect(formatManifestSource(source)).toBe(source);
    });

    it('formats a manifest the same way whatever the formatter configuration says', () => {
        const source = ['{', '    files = {', "        'a.png',", '', '', "        'b.png',", '    },', '}', ''].join('\n');

        expect(formatManifestSource(source, { maxBlankLines: 4 })).toBe(formatManifestSource(source, { maxBlankLines: 0 }));
    });
});
