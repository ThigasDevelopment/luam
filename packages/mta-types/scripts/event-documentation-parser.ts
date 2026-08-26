import type { EventDocumentation } from '#mta-types/event-documentation';
import type { ParameterDocumentation } from '#mta-types/api-documentation';

import { singleLine } from './documentation-text.ts';
import { bulletSummaries, pageIntro, sections, stripTemplates } from './wiki-documentation.ts';
import { WIKI_SITE } from './wiki-endpoint.ts';

function sectionBody(found: ReadonlyMap<string, string[]>, fragment: string): string {
    return [...found].filter(([heading]) => heading.includes(fragment)).flatMap(([, bodies]) => bodies).join('\n');
}

function parameterEntries(body: string): ParameterDocumentation[] {
    return [...bulletSummaries(body)].map(([name, summary]) => ({ name, isOptional: false, isVariadic: false, summary }));
}

export function wikiEventDocumentation(title: string, text: string): EventDocumentation {
    const found = sections(text);

    return {
        summary: pageIntro(text),
        parameters: parameterEntries(sectionBody(found, 'parameter')),
        source: singleLine(stripTemplates(sectionBody(found, 'source'))),
        cancel: singleLine(stripTemplates(sectionBody(found, 'cancel'))),
        wiki: `${WIKI_SITE}/wiki/${title}`,
    };
}
