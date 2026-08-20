import { describe, expect, it } from 'vitest';

import type { ProjectFile } from '@compiler/project/module';
import { compileProject } from '@compiler/project/project';
import { createProjectCache } from '@compiler/project/project-cache';

const STATE: ProjectFile = { path: 'src/shared/state.luam', source: 'enum MatchState {\n    LOBBY,\n    PLAYING,\n}\n' };

const READER: ProjectFile = { path: 'src/server/main.luam', source: 'print(MatchState.LOBBY)\n' };

const IDLE: ProjectFile = { path: 'src/server/main.luam', source: 'print(1)\n' };

function codeOf(project: ReturnType<typeof compileProject>, path: string): string {
    return project.modules.find((module) => module.path === path)?.code ?? '';
}

describe('enums across modules', () => {
    it('keeps an enum that only another module reads', () => {
        const project = compileProject([STATE, READER]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, STATE.path)).toBe("MatchState = enum { 'LOBBY', 'PLAYING' }\n");
        expect(project.modules.find((module) => module.path === STATE.path)?.requiredHelpers).toEqual(['class']);
    });

    it('erases an enum no module reads', () => {
        const project = compileProject([STATE, IDLE]);

        expect(project.diagnostics).toEqual([]);
        expect(codeOf(project, STATE.path)).toBe('');
        expect(project.modules.find((module) => module.path === STATE.path)?.requiredHelpers).toEqual([]);
    });

    it('emits the enum once a later build adds the reader', () => {
        const cache = createProjectCache();

        expect(codeOf(cache.compile([STATE, IDLE]), STATE.path)).toBe('');
        expect(codeOf(cache.compile([STATE, READER]), STATE.path)).toBe("MatchState = enum { 'LOBBY', 'PLAYING' }\n");
    });
});
