import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDir, '..', '..');
const snippetsRoot = join(repositoryRoot, 'docs', 'snippets');
const defaultCli = join(repositoryRoot, 'packages', 'cli', 'dist', 'luam.mjs');
const MANIFEST_FILE = '.luam.manifest';

function resolveCli(): string {
    const configured = process.env.LUAM_CLI;

    if (configured !== undefined && configured !== '') {
        return resolve(repositoryRoot, configured);
    }

    return defaultCli;
}

function snippetProjects(): string[] {
    return readdirSync(snippetsRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .filter((name) => existsSync(join(snippetsRoot, name, MANIFEST_FILE)))
        .sort();
}

function checkProject(cli: string, project: string): boolean {
    const cwd = join(snippetsRoot, project);
    const result = spawnSync(process.execPath, [cli, 'check', '--cwd', cwd, '--no-color'], { encoding: 'utf8' });

    if (result.status === 0) {
        process.stdout.write(`ok    docs/snippets/${project}\n`);

        return true;
    }

    process.stdout.write(`fail  docs/snippets/${project}\n`);
    process.stdout.write(`${result.stdout ?? ''}${result.stderr ?? ''}\n`);

    return false;
}

const cli = resolveCli();

if (!existsSync(cli)) {
    process.stderr.write(`The Luam CLI bundle was not found at "${cli}".\nRun "pnpm --filter @luam/cli bundle" first, or set LUAM_CLI to another entry point.\n`);
    process.exit(2);
}

const projects = snippetProjects();

if (projects.length === 0) {
    process.stderr.write('No snippet project was found under docs/snippets.\n');
    process.exit(2);
}

const failed = projects.filter((project) => !checkProject(cli, project));

if (failed.length > 0) {
    process.stderr.write(`\n${failed.length} of ${projects.length} snippet projects failed "luam check".\n`);
    process.exit(1);
}

process.stdout.write(`\n${projects.length} snippet projects passed "luam check".\n`);
