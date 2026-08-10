import { describe, expect, it } from 'vitest';

import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/dispatch';

import type { Editor, EditorService, ExtensionInstallResult } from '@cli/editor/editor-service';

import { createMemoryLogger } from './support/memory-logger';

const VSCODE: Editor = { id: 'vscode', name: 'Visual Studio Code', command: 'code' };

function editorService(installed: boolean, result: ExtensionInstallResult = { source: 'marketplace', error: null }): EditorService {
    return {
        detect: (): Editor[] => [VSCODE],
        hasExtension: (): boolean => installed,
        install: async (): Promise<ExtensionInstallResult> => result,
    };
}

describe('editor commands', () => {
    it('installs the extension in a detected editor after confirmation', async () => {
        const logger = createMemoryLogger();

        const exitCode = await runCli(['setup'], { logger, editorService: editorService(false), prompt: async (): Promise<boolean> => true });

        expect(exitCode).toBe(EXIT_OK);
        expect(logger.text()).toContain('Visual Studio Code: installed from the marketplace.');
    });

    it('does not install an extension that is already present', async () => {
        const logger = createMemoryLogger();

        const exitCode = await runCli(['setup', '--yes'], { logger, editorService: editorService(true) });

        expect(exitCode).toBe(EXIT_OK);
        expect(logger.text()).toContain('Luam is already installed.');
    });

    it('requires explicit approval in a non-interactive terminal', async () => {
        const logger = createMemoryLogger();

        const exitCode = await runCli(['setup'], { logger, editorService: editorService(false), prompt: async (): Promise<null> => null });

        expect(exitCode).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toContain('luam setup --yes');
    });

    it('reports installation failures', async () => {
        const logger = createMemoryLogger();
        const failure: ExtensionInstallResult = { source: null, error: 'The editor rejected the extension.' };

        const exitCode = await runCli(['setup', '--yes'], { logger, editorService: editorService(false, failure) });

        expect(exitCode).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toContain('installation failed');
    });

    it('reports editor and extension status', async () => {
        const logger = createMemoryLogger();

        const exitCode = await runCli(['doctor'], { logger, editorService: editorService(true) });

        expect(exitCode).toBe(EXIT_OK);
        expect(logger.text()).toContain('Luam CLI');
        expect(logger.text()).toContain('Visual Studio Code: Luam extension installed.');
    });
});
