import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { build } from 'esbuild';

import { parseFenceInfo } from '../.vitepress/live-examples.ts';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, '..', '..');
const docsRoot = join(repositoryRoot, 'docs');

const FENCE = /^```luam([^\n]*)\n([\s\S]*?)^```/gm;

interface Block {
    file: string;
    index: number;
    line: number;
    source: string;
    environment: string;
    declaration: boolean;
    oop: boolean;
    expectError: boolean;
}

interface DiagnosticShape {
    severity: string;
    code: string;
    message: string;
}

type CompileFn = (source: string, options: Record<string, unknown>) => { diagnostics: DiagnosticShape[] };

function compileOptions(block: Block): Record<string, unknown> {
    const base = { environment: block.environment, compilerOptions: { oop: block.oop } };

    return block.declaration ? { ...base, filePath: `src/${block.environment}/declarations.d.luam` } : base;
}

function markdownFiles(root: string): string[] {
    return readdirSync(root, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
        .map((entry) => join(entry.parentPath, entry.name));
}

function blocksIn(file: string): Block[] {
    const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const found: Block[] = [];

    for (const match of text.matchAll(FENCE)) {
        const options = parseFenceInfo(`luam${match[1] ?? ''}`);

        if (!options.live) {
            continue;
        }

        found.push({
            file: relative(repositoryRoot, file).split('\\').join('/'),
            index: found.length + 1,
            line: text.slice(0, match.index).split('\n').length,
            source: match[2] ?? '',
            environment: options.environment,
            declaration: options.declaration,
            oop: options.oop,
            expectError: options.expectError,
        });
    }

    return found;
}

async function loadCompiler(outfile: string): Promise<CompileFn> {
    await build({
        stdin: { contents: "export { compile } from '@compiler/index';", resolveDir: repositoryRoot, loader: 'ts' },
        bundle: true,
        format: 'esm',
        platform: 'neutral',
        target: 'es2022',
        outfile,
        alias: {
            '@compiler': join(repositoryRoot, 'packages/compiler/src'),
            '@runtime': join(repositoryRoot, 'packages/runtime/src'),
            '@mta-types': join(repositoryRoot, 'packages/mta-types/src'),
        },
        logLevel: 'silent',
    });

    return ((await import(pathToFileURL(outfile).href)) as { compile: CompileFn }).compile;
}

const workspace = mkdtempSync(join(tmpdir(), 'luam-examples-'));
const problems: string[] = [];

let checked = 0;
let deliberate = 0;

try {
    const compile = await loadCompiler(join(workspace, 'compiler.mjs'));

    for (const file of markdownFiles(docsRoot)) {
        for (const block of blocksIn(file)) {
            checked += 1;

            const result = compile(block.source, compileOptions(block));
            const errors = result.diagnostics.filter((entry) => entry.severity === 'error');
            const where = `${block.file}:${block.line}`;

            if (block.expectError) {
                deliberate += 1;

                if (errors.length === 0) {
                    problems.push(`${where} is marked "expect-error" but compiles cleanly. Drop the marker.`);
                }

                continue;
            }

            if (result.diagnostics.length > 0) {
                const summary = result.diagnostics.map((entry) => `${entry.severity}:${entry.code}`).join(', ');

                problems.push(`${where} reports [${summary}]. Fix the example, set "env=", "oop", or mark it "expect-error".`);
            }
        }
    }
} finally {
    rmSync(workspace, { recursive: true, force: true });
}

if (problems.length > 0) {
    for (const problem of problems) {
        process.stderr.write(`${problem}\n`);
    }

    process.stderr.write(`\n${problems.length} of ${checked} documented examples do not match their fence.\n`);
    process.exit(1);
}

process.stdout.write(`${checked} documented examples compile as declared (${deliberate} show an error on purpose).\n`);
