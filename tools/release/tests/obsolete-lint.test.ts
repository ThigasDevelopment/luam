import { afterEach, describe, expect, it } from 'vitest';

import { cleanup, fixture, write } from './fixture';

import { lintObsolete } from '#release/obsolete-lint';

function findings(root: string): string[] {
    return lintObsolete(root).findings.map((finding) => `${finding.file}:${finding.line} ${finding.rule}`);
}

afterEach(cleanup);

describe('the obsolete content linter', () => {
    it('reports a removed project file in a current page', () => {
        const root = fixture();

        write(root, 'docs/en/guide/project-layout.md', ['# Layout', '', 'Write `luam.json` in the project root.', ''].join('\n'));

        expect(findings(root)).toContain('docs/en/guide/project-layout.md:3 project-config-file');
    });

    it('reports a removed CLI option', () => {
        const root = fixture();

        write(root, 'docs/en/tooling/cli.md', ['# CLI', '', 'Run `luam build --config other.manifest`.', ''].join('\n'));

        expect(findings(root)).toContain('docs/en/tooling/cli.md:3 config-option');
    });

    it('reports a pinned install version and a pinned extension file name', () => {
        const root = fixture();

        write(root, 'docs/en/guide/installation.md', ['# Install', '', '`npm i -g @thigasdevelopment/luam@1.0.0`', '', '`luam-1.0.0.vsix`', ''].join('\n'));

        expect(findings(root)).toEqual(['docs/en/guide/installation.md:3 pinned-cli-version', 'docs/en/guide/installation.md:5 pinned-vsix-version']);
    });

    it('accepts the rendered version token', () => {
        const root = fixture();

        write(root, 'docs/en/guide/installation.md', ['# Install', '', '`npm i -g @thigasdevelopment/luam@%LUAM_VERSION%`', '', '`luam-%LUAM_VERSION%.vsix`', ''].join('\n'));

        expect(findings(root)).toEqual([]);
    });

    it('allows a removed form under a release heading no newer than its removal', () => {
        const root = fixture();

        write(root, 'docs/en/changelog.md', ['# Manual', '', '## Unreleased', '', '## 0.6.0 - 2026-01-01', '', '- `luam.json` became `.luam.manifest`.', ''].join('\n'));

        expect(findings(root)).toEqual([]);
    });

    it('reports a removed form under a release heading newer than its removal', () => {
        const root = fixture();

        write(root, 'docs/en/changelog.md', ['# Manual', '', '## Unreleased', '', '## 0.7.0 - 2026-01-01', '', '- Write `luam.json` first.', ''].join('\n'));

        expect(findings(root)).toEqual(['docs/en/changelog.md:7 project-config-file']);
    });

    it('reports a removed form under the unreleased heading', () => {
        const root = fixture();

        write(root, 'docs/en/changelog.md', ['# Manual', '', '## Unreleased', '', '- Write `luam.json` first.', ''].join('\n'));

        expect(findings(root)).toEqual(['docs/en/changelog.md:5 project-config-file']);
    });

    it('never allows a pinned version, even inside release history', () => {
        const root = fixture();

        write(root, 'docs/en/changelog.md', ['# Manual', '', '## Unreleased', '', '## 0.6.0 - 2026-01-01', '', '- `luam-0.6.0.vsix` shipped.', ''].join('\n'));

        expect(findings(root)).toEqual(['docs/en/changelog.md:7 pinned-vsix-version']);
    });

    it('reports a maintained example that still ships the removed project file', () => {
        const root = fixture();

        write(root, 'examples/json/luam.json', '{}\n');

        expect(findings(root)).toContain('examples/json/luam.json:1 project-config-file');
    });

    it('reports an exemption that no longer matches a line', () => {
        const root = fixture();

        write(root, 'docs/en/tooling/cli.md', ['# CLI', '', 'Nothing obsolete here.', ''].join('\n'));

        const unused = lintObsolete(root).unusedExemptions.map((entry) => `${entry.file} ${entry.rule}`);

        expect(unused).toContain('docs/en/tooling/cli.md project-config-file');
    });
});
