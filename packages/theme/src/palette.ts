import { buildRamp, type Ramp, type RampProfile, type Step } from '@theme/ramp';

export type Mode = 'dark' | 'light';

export type Hue = 'ink' | 'blue' | 'violet' | 'gold' | 'green' | 'orange' | 'rose' | 'cyan';

export interface Surfaces {
    background: string;
    surface: string;
    elevated: string;
    line: string;
    lineStrong: string;
}

export const MODES: readonly Mode[] = ['dark', 'light'];

export const HUES: readonly Hue[] = ['ink', 'blue', 'violet', 'gold', 'green', 'orange', 'rose', 'cyan'];

export const SYNTAX_HUES: readonly Hue[] = HUES;

export const REPORTING_HUES: readonly Hue[] = [];

export const SURFACES: Readonly<Record<Mode, Surfaces>> = {
    dark: { background: '#282c34', surface: '#21252b', elevated: '#2f343d', line: '#3a3f4b', lineStrong: '#4b5263' },
    light: { background: '#fafafa', surface: '#f5f5f6', elevated: '#eaeaeb', line: '#dcdcdd', lineStrong: '#c2c2c3' },
};

export const SEEDS: Readonly<Record<Mode, Readonly<Record<Hue, string>>>> = {
    dark: {
        ink: '#abb2bf',
        blue: '#61afef',
        violet: '#c678dd',
        gold: '#e5c07b',
        green: '#98c379',
        orange: '#d19a66',
        rose: '#e06c75',
        cyan: '#56b6c2',
    },
    light: {
        ink: '#383a42',
        blue: '#4078f2',
        violet: '#a626a4',
        gold: '#c18401',
        green: '#50a14f',
        orange: '#986801',
        rose: '#e45649',
        cyan: '#0184bc',
    },
};

export const PROFILES: Readonly<Record<Hue, RampProfile>> = {
    ink: 'neutral',
    blue: 'chromatic',
    violet: 'chromatic',
    gold: 'chromatic',
    green: 'chromatic',
    orange: 'chromatic',
    rose: 'chromatic',
    cyan: 'chromatic',
};

function rampsFor(mode: Mode): Readonly<Record<Hue, Ramp>> {
    const entries = HUES.map((hue) => [hue, buildRamp(SEEDS[mode][hue], SURFACES[mode].background, PROFILES[hue])] as const);

    return Object.fromEntries(entries) as Readonly<Record<Hue, Ramp>>;
}

export const RAMPS: Readonly<Record<Mode, Readonly<Record<Hue, Ramp>>>> = {
    dark: rampsFor('dark'),
    light: rampsFor('light'),
};

export function tone(mode: Mode, hue: Hue, step: Step): string {
    return RAMPS[mode][hue][step];
}
