import { describe, expect, it } from 'vitest';

import { compareVersionStrings, isReleaseDate, parseVersion } from '#release/semver';

describe('semver', () => {
    it('accepts a strict release version', () => {
        expect(parseVersion('0.15.6')).toEqual({ major: 0, minor: 15, patch: 6 });
    });

    it('rejects anything that is not three numbers', () => {
        for (const value of ['1.2', 'v1.2.3', '1.2.3-beta.1', '01.2.3', '1.2.3 ', '']) {
            expect(parseVersion(value)).toBeNull();
        }
    });

    it('orders versions by number, not by text', () => {
        expect(compareVersionStrings('0.10.0', '0.9.0')).toBeGreaterThan(0);
        expect(compareVersionStrings('0.15.6', '0.15.6')).toBe(0);
        expect(compareVersionStrings('1.0.0', '1.0.1')).toBeLessThan(0);
    });

    it('accepts only a real calendar date', () => {
        expect(isReleaseDate('2026-08-17')).toBe(true);
        expect(isReleaseDate('2026-02-31')).toBe(false);
        expect(isReleaseDate('2026-8-17')).toBe(false);
        expect(isReleaseDate('17-08-2026')).toBe(false);
    });
});
