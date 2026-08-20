import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { brotliCompressSync } from 'node:zlib';

import { build } from 'esbuild';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, '..', '..');

const BUDGET_KB = 500;


const themeDir = join(repositoryRoot, 'docs/.vitepress/theme/playground').split('\\').join('/');

const ENTRY = `
export { compile } from '@compiler/index';
export { DEFAULT_DOCUMENT } from '${themeDir}/starting-document.ts';
export { highlight } from '${themeDir}/highlight.ts';
`;

const INJECTIONS: readonly string[] = [
    '<img src=x onerror=alert(1)>',
    "local a = '</span><script>alert(1)</script>'",
    '# <svg onload=alert(1)>',
    'local s = "</code></pre><iframe src=javascript:alert(1)>"',
    'local t = `${<img src=x onerror=alert(1)>}`',
];

const FOREIGN_TAG = /<(?!\/?span\b)[a-zA-Z]/;

interface StartingShape {
    environment: string;
    oop: boolean;
    source: string;
}

interface DiagnosticShape {
    severity: string;
    code: string;
}

interface CompiledShape {
    code: string | null;
    diagnostics: DiagnosticShape[];
}

type CompileFn = (source: string, options: Record<string, unknown>) => CompiledShape;

type HighlightFn = (source: string) => string;

async function bundle(outfile: string): Promise<number> {
    const result = await build({
        stdin: { contents: ENTRY, resolveDir: repositoryRoot, loader: 'ts' },
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2022',
        minify: true,
        outfile,
        metafile: true,
        alias: {
            '@compiler': join(repositoryRoot, 'packages/compiler/src'),
            '@runtime': join(repositoryRoot, 'packages/runtime/src'),
            '@mta-types': join(repositoryRoot, 'packages/mta-types/src'),
        },
        logLevel: 'silent',
    });

    const output = Object.values(result.metafile.outputs)[0];

    return output === undefined ? 0 : output.bytes;
}

const workspace = mkdtempSync(join(tmpdir(), 'luam-playground-'));
const outfile = join(workspace, 'playground.mjs');
const errors: string[] = [];

const SIDES = ['shared', 'server', 'client'];

let combinations = 0;

try {
    const bytes = await bundle(outfile);
    const module = (await import(pathToFileURL(outfile).href)) as { compile: CompileFn; DEFAULT_DOCUMENT: StartingShape; highlight: HighlightFn };

    for (const injection of INJECTIONS) {
        if (FOREIGN_TAG.test(module.highlight(injection))) {
            errors.push(`The highlighter let markup through for ${JSON.stringify(injection)}. Its output is rendered with v-html.`);
        }
    }
    const compressed = brotliCompressSync(readFileSync(outfile)).length;

    if (compressed > BUDGET_KB * 1024) {
        errors.push(`The browser bundle is ${(compressed / 1024).toFixed(1)} kB compressed, above the ${BUDGET_KB} kB budget.`);
    }

    for (const side of SIDES) {
        for (const oop of [false, true]) {
            const result = module.compile(module.DEFAULT_DOCUMENT.source, { environment: side, compilerOptions: { oop } });
            const where = `${side} with oop ${oop ? 'on' : 'off'}`;

            combinations += 1;

            if (result.diagnostics.length > 0) {
                const summary = result.diagnostics.map((entry) => `${entry.severity}:${entry.code}`).join(', ');

                errors.push(`The starting document reports [${summary}] on ${where}. It must stay clean on every side.`);
            }

            if (result.code === null) {
                errors.push(`The starting document emitted no Lua on ${where}.`);
            }
        }
    }

    process.stdout.write(`Playground bundle: ${(bytes / 1024).toFixed(1)} kB raw, ${(compressed / 1024).toFixed(1)} kB brotli.\n`);
} finally {
    rmSync(workspace, { recursive: true, force: true });
}

const themeRoot = join(repositoryRoot, 'docs/.vitepress/theme');
const styles = readFileSync(join(themeRoot, 'playground.css'), 'utf8');
const component = readFileSync(join(themeRoot, 'Playground.vue'), 'utf8');

const FULLSCREEN_RULES: readonly string[] = ['html.luam-fullscreen', 'scrollbar-gutter: auto'];

for (const rule of FULLSCREEN_RULES) {
    if (!styles.includes(rule)) {
        errors.push(`playground.css lost "${rule}". Without it the reserved scrollbar lane leaves a dead strip beside the full screen app.`);
    }
}

if (!component.includes(`classList.add('luam-fullscreen')`)) {
    errors.push('Playground.vue no longer adds the "luam-fullscreen" class on mount, so the app cannot claim the whole viewport.');
}

if (!component.includes(`classList.remove('luam-fullscreen')`)) {
    errors.push('Playground.vue no longer removes the "luam-fullscreen" class on unmount, so every page after it would lose its scrollbar lane.');
}

if (errors.length > 0) {
    for (const error of errors) {
        process.stderr.write(`${error}\n`);
    }

    process.stderr.write(`\nThe playground contract failed with ${errors.length} ${errors.length === 1 ? 'problem' : 'problems'}.\n`);
    process.exit(1);
}

process.stdout.write('The full screen contract holds: the app claims the viewport and releases it on the way out.\n');

process.stdout.write(`The starting document compiles clean on all ${combinations} side and oop combinations.\n`);
process.stdout.write(`${INJECTIONS.length} injection samples stayed escaped in the highlighter.\n`);
