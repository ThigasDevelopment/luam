import { describe, expect, it } from 'vitest';

import type { BuildPhaseEvent, BuildPhaseName } from '@cli/build/build-phase';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { reportPhaseTimings, totalDuration } from '@cli/commands/build-report';
import { ERASE_LINE } from '@cli/reporting/output-style';
import { createProgressRenderer, plainPhaseLine } from '@cli/reporting/progress-renderer';
import { formatTimestamp, reportRebuildSeparator } from '@cli/reporting/rebuild-separator';

import { createMemoryReporter, createTtyReporter, type MemoryReporter } from './support/memory-logger';

const ESC = String.fromCharCode(27);

function event(phase: BuildPhaseName, state: BuildPhaseEvent['state'], completed = 0, total = 0): BuildPhaseEvent {
    return { phase, state, completed, total, item: completed > 0 ? 'src/server/main.luam' : null, durationMs: 3 };
}

function clock(): { now: () => number; advance: (ms: number) => void } {
    let value = 0;

    return { now: (): number => value, advance: (ms: number): void => void (value += ms) };
}

function animated(target: MemoryReporter, now: () => number): ReturnType<typeof createProgressRenderer> {
    return createProgressRenderer(target.reporter, { paint: target.paint, now });
}

describe('progress renderer on a terminal', () => {
    it('paints no frame for a run that finishes inside the animation delay', () => {
        const target = createTtyReporter();
        const time = clock();
        const renderer = animated(target, time.now);

        renderer.listen(event('compile', 'active', 0, 3));
        time.advance(1);
        renderer.listen(event('compile', 'active', 3, 3));
        renderer.listen(event('compile', 'done', 3, 3));
        renderer.clear();

        expect(renderer.frames()).toBe(0);
        expect(target.painted).toEqual([]);
    });

    it('draws a counted bar once the run is long enough to animate', () => {
        const target = createTtyReporter();
        const time = clock();
        const renderer = animated(target, time.now);

        time.advance(200);
        renderer.listen(event('compile', 'active', 1, 4));

        expect(renderer.frames()).toBe(1);
        expect(target.painted[0]).toContain('█');
        expect(target.painted[0]).toContain('1/4');
        expect(target.painted[0]).toContain('src/server/main.luam');
    });

    it('draws no bar for a single step phase', () => {
        const target = createTtyReporter();
        const time = clock();
        const renderer = animated(target, time.now);

        time.advance(200);
        renderer.listen(event('assembly', 'active'));

        expect(target.painted[0]).toContain('Assembly');
        expect(target.painted[0]).not.toContain('█');
        expect(target.painted[0]).not.toContain('/');
    });

    it('throttles repainting to the frame interval', () => {
        const target = createTtyReporter();
        const time = clock();
        const renderer = animated(target, time.now);

        time.advance(200);

        for (let index = 1; index <= 40; index += 1) {
            renderer.listen(event('compile', 'active', index, 40));
            time.advance(1);
        }

        expect(renderer.frames()).toBe(1);

        time.advance(60);
        renderer.listen(event('compile', 'active', 40, 40));

        expect(renderer.frames()).toBe(2);
    });

    it('erases the transient line when a phase resolves', () => {
        const target = createTtyReporter();
        const time = clock();
        const renderer = animated(target, time.now);

        time.advance(200);
        renderer.listen(event('compile', 'active', 1, 4));
        renderer.listen(event('compile', 'done', 4, 4));

        expect(target.painted.at(-1)).toBe(ERASE_LINE);
    });

    it('truncates a frame to the terminal width', () => {
        const target = createTtyReporter({ columns: 30 });
        const time = clock();
        const renderer = animated(target, time.now);

        time.advance(200);
        renderer.listen(event('compile', 'active', 1, 4));

        expect((target.painted[0] ?? '').replace(ERASE_LINE, '').length).toBeLessThanOrEqual(29);
    });
});

describe('progress renderer with the output piped', () => {
    it('writes one plain line per phase and never repaints', () => {
        const target = createMemoryReporter();
        const renderer = createProgressRenderer(target.reporter, { paint: target.paint });

        renderer.listen(event('compile', 'active', 1, 3));
        renderer.listen(event('compile', 'done', 3, 3));
        renderer.listen(event('assembly', 'done'));
        renderer.listen(event('write', 'failed', 1, 3));
        renderer.clear();

        expect(target.logger.lines).toEqual(['Compile: 3 files in 3 ms.', 'Assembly: done in 3 ms.', 'Write: failed in 3 ms.']);
        expect(target.painted).toEqual([]);
        expect(target.output()).not.toContain(ESC);
        expect(target.output()).not.toContain('\r');
    });

    it('pluralises a single compiled file', () => {
        expect(plainPhaseLine(event('compile', 'done', 1, 1))).toBe('Compile: 1 file in 3 ms.');
    });
});

describe('phase timings report', () => {
    it('lists every phase with its duration on a terminal', () => {
        const target = createTtyReporter();
        const tracker = createPhaseTracker();

        tracker.begin('discovery');
        tracker.begin('compile', 3);
        tracker.end();

        reportPhaseTimings(target.reporter, tracker.durations(), totalDuration(tracker.durations()));

        expect(target.logger.text()).toContain('Discovery');
        expect(target.logger.text()).toContain('Compile');
        expect(target.logger.text()).toContain('Total');
    });

    it('prints nothing extra when the output is piped', () => {
        const target = createMemoryReporter();
        const tracker = createPhaseTracker();

        tracker.begin('discovery');
        tracker.end();

        reportPhaseTimings(target.reporter, tracker.durations(), 1);

        expect(target.logger.lines).toEqual([]);
    });
});

describe('rebuild separator', () => {
    it('separates and timestamps each rebuild', () => {
        const target = createMemoryReporter();
        const at = new Date(2026, 7, 9, 10, 11, 12);

        reportRebuildSeparator(target.reporter, at);
        reportRebuildSeparator(target.reporter, at);

        expect(formatTimestamp(at)).toBe('10:11:12');
        expect(formatTimestamp(new Date(2026, 7, 9, 3, 4, 5))).toBe('03:04:05');
        expect(target.logger.lines.filter((line) => line.includes('rebuild at 10:11:12'))).toHaveLength(2);
        expect(target.logger.lines.filter((line) => line === '')).toHaveLength(2);
    });
});
