import type { EventDocumentation } from '#mta-types/event-documentation';
import type { ParameterDocumentation } from '#mta-types/api-documentation';

import { singleLine } from './documentation-text.ts';
import { bulletSummaries, pageIntro, sections, stripTemplates } from './wiki-documentation.ts';
import { WIKI_SITE } from './wiki-endpoint.ts';

function sectionBody(found: ReadonlyMap<string, string[]>, fragment: string): string {
    return [...found].filter(([heading]) => heading.includes(fragment)).flatMap(([, bodies]) => bodies).join('\n');
}

function parameterEntries(body: string, handlerParameters: readonly string[]): ParameterDocumentation[] {
    const summaries = bulletSummaries(body);
    const byLowerName = new Map([...summaries].map(([name, summary]) => [name.toLowerCase(), summary]));
    const ordered = [...summaries.values()];
    const sameArity = ordered.length === handlerParameters.length;

    return handlerParameters.map((name, index) => ({
        name,
        isOptional: false,
        isVariadic: false,
        summary: summaries.get(name) ?? byLowerName.get(name.toLowerCase()) ?? (sameArity ? (ordered[index] ?? '') : ''),
    }));
}

export function wikiEventDocumentation(title: string, text: string, handlerParameters: readonly string[]): EventDocumentation {
    const found = sections(text);

    return {
        summary: pageIntro(text),
        parameters: parameterEntries(stripTemplates(sectionBody(found, 'parameter')), handlerParameters),
        source: singleLine(stripTemplates(sectionBody(found, 'source'))),
        cancel: singleLine(stripTemplates(sectionBody(found, 'cancel'))),
        wiki: `${WIKI_SITE}/wiki/${title}`,
    };
}
