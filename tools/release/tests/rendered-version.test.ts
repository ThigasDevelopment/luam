import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseChangelog } from '#release/changelog';
import { manualAnchor, releaseDate, releaseNotes } from '#release/release-notes';
import { CHANGELOG_TARGETS, repositoryRoot, sourceVersion } from '#release/repository';
import { checkVersionContract } from '#release/version-contract';

const root = repositoryRoot();
const version = sourceVersion(root);

function read(path: string): string {
    return readFileSync(join(root, path), 'utf8');
}

describe('the rendered version', () => {
    it('holds across every package and changelog in this repository', () => {
        expect(checkVersionContract(root, `v${version}`).problems).toEqual([]);
    });

    it('is the only source the banner reads', () => {
        expect(read('docs/.vitepress/config.ts')).toContain("require('../../packages/cli/package.json')");
        expect(read('docs/.vitepress/theme/VersionBanner.vue')).toContain('luam.version');
    });

    it('is rendered, never written, in the install and extension examples', () => {
        for (const page of ['docs/en/guide/installation.md', 'docs/pt-br/guide/installation.md']) {
            expect(read(page)).toContain('@thigasdevelopment/luam@%LUAM_VERSION%');
        }

        for (const page of ['docs/en/tooling/editors.md', 'docs/pt-br/tooling/editors.md']) {
            expect(read(page)).toContain('luam-%LUAM_VERSION%.vsix');
        }
    });

    it('opens a release section in all three changelogs', () => {
        for (const target of CHANGELOG_TARGETS) {
            const document = parseChangelog(read(target.path), target.unreleased);

            expect(document.releases[0]?.version).toBe(version);
        }
    });

    it('keeps 0.1.1 inside its own release section of the manual', () => {
        for (const path of ['docs/en/changelog.md', 'docs/pt-br/changelog.md']) {
            const lines = read(path).replace(/\r\n/g, '\n').split('\n');
            const heading = lines.findIndex((line) => line.startsWith('## 0.1.1 - '));

            expect(heading).toBeGreaterThan(-1);
            expect(lines.slice(0, heading).some((line) => line.includes('0.1.1'))).toBe(false);
        }
    });

    it('links release notes to anchors the built manual actually renders', () => {
        const notes = releaseNotes(root);

        expect(notes).toContain(`#${manualAnchor(version, releaseDate(root, version))}`);
        expect(notes).toContain(`@thigasdevelopment/luam@${version}`);
    });
});
