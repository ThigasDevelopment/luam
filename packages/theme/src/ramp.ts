import { luminance, withLuminance } from '@theme/color';

export type Step = 'strong' | 'base' | 'muted' | 'faint';

export type RampProfile = 'neutral' | 'chromatic';

export type Ramp = Readonly<Record<Step, string>>;

export const STEPS: readonly Step[] = ['strong', 'base', 'muted', 'faint'];

export const STEP_FACTOR: Readonly<Record<RampProfile, number>> = {
    neutral: 1.45,
    chromatic: 1.38,
};

export const FAINT_RATIO: Readonly<Record<RampProfile, number>> = {
    neutral: 3.3,
    chromatic: 3.3,
};

export function stepRatio(profile: RampProfile, step: Step): number {
    const distance = STEPS.length - 1 - STEPS.indexOf(step);

    return FAINT_RATIO[profile] * STEP_FACTOR[profile] ** distance;
}

export function targetLuminance(background: number, ratio: number): number {
    if (background < 0.5) {
        return ratio * (background + 0.05) - 0.05;
    }

    return (background + 0.05) / ratio - 0.05;
}

export function buildRamp(seed: string, background: string, profile: RampProfile): Ramp {
    const anchor = luminance(background);
    const entries = STEPS.map((step) => [step, withLuminance(seed, targetLuminance(anchor, stepRatio(profile, step)))] as const);

    return Object.fromEntries(entries) as Ramp;
}
