import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { analyzeManifest } from '@compiler/manifest/manifest-analysis';

import type { LuamConfig } from '@cli/config/config-schema';
import { validateConfig } from '@cli/config/config-validation';

export interface ProjectFixture {
    root: string;
    write(path: string, contents: string): void;
    remove(path: string): void;
    read(path: string): string;
    exists(path: string): boolean;
    dispose(): void;
}

export const VALID_SHARED = [
    '#!shared',
    '',
    "RESOURCE_NAME = 'luam-demo'",
    '',
    'function formatPlayerName(name: string): string',
    "    return 'Player: ' .. name",
    'end',
    '',
].join('\n');

export const VALID_SERVER = [
    'function announceJoin(player: Player): void',
    '    outputChatBox(formatPlayerName(getPlayerName(player)), root)',
    'end',
    '',
].join('\n');

export function clientSource(title: string): string {
    return [`local title: string = '${title}'`, 'local caption: string = `HUD ${title}`', '', 'dxDrawText(caption, 10, 10)', ''].join('\n');
}

export const VALID_CLIENT = clientSource('Luam');

export const BROKEN_SERVER = ['function broken(value: string): number', '    return value', 'end', ''].join('\n');

export function createProjectFixture(files: Readonly<Record<string, string>> = {}): ProjectFixture {
    const root = mkdtempSync(join(tmpdir(), 'luam-cli-'));

    const fixture: ProjectFixture = {
        root,
        write: (path: string, contents: string): void => {
            const absolute = resolve(root, path);

            mkdirSync(dirname(absolute), { recursive: true });
            writeFileSync(absolute, contents, 'utf8');
        },
        remove: (path: string): void => {
            rmSync(resolve(root, path), { force: true, recursive: true });
        },
        read: (path: string): string => readFileSync(resolve(root, path), 'utf8'),
        exists: (path: string): boolean => existsSync(resolve(root, path)),
        dispose: (): void => {
            rmSync(root, { force: true, recursive: true });
        },
    };

    for (const [path, contents] of Object.entries(files)) {
        fixture.write(path, contents);
    }

    return fixture;
}

export const MANIFEST_FILE = '.luam.manifest';

function manifestValue(value: unknown, indent: string): string {
    if (typeof value === 'string') {
        return `'${value.replace(/(['\\])/g, '\\$1')}'`;
    }

    if (Array.isArray(value)) {
        return `{ ${value.map((entry) => manifestValue(entry, indent)).join(', ')} }`;
    }

    if (typeof value === 'object' && value !== null) {
        const inner = `${indent}    `;
        const fields = Object.entries(value).map(([key, entry]) => `${inner}${key} = ${manifestValue(entry, inner)},`);

        return ['{', ...fields, `${indent}}`].join('\n');
    }

    return String(value);
}

export function manifestSource(config: Readonly<Record<string, unknown>>): string {
    return `${Object.entries(config)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key} = ${manifestValue(value, '')}`)
        .join('\n')}\n`;
}

export function manifestConfig(config: Readonly<Record<string, unknown>>, env: Readonly<Record<string, string>> = {}): LuamConfig {
    const analysis = analyzeManifest(manifestSource(config), { mode: 'check', root: '/project', env });
    const validated = validateConfig(analysis.value, analysis.positions, env);

    if (validated.config === null) {
        throw new Error(`The fixture manifest is invalid: ${[...analysis.diagnostics, ...validated.diagnostics].map((entry) => entry.message).join(' ')}`);
    }

    return validated.config;
}

export function defaultProjectFiles(config: Readonly<Record<string, unknown>> = {}): Record<string, string> {
    return {
        [MANIFEST_FILE]: manifestSource({
            name: 'luam-demo',
            output: { bundle: false, map: true },
            assets: [{ from: 'assets/**/*', to: 'assets' }],
            ...config,
        }),
        'src/shared/config.luam': VALID_SHARED,
        'src/server/main.luam': VALID_SERVER,
        'src/client/hud.luam': VALID_CLIENT,
    };
}
