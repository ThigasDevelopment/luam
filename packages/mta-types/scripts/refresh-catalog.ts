import { writeFileSync } from 'node:fs';

import { generate } from './catalog-generator.ts';
import { GeneratorError } from './generator-model.ts';
import { refreshBlockers } from './refresh-guards.ts';
import { SNAPSHOT_FILE } from './wiki-snapshot.ts';
import { pullRequestSummary, summaryLines, writeGenerated } from './write-catalog.ts';

const result = generate();
const pages = result.source.listed + result.source.unparsed.length;
const blockers = refreshBlockers(result.diff, pages === 0 ? 0 : result.source.listed / pages);

if (blockers.length > 0) {
    throw new GeneratorError(SNAPSHOT_FILE, `the catalog was not written: ${blockers.join('; ')}`);
}

writeGenerated(result);

const summaryPath = process.argv[2];

if (summaryPath !== undefined) {
    writeFileSync(summaryPath, `${pullRequestSummary(result)}\n`, 'utf8');
}

process.stdout.write(`${summaryLines(result).join('\n')}\n`);
