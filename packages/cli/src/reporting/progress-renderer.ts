import { isCountedPhase, PHASE_LABELS, PHASE_UNITS, type BuildPhaseEvent, type BuildPhaseListener } from '@cli/build/build-phase';
import { formatDuration } from '@cli/reporting/duration';
import { pluralize } from '@cli/reporting/plural';
import type { Reporter } from '@cli/reporting/reporter';

export interface RendererOptions {
    paint?: (text: string) => void;
    now?: () => number;
    throttleMs?: number;
    animateAfterMs?: number;
}

export interface ProgressRenderer {
    listen: BuildPhaseListener;
    clear(): void;
    frames(): number;
}

export const THROTTLE_MS = 50;

export const ANIMATE_AFTER_MS = 150;

const BAR_WIDTH = 20;

export function plainPhaseLine(event: BuildPhaseEvent): string {
    const label = PHASE_LABELS[event.phase];
    const duration = formatDuration(event.durationMs);

    if (event.state === 'failed') {
        return `${label}: failed in ${duration}.`;
    }

    if (!isCountedPhase(event.phase) || event.total === 0) {
        return `${label}: done in ${duration}.`;
    }

    return `${label}: ${pluralize(event.completed, PHASE_UNITS[event.phase])} in ${duration}.`;
}

function activeLine(reporter: Reporter, event: BuildPhaseEvent): string {
    const { style } = reporter;
    const label = `${style.phaseSymbol(event.phase)} ${PHASE_LABELS[event.phase]}`;

    if (!isCountedPhase(event.phase) || event.total === 0) {
        return `${label} ${style.paint('muted', style.marker('pending'))}`;
    }

    const bar = style.paint('success', style.bar(event.completed, event.total, BAR_WIDTH));
    const counter = `${event.completed}/${event.total}`;
    const item = event.item === null ? '' : ` ${style.paint('muted', event.item)}`;

    return `${label} ${bar} ${counter}${item}`;
}

export function createProgressRenderer(reporter: Reporter, options: RendererOptions = {}): ProgressRenderer {
    const paint = options.paint ?? reporter.paint;
    const now = options.now ?? ((): number => performance.now());
    const throttleMs = options.throttleMs ?? THROTTLE_MS;
    const animateAfterMs = options.animateAfterMs ?? ANIMATE_AFTER_MS;
    const startedAt = now();
    let lastPaintAt = 0;
    let dirty = false;
    let frames = 0;

    function clear(): void {
        if (!dirty) {
            return;
        }

        paint(reporter.style.eraseLine());
        dirty = false;
    }

    function render(event: BuildPhaseEvent): void {
        const columns = Math.max(20, reporter.capability.columns - 1);
        const line = activeLine(reporter, event);

        paint(`${reporter.style.eraseLine()}${line.slice(0, columns)}`);
        lastPaintAt = now();
        dirty = true;
        frames += 1;
    }

    function interactive(event: BuildPhaseEvent): void {
        const elapsed = now() - startedAt;

        if (elapsed < animateAfterMs) {
            return;
        }

        if (event.state !== 'active') {
            clear();

            return;
        }

        if (frames > 0 && now() - lastPaintAt < throttleMs) {
            return;
        }

        render(event);
    }

    return {
        listen: (event: BuildPhaseEvent): void => {
            if (!reporter.capability.interactive) {
                if (event.state !== 'active') {
                    reporter.info(plainPhaseLine(event));
                }

                return;
            }

            interactive(event);
        },
        clear,
        frames: (): number => frames,
    };
}
