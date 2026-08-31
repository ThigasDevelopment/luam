import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { checkFile, formatViolation, type Violation } from '#conventions/conventions';
import { listSourceFiles } from '#conventions/workspace-files';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, '..', '..', '..');

const files = listSourceFiles(repositoryRoot);
const violations: Violation[] = [];

for (const path of files) {
    violations.push(...checkFile({ path, source: readFileSync(join(repositoryRoot, path), 'utf8') }));
}

for (const violation of violations) {
    process.stderr.write(`${formatViolation(violation)}\n`);
}

if (violations.length > 0) {
    process.stderr.write(`\nThe source conventions failed: ${violations.length} violations across ${files.length} files.\n`);
    process.exit(1);
}

process.stdout.write(`The source conventions passed: ${files.length} files.\n`);
