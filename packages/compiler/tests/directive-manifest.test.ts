import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { createProjectCache } from '@compiler/project/project-cache';
import { assembleResource, type ResourceAsset } from '@compiler/project/resource';

const fixtures = fileURLToPath(new URL('./fixtures', import.meta.url));

const LOGO: ResourceAsset = { path: 'assets/logo.png', source: 'assets/logo.png', isDownloaded: true };

function readProject(name: string): ProjectFile[] {
    const root = join(fixtures, name);
    const files: ProjectFile[] = [];

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.luam')) {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        files.push({ path: relative(root, absolute).replace(/\\/g, '/'), source: readFileSync(absolute, 'utf8') });
    }

    return files.sort((left, right) => left.path.localeCompare(right.path));
}

function manifestOf(files: readonly ProjectFile[], assets: readonly ResourceAsset[] = []): string {
    const project = compileProject(files);

    expect(project.diagnostics).toEqual([]);

    const assembly = assembleResource(project, { assets });

    expect(assembly.build).not.toBeNull();

    return assembly.build?.manifest ?? '';
}

function elements(manifest: string): string[] {
    return (manifest.match(/<[a-z_]+/g) ?? []).map((element) => element.slice(1));
}

function codesFor(files: readonly ProjectFile[]): string[] {
    return compileProject(files).diagnostics.map((entry) => entry.diagnostic.code);
}

function serverFile(source: string): ProjectFile {
    return { path: 'src/server/main.luam', source };
}

function clientFile(source: string): ProjectFile {
    return { path: 'src/client/hud.luam', source };
}

describe('directive manifest', () => {
    const files = readProject('directives');

    it('locks the manifest for a project using every directive', () => {
        expect(manifestOf(files, [LOGO])).toMatchSnapshot();
    });

    it('orders info, scripts, exports, and files', () => {
        expect(elements(manifestOf(files, [LOGO]))).toEqual(['meta', 'info', 'script', 'script', 'script', 'export', 'export', 'export', 'file']);
    });

    it('types an export by the environment of its file', () => {
        const manifest = manifestOf(files);

        expect(manifest).toContain('<export function="getScore" http="false" />');
        expect(manifest).toContain('<export function="refreshHud" type="client" http="false" />');
        expect(manifest).toContain('<export function="formatScore" type="shared" http="false" />');
    });

    it('enables http access only for an http export', () => {
        const source = 'export http function score(): number\n    return 1\nend\n';

        expect(manifestOf([serverFile(source)])).toContain('<export function="score" http="true" />');
    });

    it('emits one element for a shared export rather than a server and client pair', () => {
        expect(manifestOf(files).match(/formatScore/g)).toHaveLength(1);
    });

    it('does not change the manifest when an unrelated file is renamed', () => {
        const renamed = files.map((file) => (file.path === 'src/client/hud.luam' ? { ...file, path: 'src/client/ui.luam' } : file));

        expect(manifestOf(renamed)).toBe(manifestOf(files));
    });
});

describe('directive project validation', () => {
    it('reports project-duplicate-export for the same name on the same side', () => {
        const source = 'export function score(): number\n    return 1\nend\n';
        const project = compileProject([serverFile(source), { path: 'src/server/extra.luam', source }]);

        expect(project.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['project-duplicate-export']);
        expect(assembleResource(project, {}).build).toBeNull();
    });

    it('accepts the same export name once per side', () => {
        const source = 'export function score(): number\n    return 1\nend\n';

        expect(codesFor([serverFile(source), clientFile(source)])).toEqual([]);
    });

    it('reports project-duplicate-export when a shared export collides with a server one', () => {
        const source = 'export function score(): number\n    return 1\nend\n';
        const shared = { path: 'src/shared/util.luam', source };

        expect(codesFor([serverFile(source), shared])).toEqual(['project-duplicate-export']);
    });
});

describe('directive caching', () => {
    it('writes the same manifest when every module is reused', () => {
        const cache = createProjectCache();
        const files = readProject('directives');
        const first = assembleResource(cache.compile(files), {}).build?.manifest ?? '';
        const second = cache.compile(files);

        expect(second.stats.modulesReused).toBe(files.length);
        expect(assembleResource(second, {}).build?.manifest).toBe(first);
    });

    it('follows a renamed export through the cache', () => {
        const cache = createProjectCache();
        const before = [serverFile('export function score(): number\n    return 1\nend\n')];
        const after = [serverFile('export function points(): number\n    return 1\nend\n')];
        const manifest = (files: readonly ProjectFile[]): string => assembleResource(cache.compile(files), {}).build?.manifest ?? '';

        expect(manifest(before)).toContain('<export function="score" http="false" />');
        expect(manifest(after)).toContain('<export function="points" http="false" />');
        expect(manifest(after)).not.toContain('score');
    });
});
