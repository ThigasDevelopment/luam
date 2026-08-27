import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, removeWorkspace, uriFor } from './support/service-fixture';

const CONFIG = `class Config {
    name: string = ''

    label = function (): string
        return self.name
    end
}
`;

const HELPER = `function describeConfig(config: Config): string
    return config:label()
end
`;

const UNRELATED = `local title: string = 'Luam'

print(title)
`;

const roots: string[] = [];

function workspace(files: Readonly<Record<string, string>>): string {
    const root = createWorkspace(files);

    roots.push(root);

    return root;
}

function baseFiles(): Record<string, string> {
    return {
        'src/shared/config.luam': CONFIG,
        'src/shared/helper.luam': HELPER,
        'src/client/hud.luam': UNRELATED,
    };
}

function write(root: string, relative: string, text: string): void {
    const path = join(root, relative);

    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text, 'utf8');
}

function relativePaths(root: string, uris: readonly string[]): string[] {
    const prefix = uriFor(root, '');

    return uris.map((uri) => uri.slice(prefix.length).replace(/^\//, '')).sort();
}

afterEach(() => {
    for (const root of roots.splice(0)) {
        removeWorkspace(root);
    }
});

describe('workspace dependency graph', () => {
    it('reruns only the documents that reference the changed declaration', () => {
        const root = workspace(baseFiles());
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const affected = service.update(uriFor(root, 'src/shared/config.luam'), 1, CONFIG.replace("name: string = ''", "name: string = ''\n    level: number = 1"));

        expect(relativePaths(root, affected.map((analysis) => analysis.uri))).toEqual(['src/shared/config.luam', 'src/shared/helper.luam']);
    });

    it('reruns nothing else when only a body changes', () => {
        const root = workspace(baseFiles());
        const service = new LanguageService();

        service.loadWorkspace([root]);

        const affected = service.update(uriFor(root, 'src/shared/config.luam'), 1, CONFIG.replace('return self.name', "return self.name .. '!'"));

        expect(relativePaths(root, affected.map((analysis) => analysis.uri))).toEqual(['src/shared/config.luam']);
    });

    it('picks up a file that appeared while the server was running', () => {
        const root = workspace({ 'src/shared/helper.luam': HELPER });
        const service = new LanguageService();

        service.loadWorkspace([root]);

        expect(service.diagnostics(uriFor(root, 'src/shared/helper.luam')).length).toBeGreaterThan(0);

        write(root, 'src/shared/config.luam', CONFIG);

        const rescan = service.rescan();

        expect(relativePaths(root, rescan.updated.map((analysis) => analysis.uri))).toEqual(['src/shared/config.luam', 'src/shared/helper.luam']);
        expect(service.diagnostics(uriFor(root, 'src/shared/helper.luam'))).toEqual([]);
    });

    it('recovers from a file that disappeared while the server was running', () => {
        const root = workspace(baseFiles());
        const service = new LanguageService();

        service.loadWorkspace([root]);

        expect(service.diagnostics(uriFor(root, 'src/shared/helper.luam'))).toEqual([]);

        rmSync(join(root, 'src/shared/config.luam'));

        const rescan = service.rescan();

        expect(relativePaths(root, rescan.removed)).toEqual(['src/shared/config.luam']);
        expect(relativePaths(root, rescan.updated.map((analysis) => analysis.uri))).toEqual(['src/shared/helper.luam']);
        expect(service.diagnostics(uriFor(root, 'src/shared/helper.luam')).length).toBeGreaterThan(0);
        expect(service.analysis(uriFor(root, 'src/shared/config.luam'))).toBeNull();
    });

    it('leaves an unrelated document untouched across a rescan', () => {
        const root = workspace(baseFiles());
        const service = new LanguageService();

        service.loadWorkspace([root]);

        write(root, 'src/shared/extra.luam', 'function extraHelper(): void\nend\n');

        const rescan = service.rescan();

        expect(relativePaths(root, rescan.updated.map((analysis) => analysis.uri))).toEqual(['src/shared/extra.luam']);
    });

    it('rebuilds the whole index on a full rescan', () => {
        const root = workspace(baseFiles());
        const service = new LanguageService();

        service.loadWorkspace([root]);

        rmSync(join(root, 'src/client/hud.luam'));
        write(root, 'src/shared/extra.luam', 'function extraHelper(): void\nend\n');

        const reloaded = service.reload();

        expect(relativePaths(root, reloaded.removed)).toEqual(['src/client/hud.luam']);
        expect(relativePaths(root, reloaded.updated.map((analysis) => analysis.uri))).toEqual([
            'src/shared/config.luam',
            'src/shared/extra.luam',
            'src/shared/helper.luam',
        ]);
    });

    it('reports the same diagnostics as a workspace loaded from scratch', () => {
        const root = workspace(baseFiles());
        const service = new LanguageService();

        service.loadWorkspace([root]);
        service.update(uriFor(root, 'src/shared/config.luam'), 1, CONFIG.replace('class Config', 'class Setup'));

        write(root, 'src/shared/config.luam', CONFIG.replace('class Config', 'class Setup'));

        const clean = new LanguageService();

        clean.loadWorkspace([root]);

        for (const relative of Object.keys(baseFiles())) {
            expect(service.diagnostics(uriFor(root, relative))).toEqual(clean.diagnostics(uriFor(root, relative)));
        }
    });
});
