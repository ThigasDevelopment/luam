import { VERSION_PATTERN } from '#release/semver';

export interface ReleaseHeading {
    version: string;
    date: string;
    line: number;
}

export interface ChangelogDocument {
    lines: string[];
    unreleased: number;
    releases: ReleaseHeading[];
    malformed: number[];
}

export const RELEASE_HEADING = /^## (\d+\.\d+\.\d+) - (\d{4}-\d{2}-\d{2})\s*$/;

const VERSION_INSIDE_HEADING = /\b\d+\.\d+\.\d+\b/;

export function releaseHeading(version: string, date: string): string {
    return `## ${version} - ${date}`;
}

export function parseChangelog(source: string, unreleasedHeading: string): ChangelogDocument {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const releases: ReleaseHeading[] = [];
    const malformed: number[] = [];
    const wanted = `## ${unreleasedHeading}`;

    let unreleased = -1;

    for (const [index, line] of lines.entries()) {
        if (line.trim() === wanted) {
            if (unreleased === -1) {
                unreleased = index;
            }

            continue;
        }

        if (!line.startsWith('## ')) {
            continue;
        }

        const found = RELEASE_HEADING.exec(line);

        if (found === null) {
            if (VERSION_INSIDE_HEADING.test(line)) {
                malformed.push(index);
            }

            continue;
        }

        releases.push({ version: found[1] ?? '', date: found[2] ?? '', line: index });
    }

    return { lines, unreleased, releases, malformed };
}

export function sectionBody(document: ChangelogDocument, heading: number): string[] {
    const rest = document.lines.slice(heading + 1);
    const next = rest.findIndex((line) => line.startsWith('## '));
    const body = next === -1 ? rest : rest.slice(0, next);

    while (body.length > 0 && (body[0] ?? '').trim() === '') {
        body.shift();
    }

    while (body.length > 0 && (body[body.length - 1] ?? '').trim() === '') {
        body.pop();
    }

    return body;
}

export function hasReleaseVersion(document: ChangelogDocument, version: string): boolean {
    return document.releases.some((release) => release.version === version);
}

export function isVersionLike(value: string): boolean {
    return VERSION_PATTERN.test(value);
}
