import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { cleanup, fixture, manualChangelog, write } from './fixture';

import { applyRelease, planRelease } from '#release/release-preparation';
import { checkVersionContract } from '#release/version-contract';

function read(root: string, path: string): string {
    return readFileSync(join(root, path), 'utf8');
}

afterEach(cleanup);

describe('release preparation', () => {
    it('promotes the unreleased content of every changelog and bumps every package', () => {
        const root = fixture();
        const plan = planRelease(root, '1.1.0', '2026-02-01');

        expect(plan.problems).toEqual([]);
        expect(applyRelease(root, plan).sort()).toEqual([
            'CHANGELOG.md',
            'docs/en/changelog.md',
            'docs/pt-br/changelog.md',
            'packages/cli/package.json',
            'packages/runtime/package.json',
        ]);

        expect(read(root, 'packages/cli/package.json')).toContain('"version": "1.1.0"');
        expect(read(root, 'packages/runtime/package.json')).toContain('"version": "1.1.0"');
        expect(read(root, 'CHANGELOG.md')).toContain('## Unreleased\n\n## 1.1.0 - 2026-02-01\n\n### Added\n\n- A new thing.');
        expect(read(root, 'docs/pt-br/changelog.md')).toContain('## Não lançado\n\n## 1.1.0 - 2026-02-01\n\n### Alterado\n\n- A page moved.');
        expect(checkVersionContract(root, 'v1.1.0').problems).toEqual([]);
    });

    it('leaves an empty unreleased section behind', () => {
        const root = fixture();

        applyRelease(root, planRelease(root, '1.1.0', '2026-02-01'));

        const [before] = read(root, 'CHANGELOG.md').split('## 1.1.0');

        expect(before?.trimEnd().endsWith('## Unreleased')).toBe(true);
    });

    it('is deterministic across two runs on the same input', () => {
        const first = planRelease(fixture(), '1.1.0', '2026-02-01');
        const second = planRelease(fixture(), '1.1.0', '2026-02-01');

        expect(first.changes).toEqual(second.changes);
    });

    it('refuses a malformed version', () => {
        expect(planRelease(fixture(), '1.1', '2026-02-01').problems).toEqual(['"1.1" is not a strict SemVer version such as 1.2.3.']);
        expect(planRelease(fixture(), 'v1.1.0', '2026-02-01').problems).toEqual(['"v1.1.0" is not a strict SemVer version such as 1.2.3.']);
        expect(planRelease(fixture(), '1.1.0-beta.1', '2026-02-01').problems).toEqual(['"1.1.0-beta.1" is not a strict SemVer version such as 1.2.3.']);
    });

    it('refuses a malformed date', () => {
        expect(planRelease(fixture(), '1.1.0', '01-02-2026').problems).toEqual(['"01-02-2026" is not a calendar date written as YYYY-MM-DD.']);
    });

    it('refuses a downgrade and a repeat of the current version', () => {
        expect(planRelease(fixture(), '0.9.0', '2026-02-01').problems).toEqual(['packages/cli/package.json is already 1.0.0. Prepare a version above it, not 0.9.0.']);
        expect(planRelease(fixture(), '1.0.0', '2026-02-01').problems).toEqual(['packages/cli/package.json is already 1.0.0. Prepare a version above it, not 1.0.0.']);
    });

    it('refuses a second identical invocation', () => {
        const root = fixture();

        applyRelease(root, planRelease(root, '1.1.0', '2026-02-01'));

        expect(planRelease(root, '1.1.0', '2026-02-01').problems).toEqual(['packages/cli/package.json is already 1.1.0. Prepare a version above it, not 1.1.0.']);
    });

    it('refuses a version that already has a release heading', () => {
        const root = fixture();

        write(root, 'CHANGELOG.md', ['# Changelog', '', '## Unreleased', '', '- A new thing.', '', '## 1.1.0 - 2026-02-01', '', '- Already there.', ''].join('\n'));

        expect(planRelease(root, '1.1.0', '2026-02-01').problems).toEqual(['CHANGELOG.md already carries a 1.1.0 release heading.']);
    });

    it('refuses an empty unreleased section in any locale', () => {
        const root = fixture({ ptBR: ['# Manual', '', '## Não lançado', '', '## 1.0.0 - 2026-01-01', '', '- The first manual.', ''].join('\n') });
        const plan = planRelease(root, '1.1.0', '2026-02-01');

        expect(plan.problems).toEqual(['docs/pt-br/changelog.md has nothing under "## Não lançado". Write the entry before preparing 1.1.0.']);
        expect(plan.changes).toEqual([]);
    });

    it('refuses a changelog with no unreleased heading and writes nothing', () => {
        const root = fixture({ en: manualChangelog('Unreleased', 'Changed').replace('## Unreleased', '## Recent') });
        const plan = planRelease(root, '1.1.0', '2026-02-01');

        expect(plan.problems).toEqual(['docs/en/changelog.md has no "## Unreleased" heading to promote.']);
        expect(read(root, 'packages/cli/package.json')).toContain('"version": "1.0.0"');
    });
});
