import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const OOP_SERVER = 'function announceJoin(player: Player): void\n    outputChatBox(player:getName(), root)\nend\n';

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

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

describe('build command with the oop api', () => {
    it('writes the manifest tag and accepts an OOP call when the project enables the API', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles({ oop: true }), 'src/server/main.luam': OOP_SERVER });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('    <oop>true</oop>\n    <!-- Resource information -->\n    <info');
        expect(fixture.read('build/luam-demo/src/server/main.lua')).toContain('player:getName()');
    });

    it('rejects the same call and writes nothing when the project does not enable the API', async () => {
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': OOP_SERVER });

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('check-oop-disabled');
        expect(logger.text()).toContain('getPlayerName');
        expect(fixture.exists('build')).toBe(false);
    });

    it('leaves the manifest of a project that does not enable the API unchanged', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/meta.xml')).not.toContain('<oop>');
    });

    it('rebuilds the resource when the flag flips', async () => {
        const { context, fixture } = harness({ ...defaultProjectFiles({ oop: true }), 'src/server/main.luam': OOP_SERVER });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const disabled = harness({ ...defaultProjectFiles(), 'src/server/main.luam': OOP_SERVER });

        expect(await runBuildCommand(disabled.context)).toBe(EXIT_DIAGNOSTICS);
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<oop>true</oop>');
    });
});
