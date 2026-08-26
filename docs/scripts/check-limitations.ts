import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LOCALES, type LocaleId } from '../.vitepress/structure.ts';
import { VERSION_TOKEN } from '../.vitepress/version-token.ts';
import { CLAIM_EXCLUDED, CLAIM_ROOTS, LABEL_TEXT, LIMITATIONS, LIMITATIONS_PAGE, STALE_CLAIMS, labelOf } from './limitations-contract.ts';

interface Section {
    title: string;
    label: string | null;
    line: number;
}

interface Task {
    id: string;
    status: string;
}

const scriptDir = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(scriptDir, '..');
const repositoryRoot = resolve(docsRoot, '..');
const roadmapPath = join(repositoryRoot, '.claude', 'docs', 'roadmap.md');

const LABEL_LINE = /^\*\*([^*]+)\.\*\*/;

const TASK_ROW = /^\|\s*(\d+\.\d+)\s*\|[^|]*\|[^|]*\|[^|]*\|\s*([^|]+?)\s*\|$/;

const errors: string[] = [];

function lines(path: string): string[] {
    return readFileSync(path, 'utf8').replace(/\r\n/g, '\n').split('\n');
}

function sectionsOf(content: string[]): Section[] {
    const found: Section[] = [];

    for (const [index, line] of content.entries()) {
        if (!line.startsWith('## ')) {
            continue;
        }

        const next = content.slice(index + 1).find((value) => value.trim() !== '') ?? '';
        const label = LABEL_LINE.exec(next);

        found.push({ title: line.slice(3).trim(), label: label === null ? null : (label[1] ?? null), line: index + 1 });
    }

    return found;
}

function checkLabels(locale: LocaleId, page: string, sections: readonly Section[]): void {
    if (sections.length !== LIMITATIONS.length) {
        errors.push(`${page} carries ${sections.length} limitations but the contract in docs/scripts/limitations-contract.ts names ${LIMITATIONS.length}.`);

        return;
    }

    for (const [index, limitation] of LIMITATIONS.entries()) {
        const section = sections[index];
        const expected = labelOf(locale, limitation.label);

        if (section === undefined) {
            continue;
        }

        if (section.label === null) {
            errors.push(`${page}:${section.line}: "${section.title}" opens with no label. Start it with "**${expected}.**".`);

            continue;
        }

        if (section.label !== expected) {
            errors.push(`${page}:${section.line}: "${section.title}" is labelled "${section.label}" but "${limitation.id}" is "${expected}".`);
        }
    }
}

function checkLegend(locale: LocaleId, page: string, content: readonly string[]): void {
    const text = content.join('\n');

    for (const label of Object.values(LABEL_TEXT[locale])) {
        if (!text.includes(`| **${label}** |`)) {
            errors.push(`${page} has no legend row for "${label}", so a reader cannot tell what the label promises.`);
        }
    }

    if (!text.includes(VERSION_TOKEN)) {
        errors.push(`${page} does not render ${VERSION_TOKEN}, so the version it describes goes stale on the next release.`);
    }
}

function checkOwners(): void {
    for (const limitation of LIMITATIONS) {
        const planned = limitation.label === 'planned';

        if (planned && limitation.owners.length === 0) {
            errors.push(`"${limitation.id}" is planned but names no owning task in docs/scripts/limitations-contract.ts.`);
        }

        if (!planned && limitation.owners.length > 0) {
            errors.push(`"${limitation.id}" is not planned but names owning tasks. A boundary is recorded as a decision, not as pending work.`);
        }

        if (!planned && limitation.decision === null) {
            errors.push(`"${limitation.id}" is a boundary with no recorded decision. Point it at the file that records it.`);
        }

        if (limitation.decision !== null && !existsSync(join(repositoryRoot, limitation.decision))) {
            errors.push(`"${limitation.id}" records its decision in "${limitation.decision}", which does not exist.`);
        }
    }
}

function roadmapTasks(): Task[] {
    return lines(roadmapPath)
        .map((line) => TASK_ROW.exec(line))
        .filter((match): match is RegExpExecArray => match !== null)
        .map((match) => ({ id: match[1] ?? '', status: (match[2] ?? '').toLowerCase() }));
}

function checkRoadmap(): void {
    if (!existsSync(roadmapPath)) {
        process.stdout.write('The roadmap is not in this checkout, so owning tasks were not resolved.\n');

        return;
    }

    const tasks = roadmapTasks();

    for (const limitation of LIMITATIONS) {
        for (const owner of limitation.owners) {
            const task = tasks.find((entry) => entry.id === owner);

            if (task === undefined) {
                errors.push(`"${limitation.id}" names task ${owner}, which the roadmap does not list.`);

                continue;
            }

            if (task.status.startsWith('done')) {
                errors.push(`"${limitation.id}" names task ${owner}, which is done. Re-describe the limitation or drop it.`);
            }
        }
    }
}

function markdownFiles(root: string): string[] {
    const full = join(repositoryRoot, root);

    if (!existsSync(full)) {
        return [];
    }

    if (root.endsWith('.md')) {
        return [root];
    }

    return readdirSync(full, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => relative(repositoryRoot, join(entry.parentPath, entry.name)).split('\\').join('/'))
        .sort();
}

function checkClaims(): number {
    const files = CLAIM_ROOTS.flatMap((root) => markdownFiles(root)).filter((file) => !CLAIM_EXCLUDED.includes(file));

    for (const file of files) {
        for (const [index, line] of lines(join(repositoryRoot, file)).entries()) {
            for (const claim of STALE_CLAIMS) {
                const found = claim.pattern.exec(line);

                if (found !== null) {
                    errors.push(`${file}:${index + 1}: "${found[0]}" contradicts what the compiler does. ${claim.correction}`);
                }
            }
        }
    }

    return files.length;
}

for (const locale of LOCALES) {
    const page = `docs/${locale}/${LIMITATIONS_PAGE}`;
    const path = join(repositoryRoot, page);

    if (!existsSync(path)) {
        errors.push(`${page} does not exist, so the limitation contract has no ${locale} half.`);

        continue;
    }

    const content = lines(path);

    checkLabels(locale, page, sectionsOf(content));
    checkLegend(locale, page, content);
}

checkOwners();
checkRoadmap();

const scanned = checkClaims();

if (errors.length > 0) {
    for (const error of errors) {
        process.stderr.write(`${error}\n`);
    }

    process.stderr.write(`\nThe limitation contract failed with ${errors.length} problems.\n`);
    process.exit(1);
}

process.stdout.write(`The limitation contract passed: ${LIMITATIONS.length} limitations in ${LOCALES.length} locales, ${scanned} pages free of corrected claims.\n`);
