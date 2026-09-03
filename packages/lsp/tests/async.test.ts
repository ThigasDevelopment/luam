import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt, positionOf } from './support/service-fixture';

const PATH = 'src/server/main.luam';

const URI = pathToUri(`/project/${PATH}`);

const SOURCE = `async function load(id: number): number
    local waited = await delay(100)

    return id
end

async function main()
    local value = await load(1)

    print(value)
end

local settings = { async = true, await = false }

print(settings.async, settings.await)
`;

function service(text: string = SOURCE): LanguageService {
    const created = new LanguageService();

    created.update(URI, 1, text);

    return created;
}

function labels(text: string, marker: string): string[] {
    const created = service(text);

    return created.completion(URI, markerAt(text, marker)).map((item) => item.label);
}

describe('async in the editor', () => {
    it('offers the async modifier at a statement start', () => {
        expect(labels('as\n', 'as')).toContain('async');
    });

    it('offers await inside an async body and nowhere else', () => {
        expect(labels('async function load()\n    aw\nend\n', 'aw')).toContain('await');
        expect(labels('function load()\n    aw\nend\n', 'aw')).not.toContain('await');
        expect(labels('async function load()\n    local run = function()\n        aw\n    end\nend\n', 'aw')).not.toContain('await');
    });

    it('hovers an async function with the promise it returns', () => {
        const created = service();
        const position = positionOf(SOURCE, 'async function load', 'load');
        const hover = created.hover(URI, position);

        expect(JSON.stringify(hover?.contents ?? '')).toContain('Promise<number>');
    });

    it('hovers a promise library member with its documented text', () => {
        const text = 'local waiting = Promise.delay(100)\nlocal pending = Promise.settle(waiting)\n';
        const created = service(text);

        expect(JSON.stringify(created.hover(URI, positionOf(text, 'Promise.delay', 'delay'))?.contents ?? '')).toContain('50ms floor');
        expect(JSON.stringify(created.hover(URI, positionOf(text, 'Promise.settle', 'settle'))?.contents ?? '')).toContain('reports the outcome');
    });

    it('hovers a promise value with the members it answers', () => {
        const text = 'local pending = Promise.resolve(1)\n';
        const created = service(text);
        const hover = JSON.stringify(created.hover(URI, positionOf(text, 'local pending', 'pending'))?.contents ?? '');

        expect(hover).toContain('next');
        expect(hover).toContain('catch');
    });

    it('offers the parameters of every promise callback', () => {
        expect(labels('local pending = new Promise(function ()\nend)\n', 'function (')).toContain('resolve: fun(any, ...): void, reject: fun(any, ...): void');
        expect(labels('local pending = Promise.resolve(1)\n\npending:next(function ()\nend)\n', 'next(function (')).toContain('value: any, ...');
        expect(labels('local pending = Promise.resolve(1)\n\npending:catch(function ()\nend)\n', 'catch(function (')).toContain('reason: any');
    });

    it('offers the thread a pool job receives', () => {
        expect(
            labels("local pool = new Threads('concurrent', 'normal')\n\npool:add(function ()\nend)\n", 'add(function ('),
        ).toContain('thread: Thread, ...');
    });

    it('hovers the async modifier and the await operator', () => {
        const created = service();

        expect(JSON.stringify(created.hover(URI, positionOf(SOURCE, 'async function load', 'async'))?.contents ?? '')).toContain('coroutine');
        expect(JSON.stringify(created.hover(URI, positionOf(SOURCE, 'await delay(100)', 'await'))?.contents ?? '')).toContain('rejection');
    });

    it('shows the awaited type on the local bound to an await', () => {
        const text = 'async function load(): number\n    return 1\nend\n\nasync function main()\n    local value = await load()\nend\n';
        const lines = text.split('\n');
        const created = service(text);
        const hints = created.inlayHints(URI, {
            start: { line: 0, character: 0 },
            end: { line: lines.length - 1, character: lines[lines.length - 1]?.length ?? 0 },
        });

        expect(hints.map((hint) => String(hint.label))).toContain(': number');
    });
});
