import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const WORKFLOWS = fileURLToPath(new URL('../../../.github/workflows', import.meta.url));

const REFRESH = readFileSync(join(WORKFLOWS, 'catalog-refresh.yml'), 'utf8');

const USES = /^\s*-?\s*uses:\s*(\S+)(?:\s+#.*)?\s*$/gm;

function externalActions(workflow: string): string[] {
    const actions: string[] = [];

    USES.lastIndex = 0;

    for (let match = USES.exec(workflow); match !== null; match = USES.exec(workflow)) {
        const reference = match[1] ?? '';

        if (!reference.startsWith('./')) {
            actions.push(reference);
        }
    }

    return actions;
}

describe('catalog refresh workflow', () => {
    it('pins every third-party action to a commit', () => {
        const unpinned = externalActions(REFRESH).filter((reference) => !/@[0-9a-f]{40}$/.test(reference));

        expect(unpinned).toEqual([]);
        expect(externalActions(REFRESH).length).toBeGreaterThan(0);
    });

    it('grants read by default and write only to the job that opens the proposal', () => {
        expect(REFRESH).toContain('permissions:\n    contents: read\n');
        expect(REFRESH).toContain('            contents: write\n            pull-requests: write');
        expect(REFRESH).not.toContain('id-token:');
    });

    it('opens a proposal and never merges one', () => {
        expect(REFRESH).toContain('gh pr create');
        expect(REFRESH).not.toContain('gh pr merge');
        expect(REFRESH).not.toContain('--auto');
        expect(REFRESH).not.toContain('automerge');
    });

    it('runs the fetch nowhere else', () => {
        const elsewhere = readdirSync(WORKFLOWS)
            .filter((name) => name !== 'catalog-refresh.yml')
            .filter((name) => readFileSync(join(WORKFLOWS, name), 'utf8').includes('fetch-wiki'));

        expect(elsewhere).toEqual([]);
    });

    it('regenerates and proves the committed catalog matches in CI', () => {
        expect(readFileSync(join(WORKFLOWS, 'unit-typecheck.yml'), 'utf8')).toContain('git diff --exit-code -- packages/mta-types/src/generated');
        expect(readFileSync(join(WORKFLOWS, 'ci.yml'), 'utf8')).toContain('uses: ./.github/workflows/unit-typecheck.yml');
    });
});
