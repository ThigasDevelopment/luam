const OOP_TEMPLATE = /\{\{\s*OOP\s*\|([^{}]*)\}\}/gi;

const NEW_FEATURE = /\{\{\s*New feature(?:\/item)?\s*\|[^|}]*\|\s*([0-9][0-9.]*)/gi;

const DEPRECATED = /\{\{\s*Deprecated\b/i;

const NEEDS_CHECKING = /\{\{\s*Needs[ _]Checking\b/i;

const WIKI_LINK = /\[\[(?:[^\]|]*\|)?([^\]|]*)\]\]/g;

export interface WikiOopSurface {
    className: string;
    member: string | null;
    isStatic: boolean;
    property: string | null;
    counterpart: string | null;
    note: string;
}

export interface WikiPageFlags {
    since: string | null;
    isDeprecated: boolean;
    needsChecking: boolean;
}

function linkText(value: string): string {
    return value.replace(WIKI_LINK, '$1').replace(/'''?/g, '').trim();
}

function compare(left: string, right: string): number {
    const parts = (value: string): number[] => value.split('.').map((part) => Number.parseInt(part, 10) || 0);
    const [first, second] = [parts(left), parts(right)];

    for (let index = 0; index < Math.max(first.length, second.length); index += 1) {
        const difference = (first[index] ?? 0) - (second[index] ?? 0);

        if (difference !== 0) {
            return difference;
        }
    }

    return 0;
}

function splitParameters(body: string): string[] {
    const parts: string[] = [];
    let depth = 0;
    let start = 0;

    for (let index = 0; index < body.length; index += 1) {
        if (body.startsWith('[[', index)) {
            depth += 1;
        } else if (body.startsWith(']]', index)) {
            depth -= 1;
        } else if (body[index] === '|' && depth <= 0) {
            parts.push(body.slice(start, index));
            start = index + 1;
        }
    }

    parts.push(body.slice(start));

    return parts;
}

export function parseOopTemplate(text: string): WikiOopSurface | null {
    OOP_TEMPLATE.lastIndex = 0;

    const match = OOP_TEMPLATE.exec(text);

    if (match === null) {
        return null;
    }

    const [note = '', surface = '', property = '', counterpart = ''] = splitParameters(match[1] ?? '').map(linkText);
    const separator = /[.:]/.exec(surface.replace(/^\[\[|\]\]$/g, ''));
    const className = separator === null ? surface : surface.slice(0, separator.index);
    const member = separator === null ? null : surface.slice(separator.index + 1).trim();

    if (className.length === 0) {
        return null;
    }

    return {
        className,
        member: member === null || member.length === 0 ? null : member,
        isStatic: separator?.[0] === '.',
        property: property.length === 0 ? null : property,
        counterpart: counterpart.length === 0 ? null : counterpart,
        note,
    };
}

export function parsePageFlags(text: string): WikiPageFlags {
    let since: string | null = null;

    NEW_FEATURE.lastIndex = 0;

    for (let match = NEW_FEATURE.exec(text); match !== null; match = NEW_FEATURE.exec(text)) {
        const version = match[1] ?? '';

        since = since === null || compare(version, since) > 0 ? version : since;
    }

    return { since, isDeprecated: DEPRECATED.test(text), needsChecking: NEEDS_CHECKING.test(text) };
}
