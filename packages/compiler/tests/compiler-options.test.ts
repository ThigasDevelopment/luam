import { describe, expect, it } from 'vitest';

import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { compile } from '@compiler/index';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import type { ProjectFile } from '@compiler/project/module';
import { createProjectCache } from '@compiler/project/project-cache';

const SERVER = 'src/server/main.luam';

function diagnostics(source: string, overrides: Parameters<typeof compilerOptions>[0] = {}, filePath = SERVER): Diagnostic[] {
    return compile(source, { filePath, compilerOptions: compilerOptions(overrides) }).diagnostics;
}

function codes(source: string, overrides: Parameters<typeof compilerOptions>[0] = {}): string[] {
    return diagnostics(source, overrides).map((diagnostic) => diagnostic.code);
}

describe('strict', () => {
    it('applies the project setting to a file with no directive', () => {
        const source = 'local value = 1\n\nprint(value)\n';

        expect(compile(source, { filePath: SERVER, compilerOptions: compilerOptions({ strict: true }) }).mode).toBe('strict');
        expect(compile(source, { filePath: SERVER, compilerOptions: compilerOptions({ strict: false }) }).mode).toBe('nonstrict');
    });

    it('lets a file directive win over the project setting', () => {
        const source = '#!nonstrict\n\nlocal value = 1\n\nprint(value)\n';

        expect(compile(source, { filePath: SERVER, compilerOptions: compilerOptions({ strict: true }) }).mode).toBe('nonstrict');
    });
});

describe('noUnusedLocals', () => {
    it('stays silent while the option is off', () => {
        expect(codes('local unused = 1\n')).toEqual([]);
    });

    it('reports a local that is never read', () => {
        expect(codes('local unused = 1\n', { noUnusedLocals: true })).toEqual(['check-unused-local']);
    });

    it('accepts a local that is read anywhere', () => {
        expect(codes('local used = 1\n\nprint(used)\n', { noUnusedLocals: true })).toEqual([]);
    });

    it('keeps a leading underscore on purpose', () => {
        expect(codes('local _unused = 1\n', { noUnusedLocals: true })).toEqual([]);
    });

    it('reports a local declared inside a block that has already closed', () => {
        expect(codes('function run(): void\n    local inner = 1\nend\n\nrun()\n', { noUnusedLocals: true })).toEqual(['check-unused-local']);
    });

    it('never reports a module global', () => {
        expect(codes('function exported(): void\nend\n', { noUnusedLocals: true, noUnusedParameters: true })).toEqual([]);
    });
});

describe('noUnusedParameters', () => {
    it('reports a parameter that is never read', () => {
        expect(codes('function greet(name: string): void\nend\n\ngreet("a")\n', { noUnusedParameters: true })).toEqual(['check-unused-parameter']);
    });

    it('accepts a parameter that is read, and one opted out with an underscore', () => {
        expect(codes('function greet(name: string): void\n    print(name)\nend\n', { noUnusedParameters: true })).toEqual([]);
        expect(codes('function greet(_name: string): void\nend\n', { noUnusedParameters: true })).toEqual([]);
    });

    it('stays independent from the locals option', () => {
        expect(codes('local unused = 1\n\nfunction greet(name: string): void\nend\n', { noUnusedParameters: true })).toEqual(['check-unused-parameter']);
    });
});

describe('warningsAsErrors', () => {
    const files: ProjectFile[] = [{ path: SERVER, source: 'local unused = 1\n', environment: 'server' }];

    it('keeps a warning a warning by default', () => {
        const result = createProjectCache().compile(files, { compilerOptions: compilerOptions({ noUnusedLocals: true }) });

        expect(result.diagnostics.map((entry) => entry.diagnostic.severity)).toEqual(['warning']);
        expect(result.hasErrors).toBe(false);
    });

    it('promotes every warning to an error', () => {
        const result = createProjectCache().compile(files, { compilerOptions: compilerOptions({ noUnusedLocals: true, warningsAsErrors: true }) });

        expect(result.diagnostics.map((entry) => entry.diagnostic.severity)).toEqual(['error']);
        expect(result.diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-unused-local']);
        expect(result.hasErrors).toBe(true);
    });
});

describe('cache identity', () => {
    const files: ProjectFile[] = [
        { path: SERVER, source: 'local unused = 1\n', environment: 'server' },
        { path: 'src/shared/config.luam', source: "RESOURCE = 'demo'\n", environment: 'shared' },
    ];

    it('reuses everything when the options do not change', () => {
        const cache = createProjectCache();
        const options = { compilerOptions: compilerOptions({ noUnusedLocals: true }) };

        cache.compile(files, options);

        expect(cache.compile(files, options).stats.modulesReused).toBe(2);
    });

    it('recompiles when a compiler option changes', () => {
        const cache = createProjectCache();

        cache.compile(files, { compilerOptions: compilerOptions({ noUnusedLocals: false }) });

        expect(cache.compile(files, { compilerOptions: compilerOptions({ noUnusedLocals: true }) }).stats.modulesReused).toBe(0);
    });

    it('recompiles a file whose environment moved', () => {
        const cache = createProjectCache();
        const moved: ProjectFile[] = [{ ...files[0]!, environment: 'client' }, files[1]!];

        cache.compile(files);

        const result = cache.compile(moved);

        expect(result.stats.declarationsReused).toBe(1);
        expect(result.modules.find((module) => module.path === SERVER)?.environment).toBe('client');
    });
});
