import { describe, expect, it } from 'vitest';

import { contrast } from '@theme/color';
import { CONFUSION_SET_IDS, CONTRAST_FLOORS, differsOnlyByStep, ERASED_HUE, NEUTRAL_ROLES, pairsIn, REPORTING_ONLY_HUES, SYNTAX_HUES } from '@theme/constraints';
import { MODES } from '@theme/palette';
import { resolve } from '@theme/resolve';
import { styleKey } from '@theme/role-types';
import { roleOf, ROLES } from '@theme/roles';
import { CUSTOM_MODIFIERS, SEMANTIC_SELECTORS } from '@theme/targets/semantic';

describe('distinctness', () => {
    it('separates every pair inside a confusion set on at least one axis', () => {
        for (const set of CONFUSION_SET_IDS) {
            for (const [first, second] of pairsIn(set)) {
                expect(styleKey(first), `${set}: ${first.id} and ${second.id}`).not.toBe(styleKey(second));
            }
        }
    });

    it('keeps a value step pair measurably apart in both modes', () => {
        for (const set of CONFUSION_SET_IDS) {
            for (const [first, second] of pairsIn(set)) {
                if (!differsOnlyByStep(first, second)) {
                    continue;
                }

                for (const mode of MODES) {
                    const ratio = contrast(resolve(first, mode).foreground, resolve(second, mode).foreground);

                    expect(ratio, `${mode} ${first.id} against ${second.id} is ${ratio}:1`).toBeGreaterThanOrEqual(CONTRAST_FLOORS.step);
                }
            }
        }
    });

    it('keeps every syntax role on the one syntax hue', () => {
        for (const role of ROLES) {
            expect(SYNTAX_HUES, role.id).toContain(role.hue);
        }
    });

    it('paints the erased layer, and only the erased layer, in the erased hue', () => {
        for (const role of ROLES) {
            if (role.exception !== null) {
                continue;
            }

            expect(role.hue === ERASED_HUE, `${role.id} is ${role.hue} but its layer is ${role.layer}`).toBe(role.layer === 'erased');
        }
    });

    it('lets no role dodge the erased check by claiming to be neutral', () => {
        const neutral = ROLES.filter((role) => role.layer === 'neutral').map((role) => role.id);

        expect(neutral.sort()).toEqual([...NEUTRAL_ROLES].sort());
    });

    it('names the environment directive as the only documented exception', () => {
        const flagged = ROLES.filter((role) => role.exception !== null).map((role) => role.id);

        expect(flagged).toEqual(['directive.environment']);
    });

    it('reserves every reporting hue for the chrome and never for syntax', () => {
        for (const hue of REPORTING_ONLY_HUES) {
            expect(ROLES.filter((role) => role.hue === hue), hue).toEqual([]);
        }
    });

    it('makes every custom modifier change something visible', () => {
        for (const modifier of CUSTOM_MODIFIERS) {
            const bearing = SEMANTIC_SELECTORS.filter((entry) => entry.selector.split('.').includes(modifier));

            expect(bearing.length, modifier).toBeGreaterThan(0);

            for (const entry of bearing) {
                const base = entry.selector
                    .split('.')
                    .filter((segment) => segment !== modifier)
                    .join('.');
                const fallback = SEMANTIC_SELECTORS.find((other) => other.selector === base);

                if (fallback !== undefined) {
                    expect(styleKey(roleOf(entry.role)), entry.selector).not.toBe(styleKey(roleOf(fallback.role)));
                }
            }
        }
    });

    it('separates a generated member from an authored one', () => {
        expect(styleKey(roleOf('identifier.generated'))).not.toBe(styleKey(roleOf('call.method')));
    });

    it('gives the set one callable quartet four readings', () => {
        const quartet = ['call.function', 'call.method', 'call.native', 'call.library'];

        for (const mode of MODES) {
            const styles = quartet.map((role) => styleKey(roleOf(role)));

            expect(new Set(styles).size, mode).toBe(quartet.length);
            expect(new Set(quartet.map((role) => resolve(role, mode).foreground)).size, mode).toBe(3);
        }
    });
});
