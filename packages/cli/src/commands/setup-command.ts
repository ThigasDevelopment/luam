import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import type { EditorService } from '@cli/editor/editor-service';
import type { InstallationPrompt } from '@cli/editor/installation-prompt';
import type { Reporter } from '@cli/reporting/reporter';

export interface SetupOptions {
    yes: boolean;
    editorService: EditorService;
    prompt: InstallationPrompt;
}

export async function runSetupCommand(reporter: Reporter, options: SetupOptions): Promise<number> {
    const editors = options.editorService.detect();

    if (editors.length === 0) {
        reporter.error('No supported editor command was found on PATH.');
        reporter.detail('Supported commands: code, code-insiders, cursor, codium, windsurf.');

        return EXIT_DIAGNOSTICS;
    }

    let failed = false;

    for (const editor of editors) {
        if (options.editorService.hasExtension(editor)) {
            reporter.success(`${editor.name}: Luam is already installed.`);

            continue;
        }

        const confirmed = options.yes ? true : await options.prompt(editor.name);

        if (confirmed === null) {
            reporter.error('Setup needs confirmation in a non-interactive terminal. Run "luam setup --yes" to approve detected editors.');

            return EXIT_DIAGNOSTICS;
        }

        if (!confirmed) {
            reporter.detail(`${editor.name}: skipped.`);

            continue;
        }

        reporter.info(`${editor.name}: installing the Luam extension.`);
        const result = await options.editorService.install(editor);

        if (result.error !== null) {
            reporter.error(`${editor.name}: installation failed. ${result.error}`);
            failed = true;

            continue;
        }

        reporter.success(`${editor.name}: installed from the ${result.source}.`);
    }

    return failed ? EXIT_DIAGNOSTICS : EXIT_OK;
}
