import { afterEach, describe, expect, it } from 'vitest';

import { runCheckCommand } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { BROKEN_SERVER, createProjectFixture, defaultProjectFiles, MANIFEST_FILE, manifestSource, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

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

describe('check command', () => {
    it('passes on a valid project and writes nothing', () => {
        const { context, logger, fixture } = harness(defaultProjectFiles());

        expect(runCheckCommand(context)).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
        expect(logger.text()).toContain('Check passed: 3 files, 0 errors, 0 warnings');
        expect(fixture.exists('build')).toBe(false);
    });

    it('reports diagnostics with file, line, and column and exits non-zero', () => {
        const { context, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toMatch(/^src\/server\/main\.luam:\d+:\d+ error check-/);
        expect(logger.errors.at(-1)).toContain('Check failed:');
    });

    it('reports a cross-environment violation across files', () => {
        const files = {
            ...defaultProjectFiles(),
            'src/client/hud.luam': 'function openMenu(): void\nend\n',
            'src/server/main.luam': 'openMenu()\n',
        };
        const { context, logger } = harness(files);

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.join('\n')).toContain('project-environment-import');
    });

    it('reports a source mapping that matches nothing', () => {
        const { context, logger } = harness({ [MANIFEST_FILE]: manifestSource({ name: 'luam-demo' }) });

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toContain('config-no-sources');
    });

    it('reports a project without source files', () => {
        const { context, logger } = harness({ [MANIFEST_FILE]: manifestSource({ name: 'luam-demo' }), 'src/shared/notes.md': 'ignored\n' });

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toContain('config-no-sources');
    });
});
