import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { formatDiff, INDEX_PATH } from './catalog-fingerprint.ts';
import type { GenerationResult } from './catalog-generator.ts';
import { upstreamVersion, UPSTREAM_PACKAGE } from './upstream-source.ts';
import { WIKI_SITE } from './wiki-endpoint.ts';
import { SNAPSHOT_FILE } from './wiki-snapshot.ts';

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url));

const GENERATED_DIRECTORIES = ['src/generated', 'src/generated/api', 'src/generated/docs', 'src/generated/events', 'src/generated/oop'];

export function writeGenerated(result: GenerationResult): void {
    const written = new Set(result.files.map((file) => file.path));

    for (const directory of GENERATED_DIRECTORIES) {
        for (const entry of readdirSync(join(PACKAGE_ROOT, directory), { withFileTypes: true })) {
            if (entry.isFile() && entry.name.endsWith('.ts') && !written.has(`${directory}/${entry.name}`)) {
                rmSync(join(PACKAGE_ROOT, directory, entry.name));
            }
        }
    }

    for (const file of result.files) {
        writeFileSync(join(PACKAGE_ROOT, file.path), file.contents, 'utf8');
    }

    writeFileSync(INDEX_PATH, `${JSON.stringify(result.index, null, 4)}\n`, 'utf8');
}

export function summaryLines(result: GenerationResult): string[] {
    const oop = result.oop;
    const source = result.source;
    const tiebreaker = `narrowed ${source.tiebreakers.length} positions and retained ${source.retained.length} declarations`;
    const unapplied = source.unusedEnumerations.length === 0 ? '' : `, unapplied: ${source.unusedEnumerations.join('; ')}`;

    return [
        `source: ${SNAPSHOT_FILE}, covering MTA ${result.source.covers}, newest revision ${result.source.revisedAt}`,
        `tiebreaker: ${UPSTREAM_PACKAGE}@${upstreamVersion()} ${tiebreaker}`,
        `files: ${result.files.length}`,
        `shared: ${result.catalog.shared.length}, server: ${result.catalog.server.length}, client: ${result.catalog.client.length}`,
        `documented: ${result.documented}`,
        `events: ${result.events.server} server, ${result.events.client} client, ${result.events.documented} documented`,
        `element types: ${result.elementTypes}`,
        `oop: ${oop.classes.length} classes, ${oop.methods} methods, ${oop.staticMethods} static methods, ${oop.constructors} constructors, ${oop.properties} properties`,
        `oop members without a procedural function: ${oop.skippedMethods.length} methods, ${oop.skippedProperties.length} properties`,
        `multi-return functions: ${result.multiReturns.length}`,
        `reserved names skipped: ${result.catalog.reserved.join(', ')}`,
        `overrides the wiki made redundant: ${result.source.redundantOverrides.length === 0 ? 'none' : result.source.redundantOverrides.join(', ')}`,
        `literal enumerations: ${result.source.enumerations.length} parameters${unapplied}`,
        formatDiff(result.diff),
    ];
}

function link(result: GenerationResult, name: string): string {
    const surface = result.source.surfaces.find((entry) => entry.name === name);

    return surface === undefined ? `\`${name}\`` : `[\`${name}\`](${WIKI_SITE}/index.php?title=${surface.title}&oldid=${surface.revision})`;
}

function section(title: string, rows: readonly string[]): string[] {
    return [`## ${title} (${rows.length})`, '', ...(rows.length === 0 ? ['None.'] : rows), ''];
}

export function pullRequestSummary(result: GenerationResult): string {
    const diff = result.diff;

    return [
        `The MTA wiki snapshot now covers MTA ${result.source.covers}, newest page revision ${result.source.revisedAt}.`,
        '',
        'Sections are ordered by blast radius: a changed signature or environment can break code that compiles today, an added function cannot.',
        '',
        ...section('Environments changed', diff.environments.map((change) => `- ${link(result, change.name)}: \`${change.before}\` to \`${change.after}\``)),
        ...section('Existing signatures changed', diff.signatures.map((change) => `- ${link(result, change.name)}: \`${change.before}\` to \`${change.after}\``)),
        ...section('Functions the wiki no longer lists', diff.removed.map((name) => `- \`${name}\` stays declared; the refresh never deletes a declaration`)),
        ...section('Functions added', diff.added.map((name) => `- ${link(result, name)}`)),
    ].join('\n');
}
