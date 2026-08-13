import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, '..', '..');
const snippetsRoot = join(repositoryRoot, 'docs', 'snippets');
const errorsRoot = join(snippetsRoot, 'errors');
const outputRoot = join(snippetsRoot, 'output');
const defaultCli = join(repositoryRoot, 'packages', 'cli', 'dist', 'luam.mjs');

const MANIFEST_FILE = '.luam.manifest';

const RESOURCE_NAME = /^name\s*=\s*'([^']+)'/m;

const write = process.argv.includes('--write');

interface Capture {
    file: string;
    content: string;
}

function resolveCli(): string {
    const configured = process.env.LUAM_CLI;

    return configured === undefined || configured === '' ? defaultCli : resolve(repositoryRoot, configured);
}

function projects(root: string): string[] {
    if (!existsSync(root)) {
        return [];
    }

    return readdirSync(root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(root, entry.name, MANIFEST_FILE)))
        .map((entry) => entry.name)
        .sort();
}

function run(cli: string, command: string, cwd: string): { output: string; status: number } {
    const offline = command === 'build' ? ['--offline'] : [];
    const result = spawnSync(process.execPath, [cli, command, '--cwd', cwd, '--no-color', ...offline], { encoding: 'utf8' });

    return { output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(), status: result.status ?? 1 };
}

function resourceName(project: string): string {
    const source = readFileSync(join(snippetsRoot, project, MANIFEST_FILE), 'utf8');
    const found = RESOURCE_NAME.exec(source);

    if (found?.[1] === undefined) {
        throw new Error(`docs/snippets/${project}/${MANIFEST_FILE} declares no resource name.`);
    }

    return found[1];
}

function fileTree(root: string): string {
    const walk = (directory: string): string[] =>
        readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
            const full = join(directory, entry.name);

            return entry.isDirectory() ? walk(full) : [relative(root, full).split('\\').join('/')];
        });

    return walk(root).sort().join('\n');
}

function captureProject(cli: string, project: string): Capture[] {
    const name = resourceName(project);
    const source = join(snippetsRoot, project);
    const workspace = mkdtempSync(join(tmpdir(), 'luam-docs-'));

    try {
        cpSync(source, workspace, { recursive: true });

        const check = run(cli, 'check', workspace);

        if (check.status !== 0) {
            throw new Error(`"luam check" failed for docs/snippets/${project}:\n${check.output}`);
        }

        const build = run(cli, 'build', workspace);

        if (build.status !== 0) {
            throw new Error(`"luam build" failed for docs/snippets/${project}:\n${build.output}`);
        }

        const resource = join(workspace, 'build', name);
        const scrubbed = build.output.split(resource).join(`build/${name}`).split('\\').join('/');

        return [
            { file: `${project}.check.txt`, content: check.output },
            { file: `${project}.build.txt`, content: scrubbed },
            { file: `${project}.tree.txt`, content: fileTree(resource) },
            { file: `${project}.meta.xml`, content: readFileSync(join(resource, 'meta.xml'), 'utf8').trim() },
        ];
    } finally {
        rmSync(workspace, { recursive: true, force: true });
    }
}

function captureError(cli: string, project: string): Capture {
    const directory = join(errorsRoot, project);
    const check = run(cli, 'check', directory);

    if (check.status === 0) {
        throw new Error(`docs/snippets/errors/${project} was expected to fail "luam check" but it passed.`);
    }

    const scrubbed = check.output.split(directory).join(`docs/snippets/errors/${project}`).split('\\').join('/');

    return { file: `errors/${project}.txt`, content: scrubbed };
}

function normalize(content: string): string {
    return content.replace(/\d+(\.\d+)? ms/g, 'N ms').replace(/\r\n/g, '\n').trim();
}

const cli = resolveCli();

if (!existsSync(cli)) {
    process.stderr.write(`The Luam CLI bundle was not found at "${cli}".\nRun "pnpm --filter @luam/cli bundle" first.\n`);
    process.exit(2);
}

const captures: Capture[] = [
    ...projects(snippetsRoot)
        .filter((project) => project !== 'errors' && project !== 'output')
        .flatMap((project) => captureProject(cli, project)),
    ...projects(errorsRoot).map((project) => captureError(cli, project)),
];

mkdirSync(join(outputRoot, 'errors'), { recursive: true });

const stale: string[] = [];

for (const capture of captures) {
    const target = join(outputRoot, capture.file);
    const next = `${capture.content}\n`;

    if (write) {
        writeFileSync(target, next);

        continue;
    }

    const current = existsSync(target) ? readFileSync(target, 'utf8') : '';

    if (normalize(current) !== normalize(capture.content)) {
        stale.push(capture.file);
    }
}

if (write) {
    process.stdout.write(`Wrote ${captures.length} captured outputs to docs/snippets/output.\n`);

    process.exit(0);
}

if (stale.length > 0) {
    process.stderr.write(`These captured outputs no longer match the compiler:\n${stale.map((file) => `  ${file}`).join('\n')}\n`);
    process.stderr.write('\nRun "pnpm docs:capture" and review the diff.\n');
    process.exit(1);
}

process.stdout.write(`${captures.length} captured outputs match the compiler.\n`);
