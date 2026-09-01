import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

const NETWORK = 'class Network {\n    id: number = 1\n\n    init = function (): void\n        print(self.id)\n    end\n}\n\n';

function codes(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string): string[] {
    return compile(source).diagnostics.map((diagnostic) => diagnostic.message);
}

function projectCodes(files: readonly ProjectFile[]): string[] {
    return compileProject(files).diagnostics.map((entry) => entry.diagnostic.code);
}

describe('a global the source assigns later', () => {
    it('accepts the optional form and the later assignment', () => {
        const source = `${NETWORK}network?: Network = nil\n\naddEventHandler('onClientResourceStart', resourceRoot, function ()\n    network = new Network()\nend)\n`;

        expect(codes(source)).toEqual([]);
    });

    it('resolves a member inside a nil guard', () => {
        const source = `${NETWORK}network?: Network = nil\n\nif network then\n    network:init()\nend\n`;

        expect(codes(source)).toEqual([]);
    });

    it('reports a nil initialiser against a non-optional annotation', () => {
        const source = `${NETWORK}network: Network = nil\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('reports a later assignment that does not match', () => {
        const source = `${NETWORK}network?: Network = nil\n\nnetwork = 1\n`;

        expect(codes(source)).toEqual(['check-type-mismatch']);
    });

    it('reports the annotation inside a function body', () => {
        const source = 'local function make(): void\n    tally: number = 1\nend\n';

        expect(codes(source)).toEqual(['check-global-annotation-scope']);
        expect(messages(source)[0]).toContain('top level of a file');
    });

    it('emits the assignment without the annotation', () => {
        expect(compile('tally?: number = nil\n').code).toBe('tally = nil\n');
    });

    it('leaves an unannotated global exactly as it was', () => {
        expect(codes('thing = nil\n\nthing = 1\n')).toEqual(['check-type-mismatch']);
    });

    it('leaves a method call alone', () => {
        const source = `${NETWORK}local held = new Network()\n\nheld:init()\n`;

        expect(codes(source)).toEqual([]);
    });
});

describe('an annotated global across the project', () => {
    it('reads the declared type in another file', () => {
        const owner: ProjectFile = { path: 'src/shared/net.luam', source: `${NETWORK}network?: Network = nil\n` };
        const reader: ProjectFile = { path: 'src/server/main.luam', source: 'local n: number = network\n' };

        expect(projectCodes([owner, reader])).toEqual(['check-type-mismatch']);
    });

    it('keeps a server global out of a client file', () => {
        const owner: ProjectFile = { path: 'src/server/net.luam', source: 'tally?: number = nil\n' };
        const reader: ProjectFile = { path: 'src/client/page.luam', source: 'local n: number = tally\n' };

        expect(projectCodes([owner, reader])).toEqual(['project-environment-import']);
    });

    it('reports two files annotating the same global', () => {
        const first: ProjectFile = { path: 'src/shared/a.luam', source: 'tally?: number = nil\n' };
        const second: ProjectFile = { path: 'src/shared/b.luam', source: 'tally?: string = nil\n' };

        expect(projectCodes([first, second])).toEqual(['check-duplicate-global', 'check-duplicate-global']);
    });

    it('lets a declaration file win over an annotated assignment', () => {
        const declared: ProjectFile = { path: 'src/shared/types.d.luam', source: 'declare tally: number\n' };
        const owner: ProjectFile = { path: 'src/shared/b.luam', source: 'tally?: string = nil\n' };
        const diagnostics = compileProject([declared, owner]).diagnostics;

        expect(diagnostics.map((entry) => entry.diagnostic.code)).toEqual(['check-type-mismatch']);
        expect(diagnostics[0]?.diagnostic.message).toContain('expects "number"');
    });
});
