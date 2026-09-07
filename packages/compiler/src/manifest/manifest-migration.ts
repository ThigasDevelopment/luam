import { scan } from '@compiler/lexer/lexer';

import { analyzeManifest, isTableForm, LEGACY_SCHEMA } from './manifest-analysis';
import { convertLegacyManifest, legacyName } from './manifest-legacy';
import type { ManifestContext } from './manifest-pass';
import { renderManifestTable } from './manifest-writer';

export interface ManifestMigration {
    text: string | null;
    refusals: string[];
    notes: string[];
    migrated: boolean;
}

const MIGRATION_CONTEXT: ManifestContext = { mode: 'check', root: '.', env: {} };

export function migrateManifestSource(source: string, context: ManifestContext = MIGRATION_CONTEXT): ManifestMigration {
    if (isTableForm(scan(source).tokens)) {
        return { text: null, refusals: [], notes: [], migrated: true };
    }

    const read = analyzeManifest(source, context, LEGACY_SCHEMA);
    const converted = convertLegacyManifest(read.raw);
    const name = legacyName(read.raw);
    const notes = name === null ? converted.notes : [...converted.notes, `"name" is removed. This resource is now called after the folder that holds its manifest, not "${name}".`];

    if (converted.refusals.length > 0) {
        return { text: null, refusals: converted.refusals, notes, migrated: false };
    }

    return { text: renderManifestTable(converted.value), refusals: [], notes, migrated: false };
}
