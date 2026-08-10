import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

describe('document symbols', () => {
    it('excludes synthetic accessors from the class outline', () => {
        const service = new LanguageService();
        const text = 'class Player {\n    @Getter\n    @Setter\n    name: string\n    run(): void {\n    }\n}\n';

        service.update(SERVER_FILE, 1, text);

        const player = service.documentSymbols(SERVER_FILE).find((symbol) => symbol.name === 'Player');

        expect(player?.children?.map((symbol) => symbol.name)).toEqual(['name', 'run']);
    });
});
