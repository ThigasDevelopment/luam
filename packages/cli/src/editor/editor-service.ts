import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { VERSION } from '@cli/cli/usage';
import { runEditorCommand } from '@cli/editor/editor-command';

import type { SpawnSyncReturns } from 'node:child_process';

export const EXTENSION_ID = 'thigasdevelopment.luam';

export interface Editor {
    id: string;
    name: string;
    command: string;
}

export interface ExtensionInstallResult {
    source: 'marketplace' | 'release' | null;
    error: string | null;
}

export interface EditorService {
    detect(): Editor[];
    hasExtension(editor: Editor): boolean;
    install(editor: Editor): Promise<ExtensionInstallResult>;
}

export const SUPPORTED_EDITORS: readonly Editor[] = [
    { id: 'vscode', name: 'Visual Studio Code', command: 'code' },
    { id: 'vscode-insiders', name: 'Visual Studio Code Insiders', command: 'code-insiders' },
    { id: 'cursor', name: 'Cursor', command: 'cursor' },
    { id: 'vscodium', name: 'VSCodium', command: 'codium' },
    { id: 'windsurf', name: 'Windsurf', command: 'windsurf' },
];

const MAX_VSIX_BYTES = 50 * 1024 * 1024;
const RELEASE_URL = `https://github.com/ThigasDevelopment/luam/releases/download/v${VERSION}/luam-${VERSION}.vsix`;

function succeeded(result: SpawnSyncReturns<string>): boolean {
    return (result.error === undefined || result.error === null) && result.status === 0;
}

function trustedReleaseHost(url: string): boolean {
    const host = new URL(url).hostname.toLowerCase();

    return host === 'github.com' || host.endsWith('.githubusercontent.com');
}

async function downloadRelease(): Promise<Uint8Array> {
    if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(VERSION)) {
        throw new Error(`Release fallback is unavailable for development version ${VERSION}.`);
    }

    const response = await fetch(RELEASE_URL, { signal: AbortSignal.timeout(30_000) });
    const declaredSize = Number(response.headers.get('content-length') ?? '0');

    if (!response.ok || !trustedReleaseHost(response.url)) {
        throw new Error(`Release download failed with HTTP ${response.status}.`);
    }

    if (declaredSize > MAX_VSIX_BYTES) {
        throw new Error('The release extension exceeds the 50 MB download limit.');
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    if (bytes.byteLength > MAX_VSIX_BYTES) {
        throw new Error('The release extension exceeds the 50 MB download limit.');
    }

    return bytes;
}

function installVsix(editor: Editor, bytes: Uint8Array): ExtensionInstallResult {
    const directory = mkdtempSync(join(tmpdir(), 'luam-'));
    const path = join(directory, `luam-${VERSION}.vsix`);

    try {
        writeFileSync(path, bytes, { flag: 'wx' });
        const result = runEditorCommand(editor.command, ['--install-extension', path, '--force']);

        return succeeded(result) ? { source: 'release', error: null } : { source: null, error: 'The editor rejected the release VSIX.' };
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
}

export function createEditorService(): EditorService {
    let release: Promise<Uint8Array> | null = null;

    return {
        detect: (): Editor[] => SUPPORTED_EDITORS.filter((editor) => succeeded(runEditorCommand(editor.command, ['--version']))),
        hasExtension: (editor: Editor): boolean => {
            const result = runEditorCommand(editor.command, ['--list-extensions']);

            return succeeded(result) && result.stdout.split(/\r?\n/u).some((entry) => entry.trim().toLowerCase() === EXTENSION_ID);
        },
        install: async (editor: Editor): Promise<ExtensionInstallResult> => {
            const marketplace = runEditorCommand(editor.command, ['--install-extension', EXTENSION_ID, '--force']);

            if (succeeded(marketplace)) {
                return { source: 'marketplace', error: null };
            }

            try {
                release ??= downloadRelease();

                return installVsix(editor, await release);
            } catch (error: unknown) {
                return { source: null, error: error instanceof Error ? error.message : String(error) };
            }
        },
    };
}
