import type { ApiDocumentation, ParameterDocumentation } from '#mta-types/api-documentation';

import { cleanMarkup, singleLine } from './documentation-text.ts';
import { WIKI_SITE } from './wiki-endpoint.ts';
import type { WikiParameter } from './wiki-signature.ts';

const HEADING = /^=+[^\n=][^\n]*$/m;

const SECTION = /^=+\s*([^=\n]+?)\s*=+\s*$/gim;

const BULLET = /^\*+\s*'''\s*([A-Za-z_][A-Za-z0-9_]*)\s*:?\s*'''\s*:?\s*(.*)$/gm;

const MEDIA_LINK = /\[\[(?:File|Image|Media):[^\]]*\]\]/gi;

const DESCRIBING_TEMPLATE: Readonly<Record<string, number>> = {
    'new feature': 3,
    'new feature/item': 4,
    'new items': 3,
};

export function stripTemplates(text: string): string {
    let output = '';
    let index = 0;

    while (index < text.length) {
        const open = text.indexOf('{{', index);

        if (open === -1) {
            return output + text.slice(index);
        }

        output += text.slice(index, open);

        let depth = 0;
        let cursor = open;

        while (cursor < text.length) {
            if (text.startsWith('{{', cursor)) {
                depth += 1;
                cursor += 2;
            } else if (text.startsWith('}}', cursor)) {
                depth -= 1;
                cursor += 2;

                if (depth === 0) {
                    break;
                }
            } else {
                cursor += 1;
            }
        }

        const parts = text.slice(open + 2, cursor - 2).split('|');
        const describing = DESCRIBING_TEMPLATE[(parts[0] ?? '').trim().toLowerCase()];

        output += describing === undefined ? '' : stripTemplates(parts.slice(describing).join('|'));
        index = cursor;
    }

    return output;
}

export function pageIntro(text: string): string {
    const heading = HEADING.exec(text);
    const opening = stripTemplates(text.slice(0, heading?.index ?? text.length)).replace(MEDIA_LINK, '');

    return cleanMarkup(opening).replace(/^__[A-Z]+__\s*/gm, '').trim();
}

export function sections(text: string): ReadonlyMap<string, string[]> {
    const found = new Map<string, string[]>();
    const headings: { title: string; start: number; end: number }[] = [];

    SECTION.lastIndex = 0;

    for (let match = SECTION.exec(text); match !== null; match = SECTION.exec(text)) {
        headings.push({ title: (match[1] ?? '').toLowerCase(), start: match.index, end: match.index + match[0].length });
    }

    headings.forEach((heading, position) => {
        const body = text.slice(heading.end, headings[position + 1]?.start ?? text.length).trim();
        const bodies = found.get(heading.title) ?? [];

        if (body.length > 0 && !bodies.includes(body)) {
            bodies.push(body);
        }

        found.set(heading.title, bodies);
    });

    return found;
}

export function bulletSummaries(body: string): ReadonlyMap<string, string> {
    const summaries = new Map<string, string>();

    BULLET.lastIndex = 0;

    for (let match = BULLET.exec(body); match !== null; match = BULLET.exec(body)) {
        summaries.set(match[1] ?? '', singleLine(stripTemplates(match[2] ?? '')));
    }

    return summaries;
}

export function wikiDocumentation(title: string, text: string, parameters: readonly WikiParameter[], isVariadic: boolean): ApiDocumentation {
    const intro = pageIntro(text);
    const found = sections(text);
    const argumentBody = [...found].filter(([heading]) => heading.includes('argument')).flatMap(([, bodies]) => bodies).join('\n');
    const summaries = bulletSummaries(argumentBody);
    const documented: ParameterDocumentation[] = parameters.map((parameter) => ({
        name: parameter.name,
        isOptional: parameter.isOptional || parameter.defaultValue !== null,
        isVariadic: false,
        summary: summaries.get(parameter.name) ?? '',
    }));

    return {
        summary: intro,
        parameters: isVariadic ? [...documented, { name: 'arguments', isOptional: true, isVariadic: true, summary: '' }] : documented,
        returns: singleLine(stripTemplates((found.get('returns') ?? []).join(' '))),
        wiki: `${WIKI_SITE}/wiki/${title}`,
    };
}
