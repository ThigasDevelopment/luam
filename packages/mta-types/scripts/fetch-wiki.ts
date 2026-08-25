import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { GeneratorError } from './generator-model.ts';
import { pageRevisions, revisionIds, WIKI_ENDPOINT, type WikiRevision } from './wiki-endpoint.ts';
import { templateTitles } from './wiki-enumerations.ts';
import { fetchFunctionLists, type FunctionListEntry } from './wiki-function-list.ts';
import {
    hasSyntaxSection,
    parseSnapshot,
    SNAPSHOT_FILE,
    SNAPSHOT_PATH,
    trimAtExample,
    type WikiSnapshot,
    type WikiSnapshotPage,
    type WikiSnapshotTemplate,
} from './wiki-snapshot.ts';

function report(line: string): void {
    process.stdout.write(`${line}\n`);
}

function committedPages(): ReadonlyMap<string, WikiSnapshotPage> {
    if (!existsSync(SNAPSHOT_PATH)) {
        return new Map();
    }

    try {
        return new Map(parseSnapshot(readFileSync(SNAPSHOT_PATH, 'utf8')).pages.map((page) => [page.title, page]));
    } catch {
        return new Map();
    }
}

function toPage(revision: WikiRevision, entry: FunctionListEntry): WikiSnapshotPage {
    const text = trimAtExample(revision.text);

    if (!hasSyntaxSection(text)) {
        throw new GeneratorError(revision.title, 'the page carries no Syntax section, so it does not document a function');
    }

    return { name: entry.name, title: revision.title, category: entry.category, revision: revision.revision, timestamp: revision.timestamp, text };
}

function write(snapshot: WikiSnapshot): void {
    const staging = `${SNAPSHOT_PATH}.staging`;

    mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
    writeFileSync(staging, `${JSON.stringify(snapshot, null, 4)}\n`, 'utf8');
    renameSync(staging, SNAPSHOT_PATH);
}

const lists = await fetchFunctionLists();
const names = new Map([...lists.server, ...lists.client].map((entry) => [entry.title, entry]));
const titles = [...names.keys()].sort((left, right) => left.localeCompare(right, 'en'));

report(`lists: ${lists.client.length} client, ${lists.server.length} server, ${titles.length} pages`);

const committed = committedPages();
const identifiers = await revisionIds(titles);
const stale = titles.filter((title) => committed.get(title)?.revision !== identifiers.get(title));

report(`revisions: ${stale.length} of ${titles.length} pages changed since the committed snapshot`);

const fetched = new Map<string, WikiRevision>();

if (stale.length > 0) {
    const revisions = await pageRevisions(stale, (done, total) => process.stderr.write(`fetching ${done}/${total}\r`));

    process.stderr.write('\n');

    for (const revision of revisions) {
        fetched.set(revision.title, revision);
    }
}

const pages = titles.map((title) => {
    const revision = fetched.get(title);
    const existing = committed.get(title);

    const entry = names.get(title);

    if (revision !== undefined && entry !== undefined) {
        return toPage(revision, entry);
    }

    if (existing === undefined || entry === undefined) {
        throw new GeneratorError(title, 'the wiki returned no revision for the page');
    }

    return { ...existing, name: entry.name, category: entry.category };
});

const templateNames = templateTitles();
const fetchedTemplates = await pageRevisions(templateNames, () => undefined);
const templates: WikiSnapshotTemplate[] = fetchedTemplates
    .map((revision) => ({ title: revision.title, revision: revision.revision, timestamp: revision.timestamp, text: revision.text }))
    .sort((left, right) => left.title.localeCompare(right.title, 'en'));

report(`templates: ${templates.length} of ${templateNames.length} value templates`);

const snapshot: WikiSnapshot = {
    endpoint: WIKI_ENDPOINT,
    lists: { client: lists.client.map((entry) => entry.name), server: lists.server.map((entry) => entry.name) },
    pages: pages.sort((left, right) => left.name.localeCompare(right.name, 'en')),
    templates,
};

write(snapshot);

report(`snapshot: ${snapshot.pages.length} pages written to ${SNAPSHOT_FILE}`);
