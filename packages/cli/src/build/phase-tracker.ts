import { isCountedPhase, type BuildPhaseListener, type BuildPhaseName, type BuildPhaseState, type PhaseDuration } from '@cli/build/build-phase';

interface OpenPhase {
    phase: BuildPhaseName;
    startedAt: number;
    completed: number;
    total: number;
}

export interface PhaseTracker {
    begin(phase: BuildPhaseName, total?: number): void;
    advance(item: string, completed: number, total: number): void;
    end(state?: Exclude<BuildPhaseState, 'active'>): void;
    durations(): PhaseDuration[];
}

export function createPhaseTracker(listener: BuildPhaseListener | null = null): PhaseTracker {
    const closed: PhaseDuration[] = [];
    let open: OpenPhase | null = null;

    function emit(phase: OpenPhase, state: BuildPhaseState, item: string | null, durationMs: number): void {
        listener?.({ phase: phase.phase, state, completed: phase.completed, total: phase.total, item, durationMs });
    }

    function close(state: Exclude<BuildPhaseState, 'active'>): void {
        if (open === null) {
            return;
        }

        const durationMs = performance.now() - open.startedAt;
        const completed = state === 'done' && isCountedPhase(open.phase) ? open.total : open.completed;
        const finished: OpenPhase = { ...open, completed };

        closed.push({ phase: open.phase, state, completed, total: open.total, durationMs });
        open = null;

        emit(finished, state, null, durationMs);
    }

    return {
        begin: (phase: BuildPhaseName, total = 0): void => {
            close('done');

            open = { phase, startedAt: performance.now(), completed: 0, total };

            emit(open, 'active', null, 0);
        },
        advance: (item: string, completed: number, total: number): void => {
            if (open === null) {
                return;
            }

            open.completed = completed;
            open.total = total;

            emit(open, 'active', item, performance.now() - open.startedAt);
        },
        end: (state: Exclude<BuildPhaseState, 'active'> = 'done'): void => {
            close(state);
        },
        durations: (): PhaseDuration[] => [...closed],
    };
}
