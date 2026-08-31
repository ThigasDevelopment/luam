import type { ApiEnvironment } from '#mta-types/api-declaration';
import { EVENT_SIGNATURE_OVERRIDES } from '#mta-types/catalog-overrides';
import { fn, type FunctionDescriptor, VOID } from '#mta-types/type-descriptor';

import type { ParsedEventHandler } from './generator-model.ts';
import { sections, stripTemplates } from './wiki-documentation.ts';
import { parseParameterList } from './wiki-signature.ts';
import type { WikiSnapshotPage } from './wiki-snapshot.ts';
import { joinWrappedSignature } from './wiki-syntax.ts';
import { mapWikiType, type WikiTypeContext } from './wiki-type-mapper.ts';

const SERVER_TEMPLATE = /\{\{\s*Server[ _]event/i;

const CLIENT_TEMPLATE = /\{\{\s*Client[ _]event/i;

const LUA_BLOCK = /<syntaxhighlight[^>]*>([\s\S]*?)<\/syntaxhighlight>/i;

const NO_PARAMETERS = /^(?:this event has\s+)?(?:no parameters|none)\.?$/i;

export interface WikiEventParse {
    server: readonly ParsedEventHandler[];
    client: readonly ParsedEventHandler[];
    overridden: readonly string[];
    redundantOverrides: readonly string[];
    unparsed: readonly string[];
}

function environmentOf(text: string): ApiEnvironment | null {
    if (SERVER_TEMPLATE.test(text)) {
        return 'server';
    }

    return CLIENT_TEMPLATE.test(text) ? 'client' : null;
}

function parameterSection(text: string): string | null {
    const bodies = [...sections(text)]
        .filter(([heading]) => heading.includes('parameter'))
        .flatMap(([, entries]) => entries);

    return bodies.length === 0 ? null : bodies.join('\n');
}

function declaresNoParameters(body: string): boolean {
    return NO_PARAMETERS.test(stripTemplates(body).replace(/'{2,}/g, '').replace(/\s+/g, ' ').trim());
}

function handlerOf(body: string, context: WikiTypeContext): FunctionDescriptor | null {
    const block = LUA_BLOCK.exec(body);

    if (block === null) {
        return declaresNoParameters(body) ? fn([], VOID, 0, false, []) : null;
    }

    const signature = parseParameterList(joinWrappedSignature(block[1] ?? ''));

    return fn(
        signature.parameters.map((parameter) => mapWikiType(parameter.type, context)),
        VOID,
        signature.minimumArguments,
        signature.isVariadic,
        signature.parameters.map((parameter) => parameter.name),
    );
}

export function parseWikiEvents(pages: readonly WikiSnapshotPage[], context: WikiTypeContext): WikiEventParse {
    const handlers: Record<ApiEnvironment, ParsedEventHandler[]> = { server: [], client: [], shared: [] };
    const overridden: string[] = [];
    const redundantOverrides: string[] = [];
    const unparsed: string[] = [];

    for (const page of pages) {
        const override = EVENT_SIGNATURE_OVERRIDES[page.name];
        const environment = override?.environment ?? environmentOf(page.text);

        if (environment === null || environment === 'shared') {
            unparsed.push(page.name);

            continue;
        }

        const body = parameterSection(page.text);
        const parsed = body === null ? null : handlerOf(body, context);
        const type = override?.type ?? parsed;

        if (type === null) {
            unparsed.push(page.name);

            continue;
        }

        if (override !== undefined) {
            overridden.push(page.name);
        }

        if (override !== undefined && parsed !== null) {
            redundantOverrides.push(page.name);
        }

        handlers[environment].push({ name: page.name, type });
    }

    const sorted = (entries: ParsedEventHandler[]): ParsedEventHandler[] =>
        [...entries].sort((left, right) => left.name.localeCompare(right.name, 'en'));

    return {
        server: sorted(handlers.server),
        client: sorted(handlers.client),
        overridden: overridden.sort(),
        redundantOverrides: redundantOverrides.sort(),
        unparsed: unparsed.sort(),
    };
}
