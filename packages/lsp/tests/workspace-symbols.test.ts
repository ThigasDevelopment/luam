import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, removeWorkspace, uriFor } from './support/service-fixture';

const roots: string[] = [];

const SERVER = 'class Session {\n    id: number = 0\n}\n\ninterface Describable {\n    describe: fun(): string\n}\n\nenum Slot {\n    Free,\n    Taken\n}\n\nfunction openSession(): number\n    return 1\nend\n';

const CLIENT = 'class Session {\n    frames: number = 0\n}\n';

function workspace(): LanguageService {
    const root = createWorkspace({ 'src/server/main.luam': SERVER, 'src/client/hud.luam': CLIENT, '.luam.manifest': 'name = "demo"\n' });

    roots.push(root);

    const service = new LanguageService();

    service.loadWorkspace([root]);

    return service;
}

afterEach(() => {
    for (const root of roots.splice(0)) {
        removeWorkspace(root);
    }
});

describe('workspace symbols', () => {
    it('finds declarations in files that were never opened', () => {
        const names = workspace()
            .workspaceSymbols('')
            .map((symbol) => symbol.name);

        expect(names).toContain('Session');
        expect(names).toContain('Describable');
        expect(names).toContain('Slot');
        expect(names).toContain('openSession');
    });

    it('carries the environment of each declaration', () => {
        const sessions = workspace()
            .workspaceSymbols('Session')
            .filter((symbol) => symbol.name === 'Session')
            .map((symbol) => symbol.containerName)
            .sort();

        expect(sessions).toEqual(['client', 'server']);
    });

    it('matches a query without regard to case', () => {
        expect(
            workspace()
                .workspaceSymbols('describ')
                .map((symbol) => symbol.name),
        ).toEqual(['Describable']);
    });

    it('excludes locals, parameters and members', () => {
        const names = workspace()
            .workspaceSymbols('')
            .map((symbol) => symbol.name);

        expect(names).not.toContain('id');
        expect(names).not.toContain('frames');
        expect(names).not.toContain('Free');
    });

    it('answers without reanalyzing the workspace', () => {
        const service = workspace();
        const before = service.analysis(uriFor(roots[roots.length - 1] ?? '', 'src/server/main.luam'));

        service.workspaceSymbols('Session');

        expect(service.analysis(uriFor(roots[roots.length - 1] ?? '', 'src/server/main.luam'))).toBe(before);
    });
});
