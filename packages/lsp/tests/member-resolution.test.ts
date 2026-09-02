import { afterEach, describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { createWorkspace, markerAt, removeWorkspace, uriFor } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const SERVER_PATH = 'src/server/main.luam';

const roots: string[] = [];

const COLLISION = [
    'type Props = {',
    '    secret?: string',
    '}',
    '',
    'class Network {',
    "    secret: string = 'x'",
    '',
    '    read = function (): string',
    '        return self.secret',
    '    end',
    '}',
    '',
    'function take(props: Props): string',
    '    return props.secret',
    'end',
].join('\n');

function serviceWith(text: string): LanguageService {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service;
}

function textOf(service: LanguageService, uri: string, text: string, marker: string): string {
    const contents = service.hover(uri, markerAt(text, marker))?.contents;

    if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
        return '';
    }

    return contents.value;
}

function hoverText(text: string, marker: string): string {
    return textOf(serviceWith(text), SERVER_FILE, text, marker);
}

function diagnosticCodes(text: string): (string | number | undefined)[] {
    return serviceWith(text)
        .diagnostics(SERVER_FILE)
        .map((diagnostic) => diagnostic.code);
}

function definitionLines(text: string, marker: string): number[] {
    return serviceWith(text)
        .definition(SERVER_FILE, markerAt(text, marker))
        .map((location) => location.range.start.line);
}

function renameLines(text: string, marker: string): number[] {
    const edits = serviceWith(text).rename(SERVER_FILE, markerAt(text, marker), 'token')?.changes?.[SERVER_FILE] ?? [];

    return edits.map((edit) => edit.range.start.line).sort((left, right) => left - right);
}

afterEach(() => {
    roots.splice(0).forEach(removeWorkspace);
});

describe('member resolution under a name collision', () => {
    it('answers a record property with the type the checker gave it', () => {
        expect(hoverText(COLLISION, 'props.se')).toContain('Props.secret: string?');
        expect(hoverText(COLLISION, 'props.se')).not.toContain('field secret');
    });

    it('never points a record property at the class field that shares its name', () => {
        expect(definitionLines(COLLISION, 'props.se')).not.toContain(5);
        expect(renameLines(COLLISION, 'props.se')).not.toContain(5);
    });

    it('keeps a class field reachable through self', () => {
        expect(hoverText(COLLISION, 'return self.se')).toContain("field secret: string = 'x'");
        expect(definitionLines(COLLISION, 'return self.se')).toEqual([5]);
        expect(renameLines(COLLISION, 'return self.se')).toEqual([5, 8]);
    });

    it('resolves a member of a class instance past a colliding field', () => {
        const text = [
            'class Player {',
            '    name: string',
            '}',
            '',
            'class Vehicle {',
            '    name: string',
            '}',
            '',
            'local one = new Player()',
            'local value = one.name',
        ].join('\n');

        expect(hoverText(text, 'one.na')).toContain('field name: string');
        expect(definitionLines(text, 'one.na')).toEqual([1]);
    });

    it('resolves a library member past a colliding field', () => {
        const text = ['class Report {', '    format: string', '}', '', "local text = string.format('%d', 1)"].join('\n');

        expect(hoverText(text, 'string.for')).toContain('string.format');
        expect(hoverText(text, 'string.for')).not.toContain('field format');
    });

    it('resolves a table literal property past a colliding field', () => {
        const text = ['class Client {', '    retries: number', '}', '', 'local config = { retries = 3 }', 'local left = config.retries'].join('\n');

        expect(hoverText(text, 'config.ret')).not.toContain('field retries');
    });

    it('resolves a member of an MTA element past a colliding field', () => {
        const source = ['class Label {', '    getName: string', '}', '', "local player = getPlayerFromName('bob')", 'local who = player:getName()'].join('\n');
        const root = createWorkspace({ '.luam.manifest': "name = 'demo'\ncompiler = { oop = true }\n", [SERVER_PATH]: source });
        const service = new LanguageService();

        roots.push(root);
        service.loadWorkspace([root]);

        const value = textOf(service, uriFor(root, SERVER_PATH), source, 'player:getNa');

        expect(value).not.toContain('field getName');
    });
});

