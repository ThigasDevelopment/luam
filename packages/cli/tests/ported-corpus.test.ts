import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import { runCheckCommand } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const CORPUS = fileURLToPath(new URL('../../compiler/tests/fixtures', import.meta.url));

const fixtures: ProjectFixture[] = [];

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

function corpusFiles(name: string): Record<string, string> {
    const root = join(CORPUS, name);
    const files: Record<string, string> = {};

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || entry.name === 'README.md' || entry.name === 'diagnostics.txt') {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        files[relative(root, absolute).split(sep).join('/')] = readFileSync(absolute, 'utf8');
    }

    return files;
}

function harness(name: string): Harness {
    const fixture = createProjectFixture(corpusFiles(name));
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The corpus manifest is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config, logger } };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the ported resource corpus through the CLI', () => {
    it('checks clean', async () => {
        const { context, logger } = harness('ported-resource');

        expect(await runCheckCommand(context)).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
    });

    it('builds the resource the manifest describes', async () => {
        const { context, fixture } = harness('ported-resource');

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/ported-resource/meta.xml')).toBe(true);
        expect(fixture.exists('build/ported-resource/src/shared/registry.lua')).toBe(true);
        expect(fixture.exists('build/ported-resource/src/server/vehicles.service.lua')).toBe(true);
        expect(fixture.exists('build/ported-resource/src/client/dealership.page.lua')).toBe(true);
        expect(fixture.exists('build/ported-resource/config.lua')).toBe(true);
    });

    it('copies the declaration file into no output', () => {
        const { fixture } = harness('ported-resource');

        expect(fixture.exists('build/ported-resource/src/shared/types.d.lua')).toBe(false);
    });

    it('reports the negative half and refuses to build it', async () => {
        const { context } = harness('ported-defects');

        expect(await runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
    });
});
