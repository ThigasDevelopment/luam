import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { LATEST_ENGINE_VERSION } from '@compiler/manifest/manifest-defaults';

export type ReleaseFetch = (input: string, init: RequestInit) => Promise<Response>;

export interface MtaVersion {
    version: string | null;
    warning: string | null;
}

export interface ReleaseOptions {
    skip?: boolean;
    request?: ReleaseFetch;
    now?: number;
}

export const RELEASE_ENDPOINT = 'https://api.github.com/repos/multitheftauto/mtasa-blue/releases/latest';

export const VERSION_CACHE_FILE = '.luam/mta-version.json';

const REQUEST_TIMEOUT_MS = 10000;

const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const VERSION_PATTERN = /^[0-9]+(?:\.[0-9]+)*(?:-[0-9A-Za-z.]+)?$/;

const MAX_VERSION_LENGTH = 32;

const MISSING_VERSION =
    'The latest MTA release could not be resolved and no version is cached, so "min_mta_version" is left out of "meta.xml". The resource still loads.';

interface CacheEntry {
    version: string;
    checkedAt: number;
}

function normalizeTag(tag: unknown): string | null {
    if (typeof tag !== 'string') {
        return null;
    }

    const version = tag.trim().replace(/^v/i, '');

    return version.length > 0 && version.length <= MAX_VERSION_LENGTH && VERSION_PATTERN.test(version) ? version : null;
}

function cachePath(root: string): string {
    return resolve(root, VERSION_CACHE_FILE);
}

function readCache(root: string): CacheEntry | null {
    const path = cachePath(root);

    if (!existsSync(path)) {
        return null;
    }

    try {
        const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));

        if (typeof parsed !== 'object' || parsed === null) {
            return null;
        }

        const { version, checkedAt } = parsed as Partial<CacheEntry>;
        const normalized = normalizeTag(version);

        return normalized === null || typeof checkedAt !== 'number' ? null : { version: normalized, checkedAt };
    } catch {
        return null;
    }
}

function writeCache(root: string, entry: CacheEntry): void {
    const path = cachePath(root);

    try {
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, `${JSON.stringify(entry, null, 4)}\n`, 'utf8');
    } catch {
        return;
    }
}

async function fetchLatest(request: ReleaseFetch): Promise<string | null> {
    try {
        const response = await request(RELEASE_ENDPOINT, {
            headers: { Accept: 'application/vnd.github+json' },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
            return null;
        }

        const payload: unknown = await response.json();

        return typeof payload === 'object' && payload !== null ? normalizeTag((payload as { tag_name?: unknown }).tag_name) : null;
    } catch {
        return null;
    }
}

export async function resolveEngineVersion(root: string, minVersion: string, options: ReleaseOptions = {}): Promise<MtaVersion> {
    if (minVersion === LATEST_ENGINE_VERSION) {
        return resolveMtaVersion(root, options);
    }

    return { version: normalizeTag(minVersion), warning: null };
}

export async function resolveMtaVersion(root: string, options: ReleaseOptions = {}): Promise<MtaVersion> {
    const cached = readCache(root);
    const now = options.now ?? Date.now();

    if (options.skip === true || (cached !== null && now - cached.checkedAt < CACHE_MAX_AGE_MS)) {
        return { version: cached?.version ?? null, warning: null };
    }

    const fetched = await fetchLatest(options.request ?? fetch);

    if (fetched !== null) {
        writeCache(root, { version: fetched, checkedAt: now });

        return { version: fetched, warning: null };
    }

    return cached === null ? { version: null, warning: MISSING_VERSION } : { version: cached.version, warning: null };
}
