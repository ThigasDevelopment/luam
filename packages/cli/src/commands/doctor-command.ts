import { EXIT_OK } from '@cli/cli/exit-codes';
import { VERSION } from '@cli/cli/usage';
import type { EditorService } from '@cli/editor/editor-service';
import type { Reporter } from '@cli/reporting/reporter';

export function runDoctorCommand(reporter: Reporter, editorService: EditorService): number {
    reporter.success(`Luam CLI ${VERSION} is running on Node.js ${process.versions.node}.`);

    const editors = editorService.detect();

    if (editors.length === 0) {
        reporter.warn('No supported editor command was found on PATH.');
        reporter.detail('Supported commands: code, code-insiders, cursor, codium, windsurf.');

        return EXIT_OK;
    }

    for (const editor of editors) {
        if (editorService.hasExtension(editor)) {
            reporter.success(`${editor.name}: Luam extension installed.`);
        } else {
            reporter.warn(`${editor.name}: Luam extension not installed. Run "luam setup".`);
        }
    }

    return EXIT_OK;
}
