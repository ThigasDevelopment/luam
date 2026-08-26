import { mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build } from 'esbuild';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../../..', import.meta.url));
const bundle = fileURLToPath(new URL('../dist/generate.mjs', import.meta.url));

mkdirSync(fileURLToPath(new URL('../dist', import.meta.url)), { recursive: true });

await build({
    absWorkingDir: packageRoot,
    entryPoints: ['src/generate.ts'],
    outfile: 'dist/generate.mjs',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    packages: 'external',
    tsconfig: 'tsconfig.json',
});

const generator: { writeTargets: (root: string) => string[]; staleTargets: (root: string) => string[] } = await import(pathToFileURL(bundle).href);

if (process.argv.includes('--check')) {
    const stale = generator.staleTargets(workspaceRoot);

    if (stale.length > 0) {
        console.error(`The committed themes are stale. Run pnpm --filter @luam/theme themes.\n${stale.join('\n')}`);
        process.exit(1);
    }

    console.log('Every generated theme matches the role table.');
} else {
    for (const written of generator.writeTargets(workspaceRoot)) {
        console.log(`wrote ${written}`);
    }
}
