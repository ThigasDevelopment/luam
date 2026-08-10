import { execFileSync, execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const distDir = fileURLToPath(new URL('../dist', import.meta.url));
const npm = 'npm';

function quote(value: string): string {
    return value.includes(' ') ? `"${value}"` : value;
}

function run(command: string, args: readonly string[], cwd: string): string {
    if (command === process.execPath) {
        return execFileSync(command, [...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    }

    const line = [command, ...args.map(quote)].join(' ');

    return execSync(line, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function fail(message: string): never {
    process.stderr.write(`${message}\n`);
    process.exit(1);
}

process.stdout.write('Bundling the CLI.\n');

try {
    run(process.execPath, ['scripts/bundle.ts'], packageRoot);
} catch (error: unknown) {
    fail(`The bundle failed: ${error instanceof Error ? error.message : String(error)}`);
}

if (!existsSync(`${distDir}/luam.mjs`) || !existsSync(`${distDir}/package.json`)) {
    fail(`The bundle produced no installable package in "${distDir}".`);
}

process.stdout.write('Installing "luam" globally.\n');

try {
    run(npm, ['install', '--global', distDir], packageRoot);
} catch (error: unknown) {
    const detail = error instanceof Error ? error.message : String(error);

    fail(`The global install failed: ${detail}\nRun the command yourself to see why: npm install --global "${distDir}"`);
}

let installed: string;

try {
    installed = run(npm, ['root', '--global'], packageRoot).trim();
} catch {
    installed = '';
}

let version: string;

try {
    version = run('luam', ['--version'], packageRoot).trim();
} catch {
    const hint = 'The "luam" command is installed but not on PATH. Add the npm global bin directory to PATH and open a new terminal.';

    fail(`${hint}\nGlobal packages live in "${installed}".`);
}

process.stdout.write(`Installed luam ${version}. Run "luam --help" to start.\n`);
