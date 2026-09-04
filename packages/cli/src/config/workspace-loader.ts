import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { discoverResources, findServerFile, readServerFile, type WorkspaceFileSystem } from '@compiler/workspace/workspace-discovery';
import { SERVER_FILE_NAME } from '@compiler/workspace/workspace-fields';
import { resolveServerRoot } from '@cli/config/deployment';
import type { ServerFileSettings } from '@compiler/workspace/workspace-file';

export interface WorkspaceDeployment {
    serverRoot: string;
    resourcesDir: string;
    executable: string | null;
    logs: ServerFileSettings['logs'];
}

export interface LoadedWorkspace {
    path: string;
    root: string;
    source: string;
    settings: ServerFileSettings | null;
    deployment: WorkspaceDeployment | null;
    resources: string[];
    diagnostics: Diagnostic[];
}

export const NODE_WORKSPACE_FILES: WorkspaceFileSystem = {
    exists: (path: string): boolean => existsSync(path),
    read: (path: string): string => readFileSync(path, 'utf8'),
    join: (directory: string, name: string): string => join(directory, name),
    parent: (directory: string): string => dirname(directory),
    directories: (path: string): readonly string[] => {
        try {
            return readdirSync(path, { withFileTypes: true })
                .filter((entry) => entry.isDirectory())
                .map((entry) => entry.name);
        } catch {
            return [];
        }
    },
};

export function findWorkspaceFile(start: string, files: WorkspaceFileSystem = NODE_WORKSPACE_FILES): string | null {
    return findServerFile(files, start);
}

export function loadServerFile(path: string, files: WorkspaceFileSystem = NODE_WORKSPACE_FILES): LoadedWorkspace {
    const read = readServerFile(files, path);
    const settings = read.settings;

    return {
        path: read.path,
        root: read.root,
        source: read.source,
        settings,
        deployment:
            settings === null
                ? null
                : {
                      serverRoot: resolveServerRoot(read.root, settings.serverPath),
                      resourcesDir: settings.resourcesDir,
                      executable: settings.executable,
                      logs: settings.logs,
                  },
        resources: discoverResources(files, read.root),
        diagnostics: read.diagnostics,
    };
}

export function workspaceResources(root: string, files: WorkspaceFileSystem = NODE_WORKSPACE_FILES): string[] {
    return discoverResources(files, root);
}

export function loadWorkspace(start: string, files: WorkspaceFileSystem = NODE_WORKSPACE_FILES): LoadedWorkspace | null {
    const path = findWorkspaceFile(start, files);

    return path === null ? null : loadServerFile(path, files);
}

export { SERVER_FILE_NAME };
