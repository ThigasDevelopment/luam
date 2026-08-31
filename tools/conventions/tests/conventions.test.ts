import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { checkFile, formatViolation, type Violation } from '#conventions/conventions';
import { scanSource } from '#conventions/source-scan';
import { listSourceFiles } from '#conventions/workspace-files';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function rules(path: string, source: string): string[] {
    return checkFile({ path, source }).map((violation) => violation.rule);
}

function workspaceViolations(): Violation[] {
    const violations: Violation[] = [];

    for (const path of listSourceFiles(repositoryRoot)) {
        violations.push(...checkFile({ path, source: readFileSync(join(repositoryRoot, path), 'utf8') }));
    }

    return violations;
}

describe('the source scanner', () => {
    it('sees a comment and ignores one inside a string', () => {
        expect(scanSource("const a = '// not a comment';\n// a comment\n").comments).toEqual([{ line: 2, column: 1, kind: 'line' }]);
    });

    it('ignores a division and a regular expression that look like comments', () => {
        expect(scanSource('const ratio = total / count;\nconst pattern = /a\\/b/;\n').comments).toEqual([]);
    });

    it('ignores a glob inside a template literal', () => {
        expect(scanSource('const pattern = `${from}/**/*`;\n').comments).toEqual([]);
    });

    it('reports the quote each string opened with', () => {
        expect(scanSource('const a = \'one\';\nconst b = "two";\nconst c = `three`;\n').strings.map((entry) => entry.quote)).toEqual(["'", '"', '`']);
    });
});

describe('the conventions', () => {
    it('rejects a file name that is not kebab-case', () => {
        expect(rules('packages/cli/src/BuildCommand.ts', '')).toContain('kebab-case');
        expect(rules('packages/cli/src/build-command.ts', '')).not.toContain('kebab-case');
        expect(rules('packages/cli/tests/build-command.test.ts', '')).not.toContain('kebab-case');
    });

    it('rejects JavaScript', () => {
        expect(rules('packages/cli/src/helper.js', '')).toContain('typescript-only');
    });

    it('rejects a tab indent', () => {
        expect(rules('packages/cli/src/a.ts', '\tconst a = 1;\n')).toContain('indentation');
        expect(rules('packages/cli/src/a.ts', '    const a = 1;\n')).not.toContain('indentation');
    });

    it('rejects a comment', () => {
        expect(rules('packages/cli/src/a.ts', '// why\nconst a = 1;\n')).toContain('no-comments');
        expect(rules('packages/cli/src/a.ts', '/* why */\nconst a = 1;\n')).toContain('no-comments');
    });

    it('rejects a double-quoted string that could be single-quoted', () => {
        expect(rules('packages/cli/src/a.ts', 'const a = "one";\n')).toContain('single-quotes');
        expect(rules('packages/cli/src/a.ts', 'const a = "it\'s";\n')).not.toContain('single-quotes');
        expect(rules('packages/cli/src/a.ts', "const a = 'one';\n")).not.toContain('single-quotes');
    });

    it('rejects a parent import inside a package source, and allows one outside it', () => {
        const line = "import { a } from '../other/a';\n";

        expect(rules('packages/cli/src/commands/a.ts', line)).toContain('path-aliases');
        expect(rules('packages/cli/tests/a.test.ts', line)).not.toContain('path-aliases');
        expect(rules('docs/scripts/a.ts', line)).not.toContain('path-aliases');
    });

    it('names the file, the position and the rule when it reports', () => {
        const violation = checkFile({ path: 'packages/cli/src/a.ts', source: 'const a = 1;\n// why\n' })[0];

        expect(violation === undefined ? '' : formatViolation(violation)).toContain('packages/cli/src/a.ts:2:1 no-comments:');
    });
});

describe('the workspace', () => {
    it('holds more than five hundred source files', () => {
        expect(listSourceFiles(repositoryRoot).length).toBeGreaterThan(500);
    });

    it('satisfies every convention the gate enforces', () => {
        expect(workspaceViolations().map(formatViolation)).toEqual([]);
    });
});
