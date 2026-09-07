import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { loadManifest } from '@cli/config/manifest-loader';
import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, MANIFEST_FILE, VALID_CLIENT, VALID_SERVER, VALID_SHARED, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

const LEGACY = [
    "name = 'luam-demo'",
    "author = 'Thigas'",
    "version = '1.2.3'",
    "description = 'A resource written before ADR-047.'",
    '',
    'compiler = {',
    '    strict = true,',
    '    oop = false,',
    '}',
    '',
    'sources = {',
    "    server = { 'src/server/**/*.luam' },",
    "    client = { 'src/client/**/*.luam' },",
    "    shared = { 'src/shared/**/*.luam' },",
    '}',
    '',
    "dependencies = { 'scoreboard', 'admin' }",
    '',
    'output = {',
    '    bundle = false,',
    '    map = true,',
    '}',
    '',
].join('\n');

const SOURCES: Readonly<Record<string, string>> = {
    'src/shared/config.luam': VALID_SHARED,
    'src/server/main.luam': VALID_SERVER,
    'src/client/hud.luam': VALID_CLIENT,
};

function project(files: Readonly<Record<string, string>>): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
}

function context(fixture: ProjectFixture): { context: CommandContext; logger: MemoryLogger } {
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The migrated manifest is invalid.');
    }

    return { logger, context: { root: fixture.root, config, logger } };
}

async function migrate(fixture: ProjectFixture, ...args: readonly string[]): Promise<{ code: number; logger: MemoryLogger }> {
    const logger = createMemoryLogger();
    const code = await runCli(['migrate', '--cwd', fixture.root, ...args], { logger, env: OFFLINE });

    return { code, logger };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the assignment form', () => {
    it('still loads and warns once naming the command that rewrites it', () => {
        const fixture = project({ [MANIFEST_FILE]: LEGACY, ...SOURCES });
        const loaded = loadManifest(fixture.root);

        expect(loaded.config).not.toBeNull();
        expect(loaded.diagnostics.filter((entry) => entry.code === 'config-manifest-form')).toHaveLength(1);
        expect(loaded.diagnostics[0]?.message).toContain('luam migrate');
    });

    it('reads every field it carried into the section it belongs to', () => {
        const fixture = project({ [MANIFEST_FILE]: LEGACY, ...SOURCES });
        const config = loadManifest(fixture.root).config;

        expect(config?.author?.name).toBe('Thigas');
        expect(config?.version).toBe('1.2.3');
        expect(config?.dependencies.map((entry) => entry.name)).toEqual(['scoreboard', 'admin']);
        expect(config?.scripts.map((entry) => `${entry.path} ${entry.type}`)).toEqual([
            'src/shared/**/*.luam shared',
            'src/server/**/*.luam server',
            'src/client/**/*.luam client',
        ]);
        expect(config?.output.bundle).toBe(false);
    });

    it('warns that the resource is now named after its folder', () => {
        const fixture = project({ [MANIFEST_FILE]: "name = 'other-name'\n", ...SOURCES });
        const codes = loadManifest(fixture.root).diagnostics.map((entry) => entry.code);

        expect(codes).toContain('config-resource-name-moved');
    });

    it('fails the build under warningsAsErrors', () => {
        const fixture = project({ [MANIFEST_FILE]: `${LEGACY}compiler = { warningsAsErrors = true }\n`, ...SOURCES });
        const loaded = loadManifest(fixture.root);

        expect(loaded.config).toBeNull();
        expect(loaded.diagnostics.some((entry) => entry.code === 'config-manifest-form' && entry.severity === 'error')).toBe(true);
    });
});

describe('luam migrate', () => {
    it('rewrites the file and prints the diff', async () => {
        const fixture = project({ [MANIFEST_FILE]: LEGACY, ...SOURCES });
        const { code, logger } = await migrate(fixture);

        expect(code).toBe(EXIT_OK);
        expect(logger.text()).toContain('- name = ');
        expect(logger.text()).toContain('+ {');

        const rewritten = fixture.read(MANIFEST_FILE);

        expect(rewritten.trimStart().startsWith('{')).toBe(true);
        expect(loadManifest(fixture.root).diagnostics.map((entry) => `${entry.code}: ${entry.message}`)).toEqual([]);
        expect(rewritten).toMatchSnapshot();
    });

    it('produces a build the warned build already produced', async () => {
        const before = project({ [MANIFEST_FILE]: LEGACY, ...SOURCES });
        const warned = context(before);

        expect(await runBuildCommand(warned.context)).toBe(EXIT_OK);

        const generated = before.read('build/luam-demo/meta.xml');

        await migrate(before);

        const after = context(before);

        expect(await runBuildCommand(after.context)).toBe(EXIT_OK);
        expect(before.read('build/luam-demo/meta.xml')).toBe(generated);
    });

    it('writes nothing when the manifest is already one table', async () => {
        const fixture = project(defaultProjectFiles());
        const before = fixture.read(MANIFEST_FILE);
        const { code, logger } = await migrate(fixture);

        expect(code).toBe(EXIT_OK);
        expect(logger.text()).toContain('already one table of sections');
        expect(fixture.read(MANIFEST_FILE)).toBe(before);
    });

    it('refuses an assets entry that renames a file and leaves the manifest alone', async () => {
        const source = `${LEGACY}assets = { { from = 'media/**/*', to = 'assets' } }\n`;
        const fixture = project({ [MANIFEST_FILE]: source, ...SOURCES });
        const { code, logger } = await migrate(fixture);

        expect(code).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('has no replacement');
        expect(logger.text()).toContain('media/**/*');
        expect(fixture.read(MANIFEST_FILE)).toBe(source);
    });

    it('converts an assets entry whose destination is the pattern root', async () => {
        const source = `${LEGACY}assets = { { from = 'assets/**/*', to = 'assets' } }\n`;
        const fixture = project({ [MANIFEST_FILE]: source, ...SOURCES, 'assets/logo.png': 'binary' });

        expect((await migrate(fixture)).code).toBe(EXIT_OK);
        expect(fixture.read(MANIFEST_FILE)).toContain("'assets/**/*',");
    });

    it('reports the rewrite without writing it under --check', async () => {
        const fixture = project({ [MANIFEST_FILE]: LEGACY, ...SOURCES });
        const { code, logger } = await migrate(fixture, '--check');

        expect(code).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('would be rewritten');
        expect(fixture.read(MANIFEST_FILE)).toBe(LEGACY);
    });

    it('names every field it drops on the way', async () => {
        const source = `${LEGACY}serverPath = 'mta-server'\nhelpers = { 'threads' }\n`;
        const fixture = project({ [MANIFEST_FILE]: source, ...SOURCES });
        const { logger } = await migrate(fixture);

        expect(logger.text()).toContain('".luam.server"');
        expect(logger.text()).toContain('Helper selection follows the code');
    });
});
