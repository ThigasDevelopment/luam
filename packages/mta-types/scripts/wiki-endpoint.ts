import { GeneratorError } from './generator-model.ts';

export const WIKI_SITE = 'https://wiki.multitheftauto.com';

export const WIKI_ENDPOINT = `${WIKI_SITE}/api.php`;

const USER_AGENT = 'luam-catalog-generator (https://github.com/thigasdev/luam)';

const TITLES_PER_REQUEST = 50;

export interface WikiRevision {
    title: string;
    revision: number;
    timestamp: string;
    text: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

async function call(parameters: Record<string, string>): Promise<Record<string, unknown>> {
    const query = new URLSearchParams({ ...parameters, format: 'json', formatversion: '2' });
    const response = await fetch(`${WIKI_ENDPOINT}?${query.toString()}`, { headers: { 'user-agent': USER_AGENT } });

    if (!response.ok) {
        throw new GeneratorError(WIKI_ENDPOINT, `the wiki answered ${response.status} ${response.statusText} for action=${parameters.action}`);
    }

    const payload: unknown = await response.json();

    if (!isRecord(payload)) {
        throw new GeneratorError(WIKI_ENDPOINT, `action=${parameters.action} returned a payload that is not an object`);
    }

    if (isRecord(payload.error) && typeof payload.error.info === 'string') {
        throw new GeneratorError(WIKI_ENDPOINT, `action=${parameters.action} failed: ${payload.error.info}`);
    }

    return payload;
}

export async function renderedPage(title: string): Promise<string> {
    const parsed = (await call({ action: 'parse', page: title, prop: 'text' })).parse;

    if (!isRecord(parsed) || typeof parsed.text !== 'string') {
        throw new GeneratorError(title, 'the wiki returned no rendered text for the page');
    }

    return parsed.text;
}

function readRevision(page: unknown): WikiRevision {
    if (!isRecord(page) || typeof page.title !== 'string') {
        throw new GeneratorError(WIKI_ENDPOINT, 'a queried page carries no title');
    }

    if (page.missing === true) {
        throw new GeneratorError(page.title, 'the page the function list links to does not exist');
    }

    const revision = Array.isArray(page.revisions) ? page.revisions[0] : undefined;
    const slot = isRecord(revision) && isRecord(revision.slots) ? revision.slots.main : undefined;

    if (!isRecord(revision) || typeof revision.revid !== 'number' || typeof revision.timestamp !== 'string') {
        throw new GeneratorError(page.title, 'the page carries no readable revision stamp');
    }

    if (!isRecord(slot) || typeof slot.content !== 'string') {
        throw new GeneratorError(page.title, 'the page carries no readable wikitext');
    }

    return { title: page.title, revision: revision.revid, timestamp: revision.timestamp, text: slot.content };
}

export async function pageRevisions(titles: readonly string[], onBatch: (done: number, total: number) => void): Promise<WikiRevision[]> {
    const revisions: WikiRevision[] = [];

    for (let index = 0; index < titles.length; index += TITLES_PER_REQUEST) {
        const batch = titles.slice(index, index + TITLES_PER_REQUEST);
        const pages = (await call({ action: 'query', prop: 'revisions', rvprop: 'content|ids|timestamp', rvslots: 'main', titles: batch.join('|') })).query;

        if (!isRecord(pages) || !Array.isArray(pages.pages)) {
            throw new GeneratorError(WIKI_ENDPOINT, 'a revision query returned no pages');
        }

        revisions.push(...pages.pages.map(readRevision));
        onBatch(Math.min(index + TITLES_PER_REQUEST, titles.length), titles.length);
    }

    return revisions.sort((left, right) => left.title.localeCompare(right.title, 'en'));
}

export async function revisionIds(titles: readonly string[]): Promise<ReadonlyMap<string, number>> {
    const identifiers = new Map<string, number>();

    for (let index = 0; index < titles.length; index += TITLES_PER_REQUEST) {
        const batch = titles.slice(index, index + TITLES_PER_REQUEST);
        const query = (await call({ action: 'query', prop: 'revisions', rvprop: 'ids', titles: batch.join('|') })).query;

        if (!isRecord(query) || !Array.isArray(query.pages)) {
            throw new GeneratorError(WIKI_ENDPOINT, 'a revision identifier query returned no pages');
        }

        for (const page of query.pages) {
            const revision = isRecord(page) && Array.isArray(page.revisions) ? page.revisions[0] : undefined;

            if (isRecord(page) && typeof page.title === 'string' && isRecord(revision) && typeof revision.revid === 'number') {
                identifiers.set(page.title, revision.revid);
            }
        }
    }

    return identifiers;
}
