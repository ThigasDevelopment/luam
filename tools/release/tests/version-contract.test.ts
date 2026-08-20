import { afterEach, describe, expect, it } from 'vitest';

import { cleanup, fixture, manualChangelog, productChangelog, write } from './fixture';

import { checkVersionContract } from '#release/version-contract';

function messages(root: string, tag: string | null): string[] {
    return checkVersionContract(root, tag).problems.map((problem) => `${problem.file}: ${problem.message}`);
}

afterEach(cleanup);

describe('the version contract', () => {
    it('passes when every package and changelog names the source version', () => {
        const root = fixture({ version: '1.1.0' });

        const promote = (source: string, unreleased: string): string =>
            source.replace(`## ${unreleased}\n`, `## ${unreleased}\n\n## 1.1.0 - 2026-02-01\n\n- Released.\n`);

        write(root, 'CHANGELOG.md', promote(productChangelog(), 'Unreleased'));
        write(root, 'docs/en/changelog.md', promote(manualChangelog('Unreleased', 'Changed'), 'Unreleased'));
        write(root, 'docs/pt-br/changelog.md', promote(manualChangelog('Não lançado', 'Alterado'), 'Não lançado'));

        expect(messages(root, 'v1.1.0')).toEqual([]);
    });

    it('reports a package that drifted from the source version', () => {
        const root = fixture();

        write(root, 'packages/runtime/package.json', `${JSON.stringify({ name: '@luam/runtime', version: '0.9.0' }, null, 4)}\n`);

        expect(messages(root, null).join('\n')).toContain('packages/runtime/package.json: "@luam/runtime" is 0.9.0');
    });

    it('reports a tag that differs from the committed version', () => {
        const root = fixture();

        expect(messages(root, 'v2.0.0').join('\n')).toContain('The release was asked for "v2.0.0", but the committed version is 1.0.0');
    });

    it('reports a missing release heading for the current version', () => {
        const root = fixture({ version: '1.1.0' });

        expect(messages(root, null).join('\n')).toContain('The newest release heading is 1.0.0, but packages/cli/package.json is 1.1.0');
    });

    it('reports a heading that names a version without the release form', () => {
        const root = fixture({ product: ['# Changelog', '', '## Unreleased', '', '## Documents Luam 1.0.0', '', '- Prose.', ''].join('\n') });

        expect(messages(root, null).join('\n')).toContain('"## Documents Luam 1.0.0" at line 5 names a version but is not written as "## X.Y.Z - YYYY-MM-DD"');
    });

    it('reports release headings that are not newest first', () => {
        const root = fixture({
            version: '1.0.0',
            product: ['# Changelog', '', '## Unreleased', '', '## 1.0.0 - 2026-01-01', '', '- One.', '', '## 1.2.0 - 2026-03-01', '', '- Two.', ''].join('\n'),
        });

        expect(messages(root, null).join('\n')).toContain('"1.2.0" at line 9 is not older than "1.0.0"');
    });

    it('reports a duplicated release heading', () => {
        const root = fixture({
            product: ['# Changelog', '', '## Unreleased', '', '## 1.0.0 - 2026-01-01', '', '- One.', '', '## 1.0.0 - 2025-01-01', '', '- Two.', ''].join('\n'),
        });

        expect(messages(root, null).join('\n')).toContain('"1.0.0" has more than one release heading');
    });

    it('reports an invalid release date', () => {
        const root = fixture({ product: ['# Changelog', '', '## Unreleased', '', '## 1.0.0 - 2026-02-31', '', '- One.', ''].join('\n') });

        expect(messages(root, null).join('\n')).toContain('carries the invalid date "2026-02-31"');
    });

    it('reports a release the other locale does not carry', () => {
        const root = fixture({ en: manualChangelog('Unreleased', 'Changed').replace('1.0.0 - 2026-01-01', '1.0.0 - 2026-01-02') });

        expect(messages(root, null).join('\n')).toContain('docs/pt-br/changelog.md: The manual is missing the "1.0.0 - 2026-01-02" release heading');
    });

    it('reports a manual with no unreleased heading', () => {
        const root = fixture({ en: ['# Manual', '', '## 1.0.0 - 2026-01-01', '', '- The first manual.', ''].join('\n') });

        expect(messages(root, null).join('\n')).toContain('docs/en/changelog.md: No "## Unreleased" heading');
    });
});