describe('narrowed property hover', () => {
    const GUARDED = [
        'type NetworkProps = {',
        '    password?: string',
        '}',
        '',
        'class Network {',
        "    password: string = ''",
        '',
        '    constructor = function (props: NetworkProps)',
        "        if props.password and type(props.password) == 'string' then",
        '            self.password = props.password',
        '        end',
        '    end',
        '}',
    ].join('\n');

    it('answers an optional property with its optionality', () => {
        expect(hoverText(GUARDED, 'if props.pass')).toContain('NetworkProps.password: string?');
    });

    it('answers a guarded property with the narrowed type and names the declared one', () => {
        expect(hoverText(GUARDED, 'self.password = props.pass')).toContain('NetworkProps.password: string');
        expect(hoverText(GUARDED, 'self.password = props.pass')).toContain('narrowed from `string?`');
    });

    it('answers the receiver with the receiver', () => {
        expect(hoverText(GUARDED, 'function (pro')).toContain('parameter props: NetworkProps');
    });

    it('agrees with the compiler on the guarded and the unguarded assignment', () => {
        const unguarded = GUARDED.replace(
            ["        if props.password and type(props.password) == 'string' then", '            self.password = props.password', '        end'].join('\n'),
            '        self.password = props.password',
        );

        expect(diagnosticCodes(GUARDED)).toEqual(compile(GUARDED).diagnostics.map((diagnostic) => diagnostic.code));
        expect(diagnosticCodes(GUARDED)).toEqual([]);
        expect(diagnosticCodes(unguarded)).toEqual(compile(unguarded).diagnostics.map((diagnostic) => diagnostic.code));
        expect(diagnosticCodes(unguarded)).toEqual(['check-type-mismatch']);
    });
});

describe('the shape of a hovered value', () => {
    it('lists the fields of a type alias', () => {
        const text = ['type Props = {', '    event: string,', '    secret?: string', '}', '', 'function take(props: Props): void', 'end'].join('\n');
        const value = hoverText(text, 'function take(pro');

        expect(value).toContain('parameter props: Props');
        expect(value).toContain('event: string');
        expect(value).toContain('secret?: string');
    });

    it('lists the fields of an interface', () => {
        const text = ['interface Shape {', '    size: number', '}', '', 'function take(shape: Shape): void', 'end'].join('\n');

        expect(hoverText(text, 'function take(sha')).toContain('size: number');
    });

    it('lists the fields of a class', () => {
        const text = ['class Box {', '    width: number = 1', '}', '', 'local box = new Box()'].join('\n');
        const value = hoverText(text, 'local bo');

        expect(value).toContain('local box: Box');
        expect(value).toContain('class Box {');
        expect(value).toContain('width: number');
    });

    it('lists the fields of an inline object type', () => {
        const text = ['function take(entry: { id: number, label: string }): void', 'end'].join('\n');
        const value = hoverText(text, 'function take(ent');

        expect(value).toContain('id: number');
        expect(value).toContain('label: string');
    });

    it('lists the fields of a record property', () => {
        const text = [
            'type Inner = {',
            '    port: number',
            '}',
            '',
            'type Outer = {',
            '    inner: Inner',
            '}',
            '',
            'function take(outer: Outer): void',
            '    local held = outer.inner',
            'end',
        ].join('\n');
        const value = hoverText(text, 'outer.inn');

        expect(value).toContain('Outer.inner: Inner');
        expect(value).toContain('port: number');
    });

    it('caps a wide type and counts what it left out', () => {
        const fields = Array.from({ length: 30 }, (_, index) => `    field${index}: number`).join(',\n');
        const text = ['type Wide = {', fields, '}', '', 'function take(wide: Wide): void', 'end'].join('\n');
        const value = hoverText(text, 'function take(wi');

        expect(value).toContain('field23: number');
        expect(value).not.toContain('field24: number');
        expect(value).toContain('# 6 more');
    });

    it('leaves a primitive, a function, any and table alone', () => {
        const text = ['function take(count: number, run: fun(): void, loose: any, bag: table): void', 'end'].join('\n');

        expect(hoverText(text, 'function take(cou')).not.toContain('**Instance**');
        expect(hoverText(text, 'number, ru')).not.toContain('**Instance**');
        expect(hoverText(text, 'fun(): void, loo')).not.toContain('**Instance**');
        expect(hoverText(text, 'any, ba')).not.toContain('**Instance**');
    });
});
