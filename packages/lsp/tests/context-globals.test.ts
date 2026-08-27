import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const SERVER = pathToUri('/project/src/server/main.luam');

function offered(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(SERVER, 1, text);

    return service.completion(SERVER, markerAt(text, marker)).map((item) => item.label);
}

describe('context only globals', () => {
    it('hides the event globals at the top level', () => {
        const items = offered('local value = s\n', '= s');

        expect(items).not.toContain('source');
        expect(items).not.toContain('eventName');
        expect(items).toContain('root');
    });

    it('hides the event globals inside a function that is not a handler', () => {
        const text = 'function helper()\n    local value = s\nend\n';

        expect(offered(text, '= s')).not.toContain('source');
    });

    it('offers the event globals inside a named function used as a handler', () => {
        const text = 'function onLogin()\n    local value = s\nend\n\naddEventHandler("onPlayerLogin", root, onLogin);\n';

        expect(offered(text, '= s')).toContain('source');
    });

    it('offers the event globals inside an inline handler', () => {
        const text = 'addEventHandler("onPlayerLogin", root,\n    function ()\n        local value = s\n    end\n);\n';

        expect(offered(text, '= s')).toContain('source');
    });

    it('hides sourceTimer outside a timer callback', () => {
        const text = 'function helper()\n    local value = s\nend\n';

        expect(offered(text, '= s')).not.toContain('sourceTimer');
    });

    it('offers sourceTimer inside a named function used as a timer callback', () => {
        const text = 'function tick()\n    local value = s\nend\n\nsetTimer(tick, 1000, 0);\n';

        expect(offered(text, '= s')).toContain('sourceTimer');
    });
});
