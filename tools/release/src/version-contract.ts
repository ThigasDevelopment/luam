import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { type ChangelogDocument, parseChangelog } from '#release/changelog';
import { CHANGELOG_TARGETS, type ChangelogTarget, sourceVersion, VERSION_SOURCE, workspacePackages } from '#release/repository';
import { compareVersionStrings, isReleaseDate, parseVersion } from '#release/semver';

export interface ContractProblem {
    file: string;
    message: string;
}

export interface ContractResult {
    version: string;
    problems: ContractProblem[];
}

function checkPackages(root: string, version: string, problems: ContractProblem[]): void {
    for (const entry of workspacePackages(root)) {
        if (entry.version === version) {
            continue;
        }

        const found = entry.version === '' ? 'missing a version' : entry.version;

        problems.push({
            file: entry.path,
            message: `"${entry.name}" is ${found}, but ${VERSION_SOURCE} is ${version}. Run "pnpm release:prepare ${version}".`,
        });
    }
}

function checkOrder(target: ChangelogTarget, document: ChangelogDocument, problems: ContractProblem[]): void {
    const seen = new Set<string>();

    let previous: string | null = null;

    for (const release of document.releases) {
        const position = `line ${release.line + 1}`;

        if (parseVersion(release.version) === null) {
            problems.push({ file: target.path, message: `"${release.version}" at ${position} is not a strict SemVer version.` });
        }

        if (!isReleaseDate(release.date)) {
            problems.push({ file: target.path, message: `"${release.version}" at ${position} carries the invalid date "${release.date}".` });
        }

        if (seen.has(release.version)) {
            problems.push({ file: target.path, message: `"${release.version}" has more than one release heading; the last one is at ${position}.` });
        }

        seen.add(release.version);

        if (previous !== null && compareVersionStrings(previous, release.version) <= 0) {
            problems.push({ file: target.path, message: `"${release.version}" at ${position} is not older than "${previous}"; release headings run newest first.` });
        }

        previous = release.version;
    }
}

function checkChangelog(root: string, target: ChangelogTarget, version: string, problems: ContractProblem[]): ChangelogDocument | null {
    const file = join(root, target.path);

    if (!existsSync(file)) {
        problems.push({ file: target.path, message: 'The changelog is missing.' });

        return null;
    }

    const document = parseChangelog(readFileSync(file, 'utf8'), target.unreleased);

    if (document.unreleased === -1) {
        problems.push({ file: target.path, message: `No "## ${target.unreleased}" heading. Every changelog keeps one for the work that follows the current release.` });
    }

    for (const line of document.malformed) {
        problems.push({
            file: target.path,
            message: `"${(document.lines[line] ?? '').trim()}" at line ${line + 1} names a version but is not written as "## X.Y.Z - YYYY-MM-DD".`,
        });
    }

    checkOrder(target, document, problems);

    const newest = document.releases[0];

    if (newest === undefined) {
        problems.push({ file: target.path, message: `No release heading for ${version}. Run "pnpm release:prepare ${version}".` });
    } else if (newest.version !== version) {
        problems.push({
            file: target.path,
            message: `The newest release heading is ${newest.version}, but ${VERSION_SOURCE} is ${version}. Run "pnpm release:prepare ${version}".`,
        });
    } else if (document.unreleased !== -1 && document.unreleased > newest.line) {
        problems.push({ file: target.path, message: `"## ${target.unreleased}" must come before the ${version} heading.` });
    }

    return document;
}

function checkLocaleParity(documents: Map<string, ChangelogDocument>, problems: ContractProblem[]): void {
    const en = documents.get('en');
    const ptBR = documents.get('pt-br');

    if (en === undefined || ptBR === undefined) {
        return;
    }

    const left = en.releases.map((release) => `${release.version} - ${release.date}`);
    const right = ptBR.releases.map((release) => `${release.version} - ${release.date}`);

    for (const heading of left) {
        if (!right.includes(heading)) {
            problems.push({ file: 'docs/pt-br/changelog.md', message: `The manual is missing the "${heading}" release heading that docs/en/changelog.md declares.` });
        }
    }

    for (const heading of right) {
        if (!left.includes(heading)) {
            problems.push({ file: 'docs/en/changelog.md', message: `The manual is missing the "${heading}" release heading that docs/pt-br/changelog.md declares.` });
        }
    }
}

export function checkVersionContract(root: string, tag: string | null): ContractResult {
    const problems: ContractProblem[] = [];
    const version = sourceVersion(root);

    if (parseVersion(version) === null) {
        problems.push({ file: VERSION_SOURCE, message: `"${version}" is not a strict SemVer version.` });

        return { version, problems };
    }

    if (tag !== null) {
        const wanted = tag.startsWith('v') ? tag.slice(1) : tag;

        if (wanted !== version) {
            problems.push({
                file: VERSION_SOURCE,
                message: `The release was asked for "${tag}", but the committed version is ${version}. Tag the commit that ${VERSION_SOURCE} already declares.`,
            });
        }
    }

    checkPackages(root, version, problems);

    const documents = new Map<string, ChangelogDocument>();

    for (const target of CHANGELOG_TARGETS) {
        const document = checkChangelog(root, target, version, problems);

        if (document !== null) {
            documents.set(target.locale, document);
        }
    }

    checkLocaleParity(documents, problems);

    return { version, problems };
}
