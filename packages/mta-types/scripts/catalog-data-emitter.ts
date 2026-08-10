import { ELEMENT_TYPE_ALIASES, ELEMENT_TYPE_PARENTS, EXCLUDED_ELEMENT_TYPES } from '#mta-types/catalog-overrides';

import type { ParsedClass } from './declaration-parser.ts';
import { type ElementTypeEntry, GeneratorError, type GeneratedFile } from './generator-model.ts';

const EXCLUDED: ReadonlySet<string> = new Set(EXCLUDED_ELEMENT_TYPES);

function resolveName(name: string): string {
    return ELEMENT_TYPE_ALIASES[name] ?? name;
}

export function resolveElementTypes(classes: readonly ParsedClass[]): ElementTypeEntry[] {
    const byName = new Map<string, ElementTypeEntry>();

    for (const declaration of classes) {
        const name = resolveName(declaration.name);

        if (EXCLUDED.has(declaration.name) || EXCLUDED.has(name)) {
            continue;
        }

        const parent = ELEMENT_TYPE_PARENTS[name] ?? (declaration.parent === null ? null : resolveName(declaration.parent));
        const existing = byName.get(name);

        if (existing === undefined || (existing.parent === null && parent !== null)) {
            byName.set(name, { name, parent });
        }
    }

    const entries = [...byName.values()].sort((left, right) => left.name.localeCompare(right.name, 'en'));

    for (const entry of entries) {
        if (entry.parent !== null && !byName.has(entry.parent)) {
            throw new GeneratorError('element-types', `"${entry.name}" extends "${entry.parent}", which is not a declared element type`);
        }
    }

    return entries;
}

export function emitElementTypes(entries: readonly ElementTypeEntry[]): GeneratedFile {
    const lines = entries.map((entry) => `    { name: '${entry.name}', parent: ${entry.parent === null ? 'null' : `'${entry.parent}'`} },`);

    const contents = [
        'export interface ElementTypeDeclaration {',
        '    name: string;',
        '    parent: string | null;',
        '}',
        '',
        'export const ELEMENT_TYPES: readonly ElementTypeDeclaration[] = [',
        ...lines,
        '];',
        '',
    ].join('\n');

    return { path: 'src/generated/element-types.ts', contents };
}

export function emitEvents(server: readonly string[], client: readonly string[]): GeneratedFile {
    const serverSet = new Set(server);
    const clientSet = new Set(client);
    const shared = [...serverSet].filter((name) => clientSet.has(name)).sort();
    const onlyServer = [...serverSet].filter((name) => !clientSet.has(name)).sort();
    const onlyClient = [...clientSet].filter((name) => !serverSet.has(name)).sort();

    const block = (name: string, names: readonly string[]): string[] => {
        if (names.length === 0) {
            return [`const ${name}: readonly string[] = [];`, ''];
        }

        return [`const ${name}: readonly string[] = [`, ...names.map((entry) => `    '${entry}',`), '];', ''];
    };

    const contents = [
        "import type { ApiEnvironment } from '@mta-types/api-declaration';",
        '',
        ...block('SHARED_EVENTS', shared),
        ...block('SERVER_EVENTS', onlyServer),
        ...block('CLIENT_EVENTS', onlyClient),
        'export const MTA_EVENTS: Readonly<Record<ApiEnvironment, readonly string[]>> = {',
        '    server: SERVER_EVENTS,',
        '    client: CLIENT_EVENTS,',
        '    shared: SHARED_EVENTS,',
        '};',
        '',
    ].join('\n');

    return { path: 'src/generated/mta-events.ts', contents };
}
