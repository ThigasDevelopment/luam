import { hasErrors, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import { MANIFEST_FILE_NAME } from '@compiler/manifest/manifest-defaults';
import { findConfigFile, type ConfigFileSystem } from '@compiler/project/config-file-system';

import { analyzeServerFile, serverFileError, type ServerFileSettings } from './workspace-file';
import { SERVER_FILE_NAME } from './workspace-fields';

export interface WorkspaceFileSystem extends ConfigFileSystem {
    directories(path: string): readonly string[];
}

export interface ResolvedServerFile {
    path: string;
    root: string;
    source: string;
    settings: ServerFileSettings | null;
    diagnostics: Diagnostic[];
}

export function findServerFile(files: ConfigFileSystem, start: string): string | null {
    return findConfigFile(files, start, SERVER_FILE_NAME);
}

export function discoverResources(files: WorkspaceFileSystem, workspaceRoot: string): string[] {
    return [...files.directories(workspaceRoot)].filter((name) => files.exists(files.join(files.join(workspaceRoot, name), MANIFEST_FILE_NAME))).sort();
}

export function readServerFile(files: ConfigFileSystem, path: string): ResolvedServerFile {
    const root = files.parent(path);
    let source: string;

    try {
        source = files.read(path);
    } catch (error: unknown) {
        const message = `"${path}" could not be read: ${error instanceof Error ? error.message : String(error)}`;

        return { path, root, source: '', settings: null, diagnostics: [serverFileError(message)] };
    }

    const analysis = analyzeServerFile(source, root);

    return { path, root, source, settings: hasErrors(analysis.diagnostics) ? null : analysis.settings, diagnostics: analysis.diagnostics };
}
