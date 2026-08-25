import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import { GeneratorError } from './generator-model.ts';
import { pageRevisions, revisionIds, WIKI_ENDPOINT, type WikiRevision } from './wiki-endpoint.ts';
import { templateTitles } from './wiki-enumerations.ts';
import { fetchEventLists } from './wiki-event-list.ts';
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

function committedSnapshot(): WikiSnapshot | null {
    if (!existsSync(SNAPSHOT_PATH)) {
        return null;
    }

    try {
        return parseSnapshot(readFileSync(SNAPSHOT_PATH, 'utf8'));
    } catch {
        return null;
    }
}

function pageMap(pages: readonly WikiSnapshotPage[] | undefined): ReadonlyMap<string, WikiSnapshotPage> {
    return new Map((pages ?? []).map((page) => [page.title, page]));
}

function toPage(revision: WikiRevision, entry: FunctionListEntry, requireSyntax: boolean): WikiSnapshotPage {
    const text = trimAtExample(revision.text);

    if (requireSyntax && !hasSyntaxSection(text)) {
        throw new GeneratorError(revision.title, 'the page carries no Syntax section, so it does not document a function');
    }

    return { name: entry.name, title: revision.title, category: entry.category, revision: revision.revision, timestamp: revision.timestamp, text };
}

async function refreshPages(
    label: string,
    entries: ReadonlyMap<string, FunctionListEntry>,
    committed: ReadonlyMap<string, WikiSnapshotPage>,
    requireSyntax: boolean,
): Promise<WikiSnapshotPage[]> {
    const titles = [...entries.keys()].sort((left, right) => left.localeCompare(right, 'en'));
    const identifiers = await revisionIds(titles);
    const stale = titles.filter((title) => committed.get(title)?.revision !== identifiers.get(title));

    report(`${label}: ${stale.length} of ${titles.length} pages changed since the committed snapshot`);

    const fetched = new Map<string, WikiRevision>();

    if (stale.length > 0) {
        const revisions = await pageRevisions(stale, (done, total) => process.stderr.write(`fetching ${label} ${done}/${total}\r`));

        process.stderr.write('\n');

        for (const revision of revisions) {
            fetched.set(revision.title, revision);
        }
    }

    const pages = titles.map((title) => {
        const revision = fetched.get(title);
        const existing = committed.get(title);

        const entry = entries.get(title);

        if (revision !== undefined && entry !== undefined) {
            return toPage(revision, entry, requireSyntax);
        }

        if (existing === undefined || entry === undefined) {
            throw new GeneratorError(title, 'the wiki returned no revision for the page');
        }

        return { ...existing, name: entry.name, category: entry.category };
    });

    return pages.sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

function write(snapshot: WikiSnapshot): void {
    const staging = `${SNAPSHOT_PATH}.staging`;

    mkdirSync(dirname(SNAPSHOT_PATH), { recursive: true });
    writeFileSync(staging, `${JSON.stringify(snapshot, null, 4)}\n`, 'utf8');
    renameSync(staging, SNAPSHOT_PATH);
}

const lists = await fetchFunctionLists();
const names = new Map([...lists.server, ...lists.client].map((entry) => [entry.title, entry]));

report(`lists: ${lists.client.length} client, ${lists.server.length} server, ${names.size} pages`);

const eventLists = await fetchEventLists();
const eventNames = new Map([...eventLists.server, ...eventLists.client].map((entry) => [entry.title, entry]));

report(`event lists: ${eventLists.client.length} client, ${eventLists.server.length} server, ${eventNames.size} pages`);

const committed = committedSnapshot();
const pages = await refreshPages('revisions', names, pageMap(committed?.pages), true);
const events = await refreshPages('event revisions', eventNames, pageMap(committed?.events), false);

const templateNames = templateTitles();
const fetchedTemplates = await pageRevisions(templateNames, () => undefined);
const templates: WikiSnapshotTemplate[] = fetchedTemplates
    .map((revision) => ({ title: revision.title, revision: revision.revision, timestamp: revision.timestamp, text: revision.text }))
    .sort((left, right) => left.title.localeCompare(right.title, 'en'));

report(`templates: ${templates.length} of ${templateNames.length} value templates`);

const snapshot: WikiSnapshot = {
    endpoint: WIKI_ENDPOINT,
    lists: { client: lists.client.map((entry) => entry.name), server: lists.server.map((entry) => entry.name) },
    pages,
    events,
    templates,
};

write(snapshot);

report(`snapshot: ${snapshot.pages.length} pages and ${snapshot.events.length} event pages written to ${SNAPSHOT_FILE}`);
