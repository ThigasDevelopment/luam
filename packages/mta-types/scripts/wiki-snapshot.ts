import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { ApiEnvironment } from '#mta-types/api-declaration';

import { GeneratorError } from './generator-model.ts';
import { NON_FUNCTION_PAGES } from './wiki-function-list.ts';

export const SNAPSHOT_PATH = fileURLToPath(new URL('../data/mta-wiki.json', import.meta.url));

export const SNAPSHOT_FILE = 'packages/mta-types/data/mta-wiki.json';

export const FETCH_COMMAND = 'pnpm --filter @luam/mta-types fetch-wiki';

const MINIMUM_PAGES = 1300;

const SYNTAX_HEADING = /^=+\s*Syntax\b/im;

const EXAMPLE_HEADING = /^=+\s*Examples?\s*=+\s*$/im;

export interface WikiSnapshotPage {
    name: string;
    title: string;
    category: string;
    revision: number;
    timestamp: string;
    text: string;
}

export interface WikiSnapshotTemplate {
    title: string;
    revision: number;
    timestamp: string;
    text: string;
}

export interface WikiSnapshot {
    endpoint: string;
    lists: { client: readonly string[]; server: readonly string[] };
    pages: readonly WikiSnapshotPage[];
    events: readonly WikiSnapshotPage[];
    templates: readonly WikiSnapshotTemplate[];
}

export function trimAtExample(text: string): string {
    const match = EXAMPLE_HEADING.exec(text);

    return match === null ? text.trimEnd() : text.slice(0, match.index).trimEnd();
}

export function hasSyntaxSection(text: string): boolean {
    return SYNTAX_HEADING.test(text);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function readNames(value: unknown, label: string): readonly string[] {
    if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
        throw new GeneratorError(SNAPSHOT_FILE, `the ${label} function list is missing or is not a list of names`);
    }

    return value as readonly string[];
}

function readPage(value: unknown, index: number): WikiSnapshotPage {
    if (
        !isRecord(value) ||
        typeof value.name !== 'string' ||
        typeof value.title !== 'string' ||
        typeof value.category !== 'string' ||
        typeof value.revision !== 'number' ||
        typeof value.timestamp !== 'string' ||
        typeof value.text !== 'string'
    ) {
        throw new GeneratorError(SNAPSHOT_FILE, `page ${index} is missing a name, title, category, revision, timestamp, or wikitext`);
    }

    return { name: value.name, title: value.title, category: value.category, revision: value.revision, timestamp: value.timestamp, text: value.text };
}

export function validateSnapshot(snapshot: WikiSnapshot): void {
    if (snapshot.pages.length < MINIMUM_PAGES) {
        throw new GeneratorError(SNAPSHOT_FILE, `holds only ${snapshot.pages.length} pages, expected at least ${MINIMUM_PAGES}, refresh it with "${FETCH_COMMAND}"`);
    }

    for (const page of snapshot.pages) {
        if (NON_FUNCTION_PAGES[page.title] !== undefined) {
            throw new GeneratorError(SNAPSHOT_FILE, `page "${page.title}" is not a function page: ${NON_FUNCTION_PAGES[page.title]}`);
        }

        if (!hasSyntaxSection(page.text)) {
            throw new GeneratorError(SNAPSHOT_FILE, `page "${page.title}" carries no Syntax section`);
        }
    }
}

function readTemplate(value: unknown, index: number): WikiSnapshotTemplate {
    if (
        !isRecord(value) ||
        typeof value.title !== 'string' ||
        typeof value.revision !== 'number' ||
        typeof value.timestamp !== 'string' ||
        typeof value.text !== 'string'
    ) {
        throw new GeneratorError(SNAPSHOT_FILE, `template ${index} is missing a title, revision, timestamp, or wikitext`);
    }

    return { title: value.title, revision: value.revision, timestamp: value.timestamp, text: value.text };
}

export function templateText(snapshot: WikiSnapshot): ReadonlyMap<string, string> {
    return new Map(snapshot.templates.map((template) => [template.title, template.text]));
}

export function parseSnapshot(contents: string): WikiSnapshot {
    const parsed: unknown = JSON.parse(contents);

    if (!isRecord(parsed) || typeof parsed.endpoint !== 'string' || !isRecord(parsed.lists) || !Array.isArray(parsed.pages)) {
        throw new GeneratorError(SNAPSHOT_FILE, 'is not a wiki snapshot: it declares no endpoint, lists, and pages');
    }

    const snapshot: WikiSnapshot = {
        endpoint: parsed.endpoint,
        lists: { client: readNames(parsed.lists.client, 'client'), server: readNames(parsed.lists.server, 'server') },
        pages: parsed.pages.map(readPage),
        events: (Array.isArray(parsed.events) ? parsed.events : []).map(readPage),
        templates: (Array.isArray(parsed.templates) ? parsed.templates : []).map(readTemplate),
    };

    validateSnapshot(snapshot);

    return snapshot;
}

export function readSnapshot(): WikiSnapshot {
    if (!existsSync(SNAPSHOT_PATH)) {
        throw new GeneratorError(SNAPSHOT_FILE, `the committed wiki snapshot is missing, write it with "${FETCH_COMMAND}"`);
    }

    return parseSnapshot(readFileSync(SNAPSHOT_PATH, 'utf8'));
}

export function snapshotEnvironments(snapshot: WikiSnapshot): ReadonlyMap<string, ApiEnvironment> {
    const client = new Set(snapshot.lists.client);
    const server = new Set(snapshot.lists.server);
    const environments = new Map<string, ApiEnvironment>();

    for (const page of snapshot.pages) {
        const onClient = client.has(page.name);
        const onServer = server.has(page.name);

        environments.set(page.name, onClient && onServer ? 'shared' : onClient ? 'client' : 'server');
    }

    return environments;
}

export function latestRevisionAt(snapshot: WikiSnapshot): string {
    return snapshot.pages.reduce((latest, page) => (page.timestamp > latest ? page.timestamp : latest), '');
}
