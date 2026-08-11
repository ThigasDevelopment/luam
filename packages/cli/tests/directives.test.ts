import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import { runCheckCommand } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { validateConfig } from '@cli/config/config-validation';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const EXPORTED_SERVER = [
    'export function announceJoin(player: Player): void',
    '    outputChatBox(formatPlayerName(getPlayerName(player)), root)',
    'end',
    '',
].join('\n');

const EXPORTED_SHARED = ['#!shared', '', 'export function formatScore(score: number): string', "    return 'Score: ' .. score", 'end', ''].join('\n');

const REMOVED_DIRECTIVES = ['local setting = 32', 'local depends = 1', '', 'print(setting + depends)', ''].join('\n');

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = validateConfig(JSON.parse(fixture.read('luam.json')), {}).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config, logger } };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('build directives through the cli', () => {
    it('writes the export entry into meta.xml with no type for a server side one', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': EXPORTED_SERVER });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<export function="announceJoin" />');
    });

    it('writes a shared export as one entry rather than a server and client pair', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/shared/config.luam': EXPORTED_SHARED });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(manifest).toContain('<export function="formatScore" type="shared" />');
        expect(manifest.match(/formatScore/g)).toHaveLength(1);
    });

    it('emits the exported function with no marker in the generated Lua', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': EXPORTED_SERVER });

        await runBuildCommand(context);

        const lua = fixture.read('build/luam-demo/src/server/main.lua');

        expect(lua).toContain('function announceJoin(player)');
        expect(lua).not.toContain('export');
    });

    it('compiles "setting" and "depends" as ordinary locals and produces no element for them', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles(), 'src/server/rules.luam': REMOVED_DIRECTIVES });

        expect(runCheckCommand(context)).toBe(EXIT_OK);
        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(fixture.read('build/luam-demo/src/server/rules.lua')).toContain('local setting=32');
        expect(manifest).not.toContain('<setting');
        expect(manifest).not.toContain('<include');
    });

    it('keeps the manifest free of directive elements when no file declares one', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/meta.xml')).not.toContain('<export');
    });
});
