import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const serverEntry = fileURLToPath(new URL('../../lsp/src/index.ts', import.meta.url));

mkdirSync(`${distDir}/server`, { recursive: true });

await build({
    absWorkingDir: packageRoot,
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    external: ['vscode'],
    tsconfig: 'tsconfig.json',
});

await build({
    absWorkingDir: packageRoot,
    entryPoints: [serverEntry],
    outfile: 'dist/server/luam-lsp.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    tsconfig: '../lsp/tsconfig.json',
});
