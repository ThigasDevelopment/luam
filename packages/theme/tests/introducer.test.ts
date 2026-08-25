import { describe, expect, it } from 'vitest';

import { contrast } from '@theme/color';
import { CONTRAST_FLOORS, INTRODUCER_PAIRS } from '@theme/constraints';
import { MODES } from '@theme/palette';
import { resolve } from '@theme/resolve';
import { styleKey } from '@theme/role-types';
import { roleOf } from '@theme/roles';

describe('introducers', () => {
    it('never paints a word and the name it introduces the same', () => {
        for (const [keyword, name] of INTRODUCER_PAIRS) {
            expect(styleKey(roleOf(keyword)), `${keyword} against ${name}`).not.toBe(styleKey(roleOf(name)));
        }
    });

    it('keeps the two far enough apart to read as two things', () => {
        for (const [keyword, name] of INTRODUCER_PAIRS) {
            for (const mode of MODES) {
                const first = resolve(keyword, mode);
                const second = resolve(name, mode);

                if (first.fontStyle !== second.fontStyle || roleOf(keyword).hue !== roleOf(name).hue) {
                    continue;
                }

                const ratio = contrast(first.foreground, second.foreground);

                expect(ratio, `${mode} ${keyword} against ${name} is ${ratio}:1`).toBeGreaterThanOrEqual(CONTRAST_FLOORS.step);
            }
        }
    });

    it('reads a declaration head the way a local declaration reads', () => {
        for (const mode of MODES) {
            const binding = resolve('keyword', mode);
            const declared = resolve('identifier.local', mode);
            const typeName = resolve('name.type', mode);

            expect(binding.foreground, mode).not.toBe(typeName.foreground);
            expect(binding.foreground, mode).not.toBe(declared.foreground);
        }
    });
});
