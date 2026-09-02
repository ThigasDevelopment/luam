import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpawnSyncReturns } from 'node:child_process';

const calls: string[][] = [];

const results = new Map<string, SpawnSyncReturns<string>>();

function ok(stdout: string): SpawnSyncReturns<string> {
    return { pid: 1, output: [], stdout, stderr: '', status: 0, signal: null };
}

function failed(): SpawnSyncReturns<string> {
    return { pid: 1, output: [], stdout: '', stderr: '', status: 1, signal: null };
}

vi.mock('@cli/editor/editor-command', () => ({
    runEditorCommand: (command: string, args: readonly string[]): SpawnSyncReturns<string> => {
        calls.push([command, ...args]);

        return results.get(args[0] ?? '') ?? failed();
    },
}));

const { createEditorService, EXTENSION_ID, SUPPORTED_EDITORS } = await import('@cli/editor/editor-service');

const VSCODE = SUPPORTED_EDITORS[0] as { id: string; name: string; command: string };

const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../../vscode/package.json', import.meta.url)), 'utf8')) as {
    name: string;
    publisher: string;
};

beforeEach(() => {
    calls.length = 0;
    results.clear();
});

describe('the extension identifier', () => {
    it('matches the identifier the extension manifest publishes', () => {
        expect(EXTENSION_ID).toBe(`${manifest.publisher}.${manifest.name}`);
    });

    it('is lower case, so the listing comparison cannot miss it', () => {
        expect(EXTENSION_ID).toBe(EXTENSION_ID.toLowerCase());
    });
});

describe('extension detection', () => {
    it('finds the extension in the listing', () => {
        results.set('--list-extensions', ok('ms-python.python\nluam.luam\n'));

        expect(createEditorService().hasExtension(VSCODE)).toBe(true);
    });

    it('ignores the casing the editor prints', () => {
        results.set('--list-extensions', ok('  Luam.Luam  \n'));

        expect(createEditorService().hasExtension(VSCODE)).toBe(true);
    });

    it('reports nothing when the listing does not name it', () => {
        results.set('--list-extensions', ok('ms-python.python\n'));

        expect(createEditorService().hasExtension(VSCODE)).toBe(false);
    });
});

describe('extension install', () => {
    it('reaches the marketplace with the published identifier', async () => {
        results.set('--install-extension', ok(''));

        const result = await createEditorService().install(VSCODE);

        expect(result).toEqual({ source: 'marketplace', error: null });
        expect(calls[0]).toEqual([VSCODE.command, '--install-extension', EXTENSION_ID, '--force']);
    });

    it('tries the marketplace before anything else', async () => {
        results.set('--install-extension', failed());

        await createEditorService().install(VSCODE);

        expect(calls[0]?.[1]).toBe('--install-extension');
    });
});
