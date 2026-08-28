import { EXIT_OK } from '@cli/cli/exit-codes';
import { VERSION } from '@cli/cli/version';
import type { EditorService } from '@cli/editor/editor-service';
import type { Reporter } from '@cli/reporting/reporter';
import { findLuaInterpreter, INSTALL_HINT, REQUIRED_LUA_VERSION, type LuaProbe } from '@cli/testing/lua-interpreter';

function reportInterpreter(reporter: Reporter, probe: LuaProbe | undefined): void {
    const interpreter = findLuaInterpreter(probe === undefined ? {} : { probe });

    if (interpreter === null) {
        reporter.warn(`No ${REQUIRED_LUA_VERSION} interpreter was found on PATH, so "luam test" cannot run.`);
        reporter.detail(INSTALL_HINT);

        return;
    }

    reporter.success(`"${interpreter.executable}" reports ${interpreter.version} and can run "luam test".`);
}

export function runDoctorCommand(reporter: Reporter, editorService: EditorService, probe?: LuaProbe): number {
    reporter.success(`Luam CLI ${VERSION} is running on Node.js ${process.versions.node}.`);

    reportInterpreter(reporter, probe);

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
