import type { CatalogDiff } from './catalog-fingerprint.ts';
import { MINIMUM_PARSE_RATE } from './wiki-parse-classification.ts';

export const MAXIMUM_ADDED = 150;

export const MAXIMUM_SIGNATURE_CHANGES = 150;

export const MAXIMUM_ENVIRONMENT_CHANGES = 50;

export function refreshBlockers(diff: CatalogDiff, parseRate: number): string[] {
    const blockers: string[] = [];

    if (parseRate < MINIMUM_PARSE_RATE) {
        blockers.push(`only ${(parseRate * 100).toFixed(1)}% of pages parsed, below the ${(MINIMUM_PARSE_RATE * 100).toFixed(0)}% bar`);
    }

    if (diff.removed.length > 0) {
        blockers.push(`the wiki no longer lists ${diff.removed.join(', ')}, and a refresh never deletes a declaration`);
    }

    if (diff.added.length > MAXIMUM_ADDED) {
        blockers.push(`${diff.added.length} functions appeared at once, above the ${MAXIMUM_ADDED} sanity threshold`);
    }

    if (diff.signatures.length > MAXIMUM_SIGNATURE_CHANGES) {
        blockers.push(`${diff.signatures.length} signatures changed at once, above the ${MAXIMUM_SIGNATURE_CHANGES} sanity threshold`);
    }

    if (diff.environments.length > MAXIMUM_ENVIRONMENT_CHANGES) {
        blockers.push(`${diff.environments.length} environments changed at once, above the ${MAXIMUM_ENVIRONMENT_CHANGES} sanity threshold`);
    }

    return blockers;
}
