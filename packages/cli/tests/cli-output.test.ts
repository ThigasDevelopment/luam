import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runCompile } from '@cli/build/build-runner';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { runBuildCommand } from '@cli/commands/build-command';
import { runCheckCommand } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand } from '@cli/commands/ensure-command';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { RICH_CAPABILITY } from '@cli/reporting/output-capability';
import { createOutputStyle } from '@cli/reporting/output-style';
import { createProgressRenderer } from '@cli/reporting/progress-renderer';

import { createMemoryReporter, createTtyReporter, type MemoryReporter } from './support/memory-logger';
import { createMockServerConsole } from './support/mock-server-console';
import { BROKEN_SERVER, clientSource, createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const ESC = String.fromCharCode(27);

const style = createOutputStyle(RICH_CAPABILITY);

const fixtures: ProjectFixture[] = [];

interface Harness {
    fixture: ProjectFixture;
    target: MemoryReporter;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>, target: MemoryReporter = createMemoryReporter()): Harness {
    const fixture = createProjectFixture(files);
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, target, context: { root: fixture.root, config, logger: target.logger, reporter: target.reporter } };
}

function readTree(root: string): Map<string, string> {
    const files = new Map<string, string>();

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (entry.isFile()) {
            const absolute = join(entry.parentPath, entry.name);

            files.set(relative(root, absolute).replace(/\\/g, '/'), readFileSync(absolute).toString('base64'));
        }
    }

    return files;
}

function largeProject(count: number): Record<string, string> {
    const files: Record<string, string> = defaultProjectFiles();

    for (let index = 0; index < count; index += 1) {
        files[`src/shared/generated/module-${index}.luam`] = `function helper${index}(value: number): number\n    return value + ${index}\nend\n`;
    }

    return files;
}

async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (!condition()) {
        if (Date.now() > deadline) {
            throw new Error('The condition was not met before the timeout.');
        }

        await new Promise((resolveWait) => setTimeout(resolveWait, 25));
    }
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('piped build output', () => {
    it('reports the same numbers the command reported before the milestone', async () => {
        const { context, target } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(target.logger.text()).toContain('Build passed: 3 files, 0 errors, 0 warnings in ');
        expect(target.logger.text()).toMatch(/Wrote \d+ files to ".+" \(0 unchanged, 0 removed\)\./);
    });

    it('pluralises a single written file', async () => {
        const { context, fixture, target } = harness(defaultProjectFiles());

        await runBuildCommand(context);
        fixture.write('src/client/hud.luam', clientSource('Luam 2'));
        target.logger.lines.length = 0;
        await runBuildCommand(context);

        expect(target.logger.text()).toContain('Wrote 1 file to ');
    });

    it('contains no escape sequence and no carriage return', async () => {
        const { context, target } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        expect(target.output()).not.toContain(ESC);
        expect(target.output()).not.toContain('\r');
        expect(target.painted).toEqual([]);
    });

    it('writes one line per phase', async () => {
        const { context, target } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        const phases = target.logger.lines.filter((line) => /^(Discovery|Compile|Assembly|Manifest|Write): /.test(line));

        expect(phases.map((line) => line.split(':')[0])).toEqual(['Discovery', 'Compile', 'Assembly', 'Manifest', 'Write']);
    });

    it('stops the phase sequence at the failing phase', async () => {
        const { context, target } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(target.logger.text()).toContain('Assembly: failed in ');
        expect(target.logger.text()).not.toContain('Manifest:');
        expect(target.logger.text()).not.toContain('Write:');
        expect(target.logger.errors.at(-1)).toContain('Build failed:');
    });
});

describe('terminal build output', () => {
    it('closes with a phase breakdown and a total', async () => {
        const { context, target } = harness(defaultProjectFiles(), createTtyReporter());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const text = target.logger.text();

        expect(text).toContain('Discovery');
        expect(text).toContain('Manifest');
        expect(text).toContain('Write');
        expect(text).toContain('Total');
        expect(text).toContain(style.paint('success', style.marker('success')));
    });

    it('prints a warm rebuild with no intermediate frame', async () => {
        const { context, target } = harness(defaultProjectFiles(), createTtyReporter());

        await runBuildCommand(context);
        target.painted.length = 0;
        await runBuildCommand(context);

        expect(target.painted).toEqual([]);
        expect(target.logger.text()).toContain('Build passed:');
    });

    it('groups diagnostics under the file and shows the offending line', async () => {
        const { context, target } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER }, createTtyReporter());

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);

        const block = target.logger.errors[0] ?? '';

        expect(target.logger.lines).toContain(style.paint('strong', 'src/server/main.luam'));
        expect(block).toContain('src/server/main.luam:2:');
        expect(block).toContain('return value');
        expect(block).toContain('^');
    });

    it('keeps painting under five milliseconds on a three hundred file build', () => {
        const { context, target } = harness(largeProject(300), createTtyReporter());
        const renderer = createProgressRenderer(target.reporter, { animateAfterMs: 0 });
        let paintedMs = 0;

        const tracker = createPhaseTracker((event) => {
            const started = performance.now();

            renderer.listen(event);
            paintedMs += performance.now() - started;
        });

        expect(runCompile(context.root, context.config, { tracker }).build).not.toBeNull();

        renderer.clear();

        expect(target.painted.length).toBeGreaterThan(0);
        expect(paintedMs).toBeLessThan(5);
    });
});

describe('generated resource', () => {
    it('is byte identical whichever way the output is rendered', async () => {
        const plain = harness(defaultProjectFiles());
        const rich = harness(defaultProjectFiles(), createTtyReporter());

        expect(await runBuildCommand(plain.context)).toBe(EXIT_OK);
        expect(await runBuildCommand(rich.context)).toBe(EXIT_OK);

        const left = readTree(resolve(plain.fixture.root, 'build/luam-demo'));
        const right = readTree(resolve(rich.fixture.root, 'build/luam-demo'));

        expect(left.size).toBeGreaterThan(0);
        expect([...right]).toEqual([...left]);
    });
});

describe('check output', () => {
    it('keeps the passing summary and the plain diagnostic format', async () => {
        const passing = harness(defaultProjectFiles());

        expect(runCheckCommand(passing.context)).toBe(EXIT_OK);
        expect(passing.target.logger.errors).toEqual([]);
        expect(passing.target.logger.text()).toContain('Check passed: 3 files, 0 errors, 0 warnings');

        const failing = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });

        expect(runCheckCommand(failing.context)).toBe(EXIT_DIAGNOSTICS);
        expect(failing.target.logger.errors[0]).toMatch(/^src\/server\/main\.luam:\d+:\d+ error check-/);
    });
});

describe('watch output', () => {
    it('separates and timestamps each rebuild', async () => {
        const { context, fixture, target } = harness(defaultProjectFiles({ serverPath: 'mta-server' }));
        const serverConsole = createMockServerConsole();
        const controller = new AbortController();
        const command = runEnsureCommand(context, { serverConsole, watch: true, signal: controller.signal });

        await waitFor(() => serverConsole.calls.length === 2);
        fixture.write('src/client/hud.luam', clientSource('Luam watched'));

        await waitFor(() => serverConsole.calls.length === 4);
        controller.abort();

        expect(await command).toBe(EXIT_OK);
        expect(target.logger.lines.filter((line) => line.includes('rebuild at '))).toHaveLength(1);
        expect(target.logger.text()).toContain('Sync: ');
        expect(target.logger.text()).toContain('Restart: ');
        expect(target.logger.text()).not.toContain('Write: ');
        expect(target.logger.text()).not.toContain('Wrote ');
    });
});
