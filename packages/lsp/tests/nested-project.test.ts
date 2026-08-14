import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';

import { createWorkspace, markerAt, removeWorkspace, uriFor } from './support/service-fixture';

const roots: string[] = [];

const ENV = 'SERVER_NAME="Luam Server"\nMAX_PLAYERS=32\n';

const NESTED = 'examples/resource/src/server/main.luam';

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

describe('a project nested inside the workspace folder', () => {
    const source = 'outputServerLog(`[${env.SERVER_NAME}] room for ${env.MAX_PLAYERS}`)\n';

    it('reads the .env beside the nested manifest', () => {
        const { service, root } = open({
            'examples/resource/.luam.manifest': "name = 'nested'\n",
            'examples/resource/.env': ENV,
            [NESTED]: source,
        });
        const uri = uriFor(root, NESTED);

        service.update(uri, 2, source);

        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.message)).toEqual([]);
    });

    it('still reports env when no .env is reachable', () => {
        const { service, root } = open({ 'examples/resource/.luam.manifest': "name = 'nested'\n", [NESTED]: source });
        const uri = uriFor(root, NESTED);

        service.update(uri, 2, source);

        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.message).join(' ')).toContain('"env"');
    });

    it('completes the keys of the nested .env', () => {
        const text = 'local name = env.\n';
        const { service, root } = open({ 'examples/resource/.luam.manifest': "name = 'nested'\n", 'examples/resource/.env': ENV, [NESTED]: text });
        const uri = uriFor(root, NESTED);

        service.update(uri, 2, text);

        expect(service.completion(uri, markerAt(text, 'env.')).map((item) => item.label)).toEqual(['MAX_PLAYERS', 'SERVER_NAME']);
    });

    it('keeps using the workspace .env for a file outside the nested project', () => {
        const top = 'src/server/main.luam';
        const { service, root } = open({ '.luam.manifest': "name = 'top'\n", '.env': ENV, [top]: source });
        const uri = uriFor(root, top);

        service.update(uri, 2, source);

        expect(service.diagnostics(uri).map((diagnostic) => diagnostic.message)).toEqual([]);
    });
});
