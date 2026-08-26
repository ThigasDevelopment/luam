import type { Hue } from '@theme/palette';
import type { Step } from '@theme/ramp';

export type ConfusionSet = 'callable' | 'declaration-name' | 'identifier' | 'keyword' | 'literal' | 'type' | 'punctuation' | 'comment';

export type FontStyle = 'none' | 'bold' | 'italic';

export type Layer = 'erased' | 'runtime' | 'neutral';

export interface Role {
    id: string;
    set: ConfusionSet;
    hue: Hue;
    step: Step;
    style: FontStyle;
    layer: Layer;
    ambient: boolean;
    exception: string | null;
    description: string;
}

export interface ResolvedRole {
    foreground: string;
    fontStyle: FontStyle;
}

export function styleKey(role: Role): string {
    return `${role.hue}/${role.step}/${role.style}`;
}
