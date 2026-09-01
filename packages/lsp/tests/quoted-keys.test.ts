import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt, positionOf } from './support/service-fixture';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const FONTS = "interface ClientFonts {\n    ['medium:20']: string\n    ['bold:15']: string\n    plain: string\n}\n\n";

function labels(text: string, marker: string): string[] {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    return service.completion(SERVER_FILE, markerAt(text, marker)).map((item) => item.label);
}

function hoverText(text: string, anchor: string, word: string): string {
    const service = new LanguageService();

    service.update(SERVER_FILE, 1, text);

    const contents = service.hover(SERVER_FILE, positionOf(text, anchor, word))?.contents;

    if (contents === undefined || typeof contents === 'string' || Array.isArray(contents)) {
        return '';
    }

    return contents.value;
}

describe('completion after an index bracket', () => {
    it('offers the declared keys with their quotes', () => {
        const text = `${FONTS}local fonts: ClientFonts = nil\nlocal picked = fonts[]\n`;
        const found = labels(text, 'fonts[');

        expect(found).toContain("'medium:20'");
        expect(found).toContain("'bold:15'");
        expect(found).toContain("'plain'");
    });

    it('offers bare keys once a quote is open', () => {
        const text = `${FONTS}local fonts: ClientFonts = nil\nlocal picked = fonts['']\n`;
        const found = labels(text, "fonts['");

        expect(found).toContain('medium:20');
        expect(found).not.toContain("'medium:20'");
    });

    it('leaves a dotted receiver alone', () => {
        const text = `${FONTS}local fonts: ClientFonts = nil\nlocal picked = fonts.\n`;
        const found = labels(text, 'fonts.');

        expect(found).toContain('plain');
        expect(found).not.toContain("'plain'");
    });
});

describe('hover on a value taken by a quoted key', () => {
    it('names the type the key declares', () => {
        const text = `${FONTS}local fonts: ClientFonts = nil\nlocal picked = fonts['medium:20']\n\nprint(picked)\n`;

        expect(hoverText(text, 'print(picked)', 'picked')).toContain('string');
    });
});

describe('hover on a fun type with an optional parameter', () => {
    it('prints the marker on the parameter name', () => {
        const text = 'local handler: fun(reason?: string): void = print\n\nprint(handler)\n';

        expect(hoverText(text, 'print(handler)', 'handler')).toContain('fun(reason?: string): void');
    });

    it('prints a required parameter with its name', () => {
        const text = 'local handler: fun(reason: string): void = print\n\nprint(handler)\n';

        expect(hoverText(text, 'print(handler)', 'handler')).toContain('fun(reason: string): void');
    });

    it('leaves an unnamed parameter bare', () => {
        const text = 'local handler: fun(string?): void = print\n\nprint(handler)\n';

        expect(hoverText(text, 'print(handler)', 'handler')).toContain('fun(string?): void');
    });
});

describe('hover on an annotated global', () => {
    const NETWORK = 'class Network {\n    props: table\n    isClient: boolean = false\n    events: table<string, table> = {}\n\n    init = function (): void\n    end\n}\n\n';

    it('names the class the annotation declares', () => {
        const text = `${NETWORK}network?: Network = nil\n\nprint(network)\n`;

        expect(hoverText(text, 'print(network)', 'network')).toContain('network?: Network');
    });

    it('lists the fields of the class under the signature', () => {
        const text = `${NETWORK}network?: Network = nil\n\nprint(network)\n`;
        const hover = hoverText(text, 'print(network)', 'network');

        expect(hover).toContain('isClient: boolean');
        expect(hover).toContain('events: table<string, table>');
    });

    it('lists the fields of an interface a global is annotated with', () => {
        const text = 'interface Config {\n    limit: number\n    label?: string\n}\n\nsettings?: Config = nil\n\nprint(settings)\n';
        const hover = hoverText(text, 'print(settings)', 'settings');

        expect(hover).toContain('limit: number');
        expect(hover).toContain('label?: string');
    });
});

describe('hover on a declared global', () => {
    it('lists the fields of the interface the declaration names', () => {
        const text = 'interface ConfigShape {\n    limit: number\n    label?: string\n}\n\ndeclare settings: ConfigShape\n';
        const service = new LanguageService();
        const declarations = pathToUri('/project/src/server/types.d.luam');

        service.update(declarations, 1, text);

        const reader = 'print(settings)\n';

        service.update(SERVER_FILE, 1, reader);

        const contents = service.hover(SERVER_FILE, positionOf(reader, 'print(', 'settings'))?.contents;
        const value = contents === undefined || typeof contents === 'string' || Array.isArray(contents) ? '' : contents.value;

        expect(value).toContain('limit: number');
        expect(value).toContain('label?: string');
    });
});
