import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

export interface ProjectFixture {
    root: string;
    write(path: string, contents: string): void;
    remove(path: string): void;
    read(path: string): string;
    exists(path: string): boolean;
    dispose(): void;
}

export const VALID_SHARED = [
    '--!shared',
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

export function defaultProjectFiles(config: Readonly<Record<string, unknown>> = {}): Record<string, string> {
    return {
        'luam.json': `${JSON.stringify({ name: 'luam-demo', ...config }, null, 4)}\n`,
        'src/shared/config.luam': VALID_SHARED,
        'src/server/main.luam': VALID_SERVER,
        'src/client/hud.luam': VALID_CLIENT,
    };
}
