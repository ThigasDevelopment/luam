import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

function codes(files: readonly ProjectFile[]): string[] {
    return compileProject(files).diagnostics.map((entry) => entry.diagnostic.code);
}

function codeOf(files: readonly ProjectFile[], path: string): string {
    return compileProject(files).modules.find((module) => module.path === path)?.code ?? '';
}

const SHARED: ProjectFile = {
    path: 'src/shared/types.luam',
    source: "type Alias = 'x' | 'y'\n\ninterface Iface {\n    v: number\n}\n",
};

describe('a type alias reaches the project', () => {
    it('resolves an alias declared in another file', () => {
        const reader: ProjectFile = { path: 'src/server/main.luam', source: "local a: Alias = 'x'\n\nprint(a)\n" };

        expect(codes([SHARED, reader])).toEqual([]);
    });

    it('keeps the alias narrowing it has in its own file', () => {
        const reader: ProjectFile = { path: 'src/server/main.luam', source: "local a: Alias = 'z'\n\nprint(a)\n" };

        expect(codes([SHARED, reader])).toEqual(['check-type-mismatch']);
    });

    it('resolves an object alias with its keys', () => {
        const shared: ProjectFile = { path: 'src/shared/types.luam', source: 'type Position = {\n    x: number,\n    y: number\n}\n' };
        const reader: ProjectFile = { path: 'src/client/page.luam', source: 'local p: Position = { x = 1, y = 2 }\n\nprint(p.z)\n' };

        expect(codes([shared, reader])).toEqual(['check-unknown-record-key']);
    });

    it('resolves a generic alias with its parameters intact', () => {
        const shared: ProjectFile = { path: 'src/shared/types.luam', source: 'type Result<T> = T | string\n' };
        const reader: ProjectFile = { path: 'src/server/main.luam', source: 'local r: Result<number> = 1\n\nprint(r)\n' };

        expect(codes([shared, reader])).toEqual([]);
    });

    it('reports a wrong argument count on a cross-file generic alias', () => {
        const shared: ProjectFile = { path: 'src/shared/types.luam', source: 'type Result<T> = T | string\n' };
        const reader: ProjectFile = { path: 'src/server/main.luam', source: 'local r: Result = 1\n\nprint(r)\n' };

        expect(codes([shared, reader])).toEqual(['check-generic-arity']);
    });

    it('keeps a server alias out of a client file', () => {
        const shared: ProjectFile = { path: 'src/server/types.luam', source: "type Alias = 'x'\n" };
        const reader: ProjectFile = { path: 'src/client/page.luam', source: "local a: Alias = 'x'\n\nprint(a)\n" };

        expect(codes([shared, reader])).toEqual(['check-unknown-type']);
    });

    it('reports two files declaring the same alias at both declarations', () => {
        const first: ProjectFile = { path: 'src/shared/a.luam', source: "type Alias = 'x'\n" };
        const second: ProjectFile = { path: 'src/shared/b.luam', source: "type Alias = 'y'\n" };

        expect(codes([first, second])).toEqual(['check-duplicate-type', 'check-duplicate-type']);
    });

    it('leaves the emitted Lua empty', () => {
        const reader: ProjectFile = { path: 'src/server/main.luam', source: "local a: Alias = 'x'\n\nprint(a)\n" };

        expect(codeOf([SHARED, reader], SHARED.path)).toBe('');
    });
});
