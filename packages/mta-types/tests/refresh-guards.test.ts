import { describe, expect, it } from 'vitest';

import { diffCatalogs } from '@generator/catalog-fingerprint';
import { MAXIMUM_ADDED, MAXIMUM_ENVIRONMENT_CHANGES, MAXIMUM_SIGNATURE_CHANGES, refreshBlockers } from '@generator/refresh-guards';
import { parseWikiCatalog } from '@generator/wiki-declaration-parser';
import { parseUpstream } from '@generator/upstream-catalog';
import { parseSnapshot, readSnapshot, validateSnapshot } from '@generator/wiki-snapshot';

const SNAPSHOT = readSnapshot();

const CONTEXT = { elementTypes: parseUpstream().contexts.server.elementTypes };

function withPage(name: string, text: string): typeof SNAPSHOT {
    return { ...SNAPSHOT, pages: SNAPSHOT.pages.map((page) => (page.name === name ? { ...page, text } : page)) };
}

const EMPTY_DIFF = { added: [], removed: [], signatures: [], environments: [] };

describe('refresh guards', () => {
    it('lets an unchanged catalog through', () => {
        expect(refreshBlockers(EMPTY_DIFF, 1)).toEqual([]);
    });

    it('refuses a blanked page rather than emitting it', () => {
        expect(() => validateSnapshot(withPage('getElementPosition', ''))).toThrow(/GetElementPosition.*carries no Syntax section/);
    });

    it('refuses a snapshot that lost most of its pages', () => {
        expect(() => validateSnapshot({ ...SNAPSHOT, pages: SNAPSHOT.pages.slice(0, 10) })).toThrow(/holds only 10 pages/);
    });

    it('refuses a snapshot that is not a snapshot at all', () => {
        expect(() => parseSnapshot('{"endpoint":"x"}')).toThrow(/is not a wiki snapshot/);
    });

    it('reports a page whose syntax block was broken rather than dropping it silently', () => {
        const broken = withPage('getElementPosition', '==Syntax==\n<syntaxhighlight lang="lua">\nsomethingElse ( element theElement )\n</syntaxhighlight>\n');
        const parsed = parseWikiCatalog(broken, CONTEXT);

        expect(parsed.unparsed.map((entry) => entry.name)).toEqual(['getElementPosition']);
        expect(parsed.unparsed[0]?.reason).toContain('no Lua block naming the function');
    });

    it('never deletes a declaration the wiki stopped listing', () => {
        const diff = diffCatalogs({ getElementPosition: 'shared ()->bool', stillHere: 'shared ()->bool' }, { stillHere: 'shared ()->bool' });

        expect(diff.removed).toEqual(['getElementPosition']);
        expect(refreshBlockers(diff, 1)).toEqual(['the wiki no longer lists getElementPosition, and a refresh never deletes a declaration']);
    });

    it('refuses a parse rate below the measured bar', () => {
        expect(refreshBlockers(EMPTY_DIFF, 0.5)).toEqual(['only 50.0% of pages parsed, below the 99% bar']);
    });

    it('refuses a mass change that is far more likely to be breakage upstream', () => {
        const added = Array.from({ length: MAXIMUM_ADDED + 1 }, (_unused, index) => `added${index}`);
        const change = (index: number): { name: string; before: string; after: string } => ({ name: `changed${index}`, before: 'a', after: 'b' });
        const signatures = Array.from({ length: MAXIMUM_SIGNATURE_CHANGES + 1 }, (_unused, index) => change(index));
        const environments = Array.from({ length: MAXIMUM_ENVIRONMENT_CHANGES + 1 }, (_unused, index) => change(index));

        expect(refreshBlockers({ ...EMPTY_DIFF, added }, 1)).toHaveLength(1);
        expect(refreshBlockers({ ...EMPTY_DIFF, signatures }, 1)).toHaveLength(1);
        expect(refreshBlockers({ ...EMPTY_DIFF, environments }, 1)).toHaveLength(1);
    });

    it('separates an environment change from a signature change', () => {
        const diff = diffCatalogs({ a: 'server ()->bool', b: 'shared ()->bool' }, { a: 'shared ()->bool', b: 'shared (str)->bool' });

        expect(diff.environments.map((entry) => entry.name)).toEqual(['a']);
        expect(diff.signatures.map((entry) => entry.name)).toEqual(['b']);
    });
});
