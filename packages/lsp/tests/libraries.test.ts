import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, removeWorkspace, uriFor } from './support/service-fixture';

const roots: string[] = [];

const PACKAGE = '@luam-fixture/collections';

const PACKAGE_ROOT = `node_modules/${PACKAGE}`;

const LIST = [
    'class FixtureList {',
    '    total: number = 0',
    '',
    '    add = function (amount: number): void',
    '        self.total += amount',
    '    end',
    '}',
    '',
].join('\n');

const CONSUMER = ['local list = new FixtureList()', '', 'list:add(2)', ''].join('\n');

function manifest(libraries: readonly string[]): string {
    return `name = 'luam-demo'\nlibraries = { ${libraries.map((entry) => `'${entry}'`).join(', ')} }\n`;
}

function library(luam: unknown = { sources: { shared: ['src/**/*.luam'] } }): Record<string, string> {
    return {
        [`${PACKAGE_ROOT}/package.json`]: `${JSON.stringify({ name: PACKAGE, version: '1.0.0', luam }, null, 4)}\n`,
        [`${PACKAGE_ROOT}/src/list.luam`]: LIST,
    };
}

function open(files: Readonly<Record<string, string>>): { service: LanguageService; root: string } {
    const root = createWorkspace(files);
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, root };
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('libraries in the editor', () => {
    it('sees a class a listed library declares', () => {
        const { service, root } = open({ '.luam.manifest': manifest([PACKAGE]), 'src/shared/main.luam': CONSUMER, ...library() });
        const uri = uriFor(root, 'src/shared/main.luam');

        service.update(uri, 2, CONSUMER);

        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.message)).toEqual([]);
    });

    it('leaves an installed package the manifest does not list out of the index', () => {
        const { service, root } = open({ '.luam.manifest': manifest([]), 'src/shared/main.luam': CONSUMER, ...library() });
        const uri = uriFor(root, 'src/shared/main.luam');

        service.update(uri, 2, CONSUMER);

        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.message).join(' ')).toContain('FixtureList');
    });

    it('checks a call into a library class against its declared signature', () => {
        const source = ['local list = new FixtureList()', '', "list:add('two')", ''].join('\n');
        const { service, root } = open({ '.luam.manifest': manifest([PACKAGE]), 'src/shared/main.luam': source, ...library() });
        const uri = uriFor(root, 'src/shared/main.luam');

        service.update(uri, 2, source);

        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.message).join(' ')).toContain('Argument 1 expects "number"');
    });
});
