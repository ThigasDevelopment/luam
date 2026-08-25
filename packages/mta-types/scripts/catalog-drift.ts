import type { ApiEnvironment } from '#mta-types/api-declaration';

import { DEFERRED_ENVIRONMENTS, DEFERRED_FUNCTIONS, deferredNames } from './catalog-drift-allowlist.ts';
import { latestRevisionAt, snapshotEnvironments, type WikiSnapshot } from './wiki-snapshot.ts';

const NEW_FEATURE = /\{\{New feature(?:\/item)?\|[^|}]*\|\s*(\d+(?:\.\d+)*)/g;

export interface MissingFunction {
    name: string;
    environment: ApiEnvironment;
    theme: string;
}

export interface EnvironmentDisagreement {
    name: string;
    catalog: ApiEnvironment;
    wiki: ApiEnvironment;
    theme: string;
}

export interface DriftReport {
    declared: number;
    listed: number;
    missing: readonly MissingFunction[];
    missingByEnvironment: Readonly<Record<ApiEnvironment, number>>;
    unlisted: readonly string[];
    disagreements: readonly EnvironmentDisagreement[];
    undeclaredDeferrals: readonly string[];
    resolvedFunctionDeferrals: readonly string[];
    resolvedEnvironmentDeferrals: readonly string[];
    coveredRelease: string;
    latestRevision: string;
}

function compareVersions(left: string, right: string): number {
    const parts = (value: string): number[] => value.split('.').map((part) => Number.parseInt(part, 10));
    const [first, second] = [parts(left), parts(right)];

    for (let index = 0; index < Math.max(first.length, second.length); index += 1) {
        const difference = (first[index] ?? 0) - (second[index] ?? 0);

        if (difference !== 0) {
            return difference;
        }
    }

    return 0;
}

export function coveredRelease(snapshot: WikiSnapshot): string {
    let highest = '0';

    for (const page of snapshot.pages) {
        NEW_FEATURE.lastIndex = 0;

        for (let match = NEW_FEATURE.exec(page.text); match !== null; match = NEW_FEATURE.exec(page.text)) {
            const version = match[1];

            if (version !== undefined && compareVersions(version, highest) > 0) {
                highest = version;
            }
        }
    }

    return highest;
}

export function reportDrift(snapshot: WikiSnapshot, declarations: ReadonlyMap<string, ApiEnvironment>): DriftReport {
    const listed = snapshotEnvironments(snapshot);
    const deferredFunctions = deferredNames(DEFERRED_FUNCTIONS);
    const deferredEnvironments = deferredNames(DEFERRED_ENVIRONMENTS);
    const missing: MissingFunction[] = [];
    const disagreements: EnvironmentDisagreement[] = [];
    const missingByEnvironment: Record<ApiEnvironment, number> = { shared: 0, server: 0, client: 0 };

    for (const [name, environment] of [...listed].sort(([left], [right]) => left.localeCompare(right, 'en'))) {
        const declared = declarations.get(name);

        if (declared === undefined) {
            missing.push({ name, environment, theme: deferredFunctions.get(name) ?? 'not deferred' });
            missingByEnvironment[environment] += 1;

            continue;
        }

        if (declared !== environment) {
            disagreements.push({ name, catalog: declared, wiki: environment, theme: deferredEnvironments.get(name) ?? 'not deferred' });
        }
    }

    const missingNames = new Set(missing.map((entry) => entry.name));
    const disagreeingNames = new Set(disagreements.map((entry) => entry.name));

    return {
        declared: declarations.size,
        listed: listed.size,
        missing,
        missingByEnvironment,
        unlisted: [...declarations.keys()].filter((name) => !listed.has(name)).sort(),
        disagreements,
        undeclaredDeferrals: missing.filter((entry) => !deferredFunctions.has(entry.name)).map((entry) => entry.name),
        resolvedFunctionDeferrals: [...deferredFunctions.keys()].filter((name) => !missingNames.has(name)).sort(),
        resolvedEnvironmentDeferrals: [...deferredEnvironments.keys()].filter((name) => !disagreeingNames.has(name)).sort(),
        coveredRelease: coveredRelease(snapshot),
        latestRevision: latestRevisionAt(snapshot),
    };
}

export function formatDrift(report: DriftReport): string {
    const themes = new Map<string, string[]>();

    for (const entry of report.missing) {
        themes.set(entry.theme, [...(themes.get(entry.theme) ?? []), entry.name]);
    }

    const counts = report.missingByEnvironment;
    const lines = [
        `catalog: ${report.declared} MTA functions declared, wiki lists ${report.listed}`,
        `missing: ${report.missing.length} (${counts.client} client, ${counts.server} server, ${counts.shared} shared)`,
        ...[...themes].map(([theme, names]) => `  ${theme.split(':')[0] ?? theme} (${names.length}): ${names.join(', ')}`),
        `environment disagreements: ${report.disagreements.length}`,
        ...report.disagreements.map((entry) => `  ${entry.name}: catalog=${entry.catalog} wiki=${entry.wiki}`),
        `declared but not on a curated list: ${report.unlisted.length}`,
        `covers MTA ${report.coveredRelease}, newest page revision ${report.latestRevision}`,
    ];

    return lines.join('\n');
}
