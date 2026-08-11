import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { build } from 'esbuild';

import { distManifest } from './dist-manifest.ts';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const luaDir = fileURLToPath(new URL('../../runtime/lua', import.meta.url));
const templateDir = fileURLToPath(new URL('../../template/files', import.meta.url));
const workspaceRoot = fileURLToPath(new URL('../../../', import.meta.url));

function packageVersion(): string {
    const parsed: unknown = JSON.parse(readFileSync(`${packageRoot}/package.json`, 'utf8'));

    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || typeof parsed.version !== 'string') {
        throw new Error('the cli package manifest declares no version');
    }

    return parsed.version;
}

mkdirSync(distDir, { recursive: true });
cpSync(luaDir, `${distDir}/lua`, { recursive: true });
cpSync(templateDir, `${distDir}/template`, { recursive: true });
cpSync(`${workspaceRoot}/README.md`, `${distDir}/README.md`);
cpSync(`${workspaceRoot}/LICENSE`, `${distDir}/LICENSE`);
writeFileSync(`${distDir}/package.json`, distManifest(packageVersion()), 'utf8');

await build({
    absWorkingDir: packageRoot,
    entryPoints: ['src/index.ts'],
    outfile: 'dist/luam.mjs',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    tsconfig: 'tsconfig.json',
    define: { LUAM_VERSION: JSON.stringify(packageVersion()) },
    banner: { js: ["import { createRequire } from 'node:module';", 'const require = createRequire(import.meta.url);'].join('\n') },
});
