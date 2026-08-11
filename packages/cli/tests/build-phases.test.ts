import { afterEach, describe, expect, it } from 'vitest';

import { BUILD_PHASES, isCountedPhase, type BuildPhaseEvent } from '@cli/build/build-phase';
import { runCompile } from '@cli/build/build-runner';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { writeResource } from '@cli/build/resource-writer';
import { generatedFiles, generatedRoots } from '@cli/build/write-options';
import { validateConfig } from '@cli/config/config-validation';
import type { LuamConfig } from '@cli/config/config-schema';
import { createProjectCache } from '@compiler/project/project-cache';
import type { ProgressEvent } from '@compiler/project/progress';

import { BROKEN_SERVER, createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

interface Harness {
    fixture: ProjectFixture;
    config: LuamConfig;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const config = validateConfig(JSON.parse(fixture.read('luam.json')), {}).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, config };
}

function sourceFiles(): { path: string; source: string }[] {
    return [
        { path: 'src/shared/a.luam', source: 'A = 1\n' },
        { path: 'src/shared/b.luam', source: 'B = 2\n' },
        { path: 'src/shared/c.luam', source: 'C = 3\n' },
    ];
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('compile progress', () => {
    it('fires once per file, in order, with the index and the total', () => {
        const events: ProgressEvent[] = [];
        const files = sourceFiles();

        createProjectCache().compile(files, { onProgress: (event) => events.push(event) });

        expect(events).toEqual([
            { item: 'src/shared/a.luam', index: 1, total: 3 },
            { item: 'src/shared/b.luam', index: 2, total: 3 },
            { item: 'src/shared/c.luam', index: 3, total: 3 },
        ]);
    });

    it('produces the same modules with and without the callback', () => {
        const files = sourceFiles();
        const plain = createProjectCache().compile(files);
        const watched = createProjectCache().compile(files, { onProgress: (): void => undefined });

        expect(watched.modules.map((module) => module.code)).toEqual(plain.modules.map((module) => module.code));
        expect(watched.stats).toEqual(plain.stats);
    });
});

describe('write progress', () => {
    it('fires once per written or unchanged file', () => {
        const { fixture, config } = harness(defaultProjectFiles());
        const outcome = runCompile(fixture.root, config);
        const events: ProgressEvent[] = [];

        expect(outcome.build).not.toBeNull();

        const result = writeResource(`${fixture.root}/build/luam-demo`, outcome.build!, {
            root: fixture.root,
            generatedFiles: generatedFiles(),
            generatedRoots: generatedRoots(config),
            environmentTemplate: null,
            onProgress: (event) => events.push(event),
        });

        expect(events.length).toBe(result.written.length + result.unchanged);
        expect(events.map((event) => event.index)).toEqual(events.map((_, index) => index + 1));
        expect(new Set(events.map((event) => event.total))).toEqual(new Set([events.length]));
    });

    it('counts the deployment env file it generates', () => {
        const { fixture, config } = harness({ ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=32\n' });
        const outcome = runCompile(fixture.root, config);
        const events: ProgressEvent[] = [];

        expect(outcome.build).not.toBeNull();

        writeResource(`${fixture.root}/build/luam-demo`, outcome.build!, {
            root: fixture.root,
            generatedFiles: generatedFiles(),
            generatedRoots: generatedRoots(config),
            environmentTemplate: outcome.environmentTemplate,
            onProgress: (event) => events.push(event),
        });

        expect(events.at(-1)).toEqual({ item: '.env', index: events.length, total: events.length });
    });
});

describe('build phases', () => {
    it('records a duration for every phase the build ran', () => {
        const { fixture, config } = harness(defaultProjectFiles());
        const outcome = runCompile(fixture.root, config);

        expect(outcome.phases.map((phase) => phase.phase)).toEqual(['discovery', 'compile', 'assembly', 'manifest']);
        expect(outcome.phases.every((phase) => phase.state === 'done')).toBe(true);
    });

    it('sums the phase durations to within a millisecond of the total', () => {
        const { fixture, config } = harness(defaultProjectFiles());
        const outcome = runCompile(fixture.root, config);
        const sum = outcome.phases.reduce((total, phase) => total + phase.durationMs, 0);

        expect(Math.abs(outcome.durationMs - sum)).toBeLessThan(1);
    });

    it('counts the compiled files on the compile phase only', () => {
        const { fixture, config } = harness(defaultProjectFiles());
        const compile = runCompile(fixture.root, config).phases.find((phase) => phase.phase === 'compile');

        expect(compile?.completed).toBe(3);
        expect(compile?.total).toBe(3);
        expect(BUILD_PHASES.filter(isCountedPhase)).toEqual(['compile', 'write']);
    });

    it('marks the failing phase and runs no later phase', () => {
        const { fixture, config } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });
        const outcome = runCompile(fixture.root, config);

        expect(outcome.phases.at(-1)).toMatchObject({ phase: 'assembly', state: 'failed' });
        expect(outcome.phases.some((phase) => phase.phase === 'manifest')).toBe(false);
    });

    it('fails discovery when no source directory exists', () => {
        const { fixture, config } = harness({ 'luam.json': '{ "name": "luam-demo" }' });
        const outcome = runCompile(fixture.root, config);

        expect(outcome.phases).toHaveLength(1);
        expect(outcome.phases[0]).toMatchObject({ phase: 'discovery', state: 'failed' });
    });
});

describe('phase tracker', () => {
    it('closes the previous phase when the next one begins', () => {
        const events: BuildPhaseEvent[] = [];
        const tracker = createPhaseTracker((event) => events.push(event));

        tracker.begin('discovery');
        tracker.begin('compile', 2);
        tracker.advance('a.luam', 1, 2);
        tracker.end();

        expect(events.map((event) => `${event.phase}:${event.state}`)).toEqual([
            'discovery:active',
            'discovery:done',
            'compile:active',
            'compile:active',
            'compile:done',
        ]);
        expect(tracker.durations().map((phase) => phase.phase)).toEqual(['discovery', 'compile']);
    });

    it('completes a counted phase at its total', () => {
        const tracker = createPhaseTracker();

        tracker.begin('compile', 5);
        tracker.advance('a.luam', 2, 5);
        tracker.end();

        expect(tracker.durations()[0]?.completed).toBe(5);
    });

    it('keeps the partial count on a failed phase', () => {
        const tracker = createPhaseTracker();

        tracker.begin('compile', 5);
        tracker.advance('a.luam', 2, 5);
        tracker.end('failed');

        expect(tracker.durations()[0]).toMatchObject({ completed: 2, state: 'failed' });
    });
});
