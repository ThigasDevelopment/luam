import { describe, expect, it } from 'vitest';

import { DEFAULT_RESOURCES_DIR } from '@compiler/manifest/manifest-defaults';
import type { ConfigFileSystem } from '@compiler/project/config-file-system';
import { discoverResources, findServerFile, readServerFile, type WorkspaceFileSystem } from '@compiler/workspace/workspace-discovery';
import { DEFAULT_SERVER_LOGS, isServerFilePath, SERVER_FIELD_NAMES } from '@compiler/workspace/workspace-fields';
import { analyzeServerFile } from '@compiler/workspace/workspace-file';

const MINIMAL = "serverPath = 'server'\n";

function analysis(source: string): ReturnType<typeof analyzeServerFile> {
    return analyzeServerFile(source, '/resources');
}

function codes(source: string): string[] {
    return analysis(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return analysis(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function files(tree: Readonly<Record<string, string>>, directories: Readonly<Record<string, string[]>> = {}): WorkspaceFileSystem {
    return {
        exists: (path: string): boolean => tree[path] !== undefined,
        read: (path: string): string => {
            if (tree[path] === undefined) {
                throw new Error(`no such file: ${path}`);
            }

            return tree[path];
        },
        join: (directory: string, name: string): string => `${directory}/${name}`,
        parent: (directory: string): string => (directory.lastIndexOf('/') <= 0 ? directory : directory.slice(0, directory.lastIndexOf('/'))),
        directories: (path: string): readonly string[] => directories[path] ?? [],
    };
}

describe('the server file', () => {
    it('names itself in the file predicate', () => {
        expect(isServerFilePath('/resources/.luam.server')).toBe(true);
        expect(isServerFilePath('C:\\resources\\.luam.server')).toBe(true);
        expect(isServerFilePath('/resources/.luam.manifest')).toBe(false);
    });

    it('parses the one required field and defaults the rest', () => {
        const result = analysis(MINIMAL);

        expect(result.diagnostics).toEqual([]);
        expect(result.settings).toEqual({
            serverPath: 'server',
            resourcesDir: DEFAULT_RESOURCES_DIR,
            executable: null,
            logs: DEFAULT_SERVER_LOGS,
        });
    });

    it('reads every field', () => {
        const source = [
            "serverPath = '/opt/mta'",
            "resourcesDir = 'mods/deathmatch/resources/[luam]'",
            "executable = 'bin/mta-server64'",
            'logs = { enabled = true, maxMessageLength = 512, rateLimit = 5, rateWindowMs = 250 }',
        ].join('\n');
        const result = analysis(source);

        expect(result.diagnostics).toEqual([]);
        expect(result.settings).toEqual({
            serverPath: '/opt/mta',
            resourcesDir: 'mods/deathmatch/resources/[luam]',
            executable: 'bin/mta-server64',
            logs: { enabled: true, maxMessageLength: 512, rateLimit: 5, rateWindowMs: 250 },
        });
    });

    it('requires serverPath and names the file rather than the manifest', () => {
        expect(codes('')).toEqual(['config-missing-field']);
        expect(messages('')[0]).toBe(
            'A ".luam.server" file requires a "serverPath" field. Path to the MTA server installation the resources in this directory share.',
        );
        expect(messages('')[0]).not.toContain('manifest');
    });

    it('reports an unknown field and lists the fields there are', () => {
        expect(codes(`${MINIMAL}outDir = 'build'\n`)).toEqual(['server-unknown-field']);
        expect(messages(`${MINIMAL}outDir = 'build'\n`)[0]).toBe(
            `"outDir" is not a ".luam.server" field. The fields are ${SERVER_FIELD_NAMES.map((name) => `"${name}"`).join(', ')}.`,
        );
    });

    it('reports a wrong type at the field position', () => {
        const [diagnostic] = analysis('serverPath = 3\n').diagnostics;

        expect(diagnostic?.code).toBe('server-invalid-value');
        expect(diagnostic?.position.line).toBe(1);
        expect(codes(`${MINIMAL}logs = { enabled = 'yes' }\n`)).toEqual(['server-invalid-value']);
        expect(codes(`${MINIMAL}logs = { rateLimit = 0 }\n`)).toEqual(['server-invalid-value']);
    });

    it('keeps a path inside its boundary', () => {
        expect(codes(`${MINIMAL}resourcesDir = '../elsewhere'\n`)).toEqual(['server-invalid-value']);
        expect(codes(`${MINIMAL}executable = '../outside'\n`)).toEqual(['server-invalid-value']);
    });

    it('rejects everything the manifest dialect forbids', () => {
        expect(codes(`${MINIMAL}serverPath = resolve('server')\n`)).toContain('server-invalid-value');
        expect(codes('function pick(): string\nend\n')).toContain('server-invalid-value');
        expect(codes('serverPath = \n')).toContain('server-parse-error');
    });
});

describe('workspace discovery', () => {
    const tree = {
        '/work/resources/.luam.server': MINIMAL,
        '/work/resources/resource-a/.luam.manifest': "name = 'resource-a'\n",
        '/work/resources/resource-b/.luam.manifest': "name = 'resource-b'\n",
        '/work/resources/notes/README.md': '',
        '/work/resources/nested/inner/.luam.manifest': "name = 'inner'\n",
        '/work/resources/node_modules/lib/.luam.server': MINIMAL,
    };
    const directories = {
        '/work/resources': ['resource-a', 'resource-b', 'notes', 'nested', 'node_modules'],
    };

    it('walks up to the nearest server file', () => {
        expect(findServerFile(files(tree), '/work/resources/resource-a/src/server')).toBe('/work/resources/.luam.server');
        expect(findServerFile(files(tree), '/work/resources')).toBe('/work/resources/.luam.server');
    });

    it('stops at a node_modules segment and at a tree with no file', () => {
        expect(findServerFile(files(tree), '/work/resources/node_modules/lib')).toBeNull();
        expect(findServerFile(files({}), '/elsewhere/deep')).toBeNull();
    });

    it('takes the direct children that hold a manifest, sorted', () => {
        expect(discoverResources(files(tree, directories), '/work/resources')).toEqual(['resource-a', 'resource-b']);
    });

    it('reads the file and reports where it lives', () => {
        const read = readServerFile(files(tree), '/work/resources/.luam.server');

        expect(read.root).toBe('/work/resources');
        expect(read.settings?.serverPath).toBe('server');
        expect(read.diagnostics).toEqual([]);
    });

    it('reports an unreadable file rather than throwing', () => {
        const read = readServerFile(files({}) as ConfigFileSystem, '/work/resources/.luam.server');

        expect(read.settings).toBeNull();
        expect(read.diagnostics.map((entry) => entry.code)).toEqual(['server-parse-error']);
    });

    it('refuses a file that does not parse', () => {
        const read = readServerFile(files({ '/work/.luam.server': 'serverPath = \n' }), '/work/.luam.server');

        expect(read.settings).toBeNull();
        expect(read.diagnostics.map((entry) => entry.code)).toContain('server-parse-error');
    });
});
