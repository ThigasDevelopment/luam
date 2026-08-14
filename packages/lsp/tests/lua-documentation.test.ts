import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt, positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

function openService(text: string): LanguageService {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service;
}

function hoverText(text: string, anchor: string, word: string): string {
    const contents = openService(text).hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

function labels(text: string, marker: string): string[] {
    return openService(text)
        .completion(SERVER_FILE, markerAt(text, marker))
        .map((item) => item.label);
}

describe('lua documentation', () => {
    it('describes a lua global instead of only naming its scope', () => {
        const hover = hoverText('for key, value in pairs({}) do end\n', 'pairs', 'pairs');

        expect(hover).toContain('Iterates every key/value pair');
        expect(hover).toContain('`target`');
        expect(hover).toContain('**Returns**');
        expect(hover).toContain('lua.org/manual/5.1');
    });

    it('describes a library table rather than showing only its type', () => {
        const hover = hoverText('local text = string.upper("a")\n', 'string', 'string');

        expect(hover).toContain('The string library');
        expect(hover).toContain('lua api (shared)');
    });

    it('describes a library member with named parameters', () => {
        const hover = hoverText('local text = string.format("%s", 1)\n', 'format', 'format');

        expect(hover).toContain('function string.format(template: string');
        expect(hover).toContain('printf placeholders');
        expect(hover).toContain('`template`');
    });

    it('marks a luam addition as such', () => {
        expect(hoverText('local parts = string.split("a,b", ",")\n', 'split', 'split')).toContain('a Luam addition');
    });

    it('carries the documentation into a library completion item', () => {
        const service = openService('local value = table.\n');
        const items = service.completion(SERVER_FILE, markerAt('local value = table.\n', 'table.'));
        const insert = items.find((item) => item.label === 'insert');
        const documentation = insert?.documentation;

        expect(insert?.detail).toContain('table.insert(list: table');
        expect(typeof documentation === 'object' && documentation !== null ? documentation.value : '').toContain('array part');
    });

    it('names the parameters in library signature help', () => {
        const text = 'local text = string.format(\n';
        const help = openService(text).signatureHelp(SERVER_FILE, markerAt(text, 'string.format('));

        expect(help?.signatures[0]?.label).toBe('string.format(template: string, ...values): string');
    });
});

describe('native runtime libraries', () => {
    it('offers the members of Thread', () => {
        expect(labels('Thread.\n', 'Thread.')).toEqual(['get', 'set', 'pause', 'resume', 'isPaused', 'isStarted']);
    });

    it('offers new on the Async and Threads entry points', () => {
        expect(labels('Async.\n', 'Async.')).toEqual(['new']);
        expect(labels('Threads.\n', 'Threads.')).toEqual(['new']);
    });

    it('offers the members of an async runner built with new Async', () => {
        const found = labels('local runner = new Async(50)\nrunner.\n', 'runner.');

        expect(found).toEqual(['map', 'iterate', 'foreach', 'getInterval', 'setInterval']);
    });

    it('offers the members of a scheduler built with new Threads', () => {
        const found = labels('local pool = new Threads("work", "frame")\npool.\n', 'pool.');

        expect(found).toContain('add');
        expect(found).toContain('start');
    });

    it('describes the async library on hover', () => {
        expect(hoverText('local runner = new Async(50)\n', 'Async', 'Async')).toContain('walks a table or a numeric range a slice at a time');
    });

    it('describes an async member on hover', () => {
        const hover = hoverText('local runner = new Async(50)\nrunner.foreach({}, print)\n', 'runner.foreach', 'foreach');

        expect(hover).toContain('without building a result');
    });

    it('documents a thread member in the completion item', () => {
        const service = openService('Thread.\n');
        const items = service.completion(SERVER_FILE, markerAt('Thread.\n', 'Thread.'));
        const documentation = items.find((item) => item.label === 'pause')?.documentation;

        expect(typeof documentation === 'object' && documentation !== null ? documentation.value : '').toContain('resume where it left off');
    });
});
