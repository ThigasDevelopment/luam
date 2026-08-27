import { bench, describe } from 'vitest';

import { check } from '@compiler/checker/checker';
import { builtinSymbols, clearBuiltinCache } from '@compiler/checker/globals';
import { clearMtaClassCache, mtaClassRegistry } from '@compiler/checker/oop-classes';
import { emit } from '@compiler/emitter/emitter';
import { parse } from '@compiler/parser/parser';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import { createProjectCache } from '@compiler/project/project-cache';

import { editBody, editDeclaration, editLeafDeclaration, editRootDeclaration, generateProject, type GeneratedProject } from './project-generator';

const MODULE_COUNT = 100;

const LARGE_MODULE_COUNT = 400;

const OPTIONS = { iterations: 5, time: 100 };

const LARGE_OPTIONS = { iterations: 1, time: 100 };

const sparse = generateProject(MODULE_COUNT, 'sparse');

const dense = generateProject(MODULE_COUNT, 'dense');

const large = generateProject(LARGE_MODULE_COUNT, 'sparse');

function warmCache(project: GeneratedProject): ReturnType<typeof createProjectCache> {
    const cache = createProjectCache();

    cache.compile(project.files);

    return cache;
}

function benchEdits(project: GeneratedProject): void {
    const unchanged = warmCache(project);
    const bodyCache = warmCache(project);
    const declarationCache = warmCache(project);
    const leafCache = warmCache(project);
    const rootCache = warmCache(project);
    const bodyEdit = editBody(project, project.clientPath);
    const declarationEdit = editDeclaration(project, project.sharedPath);
    const leafEdit = editLeafDeclaration(project);
    const rootEdit = editRootDeclaration(project);
    const toggles = { body: false, declaration: false, leaf: false, root: false };

    bench(
        `warm rebuild without changes on a ${project.topology} project`,
        () => {
            unchanged.compile(project.files);
        },
        OPTIONS,
    );

    bench(
        `warm rebuild after one body edit on a ${project.topology} project`,
        () => {
            toggles.body = !toggles.body;
            bodyCache.compile(toggles.body ? bodyEdit : project.files);
        },
        OPTIONS,
    );

    bench(
        `warm rebuild after one declaration edit on a ${project.topology} project`,
        () => {
            toggles.declaration = !toggles.declaration;
            declarationCache.compile(toggles.declaration ? declarationEdit : project.files);
        },
        OPTIONS,
    );

    bench(
        `warm rebuild after one leaf declaration edit on a ${project.topology} project`,
        () => {
            toggles.leaf = !toggles.leaf;
            leafCache.compile(toggles.leaf ? leafEdit : project.files);
        },
        OPTIONS,
    );

    bench(
        `warm rebuild after one shared root edit on a ${project.topology} project`,
        () => {
            toggles.root = !toggles.root;
            rootCache.compile(toggles.root ? rootEdit : project.files);
        },
        OPTIONS,
    );
}

describe('project build', () => {
    bench(
        'cold full build',
        () => {
            createProjectCache().compile(sparse.files);
        },
        OPTIONS,
    );

    bench(
        'cold full build with the oop api enabled',
        () => {
            createProjectCache().compile(sparse.files, { compilerOptions: compilerOptions({ oop: true }) });
        },
        OPTIONS,
    );

    bench(
        'cold full build on a dense project',
        () => {
            createProjectCache().compile(dense.files);
        },
        OPTIONS,
    );

    bench(
        'cold full build on a large project',
        () => {
            createProjectCache().compile(large.files);
        },
        LARGE_OPTIONS,
    );

    benchEdits(sparse);
    benchEdits(dense);
});

describe('large project edits', () => {
    const largeCache = warmCache(large);
    const largeBodyEdit = editBody(large, large.clientPath);
    const largeLeafEdit = editLeafDeclaration(large);
    const toggles = { body: false, leaf: false };

    bench(
        'warm rebuild after one body edit on a large project',
        () => {
            toggles.body = !toggles.body;
            largeCache.compile(toggles.body ? largeBodyEdit : large.files);
        },
        LARGE_OPTIONS,
    );

    bench(
        'warm rebuild after one leaf declaration edit on a large project',
        () => {
            toggles.leaf = !toggles.leaf;
            largeCache.compile(toggles.leaf ? largeLeafEdit : large.files);
        },
        LARGE_OPTIONS,
    );
});

describe('pipeline phases', () => {
    bench(
        'parse every file',
        () => {
            for (const file of sparse.files) {
                parse(file.source);
            }
        },
        OPTIONS,
    );

    bench(
        'parse and check every file',
        () => {
            for (const file of sparse.files) {
                check(parse(file.source).program, 'strict', 'shared');
            }
        },
        OPTIONS,
    );

    bench(
        'parse, check, and emit every file',
        () => {
            for (const file of sparse.files) {
                const parsed = parse(file.source);
                const checked = check(parsed.program, 'strict', 'shared');

                emit(parsed.program, checked.types, checked.references, checked.generatedMembers);
            }
        },
        OPTIONS,
    );
});

describe('global scope', () => {
    bench(
        'build the mta oop class registry from the full surface',
        () => {
            clearMtaClassCache();
            mtaClassRegistry();
        },
        OPTIONS,
    );

    bench(
        'reuse the cached mta oop class registry',
        () => {
            mtaClassRegistry();
        },
        OPTIONS,
    );

    bench(
        'build every environment scope from the full catalog',
        () => {
            clearBuiltinCache();
            builtinSymbols('server');
            builtinSymbols('client');
            builtinSymbols('shared');
        },
        OPTIONS,
    );

    bench(
        'reuse the cached environment scopes',
        () => {
            builtinSymbols('server');
            builtinSymbols('client');
            builtinSymbols('shared');
        },
        OPTIONS,
    );
});
