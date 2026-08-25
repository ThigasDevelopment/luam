import type { ApiEnvironment } from '#mta-types/api-declaration';

import { GeneratorError } from './generator-model.ts';
import { renderedPage } from './wiki-endpoint.ts';

export const CLIENT_LIST_PAGE = 'Client_Scripting_Functions';

export const SERVER_LIST_PAGE = 'Server_Scripting_Functions';

export const NON_FUNCTION_PAGES: Readonly<Record<string, string>> = {
    Matrix: 'the OOP class reference, listed beside the functions but documenting a class rather than a function',
};

const MINIMUM_CLIENT_ENTRIES = 1100;

const MINIMUM_SERVER_ENTRIES = 700;

const FUNCTION_LINK = /<h2><span class="mw-headline"[^>]*>([^<]*)<\/span>|<li><a href="\/wiki\/([A-Za-z0-9_]+)"[^>]*>([A-Za-z_][A-Za-z0-9_]*)<\/a><\/li>/g;

export interface FunctionListEntry {
    name: string;
    title: string;
    category: string;
}

export function categoryOf(heading: string): string {
    return (heading.trim().split(/\s+/)[0] ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function extractFunctionLinks(html: string): FunctionListEntry[] {
    const entries = new Map<string, FunctionListEntry>();
    let category = 'utility';

    FUNCTION_LINK.lastIndex = 0;

    for (let match = FUNCTION_LINK.exec(html); match !== null; match = FUNCTION_LINK.exec(html)) {
        const [, heading, title, label] = match;

        if (heading !== undefined) {
            category = categoryOf(heading) || category;

            continue;
        }

        if (title === undefined || label === undefined || NON_FUNCTION_PAGES[title] !== undefined) {
            continue;
        }

        entries.set(title, { name: `${label.charAt(0).toLowerCase()}${label.slice(1)}`, title, category });
    }

    return [...entries.values()].sort((left, right) => left.name.localeCompare(right.name, 'en'));
}

async function readList(page: string, minimum: number): Promise<FunctionListEntry[]> {
    const entries = extractFunctionLinks(await renderedPage(page));

    if (entries.length < minimum) {
        throw new GeneratorError(page, `the curated list yielded only ${entries.length} functions, expected at least ${minimum}`);
    }

    return entries;
}

export function environmentOf(name: string, client: ReadonlySet<string>, server: ReadonlySet<string>): ApiEnvironment {
    if (client.has(name) && server.has(name)) {
        return 'shared';
    }

    return client.has(name) ? 'client' : 'server';
}

export interface FunctionLists {
    client: readonly FunctionListEntry[];
    server: readonly FunctionListEntry[];
}

export async function fetchFunctionLists(): Promise<FunctionLists> {
    const client = await readList(CLIENT_LIST_PAGE, MINIMUM_CLIENT_ENTRIES);
    const server = await readList(SERVER_LIST_PAGE, MINIMUM_SERVER_ENTRIES);

    return { client, server };
}
