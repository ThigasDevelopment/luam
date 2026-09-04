import { describe, expect, it } from 'vitest';

import { deferDocumentation, RESOLVE_KEY } from '@lsp/features/completion-documentation';
import { LanguageService } from '@lsp/server/language-service';
import { SERVER_CAPABILITIES } from '@lsp/server/capabilities';

import { createWorkspace, removeWorkspace, uriFor } from './support/service-fixture';

function catalogCompletion(): ReturnType<LanguageService['completion']> {
    const root = createWorkspace({ '.luam.manifest': "name = 'r'\n", 'src/server/main.luam': 'get\n' });
    const service = new LanguageService();

    service.loadWorkspace([root]);
    service.update(uriFor(root, 'src/server/main.luam'), 2, 'get\n');

    const items = service.completion(uriFor(root, 'src/server/main.luam'), { line: 0, character: 3 });

    removeWorkspace(root);

    return items;
}

describe('the completion payload', () => {
    it('is announced as resolvable', () => {
        expect(SERVER_CAPABILITIES.completionProvider?.resolveProvider).toBe(true);
    });

    it('holds the documentation back and gives it up on resolve', () => {
        const items = catalogCompletion();
        const documented = items.filter((item) => item.documentation !== undefined);

        expect(documented.length).toBeGreaterThan(0);

        const deferred = deferDocumentation(items);

        expect(deferred.items.filter((item) => item.documentation !== undefined)).toEqual([]);
        expect(deferred.items).toHaveLength(items.length);

        const first = deferred.items.find((item) => (item.data as Record<string, unknown>)[RESOLVE_KEY] === 0);

        expect(first).toBeDefined();
        expect(deferred.resolve(first ?? { label: '' }).documentation).toEqual(items[0]?.documentation);
    });

    it('cuts the bytes that cross the connection by most of the payload', () => {
        const items = catalogCompletion();
        const before = JSON.stringify(items).length;
        const after = JSON.stringify(deferDocumentation(items).items).length;

        expect(after).toBeLessThan(before * 0.4);
    });

    it('keeps what the list itself shows', () => {
        const items = catalogCompletion();
        const deferred = deferDocumentation(items);
        const [sent] = deferred.items;
        const [original] = items;

        expect(sent?.label).toBe(original?.label);
        expect(sent?.detail).toBe(original?.detail);
        expect(sent?.sortText).toBe(original?.sortText);
        expect(sent?.insertText).toBe(original?.insertText);
    });

    it('returns an item it does not know unchanged', () => {
        const deferred = deferDocumentation(catalogCompletion());

        expect(deferred.resolve({ label: 'stranger' })).toEqual({ label: 'stranger' });
    });

    it('leaves an item that carries no documentation untouched', () => {
        const deferred = deferDocumentation([{ label: 'plain', detail: 'x' }]);

        expect(deferred.items).toEqual([{ label: 'plain', detail: 'x' }]);
    });
});
