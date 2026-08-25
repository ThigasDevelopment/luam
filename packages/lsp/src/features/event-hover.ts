import type { Hover } from 'vscode-languageserver';

import type { EventInfo } from '@compiler/checker/registry';
import type { EventDocumentation } from '@mta-types/event-documentation';
import { findEventDocumentation } from '@mta-types/event-documentation-lookup';

import type { DocumentAnalysis } from '@lsp/analysis/document-analysis';
import { documentationAbove } from '@lsp/features/declaration-documentation';
import { parameterList } from '@lsp/features/documentation-text';
import { eventNameAt, handlerText, type EventNameContext } from '@lsp/features/event-signature';

interface HoverSections {
    body: readonly string[];
    footer: string;
}

function mtaBody(documentation: EventDocumentation | null): string[] {
    if (documentation === null) {
        return [];
    }

    const sections: string[] = [];

    if (documentation.summary.length > 0) {
        sections.push(documentation.summary);
    }

    const parameters = parameterList(documentation);

    if (parameters.length > 0) {
        sections.push(['**Parameters**', '', ...parameters].join('\n'));
    }

    if (documentation.source.length > 0) {
        sections.push(`**Source** — ${documentation.source}`);
    }

    if (documentation.cancel.length > 0) {
        sections.push(`**Cancel effect** — ${documentation.cancel}`);
    }

    return sections;
}

function mtaSections(context: EventNameContext): HoverSections {
    const documentation = findEventDocumentation(context.name);
    const scope = `mta event (${context.environment})`;

    return {
        body: mtaBody(documentation),
        footer: documentation === null || documentation.wiki.length === 0 ? scope : `${scope} · [wiki](${documentation.wiki})`,
    };
}

function customSections(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], name: string, custom: EventInfo): HoverSections {
    const owner = [analysis, ...others].find((document) => document.own.events.some((event) => event.name === name));

    if (owner === undefined) {
        return { body: [], footer: `custom event (${custom.environment})` };
    }

    const documentation = documentationAbove(owner.text, custom.position.offset);

    return {
        body: documentation.length > 0 ? [documentation] : [],
        footer: `custom event declared in ${owner.relative} (${custom.environment})`,
    };
}

export function eventHover(analysis: DocumentAnalysis, others: readonly DocumentAnalysis[], offset: number): Hover | null {
    const context = eventNameAt(analysis, offset);

    if (context === null || context.handler === null) {
        return null;
    }

    const signature = ['```luam', handlerText(context.name, context.handler), '```'].join('\n');
    const sections = context.custom === null ? mtaSections(context) : customSections(analysis, others, context.name, context.custom);

    return { contents: { kind: 'markdown', value: [signature, ...sections.body, sections.footer].join('\n\n') } };
}
