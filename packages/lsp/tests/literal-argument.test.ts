import { describe, expect, it } from 'vitest';

import { compile } from '@compiler/index';
import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

import { markerAt } from './support/service-fixture';

const CLIENT = pathToUri('/project/src/client/main.luam');

function at(text: string, marker: string): { labels: string[]; signature: string } {
    const service = new LanguageService();

    service.update(CLIENT, 1, text);

    const position = markerAt(text, marker);

    return {
        labels: service.completion(CLIENT, position).map((item) => item.label),
        signature: service.signatureHelp(CLIENT, position)?.signatures[0]?.label ?? '',
    };
}

function codes(source: string): string[] {
    return compile(source, { filePath: 'src/client/main.luam' }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('literal argument completion', () => {
    it('offers the pool names inside engineSetPoolCapacity', () => {
        const found = at("engineSetPoolCapacity('')\n", "('");

        expect(found.labels).toContain('vehicle');
        expect(found.labels).toContain('col-model');
        expect(found.labels).toHaveLength(20);
        expect(found.labels).not.toContain('player');
    });

    it('spells the union out in signature help', () => {
        expect(at("createMarker(0, 0, 0, '')\n", "0, '").signature).toContain("theType?: 'checkpoint' | 'ring' | 'cylinder' | 'arrow' | 'corona'");
    });

    it('offers only the alignments each dxDrawText argument accepts', () => {
        expect(at("dxDrawText('hi', 0, 0, 0, 0, 0, 1, 'default', '')\n", "'default', '").labels).toEqual(['left', 'center', 'right']);
    });

    it('reports a value the enumeration does not carry', () => {
        expect(codes("engineSetPoolCapacity('player', 1000)\n")).toEqual(['check-type-mismatch']);
        expect(codes("createMarker(0, 0, 0, 'sphere')\n")).toEqual(['check-type-mismatch']);
    });

    it('accepts every value the enumeration carries', () => {
        expect(codes("engineSetPoolCapacity('vehicle', 1000)\n")).toEqual([]);
        expect(codes("createMarker(0, 0, 0, 'corona')\n")).toEqual([]);
        expect(codes("dxDrawText('hi', 0, 0, 0, 0, 0, 1, 'default', 'center', 'bottom')\n")).toEqual([]);
    });

    it('offers the built-in font names and still takes a DxFont', () => {
        const found = at("dxDrawText('hi', 0, 0, 0, 0, 0, 1, '')\n", "1, '");

        expect(found.labels).toEqual(['default', 'default-bold', 'clear', 'arial', 'sans', 'pricedown', 'bankgothic', 'diploma', 'beckett', 'unifont']);
        expect(found.signature).toContain("font?: 'default' | 'default-bold'");
        expect(found.signature).toContain('| DxFont');
        expect(codes("dxDrawText('hi', 0, 0, 0, 0, 0, 1, 'pricedown')\n")).toEqual([]);
        expect(codes("local font = dxCreateFont('my.ttf')\ndxDrawText('hi', 0, 0, 0, 0, 0, 1, font)\n")).toEqual([]);
    });

    it('checks a name only where the enumeration carries no element type', () => {
        expect(codes("dxDrawText('hi', 0, 0, 0, 0, 0, 1, 'comic-sans')\n")).toEqual([]);
        expect(codes("local player: Player = 'not a player'\n")).toEqual([]);
        expect(codes("engineSetPoolCapacity('player', 1000)\n")).toEqual(['check-type-mismatch']);
    });

    it('offers the values and nothing else at an argument position', () => {
        const service = new LanguageService();
        const text = "setElementData(source, 'teste', 'x', )\n";
        const server = pathToUri('/project/src/server/main.luam');

        service.update(server, 1, text);

        const items = service.completion(server, markerAt(text, "'x', "));

        expect(items.map((item) => item.label)).toEqual(['broadcast', 'local', 'subscribe']);
        expect(items.map((item) => item.insertText)).toEqual(["'broadcast'", "'local'", "'subscribe'"]);
    });

    it('keeps the globals where the union also accepts an element', () => {
        const service = new LanguageService();
        const text = "dxDrawText('h', 0, 0, 0, 0, 0, 1, )\n";

        service.update(CLIENT, 1, text);

        const items = service.completion(CLIENT, markerAt(text, '1, '));

        expect(items.slice(0, 3).map((item) => item.label)).toEqual(['default', 'default-bold', 'clear']);
        expect(items.map((item) => item.label)).toContain('dxCreateFont');
    });

    it('leaves an argument of another type untouched', () => {
        const service = new LanguageService();
        const text = "engineSetPoolCapacity('ped', )\n";

        service.update(CLIENT, 1, text);

        const items = service.completion(CLIENT, markerAt(text, "'ped', "));

        expect(items.length).toBeGreaterThan(100);
        expect(items.map((item) => item.label)).toContain('getTickCount');
        expect(items.map((item) => item.label)).not.toContain('math');
    });

    it('leaves an argument that takes a plain string untouched', () => {
        const service = new LanguageService();
        const text = 'outputChatBox()\n';

        service.update(CLIENT, 1, text);

        const first = service.completion(CLIENT, markerAt(text, 'outputChatBox('))[0];

        expect(first?.insertText).toBeUndefined();
    });

    it('leaves an unenumerated string parameter alone', () => {
        expect(codes("outputChatBox('anything at all')\n")).toEqual([]);
        expect(at("outputChatBox('')\n", "('").labels).toEqual([]);
    });
});
