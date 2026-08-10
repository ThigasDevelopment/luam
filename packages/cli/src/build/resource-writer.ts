import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, relative, resolve } from 'node:path';

import { readHelperSource } from '@cli/build/helper-files';
import { pruneResource } from '@cli/build/resource-prune';
import type { ProgressReporter } from '@compiler/project/progress';
import { ENVIRONMENT_FILE, type ResourceBuild } from '@compiler/project/resource';

export interface WriteResult {
    written: string[];
    removed: string[];
    unchanged: number;
}

export interface WriteOptions {
    root: string;
    generatedRoots: readonly string[];
    environmentTemplate: string | null;
    onProgress?: ProgressReporter;
}

export const MANIFEST_FILE = 'meta.xml';

export function resourceFiles(build: ResourceBuild): Map<string, string> {
    const files = new Map<string, string>();

    for (const helper of build.helpers) {
        files.set(helper.path, readHelperSource(helper.helper, helper.file));
    }

    if (build.configuration !== null) {
        files.set(build.configuration.path, build.configuration.content);
    }

    for (const script of build.scripts) {
        files.set(script.path, script.content);
    }

    files.set(MANIFEST_FILE, build.manifest);

    return files;
}

function resolveInside(targetDir: string, path: string): string {
    const absolute = resolve(targetDir, path);
    const inside = relative(targetDir, absolute);

    if (inside.startsWith('..') || isAbsolute(inside)) {
        throw new Error(`The generated file "${path}" resolves outside the resource directory "${targetDir}".`);
    }

    return absolute;
}

function writeIfChanged(absolute: string, content: Buffer): boolean {
    if (existsSync(absolute) && readFileSync(absolute).equals(content)) {
        return false;
    }

    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, content);

    return true;
}

function writeEnvironmentFile(targetDir: string, template: string | null): boolean {
    if (template === null) {
        return false;
    }

    const absolute = resolveInside(targetDir, ENVIRONMENT_FILE);

    if (existsSync(absolute)) {
        return false;
    }

    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, template, 'utf8');

    return true;
}

export function writeResource(targetDir: string, build: ResourceBuild, options: WriteOptions): WriteResult {
    const files = resourceFiles(build);
    const written: string[] = [];
    const total = files.size + build.assets.length + (options.environmentTemplate === null ? 0 : 1);
    let index = 0;
    let unchanged = 0;

    const advance = (path: string): void => {
        index += 1;
        options.onProgress?.({ item: path, index, total });
    };

    for (const [path, content] of files) {
        if (writeIfChanged(resolveInside(targetDir, path), Buffer.from(content, 'utf8'))) {
            written.push(path);
            advance(path);

            continue;
        }

        unchanged += 1;
        advance(path);
    }

    for (const asset of build.assets) {
        if (writeIfChanged(resolveInside(targetDir, asset.path), readFileSync(resolve(options.root, asset.source)))) {
            written.push(asset.path);
            advance(asset.path);

            continue;
        }

        unchanged += 1;
        advance(asset.path);
    }

    if (options.environmentTemplate !== null) {
        if (writeEnvironmentFile(targetDir, options.environmentTemplate)) {
            written.push(ENVIRONMENT_FILE);
        }

        advance(ENVIRONMENT_FILE);
    }

    const keep = new Set([...files.keys(), ...build.assets.map((asset) => asset.path), ENVIRONMENT_FILE]);
    const removed = pruneResource(targetDir, keep, { generatedRoots: options.generatedRoots });

    return { written: written.sort((left, right) => left.localeCompare(right)), removed, unchanged };
}
