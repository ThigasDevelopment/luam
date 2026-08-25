import { CATALOG_OVERRIDES } from '#mta-types/catalog-overrides';

import { coveredRelease } from './catalog-drift.ts';
import type { ParsedDeclaration } from './generator-model.ts';
import { applyTiebreaker } from './upstream-tiebreaker.ts';
import { parseWikiCatalog, type UnparsedPage, type WikiSurface } from './wiki-declaration-parser.ts';
import { applyEnumerations } from './wiki-enumeration-apply.ts';
import { enumerationValues, pageEnumerations } from './wiki-enumeration-values.ts';
import { latestRevisionAt, readSnapshot, templateText } from './wiki-snapshot.ts';

export const RETAINED_UPSTREAM: Readonly<Record<string, string>> = {
    base64Decode: 'documented outside the curated lists, still accepted by MTA',
    base64Encode: 'documented outside the curated lists, still accepted by MTA',
    doesPedHaveJetPack: 'deprecated by MTA, still accepted, and no longer on a curated list',
    getBanUsername: 'deprecated by MTA, still accepted, and no longer on a curated list',
    getBlurLevel: 'deprecated by MTA, still accepted, and no longer on a curated list',
    getCameraShakeLevel: 'deprecated by MTA, still accepted, and no longer on a curated list',
    getHelicopterRotorSpeed: 'deprecated by MTA, still accepted, and no longer on a curated list',
    getPlayerACInfo: 'documented outside the curated lists, still accepted by MTA',
    getVehicleTurnVelocity: 'deprecated by MTA, still accepted, and no longer on a curated list',
    getWeaponOwner: 'deprecated by MTA, still accepted, and no longer on a curated list',
    isPedOnFire: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setBlurLevel: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setCameraShakeLevel: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setElementMatrix: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setHelicopterRotorSpeed: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setPedOnFire: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setVehicleDirtLevel: 'deprecated by MTA, still accepted, and no longer on a curated list',
    setVehicleTurnVelocity: 'deprecated by MTA, still accepted, and no longer on a curated list',
};

export interface WikiCatalogSource {
    server: readonly ParsedDeclaration[];
    client: readonly ParsedDeclaration[];
    surfaces: readonly WikiSurface[];
    unparsed: readonly UnparsedPage[];
    multiReturns: readonly string[];
    tiebreakers: readonly string[];
    retained: readonly string[];
    redundantOverrides: readonly string[];
    listed: number;
    covers: string;
    revisedAt: string;
    enumerations: readonly string[];
    unusedEnumerations: readonly string[];
}

function redundant(declarations: readonly ParsedDeclaration[]): string[] {
    const names = new Set<string>();

    for (const declaration of declarations) {
        const override = CATALOG_OVERRIDES[declaration.name]?.type;

        if (override !== undefined && JSON.stringify(override) === JSON.stringify(declaration.type)) {
            names.add(declaration.name);
        }
    }

    return [...names].sort();
}

export function wikiCatalogSource(
    elementTypes: ReadonlySet<string>,
    upstream: { server: readonly ParsedDeclaration[]; client: readonly ParsedDeclaration[] },
): WikiCatalogSource {
    const snapshot = readSnapshot();
    const parsed = parseWikiCatalog(snapshot, { elementTypes });
    const values = enumerationValues(templateText(snapshot));
    const pageValues = new Map(snapshot.pages.map((page) => [page.name, pageEnumerations(page.text)]));
    const enumeratedServer = applyEnumerations(parsed.server, values, pageValues);
    const enumeratedClient = applyEnumerations(parsed.client, values, pageValues);
    const server = applyTiebreaker(enumeratedServer.declarations, upstream.server);
    const client = applyTiebreaker(enumeratedClient.declarations, upstream.client);
    const listedNames = new Set([...parsed.server, ...parsed.client].map((declaration) => declaration.name));
    const applied = new Set([...enumeratedServer.applied, ...enumeratedClient.applied]);
    const unused = [...new Set([...enumeratedServer.skipped, ...enumeratedClient.skipped])].filter((entry) => !applied.has(entry.split(':')[0] ?? ''));
    const keep = (declaration: ParsedDeclaration): boolean => RETAINED_UPSTREAM[declaration.name] !== undefined && !listedNames.has(declaration.name);
    const retainedServer = upstream.server.filter(keep);
    const retainedClient = upstream.client.filter(keep);

    return {
        server: [...server.declarations, ...retainedServer],
        client: [...client.declarations, ...retainedClient],
        surfaces: parsed.surfaces,
        unparsed: parsed.unparsed,
        multiReturns: parsed.multiReturns,
        tiebreakers: [...new Set([...server.resolved, ...client.resolved])].sort(),
        retained: [...new Set([...retainedServer, ...retainedClient].map((declaration) => declaration.name))].sort(),
        redundantOverrides: redundant([...server.declarations, ...client.declarations]),
        listed: listedNames.size,
        covers: coveredRelease(snapshot),
        revisedAt: latestRevisionAt(snapshot),
        enumerations: [...applied].sort(),
        unusedEnumerations: unused.sort(),
    };
}
