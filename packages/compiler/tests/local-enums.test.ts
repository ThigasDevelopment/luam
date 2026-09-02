import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { compilerOptions } from '@compiler/manifest/manifest-defaults';
import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';

const STATE: ProjectFile = {
    path: 'src/shared/state.luam',
    source: 'local enum MatchState {\n    LOBBY,\n    PLAYING,\n}\n\nprint(MatchState.LOBBY)\n',
};

const UNUSED: ProjectFile = {
    path: 'src/shared/state.luam',
    source: 'local enum MatchState {\n    LOBBY,\n    PLAYING,\n}\n',
};

const READER: ProjectFile = { path: 'src/server/main.luam', source: '#!strict\nprint(MatchState.LOBBY)\n' };

function codeOf(project: ReturnType<typeof compileProject>, path: string): string {
    return project.modules.find((module) => module.path === path)?.code ?? '';
}

describe('local enums', () => {
    it('emits a local declaration when the file reads it', () => {
        const project = compileProject([STATE]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, STATE.path)).toBe("local MatchState = enum { 'LOBBY', 'PLAYING' }\n\n\n\n\nprint(MatchState.LOBBY)\n");
        expect(project.modules.find((module) => module.path === STATE.path)?.requiredHelpers).toEqual(['class']);
    });

    it('erases a local enum the file never reads', () => {
        const project = compileProject([UNUSED]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, UNUSED.path)).toBe('');
    });

    it('stays erased when only another module reads the name', () => {
        const project = compileProject([UNUSED, READER]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, UNUSED.path)).toBe('');
        expect(project.modules.find((module) => module.path === UNUSED.path)?.requiredHelpers).toEqual([]);
    });

    it('shadows a global enum declared in another module', () => {
        const shared: ProjectFile = {
            path: 'src/shared/global-state.luam',
            source: 'enum MatchState {\n    IDLE,\n}\n\nprint(MatchState.IDLE)\n',
        };
        const project = compileProject([shared, STATE]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, shared.path)).toContain('MatchState = enum');
        expect(codeOf(project, STATE.path)).toContain('local MatchState = enum');
    });

    it('reports an unread local enum under noUnusedLocals', () => {
        const options = compilerOptions({ noUnusedLocals: true, strict: false });
        const result = compile(UNUSED.source, { compilerOptions: options });

        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toContain('check-unused-local');
    });

    it('checks members inside the declaring file', () => {
        const wrong: ProjectFile = { ...STATE, source: STATE.source.replace('MatchState.LOBBY', 'MatchState.FINISHED') };
        const project = compileProject([wrong]);

        expect(project.diagnostics).not.toEqual([]);
    });

    it('allows the same local name in two modules', () => {
        const twin: ProjectFile = { ...UNUSED, path: 'src/client/state.luam', source: `${UNUSED.source}\nprint(MatchState.LOBBY)\n` };
        const project = compileProject([STATE, twin]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, twin.path)).toContain('local MatchState = enum');
    });
});
