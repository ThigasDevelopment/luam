export type BuildPhaseName = 'version' | 'discovery' | 'compile' | 'assembly' | 'manifest' | 'write' | 'sync' | 'restart';

export type BuildPhaseState = 'active' | 'done' | 'failed';

export interface BuildPhaseEvent {
    phase: BuildPhaseName;
    state: BuildPhaseState;
    completed: number;
    total: number;
    item: string | null;
    durationMs: number;
}

export type BuildPhaseListener = (event: BuildPhaseEvent) => void;

export interface PhaseDuration {
    phase: BuildPhaseName;
    state: Exclude<BuildPhaseState, 'active'>;
    completed: number;
    total: number;
    durationMs: number;
}

export const BUILD_PHASES: readonly BuildPhaseName[] = ['version', 'discovery', 'compile', 'assembly', 'manifest', 'write', 'sync', 'restart'];

const COUNTED_PHASES: ReadonlySet<BuildPhaseName> = new Set<BuildPhaseName>(['compile', 'write']);

export const PHASE_LABELS: Readonly<Record<BuildPhaseName, string>> = {
    version: 'Version',
    discovery: 'Discovery',
    compile: 'Compile',
    assembly: 'Assembly',
    manifest: 'Manifest',
    write: 'Write',
    sync: 'Sync',
    restart: 'Restart',
};

export const PHASE_UNITS: Readonly<Record<BuildPhaseName, string>> = {
    version: 'step',
    discovery: 'file',
    compile: 'file',
    assembly: 'step',
    manifest: 'step',
    write: 'file',
    sync: 'file',
    restart: 'step',
};

export function isCountedPhase(phase: BuildPhaseName): boolean {
    return COUNTED_PHASES.has(phase);
}
