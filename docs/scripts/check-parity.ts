import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { LocaleStrings } from '../.vitepress/locale-theme.ts';
import { en } from '../.vitepress/locales/en.ts';
import { ptBR } from '../.vitepress/locales/pt-br.ts';
import { LOCALES, SECTIONS, pageFiles } from '../.vitepress/structure.ts';

const STRINGS: Readonly<Record<string, LocaleStrings>> = { en, 'pt-br': ptBR };

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDir, '..');
const allowlistPath = join(docsRoot, 'translation-allowlist.json');

const MARKERS: Readonly<Record<string, string>> = {
    en: 'Translation in progress',
    'pt-br': 'Tradução em andamento',
};

interface Allowlist {
    pending: string[];
}

function readAllowlist(): string[] {
    if (!existsSync(allowlistPath)) {
        return [];
    }

    const parsed = JSON.parse(readFileSync(allowlistPath, 'utf8')) as Allowlist;

    return parsed.pending ?? [];
}

function markdownFiles(root: string): string[] {
    if (!existsSync(root)) {
        return [];
    }

    return readdirSync(root, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => relative(root, join(entry.parentPath, entry.name)).split('\\').join('/'))
        .sort();
}

const allowlist = new Set(readAllowlist());
const expected = pageFiles();
const errors: string[] = [];

for (const locale of LOCALES) {
    const localeRoot = join(docsRoot, locale);
    const present = new Set(markdownFiles(localeRoot));

    for (const file of expected) {
        const id = `${locale}/${file}`;

        if (!present.has(file)) {
            if (!allowlist.has(id)) {
                errors.push(`Missing page "${id}". Add the translation, or list the page in docs/translation-allowlist.json.`);
            }

            continue;
        }

        if (!allowlist.has(id)) {
            continue;
        }

        const marker = MARKERS[locale] ?? '';
        const content = readFileSync(join(localeRoot, file), 'utf8');

        if (!content.includes(marker)) {
            errors.push(`"${id}" is listed in docs/translation-allowlist.json but does not show the "${marker}" marker.`);
        }
    }

    for (const file of present) {
        if (!expected.includes(file)) {
            errors.push(`"${locale}/${file}" is not part of the page map in docs/.vitepress/structure.ts.`);
        }
    }
}

for (const id of allowlist) {
    const [locale] = id.split('/');

    if (locale === undefined || !LOCALES.includes(locale as (typeof LOCALES)[number])) {
        errors.push(`"${id}" in docs/translation-allowlist.json does not start with a known locale.`);
    }
}

for (const locale of LOCALES) {
    const strings = STRINGS[locale];

    if (strings === undefined) {
        errors.push(`"${locale}" has no strings module. Add one next to docs/.vitepress/locales.`);

        continue;
    }

    for (const section of SECTIONS) {
        if (strings.sectionTitles[section.id] === undefined) {
            errors.push(`"${locale}" has no sidebar title for the "${section.id}" section, so the sidebar would show the raw id.`);
        }

        for (const page of section.pages) {
            const id = `${section.id}/${page}`;

            if (strings.pageTitles[id] === undefined) {
                errors.push(`"${locale}" has no sidebar title for "${id}", so the sidebar would show the raw slug.`);
            }
        }
    }
}

if (errors.length > 0) {
    for (const error of errors) {
        process.stderr.write(`${error}\n`);
    }

    process.stderr.write(`\nLocale parity failed with ${errors.length} problems.\n`);
    process.exit(1);
}

process.stdout.write(`Locale parity passed: ${LOCALES.length} locales, ${expected.length} pages each.\n`);
