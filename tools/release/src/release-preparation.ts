import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { hasReleaseVersion, parseChangelog, releaseHeading, sectionBody } from '#release/changelog';
import { CHANGELOG_TARGETS, type ChangelogTarget, sourceVersion, VERSION_SOURCE, workspacePackages } from '#release/repository';
import { compareVersionStrings, isReleaseDate, parseVersion } from '#release/semver';

export interface FileChange {
    path: string;
    content: string;
}

export interface PreparationPlan {
    version: string;
    date: string;
    changes: FileChange[];
    problems: string[];
}

function bumpManifest(root: string, path: string, version: string): FileChange | null {
    const file = join(root, path);
    const source = readFileSync(file, 'utf8');
    const replaced = source.replace(/("version"\s*:\s*)"[^"]*"/, `$1"${version}"`);

    return replaced === source ? null : { path, content: replaced };
}

function prepareChangelog(root: string, target: ChangelogTarget, version: string, date: string, problems: string[]): FileChange | null {
    const file = join(root, target.path);

    if (!existsSync(file)) {
        problems.push(`${target.path} is missing.`);

        return null;
    }

    const document = parseChangelog(readFileSync(file, 'utf8'), target.unreleased);

    if (document.unreleased === -1) {
        problems.push(`${target.path} has no "## ${target.unreleased}" heading to promote.`);

        return null;
    }

    if (hasReleaseVersion(document, version)) {
        problems.push(`${target.path} already carries a ${version} release heading.`);

        return null;
    }

    const body = sectionBody(document, document.unreleased);

    if (body.length === 0) {
        problems.push(`${target.path} has nothing under "## ${target.unreleased}". Write the entry before preparing ${version}.`);

        return null;
    }

    const rest = document.lines.slice(document.unreleased + 1);
    const next = rest.findIndex((line) => line.startsWith('## '));
    const tail = next === -1 ? [] : rest.slice(next);
    const lines = [...document.lines.slice(0, document.unreleased + 1), '', releaseHeading(version, date), '', ...body, '', ...tail];

    return { path: target.path, content: `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n` };
}

export function planRelease(root: string, version: string, date: string): PreparationPlan {
    const problems: string[] = [];
    const changes: FileChange[] = [];

    if (parseVersion(version) === null) {
        problems.push(`"${version}" is not a strict SemVer version such as 1.2.3.`);

        return { version, date, changes, problems };
    }

    if (!isReleaseDate(date)) {
        problems.push(`"${date}" is not a calendar date written as YYYY-MM-DD.`);

        return { version, date, changes, problems };
    }

    const current = sourceVersion(root);

    if (compareVersionStrings(version, current) <= 0) {
        problems.push(`${VERSION_SOURCE} is already ${current}. Prepare a version above it, not ${version}.`);

        return { version, date, changes, problems };
    }

    for (const entry of workspacePackages(root)) {
        const change = bumpManifest(root, entry.path, version);

        if (change !== null) {
            changes.push(change);
        }
    }

    for (const target of CHANGELOG_TARGETS) {
        const change = prepareChangelog(root, target, version, date, problems);

        if (change !== null) {
            changes.push(change);
        }
    }

    if (problems.length > 0) {
        return { version, date, changes: [], problems };
    }

    return { version, date, changes, problems };
}

export function applyRelease(root: string, plan: PreparationPlan): string[] {
    for (const change of plan.changes) {
        writeFileSync(join(root, change.path), change.content);
    }

    return plan.changes.map((change) => change.path);
}

export function today(): string {
    return new Date().toISOString().slice(0, 10);
}
