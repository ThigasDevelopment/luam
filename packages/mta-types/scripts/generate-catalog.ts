import { readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generate } from './catalog-generator.ts';
import { upstreamVersion, UPSTREAM_PACKAGE } from './upstream-source.ts';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const generatedDirs = ['src/generated', 'src/generated/api', 'src/generated/docs', 'src/generated/events', 'src/generated/oop'];

const result = generate();
const oop = result.oop;
const written = new Set(result.files.map((file) => file.path));

for (const directory of generatedDirs) {
    for (const entry of readdirSync(join(packageRoot, directory), { withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.ts') && !written.has(`${directory}/${entry.name}`)) {
            rmSync(join(packageRoot, directory, entry.name));
        }
    }
}

for (const file of result.files) {
    writeFileSync(join(packageRoot, file.path), file.contents, 'utf8');
}

const lines = [
    `source: ${UPSTREAM_PACKAGE}@${upstreamVersion()}`,
    `files: ${result.files.length}`,
    `shared: ${result.catalog.shared.length}, server: ${result.catalog.server.length}, client: ${result.catalog.client.length}`,
    `documented: ${result.documented}`,
    `events: ${result.events.server} server, ${result.events.client} client`,
    `element types: ${result.elementTypes}`,
    `oop: ${oop.classes.length} classes, ${oop.methods} methods, ${oop.staticMethods} static methods, ${oop.constructors} constructors, ${oop.properties} properties`,
    `oop members without a procedural function: ${result.oop.skippedMethods.length} methods, ${result.oop.skippedProperties.length} properties`,
    `multi-return functions: ${result.multiReturns.length}`,
    `reserved names skipped: ${result.catalog.reserved.join(', ')}`,
];

process.stdout.write(`${lines.join('\n')}\n`);
