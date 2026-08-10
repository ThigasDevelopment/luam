import { describe, expect, it } from 'vitest';

import { isSensitiveKey, mergeEnvFiles, parseEnvFile } from '@compiler/project/env-file';

describe('env file parsing', () => {
    it('carries the Lua type of an unquoted value', () => {
        const parsed = parseEnvFile('PORT=3306\nDEBUG=true\nHOST=localhost\n');

        expect(parsed.entries).toEqual([
            { key: 'PORT', value: '3306', kind: 'number', line: 1 },
            { key: 'DEBUG', value: 'true', kind: 'boolean', line: 2 },
            { key: 'HOST', value: 'localhost', kind: 'string', line: 3 },
        ]);
    });

    it('forces a string when the value is quoted', () => {
        const parsed = parseEnvFile('PORT="3306"\nFLAG=\'true\'\n');

        expect(parsed.entries.map((entry) => `${entry.key} ${entry.kind} ${entry.value}`)).toEqual(['PORT string 3306', 'FLAG string true']);
    });

    it('ignores comments and blank lines', () => {
        const parsed = parseEnvFile('# Database\n\nPORT=3306 # the listening port\n');

        expect(parsed.entries).toEqual([{ key: 'PORT', value: '3306', kind: 'number', line: 3 }]);
    });

    it('reports a malformed entry with its line', () => {
        const parsed = parseEnvFile('PORT 3306\n');

        expect(parsed.entries).toEqual([]);
        expect(parsed.errors).toEqual([{ line: 1, message: 'Malformed entry on line 1. Expected "KEY=value".' }]);
    });

    it('takes values from the local override but never its types', () => {
        const merged = mergeEnvFiles(parseEnvFile('PORT=3306\n'), parseEnvFile('PORT="7777"\nEXTRA=1\n'));

        expect(merged.entries).toEqual([{ key: 'PORT', value: '7777', kind: 'number', line: 1 }]);
    });

    it('treats credential shaped keys as sensitive', () => {
        expect(['DB_PASSWORD', 'API_TOKEN', 'JWT_SECRET', 'PRIVATE_KEY'].every(isSensitiveKey)).toBe(true);
        expect(['PORT', 'SERVER_NAME', 'DEBUG'].some(isSensitiveKey)).toBe(false);
    });
});
