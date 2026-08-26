import { describe, expect, it } from 'vitest';

import { chrome } from '@theme/resolve';
import { contrast } from '@theme/color';
import { CONTRAST_FLOORS, floorFor } from '@theme/constraints';
import { DIAGNOSTIC_KEYS } from '@theme/chrome';
import { MODES, SURFACES } from '@theme/palette';
import { resolve } from '@theme/resolve';
import { ROLES } from '@theme/roles';

function report(mode: string, label: string, ratio: number, floor: number): string {
    return `${mode} ${label} is ${ratio}:1 against a floor of ${floor}:1`;
}

describe('contrast', () => {
    it('keeps every role above its floor against the editor background', () => {
        for (const mode of MODES) {
            const background = SURFACES[mode].background;

            for (const role of ROLES) {
                const ratio = contrast(resolve(role, mode).foreground, background);

                expect(ratio, report(mode, role.id, ratio, floorFor(role))).toBeGreaterThanOrEqual(floorFor(role));
            }
        }
    });

    it('keeps the chrome a user reads constantly readable', () => {
        for (const mode of MODES) {
            const surface = chrome(mode);
            const pairs: [string, string, string][] = [
                ['status bar text', surface.foreground, surface.surface],
                ['tab label', surface.dimForeground, surface.surface],
                ['active tab label', surface.foreground, surface.background],
                ['sidebar text', surface.foreground, surface.surface],
            ];

            for (const [label, foreground, background] of pairs) {
                const ratio = contrast(foreground, background);

                expect(ratio, report(mode, label, ratio, CONTRAST_FLOORS.body)).toBeGreaterThanOrEqual(CONTRAST_FLOORS.body);
            }
        }
    });

    it('keeps the inlay hint above the ambient floor', () => {
        for (const mode of MODES) {
            const surface = chrome(mode);
            const ratio = contrast(surface.inlayHint, surface.background);

            expect(ratio, report(mode, 'inlay hint', ratio, CONTRAST_FLOORS.ambient)).toBeGreaterThanOrEqual(CONTRAST_FLOORS.ambient);
        }
    });

    it('keeps every diagnostic colour readable on the editor and on the panel', () => {
        for (const mode of MODES) {
            const surface = chrome(mode);

            for (const key of DIAGNOSTIC_KEYS) {
                for (const [label, background] of [
                    ['editor', surface.background],
                    ['panel', surface.surface],
                ] as const) {
                    const ratio = contrast(surface[key] as string, background);

                    expect(ratio, report(mode, `${String(key)} on the ${label}`, ratio, CONTRAST_FLOORS.body)).toBeGreaterThanOrEqual(
                        CONTRAST_FLOORS.body,
                    );
                }
            }
        }
    });

    it('keeps the four diagnostic severities apart', () => {
        for (const mode of MODES) {
            const surface = chrome(mode);
            const colours = DIAGNOSTIC_KEYS.map((key) => surface[key] as string);

            expect(new Set(colours).size, mode).toBe(DIAGNOSTIC_KEYS.length);
        }
    });
});
