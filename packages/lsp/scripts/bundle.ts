import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = fileURLToPath(new URL('../dist', import.meta.url));

mkdirSync(distDir, { recursive: true });

await build({
    absWorkingDir: packageRoot,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/luam-lsp.mjs',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    tsconfig: 'tsconfig.json',
});
