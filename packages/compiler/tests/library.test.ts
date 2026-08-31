import { describe, expect, it } from 'vitest';

import {
    installCommand,
    isPackageName,
    libraryDirectory,
    libraryFilePath,
    libraryOutputPath,
    missingRequirements,
    readLibraryDeclaration,
    type LibraryDeclaration,
} from '@compiler/project/library';

function declaration(luam: unknown): ReturnType<typeof readLibraryDeclaration> {
    return readLibraryDeclaration('@luam/collections', { name: '@luam/collections', luam });
}

function codes(problems: readonly { code: string }[]): string[] {
    return problems.map((problem) => problem.code);
}

function library(name: string, requires: readonly string[]): LibraryDeclaration {
    return { name, sources: { server: [], client: [], shared: ['src/**/*.luam'] }, requires: [...requires] };
}

describe('library declaration', () => {
    it('reads sources per side and the requirement list', () => {
        const result = declaration({ sources: { shared: ['src/**/*.luam'], client: ['ui/**/*.luam'] }, requires: ['mta-async'] });

        expect(result.problems).toEqual([]);
        expect(result.declaration?.sources).toEqual({ server: [], client: ['ui/**/*.luam'], shared: ['src/**/*.luam'] });
        expect(result.declaration?.requires).toEqual(['mta-async']);
    });

    it('reports a package that declares no "luam" field', () => {
        const result = readLibraryDeclaration('@luam/collections', { name: '@luam/collections' });

        expect(codes(result.problems)).toEqual(['config-library-invalid']);
        expect(result.declaration).toBeNull();
    });

    it('reports a "luam" field with no sources', () => {
        expect(codes(declaration({ requires: [] }).problems)).toEqual(['config-library-invalid']);
    });

    it('reports a side declared as something other than a list', () => {
        expect(codes(declaration({ sources: { shared: 'src' } }).problems)).toEqual(['config-library-invalid', 'config-library-invalid']);
    });

    it('reports a pattern that leaves the package directory', () => {
        expect(codes(declaration({ sources: { shared: ['../elsewhere/**/*.luam'] } }).problems)).toEqual(['config-library-escape']);
    });

    it('reports a requirement that is not a package name', () => {
        const result = declaration({ sources: { shared: ['src/**/*.luam'] }, requires: ['Not A Package'] });

        expect(codes(result.problems)).toEqual(['config-library-invalid']);
        expect(result.declaration?.requires).toEqual([]);
    });
});

describe('library paths', () => {
    it('flattens a scoped name into one directory', () => {
        expect(libraryDirectory('@luam/collections')).toBe('luam-collections');
        expect(libraryDirectory('mta-async')).toBe('mta-async');
    });

    it('mirrors the library source tree under the environment directory', () => {
        expect(libraryOutputPath('@luam/collections', 'shared', 'src/list.luam')).toBe('libs/luam-collections/shared/src/list.lua');
        expect(libraryOutputPath('mta-async', 'client', 'ui/hud.lua')).toBe('libs/mta-async/client/ui/hud.lua');
    });

    it('names a library file by its package', () => {
        expect(libraryFilePath('@luam/collections', 'src/list.luam')).toBe('@luam/collections/src/list.luam');
    });

    it('names the install command a missing package needs', () => {
        expect(installCommand('@luam/collections')).toBe('npm install @luam/collections');
    });

    it('accepts npm package names and rejects anything else', () => {
        expect(isPackageName('@luam/collections')).toBe(true);
        expect(isPackageName('mta-async')).toBe(true);
        expect(isPackageName('Not A Package')).toBe(false);
        expect(isPackageName('../escape')).toBe(false);
    });
});

describe('library requirements', () => {
    it('reports a requirement no resolved library satisfies', () => {
        const problems = missingRequirements([library('@luam/collections', ['mta-async'])]);

        expect(codes(problems)).toEqual(['config-library-requirement-missing']);
        expect(problems[0]?.message).toContain('npm install mta-async');
    });

    it('says nothing when the requirement is listed, whatever the order', () => {
        expect(missingRequirements([library('@luam/collections', ['mta-async']), library('mta-async', [])])).toEqual([]);
    });

    it('walks nothing beyond the resolved set', () => {
        const problems = missingRequirements([library('@luam/collections', ['mta-async']), library('mta-async', ['mta-threads'])]);

        expect(problems).toHaveLength(1);
        expect(problems[0]?.message).toContain('mta-threads');
    });
});
