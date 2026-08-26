import { CompletionItemKind, InsertTextFormat } from 'vscode-languageserver';
import { afterEach, describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { createWorkspace, markerAt, positionOf, removeWorkspace, uriFor } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');
const CLIENT_FILE = pathToUri('/project/src/client/main.luam');

const roots: string[] = [];

function labels(service: LanguageService, uri: string, text: string, marker: string): string[] {
    service.update(uri, 1, text);

    return service.completion(uri, markerAt(text, marker)).map((item) => item.label);
}

function hoverText(service: LanguageService, uri: string, text: string, anchor: string, word: string): string {
    service.update(uri, 1, text);

    const contents = service.hover(uri, positionOf(text, anchor, word))?.contents;

    return contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;
}

function oopProject(source: string): { service: LanguageService; uri: string } {
    const root = createWorkspace({
        '.luam.manifest': "name = 'callbacks'\ncompiler = { oop = true }\n",
        'src/server/main.luam': source,
    });
    const service = new LanguageService();

    roots.push(root);
    service.loadWorkspace([root]);

    return { service, uri: uriFor(root, 'src/server/main.luam') };
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('contextual callback completion', () => {
    it('filters project callback class fields and methods by dot and colon', () => {
        const text = [
            'class ProjectPlayer {',
            '    name: string',
            '    greet = function (): void',
            '    end',
            '}',
            'function withPlayer(handler: fun(ProjectPlayer): void): void',
            'end',
            'withPlayer(function(player)',
            '    player.',
            '    player:',
            'end)',
        ].join('\n');
        const service = new LanguageService();
        const fields = labels(service, SERVER_FILE, text, '    player.');
        const methods = labels(service, SERVER_FILE, text, '    player:');

        expect(fields).toContain('name');
        expect(fields).not.toContain('greet');
        expect(methods).toContain('greet');
        expect(methods).not.toContain('name');
        expect(hoverText(service, SERVER_FILE, text, 'function(player', 'player')).toContain('parameter player: ProjectPlayer');
    });

    it('uses record, string, and table callback parameter types', () => {
        const text = [
            'function inspect(handler: fun({ label: string }, string, table): void): void',
            'end',
            'inspect(function(record, text, values)',
            '    record.',
            '    text.',
            '    values.',
            'end)',
        ].join('\n');
        const service = new LanguageService();

        expect(labels(service, SERVER_FILE, text, '    record.')).toContain('label');
        expect(labels(service, SERVER_FILE, text, '    text.')).toContain('trim');
        expect(labels(service, SERVER_FILE, text, '    text.')).not.toContain('size');
        expect(labels(service, SERVER_FILE, text, '    values.')).toContain('count');
        expect(labels(service, SERVER_FILE, text, '    values.')).not.toContain('trim');
        expect(hoverText(service, SERVER_FILE, text, 'function(record', 'record')).toContain('parameter record: { label: string }');
        expect(hoverText(service, SERVER_FILE, text, 'record, text', 'text')).toContain('parameter text: string');
        expect(hoverText(service, SERVER_FILE, text, 'text, values', 'values')).toContain('parameter values: table');
    });

    it('uses generated MTA callback types and preserves environment filtering', () => {
        const text = [
            "addCommandHandler('status', function(player, command)",
            '    player.',
            '    player:',
            '    command.',
            'end)',
        ].join('\n');
        const workspace = oopProject(text);
        const fields = labels(workspace.service, workspace.uri, text, '    player.');
        const methods = labels(workspace.service, workspace.uri, text, '    player:');

        expect(fields).toContain('name');
        expect(fields).not.toContain('getName');
        expect(methods).toContain('getName');
        expect(methods).toContain('getSerial');
        expect(methods).not.toContain('getLighting');
        expect(labels(workspace.service, workspace.uri, text, '    command.')).toContain('trim');
        expect(hoverText(workspace.service, workspace.uri, text, 'function(player', 'player')).toContain('parameter player: Player');
        expect(hoverText(workspace.service, workspace.uri, text, 'player, command', 'command')).toContain('parameter command: string');
    });

    it('inserts generated callback parameter names inside an empty function expression', () => {
        const text = ["addCommandHandler('luam-test', function ()", 'end)'].join('\n');
        const workspace = oopProject(text);
        const found = workspace.service.completion(workspace.uri, markerAt(text, 'function ('));

        expect(found).toEqual([
            expect.objectContaining({
                label: 'playerSource: Player, commandName: string, ...: string',
                kind: CompletionItemKind.Snippet,
                insertText: '${1:playerSource}: Player, ${2:commandName}: string, ...: string',
                insertTextFormat: InsertTextFormat.Snippet,
            }),
        ]);
    });

    it('uses the client addCommandHandler callback variant', () => {
        const text = ["addCommandHandler('status', function(command)", '    command.', 'end)'].join('\n');
        const service = new LanguageService();

        expect(labels(service, CLIENT_FILE, text, '    command.')).toContain('trim');
        expect(hoverText(service, CLIENT_FILE, text, 'function(command', 'command')).toContain('parameter command: string');
    });

    it('keeps an authored annotation instead of the contextual parameter type', () => {
        const text = [
            'function accept(handler: fun({ contextual: string }): void): void',
            'end',
            'accept(function(value: string)',
            '    value.',
            'end)',
        ].join('\n');
        const service = new LanguageService();
        const found = labels(service, SERVER_FILE, text, '    value.');

        expect(found).toContain('trim');
        expect(found).not.toContain('contextual');
        expect(hoverText(service, SERVER_FILE, text, 'function(value', 'value')).toContain('parameter value: string');
    });

    it('falls back to any without a contextual callback type', () => {
        const text = ['local callback = function(value)', '    print(value)', 'end'].join('\n');
        const service = new LanguageService();

        expect(hoverText(service, SERVER_FILE, text, 'function(value', 'value')).toContain('parameter value: any');
    });
});

describe('contextual callback navigation', () => {
    it('preserves definition, references, and rename for an inferred parameter', () => {
        const text = [
            'function inspect(handler: fun({ label: string }): void): void',
            'end',
            'inspect(function(value)',
            '    print(value.label)',
            '    print(value.label)',
            'end)',
        ].join('\n');
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, text);

        const position = positionOf(text, 'print(value', 'value');
        const definition = service.definition(SERVER_FILE, position);
        const references = service.references(SERVER_FILE, position);
        const rename = service.rename(SERVER_FILE, position, 'entry');

        expect(definition[0]?.range.start).toEqual({ line: 2, character: 17 });
        expect(references).toHaveLength(3);
        expect(rename?.changes?.[SERVER_FILE]).toHaveLength(3);
    });
});
