import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const distRoot = resolve(scriptDir, '..', '.vitepress', 'dist');

const WRAPPER = '<div class="table-wrapper">';

function htmlFiles(root: string): string[] {
    return readdirSync(root, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
        .map((entry) => relative(root, join(entry.parentPath, entry.name)).split('\\').join('/'))
        .sort();
}

function unwrappedTables(html: string): number {
    let unwrapped = 0;
    let index = html.indexOf('<table');

    while (index !== -1) {
        if (!html.slice(0, index).endsWith(WRAPPER)) {
            unwrapped += 1;
        }

        index = html.indexOf('<table', index + 1);
    }

    return unwrapped;
}

if (!existsSync(distRoot)) {
    process.stderr.write('No build output at docs/.vitepress/dist. Run "pnpm docs:build" first.\n');
    process.exit(1);
}

const SEARCH_TOKENS: readonly string[] = [
    '--vp-local-search-bg',
    '--vp-local-search-result-bg',
    '--vp-local-search-result-border',
    '--vp-local-search-result-selected-bg',
    '--vp-local-search-result-selected-border',
    '--vp-local-search-highlight-bg',
    '--vp-local-search-highlight-text',
];

const pages = htmlFiles(distRoot);
const errors: string[] = [];
let tables = 0;

const tokens = readFileSync(resolve(scriptDir, '..', '.vitepress', 'theme', 'tokens.css'), 'utf8');

for (const token of SEARCH_TOKENS) {
    if (!tokens.includes(token)) {
        errors.push(`tokens.css does not map "${token}". Search results then fall back to a solid brand fill that is unreadable in the dark theme.`);
    }
}

for (const page of pages) {
    const html = readFileSync(join(distRoot, page), 'utf8');
    const total = html.split('<table').length - 1;
    const loose = unwrappedTables(html);

    tables += total;

    if (loose > 0) {
        errors.push(`"${page}" renders ${loose} table(s) outside a "table-wrapper". A bare table widens the page instead of scrolling itself.`);
    }
}

if (errors.length > 0) {
    for (const error of errors) {
        process.stderr.write(`${error}\n`);
    }

    process.stderr.write(`\nLayout check failed with ${errors.length} problems.\n`);
    process.exit(1);
}

process.stdout.write(`Layout check passed: ${tables} tables across ${pages.length} pages scroll inside a wrapper.\n`);
process.stdout.write(`${SEARCH_TOKENS.length} search result tokens follow the theme instead of the raw brand colour.\n`);
