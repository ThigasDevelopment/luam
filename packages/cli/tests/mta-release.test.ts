import { afterEach, describe, expect, it } from 'vitest';

import { resolveMtaVersion, RELEASE_ENDPOINT, VERSION_CACHE_FILE, type ReleaseFetch } from '@cli/build/mta-release';

import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const DAY_MS = 24 * 60 * 60 * 1000;

function fixture(files: Readonly<Record<string, string>> = {}): ProjectFixture {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created;
}

function responds(payload: unknown, ok = true): { request: ReleaseFetch; urls: string[] } {
    const urls: string[] = [];
    const request: ReleaseFetch = async (input) => {
        urls.push(input);

        return { ok, json: async (): Promise<unknown> => payload } as Response;
    };

    return { request, urls };
}

const REJECTS: ReleaseFetch = async () => {
    throw new Error('getaddrinfo ENOTFOUND api.github.com');
};

function cached(version: string, checkedAt: number): Record<string, string> {
    return { [VERSION_CACHE_FILE]: `${JSON.stringify({ version, checkedAt }, null, 4)}\n` };
}

afterEach(() => {
    for (const created of fixtures.splice(0)) {
        created.dispose();
    }
});

describe('mta release lookup', () => {
    it('resolves the latest published tag and writes it to the cache', async () => {
        const project = fixture();
        const { request, urls } = responds({ tag_name: '1.6.0' });

        expect(await resolveMtaVersion(project.root, { request })).toEqual({ version: '1.6.0', warning: null });
        expect(urls).toEqual([RELEASE_ENDPOINT]);
        expect(JSON.parse(project.read(VERSION_CACHE_FILE))).toMatchObject({ version: '1.6.0' });
    });

    it('strips a leading v from the tag', async () => {
        const { request } = responds({ tag_name: 'v1.6.0-r5' });

        expect((await resolveMtaVersion(fixture().root, { request })).version).toBe('1.6.0-r5');
    });

    it('reads the cache without a request while the value is fresh', async () => {
        const project = fixture(cached('1.5.9', Date.now()));
        const { request, urls } = responds({ tag_name: '1.6.0' });

        expect((await resolveMtaVersion(project.root, { request })).version).toBe('1.5.9');
        expect(urls).toEqual([]);
    });

    it('refreshes a stale cache', async () => {
        const project = fixture(cached('1.5.9', Date.now() - 2 * DAY_MS));
        const { request, urls } = responds({ tag_name: '1.6.0' });

        expect((await resolveMtaVersion(project.root, { request })).version).toBe('1.6.0');
        expect(urls).toEqual([RELEASE_ENDPOINT]);
    });

    it('falls back to the cached value when the network is unavailable', async () => {
        const project = fixture(cached('1.5.9', Date.now() - 2 * DAY_MS));

        expect(await resolveMtaVersion(project.root, { request: REJECTS })).toEqual({ version: '1.5.9', warning: null });
    });

    it('warns and resolves nothing when there is neither network nor cache', async () => {
        const resolved = await resolveMtaVersion(fixture().root, { request: REJECTS });

        expect(resolved.version).toBeNull();
        expect(resolved.warning).toContain('min_mta_version');
    });

    it('treats a malformed tag as a failed lookup', async () => {
        const cases = [{ tag_name: '<script>' }, { tag_name: '1.6.0" onload="x' }, { tag_name: 42 }, { tag_name: '' }, {}, null];

        for (const payload of cases) {
            const resolved = await resolveMtaVersion(fixture().root, { request: responds(payload).request });

            expect(resolved.version, JSON.stringify(payload)).toBeNull();
        }
    });

    it('treats a failed HTTP status as a failed lookup', async () => {
        const { request } = responds({ tag_name: '1.6.0' }, false);

        expect((await resolveMtaVersion(fixture().root, { request })).version).toBeNull();
    });

    it('never writes a malformed cache value into the manifest', async () => {
        const project = fixture({ [VERSION_CACHE_FILE]: '{ "version": "<meta>", "checkedAt": 1 }\n' });
        const { request } = responds({ tag_name: '1.6.0' });

        expect((await resolveMtaVersion(project.root, { request })).version).toBe('1.6.0');
    });

    it('survives an unreadable cache file', async () => {
        const project = fixture({ [VERSION_CACHE_FILE]: 'not json\n' });

        expect((await resolveMtaVersion(project.root, { request: REJECTS })).version).toBeNull();
    });

    it('skips the lookup entirely and reports the cached value', async () => {
        const project = fixture(cached('1.5.9', 0));
        const { request, urls } = responds({ tag_name: '1.6.0' });

        expect((await resolveMtaVersion(project.root, { skip: true, request })).version).toBe('1.5.9');
        expect(urls).toEqual([]);
    });

    it('skips the lookup with no cache and stays silent', async () => {
        expect(await resolveMtaVersion(fixture().root, { skip: true, request: REJECTS })).toEqual({ version: null, warning: null });
    });
});
