import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseChangelog } from '#release/changelog';
import { CHANGELOG_TARGETS, sourceVersion } from '#release/repository';

export const MANUAL_SITE = 'https://luam.dracon.dev';

export const REPOSITORY = 'https://github.com/ThigasDevelopment/luam';

export function manualAnchor(version: string, date: string): string {
    return `_${version.split('.').join('-')}-${date}`;
}

export function repositoryAnchor(version: string, date: string): string {
    return `${version.split('.').join('')}---${date}`;
}

export function releaseDate(root: string, version: string): string {
    const target = CHANGELOG_TARGETS[0];

    if (target === undefined) {
        throw new Error('No changelog target is configured.');
    }

    const document = parseChangelog(readFileSync(join(root, target.path), 'utf8'), target.unreleased);
    const release = document.releases.find((entry) => entry.version === version);

    if (release === undefined) {
        throw new Error(`${target.path} has no release heading for ${version}.`);
    }

    return release.date;
}

export function releaseNotes(root: string): string {
    const version = sourceVersion(root);
    const date = releaseDate(root, version);
    const manual = manualAnchor(version, date);

    return [
        `Luam ${version}, released ${date}.`,
        '',
        `- Manual: [English](${MANUAL_SITE}/en/changelog#${manual}) · [Português (Brasil)](${MANUAL_SITE}/pt-br/changelog#${manual})`,
        `- Compiler and CLI: [CHANGELOG](${REPOSITORY}/blob/v${version}/CHANGELOG.md#${repositoryAnchor(version, date)})`,
        `- Install: \`npm install --global @thigasdevelopment/luam@${version}\``,
    ].join('\n');
}
