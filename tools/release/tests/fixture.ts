import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export interface FixtureOptions {
    version?: string;
    product?: string;
    en?: string;
    ptBR?: string;
    packages?: Readonly<Record<string, string>>;
}

const created: string[] = [];

export function productChangelog(): string {
    return ['# Changelog', '', '## Unreleased', '', '### Added', '', '- A new thing.', '', '## 1.0.0 - 2026-01-01', '', '- The first release.', ''].join('\n');
}

export function manualChangelog(unreleased: string, changed: string): string {
    return ['# Manual', '', `## ${unreleased}`, '', `### ${changed}`, '', '- A page moved.', '', '## 1.0.0 - 2026-01-01', '', '- The first manual.', ''].join('\n');
}

export function write(root: string, path: string, content: string): void {
    const file = join(root, path);

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, content);
}

export function fixture(options: FixtureOptions = {}): string {
    const root = mkdtempSync(join(tmpdir(), 'luam-release-'));

    created.push(root);

    const version = options.version ?? '1.0.0';
    const packages = options.packages ?? { cli: '@luam/cli', runtime: '@luam/runtime' };

    for (const [directory, name] of Object.entries(packages)) {
        write(root, `packages/${directory}/package.json`, `${JSON.stringify({ name, version, private: true }, null, 4)}\n`);
    }

    write(root, 'CHANGELOG.md', options.product ?? productChangelog());
    write(root, 'docs/en/changelog.md', options.en ?? manualChangelog('Unreleased', 'Changed'));
    write(root, 'docs/pt-br/changelog.md', options.ptBR ?? manualChangelog('Não lançado', 'Alterado'));

    return root;
}

export function cleanup(): void {
    for (const root of created.splice(0)) {
        rmSync(root, { recursive: true, force: true });
    }
}
