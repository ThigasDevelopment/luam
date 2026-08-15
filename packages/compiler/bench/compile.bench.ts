import { bench, describe } from 'vitest';

import { check } from '@compiler/checker/checker';
import { builtinSymbols, clearBuiltinCache } from '@compiler/checker/globals';
import { clearMtaClassCache, mtaClassRegistry } from '@compiler/checker/oop-classes';
import { emit } from '@compiler/emitter/emitter';
import { parse } from '@compiler/parser/parser';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import { createProjectCache } from '@compiler/project/project-cache';

import { editBody, editDeclaration, generateProject } from './project-generator';

const MODULE_COUNT = 100;

const OPTIONS = { iterations: 5, time: 100 };

const project = generateProject(MODULE_COUNT);

const bodyEdit = editBody(project, project.clientPath);

const declarationEdit = editDeclaration(project, project.sharedPath);

function warmCache(): ReturnType<typeof createProjectCache> {
    const cache = createProjectCache();

    cache.compile(project.files);

    return cache;
}

describe('project build', () => {
    const unchanged = warmCache();
    const bodyCache = warmCache();
    const declarationCache = warmCache();

    let bodyToggle = false;
    let declarationToggle = false;

    bench(
        'cold full build',
        () => {
            createProjectCache().compile(project.files);
        },
        OPTIONS,
    );

    bench(
        'cold full build with the oop api enabled',
        () => {
            createProjectCache().compile(project.files, { compilerOptions: compilerOptions({ oop: true }) });
        },
        OPTIONS,
    );

    bench(
        'warm rebuild without changes',
        () => {
            unchanged.compile(project.files);
        },
        OPTIONS,
    );

    bench(
        'warm rebuild after one body edit',
        () => {
            bodyToggle = !bodyToggle;
            bodyCache.compile(bodyToggle ? bodyEdit : project.files);
        },
        OPTIONS,
    );

    bench(
        'warm rebuild after one declaration edit',
        () => {
            declarationToggle = !declarationToggle;
            declarationCache.compile(declarationToggle ? declarationEdit : project.files);
        },
        OPTIONS,
    );
});

describe('pipeline phases', () => {
    bench(
        'parse every file',
        () => {
            for (const file of project.files) {
                parse(file.source);
            }
        },
        OPTIONS,
    );

    bench(
        'parse and check every file',
        () => {
            for (const file of project.files) {
                check(parse(file.source).program, 'strict', 'shared');
            }
        },
        OPTIONS,
    );

    bench(
        'parse, check, and emit every file',
        () => {
            for (const file of project.files) {
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
