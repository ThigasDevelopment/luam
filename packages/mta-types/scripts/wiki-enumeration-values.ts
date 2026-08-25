import { GeneratorError } from './generator-model.ts';
import { VALUE_TEMPLATES, type ValueShape } from './wiki-enumerations.ts';

const VALUE = /^[A-Za-z][A-Za-z0-9_.-]{0,40}$/;

const QUOTED = /^\s*(?:'''|'')?\s*"([^"]+)"/;

const BOLD = /^\s*'''([^']+)'''/;

function clean(value: string): string {
    return value
        .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
        .replace(/\[\[|\]\]/g, '')
        .replace(/<[^>]*>/g, '')
        .replace(/'''|''/g, '')
        .replace(/[:：]\s*$/, '')
        .trim();
}

function bulletValue(line: string): string | null {
    const body = line.replace(/^\*+\s*/, '');
    const quoted = QUOTED.exec(body);

    if (quoted !== null) {
        return clean(quoted[1] ?? '');
    }

    const bold = BOLD.exec(body);

    if (bold !== null) {
        return clean(bold[1] ?? '');
    }

    return clean((body.split(/\s+[-–—]\s+|:/)[0] ?? '').trim());
}

function tableValue(line: string): string | null {
    const cell = line.replace(/^\|\s*/, '').split('||')[0] ?? '';

    return clean(cell.replace(/^[^|]*"[^"]*"\s*\|/, '').replace(/^scope="row"\s*\|/, ''));
}

function tableValues(text: string): string[] {
    const values: string[] = [];
    let depth = 0;
    let closed = false;
    let expectingFirstCell = false;

    for (const raw of text.split('\n')) {
        const line = raw.trim();

        if (closed) {
            break;
        }

        if (line.startsWith('{|')) {
            depth += 1;
            expectingFirstCell = false;
        } else if (line.startsWith('|}')) {
            depth -= 1;
            closed = depth === 0;
            expectingFirstCell = false;
        } else if (line.startsWith('|-')) {
            expectingFirstCell = depth === 1;
        } else if (expectingFirstCell && line.startsWith('|')) {
            const value = tableValue(line);

            expectingFirstCell = false;

            if (value !== null && VALUE.test(value)) {
                values.push(value);
            }
        }
    }

    return values;
}

function bulletValues(text: string): string[] {
    const values: string[] = [];

    for (const raw of text.split('\n')) {
        const line = raw.trim();

        if (!line.startsWith('*')) {
            continue;
        }

        const value = bulletValue(line);

        if (value !== null && VALUE.test(value)) {
            values.push(value);
        }
    }

    return values;
}

export function extractValues(text: string, shape: ValueShape): string[] {
    return [...new Set(shape === 'bullet' ? bulletValues(text) : tableValues(text))];
}

const NESTED_LIST = /^\*\s*'''\s*([A-Za-z_][A-Za-z0-9_]*)\s*:?\s*'''[^\n]*\n((?:\*\*[^\n]*\n)+)/gm;

const SECOND_LEVEL = /^\*\*(?!\*)/;

export function pageEnumerations(text: string): ReadonlyMap<string, readonly string[]> {
    const found = new Map<string, readonly string[]>();

    NESTED_LIST.lastIndex = 0;

    for (let match = NESTED_LIST.exec(text); match !== null; match = NESTED_LIST.exec(text)) {
        const values = (match[2] ?? '')
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => SECOND_LEVEL.test(line))
            .map((line) => bulletValue(line))
            .filter((value): value is string => value !== null && VALUE.test(value));

        if (values.length >= 2) {
            found.set(match[1] ?? '', [...new Set(values)]);
        }
    }

    return found;
}

export function enumerationValues(templates: ReadonlyMap<string, string>): ReadonlyMap<string, readonly string[]> {
    const resolved = new Map<string, readonly string[]>();

    for (const [key, template] of Object.entries(VALUE_TEMPLATES)) {
        const text = templates.get(template.title);

        if (text === undefined) {
            throw new GeneratorError(template.title, `the snapshot carries no wikitext for the value template of "${key}"`);
        }

        const values = extractValues(text, template.shape);

        if (values.length < template.minimum) {
            throw new GeneratorError(template.title, `yielded only ${values.length} values for "${key}", expected at least ${template.minimum}`);
        }

        resolved.set(key, values);
    }

    return resolved;
}
