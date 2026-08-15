import { statSync } from 'node:fs';
import { resolve } from 'node:path';

import { listProjectFiles } from '@cli/build/project-files';
import { cliError, type CliDiagnostic } from '@cli/reporting/cli-diagnostic';
import type { AssetMapping } from '@compiler/manifest/manifest-contract';
import { isLiteralPattern, matchesPattern, normalizePattern, patternRoot } from '@compiler/project/path-pattern';
import { LIBRARY_DIRECTORY, type ResourceAsset } from '@compiler/project/resource';

export interface ResolvedAssets {
    assets: ResourceAsset[];
    diagnostics: CliDiagnostic[];
}

const MISSING_ASSET = 'config-missing-asset';

const OUTPUT_COLLISION = 'config-output-collision';

const MANIFEST_OUTPUT = 'meta.xml';

const HERE = '.';

function isDirectory(root: string, path: string): boolean {
    try {
        return statSync(resolve(root, path)).isDirectory();
    } catch {
        return false;
    }
}

function exists(root: string, path: string): boolean {
    try {
        statSync(resolve(root, path));

        return true;
    } catch {
        return false;
    }
}

function joinDestination(to: string, suffix: string): string {
    if (to === HERE || to.length === 0) {
        return suffix;
    }

    return suffix.length === 0 ? to : `${to}/${suffix}`;
}

function suffixBelow(root: string, path: string): string {
    return root.length === 0 ? path : path.slice(root.length + 1);
}

function reservedOutput(destination: string): string | null {
    if (destination === MANIFEST_OUTPUT) {
        return 'the generated "meta.xml"';
    }

    return destination === LIBRARY_DIRECTORY || destination.startsWith(`${LIBRARY_DIRECTORY}/`) ? `the generated "${LIBRARY_DIRECTORY}" directory` : null;
}

function collect(root: string, mapping: AssetMapping, excluded: readonly string[], diagnostics: CliDiagnostic[]): ResourceAsset[] {
    const from = normalizePattern(mapping.from);
    const to = normalizePattern(mapping.to);

    if (isLiteralPattern(from) && !isDirectory(root, from)) {
        if (!exists(root, from)) {
            diagnostics.push(cliError(MISSING_ASSET, `"${from}" is listed in "assets" but does not exist in "${normalizePattern(root)}".`));

            return [];
        }

        return [{ path: to === HERE ? from : to, source: from, isDownloaded: true }];
    }

    const base = isLiteralPattern(from) ? from : patternRoot(from);
    const pattern = isLiteralPattern(from) ? `${from}/**/*` : from;
    const tree = listProjectFiles(root, [base], excluded);

    for (const message of tree.errors) {
        diagnostics.push(cliError(MISSING_ASSET, message));
    }

    return tree.files
        .filter((path) => matchesPattern(pattern, path))
        .map((path) => ({ path: joinDestination(to, suffixBelow(base, path)), source: path, isDownloaded: true }));
}

function reject(assets: readonly ResourceAsset[], diagnostics: CliDiagnostic[]): ResourceAsset[] {
    const seen = new Map<string, string>();
    const accepted: ResourceAsset[] = [];

    for (const asset of assets) {
        const reserved = reservedOutput(asset.path);
        const previous = seen.get(asset.path);

        if (reserved !== null) {
            diagnostics.push(cliError(OUTPUT_COLLISION, `"${asset.source}" would be written to "${asset.path}", which is reserved for ${reserved}.`));
        } else if (previous !== undefined) {
            diagnostics.push(cliError(OUTPUT_COLLISION, `"${asset.source}" and "${previous}" both produce "${asset.path}". Give one of them a different "to".`));
        } else {
            seen.set(asset.path, asset.source);
            accepted.push(asset);
        }
    }

    return accepted;
}

export function resolveAssets(root: string, mappings: readonly AssetMapping[], excluded: readonly string[] = []): ResolvedAssets {
    const diagnostics: CliDiagnostic[] = [];
    const collected = mappings.flatMap((mapping) => collect(root, mapping, excluded, diagnostics));
    const assets = reject(collected, diagnostics).sort((left, right) => left.path.localeCompare(right.path));

    return { assets, diagnostics };
}
