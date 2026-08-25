import { generate } from './catalog-generator.ts';
import { summaryLines, writeGenerated } from './write-catalog.ts';

const result = generate();

writeGenerated(result);

process.stdout.write(`${summaryLines(result).join('\n')}\n`);
