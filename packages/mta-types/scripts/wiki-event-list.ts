import { GeneratorError } from './generator-model.ts';
import { renderedPage } from './wiki-endpoint.ts';
import { extractFunctionLinks, type FunctionListEntry, type FunctionLists } from './wiki-function-list.ts';

export const CLIENT_EVENT_LIST_PAGE = 'Client_Scripting_Events';

export const SERVER_EVENT_LIST_PAGE = 'Server_Scripting_Events';

const MINIMUM_CLIENT_ENTRIES = 90;

const MINIMUM_SERVER_ENTRIES = 70;

async function readList(page: string, minimum: number): Promise<FunctionListEntry[]> {
    const entries = extractFunctionLinks(await renderedPage(page));

    if (entries.length < minimum) {
        throw new GeneratorError(page, `the curated list yielded only ${entries.length} events, expected at least ${minimum}`);
    }

    return entries;
}

export async function fetchEventLists(): Promise<FunctionLists> {
    const client = await readList(CLIENT_EVENT_LIST_PAGE, MINIMUM_CLIENT_ENTRIES);
    const server = await readList(SERVER_EVENT_LIST_PAGE, MINIMUM_SERVER_ENTRIES);

    return { client, server };
}
