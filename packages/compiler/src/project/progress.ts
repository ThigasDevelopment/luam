export interface ProgressEvent {
    item: string;
    index: number;
    total: number;
}

export type ProgressReporter = (event: ProgressEvent) => void;

export type AssemblyStep = 'assembly' | 'manifest';

export type AssemblyReporter = (step: AssemblyStep) => void;
