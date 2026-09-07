import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build } from 'esbuild';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, '..', '..');
const generatedRoot = join(repositoryRoot, 'docs', 'generated');

interface Field {
    name: string;
    summary: string;
    required: boolean;
    open: boolean;
    ordered: boolean;
    members: Field[] | null;
    elements: Field[] | null;
}

interface Catalog {
    MANIFEST_FIELDS: Field[];
    REMOVED_FIELDS: Record<string, string>;
    typeOf: (field: Field) => string;
    defaultOf: (field: Field) => string | null;
    ruleOf: (field: Field) => string | null;
}

const HEADERS: Readonly<Record<string, readonly string[]>> = {
    en: ['Field', 'Type', 'Required', 'Default', 'Meaning'],
    'pt-br': ['Campo', 'Tipo', 'Obrigatório', 'Padrão', 'Significado'],
};

const REQUIRED: Readonly<Record<string, readonly [string, string]>> = {
    en: ['yes', 'no'],
    'pt-br': ['sim', 'não'],
};

const UNSET: Readonly<Record<string, string>> = { en: 'unset', 'pt-br': 'sem valor' };

const REMOVED_HEADERS: Readonly<Record<string, readonly string[]>> = {
    en: ['Removed field', 'Where it went'],
    'pt-br': ['Campo removido', 'Para onde foi'],
};

async function loadCatalog(outfile: string): Promise<Catalog> {
    const contents = [
        "export { MANIFEST_FIELDS, REMOVED_FIELDS } from '@compiler/manifest/manifest-fields';",
        "import { defaultText, ruleText } from '@compiler/manifest/manifest-field';",
        "import { typeToString } from '@compiler/checker/types';",
        'export const typeOf = (field) => typeToString(field.type);',
        'export const defaultOf = (field) => defaultText(field);',
        'export const ruleOf = (field) => ruleText(field);',
    ].join('\n');

    await build({
        stdin: { contents, resolveDir: repositoryRoot, loader: 'ts' },
        bundle: true,
        format: 'esm',
        platform: 'neutral',
        target: 'es2022',
        outfile,
        alias: {
            '@compiler': join(repositoryRoot, 'packages/compiler/src'),
            '@runtime': join(repositoryRoot, 'packages/runtime/src'),
            '@mta-types': join(repositoryRoot, 'packages/mta-types/src'),
        },
        logLevel: 'silent',
    });

    return (await import(pathToFileURL(outfile).href)) as Catalog;
}

function cell(value: string): string {
    return value.replace(/\|/g, '\\|');
}

function rows(catalog: Catalog, locale: string, fields: readonly Field[], prefix: string): string[] {
    const [yes, no] = REQUIRED[locale] ?? REQUIRED['en'] ?? ['yes', 'no'];

    return fields.flatMap((field) => {
        const path = prefix.length === 0 ? field.name : `${prefix}.${field.name}`;
        const nested = field.members === null ? [] : rows(catalog, locale, field.members, path);
        const elements = field.elements === null ? [] : rows(catalog, locale, field.elements, `${path}[]`);
        const fallback = catalog.defaultOf(field) ?? (field.required ? '—' : (UNSET[locale] ?? 'unset'));
        const rule = catalog.ruleOf(field);
        const meaning = rule === null ? field.summary : `${field.summary} ${rule}`;
        const own =
            field.members === null
                ? [`| \`${path}\` | \`${cell(catalog.typeOf(field))}\` | ${field.required ? yes : no} | \`${cell(fallback)}\` | ${cell(meaning)} |`]
                : [];

        return [...own, ...nested, ...elements];
    });
}

function table(catalog: Catalog, locale: string): string {
    const header = HEADERS[locale] ?? HEADERS['en'] ?? [];

    return [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows(catalog, locale, catalog.MANIFEST_FIELDS, '')].join('\n');
}

function removedTable(catalog: Catalog, locale: string): string {
    const header = REMOVED_HEADERS[locale] ?? REMOVED_HEADERS['en'] ?? [];
    const entries = Object.entries(catalog.REMOVED_FIELDS).sort(([left], [right]) => left.localeCompare(right));

    return [
        `| ${header.join(' | ')} |`,
        `| ${header.map(() => '---').join(' | ')} |`,
        ...entries.map(([name, replacement]) => `| \`${name}\` | ${cell(replacement)} |`),
    ].join('\n');
}

function render(catalog: Catalog, locale: string): string {
    return [`${table(catalog, locale)}\n`, `${removedTable(catalog, locale)}\n`].join('\n');
}

const workspace = mkdtempSync(join(tmpdir(), 'luam-manifest-reference-'));
const written: string[] = [];

try {
    const catalog = await loadCatalog(join(workspace, 'catalog.mjs'));

    for (const locale of ['en', 'pt-br']) {
        const target = join(generatedRoot, `manifest-fields.${locale}.md`);
        const content = render(catalog, locale);

        if (process.argv.includes('--check')) {
            if (readFileSync(target, 'utf8') !== content) {
                console.error(`The committed "${target}" is stale. Run "pnpm docs:fields".`);
                process.exit(1);
            }

            continue;
        }

        writeFileSync(target, content, 'utf8');
        written.push(target);
    }
} finally {
    rmSync(workspace, { recursive: true, force: true });
}

console.log(process.argv.includes('--check') ? 'The manifest field reference matches the catalog.' : `Wrote ${written.length} manifest field tables.`);
