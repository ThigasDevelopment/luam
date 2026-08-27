import { describe, expect, it } from 'vitest';

import { LanguageService } from '@lsp/server/language-service';
import { pathToUri } from '@lsp/workspace/document-uri';

const SERVER_FILE = pathToUri('/project/src/server/main.luam');

const CLIENT_FILE = pathToUri('/project/src/client/hud.luam');

const SHARED_FILE = pathToUri('/project/src/shared/util.luam');

const DECLARATION_FILE = pathToUri('/project/src/shared/vendor.d.luam');

describe('diagnostics', () => {
    it('accepts declarations in a declaration file', () => {
        const service = new LanguageService();

        service.update(DECLARATION_FILE, 1, 'class Vendor {\n    id: number = 0\n}\n');

        expect(service.diagnostics(DECLARATION_FILE)).toHaveLength(0);
    });

    it('rejects a statement with an effect in a declaration file', () => {
        const service = new LanguageService();

        service.update(DECLARATION_FILE, 1, 'print(1)\n');

        expect(service.diagnostics(DECLARATION_FILE).map((diagnostic) => diagnostic.code)).toEqual(['check-declaration-file-statement']);
    });

    it('publishes a type error for a mismatched assignment', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local health: number = "full"\n');

        const diagnostics = service.diagnostics(SERVER_FILE);

        expect(diagnostics).toHaveLength(1);
        expect(diagnostics[0]?.code).toBe('check-type-mismatch');
        expect(diagnostics[0]?.severity).toBe(1);
        expect(diagnostics[0]?.source).toBe('luam');
    });

    it('clears diagnostics when the error is fixed', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local health: number = "full"\n');
        expect(service.diagnostics(SERVER_FILE)).toHaveLength(1);

        service.update(SERVER_FILE, 2, 'local health: number = 100\n');
        expect(service.diagnostics(SERVER_FILE)).toHaveLength(0);
    });

    it('reports a parser error with a range on the offending token', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local = 1\n');

        const diagnostics = service.diagnostics(SERVER_FILE);

        expect(diagnostics.length).toBeGreaterThan(0);
        expect(diagnostics[0]?.range.start.line).toBe(0);
    });

    it('reports a client api used in a server file', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'dxDrawText("hello", 10, 10)\n');

        const codes = service.diagnostics(SERVER_FILE).map((diagnostic) => diagnostic.code);

        expect(codes).toContain('check-environment-api');
    });

    it('accepts a client api in a client file', () => {
        const service = new LanguageService();

        service.update(CLIENT_FILE, 1, 'dxDrawText("hello", 10, 10)\n');

        expect(service.diagnostics(CLIENT_FILE)).toHaveLength(0);
    });

    it('resolves the environment from the file path', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, 'local value = 1\n');
        service.update(CLIENT_FILE, 1, 'local value = 1\n');
        service.update(SHARED_FILE, 1, 'local value = 1\n');

        expect(service.environment(SERVER_FILE)).toBe('server');
        expect(service.environment(CLIENT_FILE)).toBe('client');
        expect(service.environment(SHARED_FILE)).toBe('shared');
    });

    it('lets a directive override the path environment with a warning', () => {
        const service = new LanguageService();

        service.update(SERVER_FILE, 1, '#!client\nlocal value = 1\n');

        const diagnostics = service.diagnostics(SERVER_FILE);

        expect(service.environment(SERVER_FILE)).toBe('client');
        expect(diagnostics[0]?.code).toBe('env-path-directive-conflict');
        expect(diagnostics[0]?.severity).toBe(2);
    });

    it('narrows a guarded field the same way the compiler does', () => {
        const service = new LanguageService();
        const types = 'type Session = {\n    connection?: string\n}\n\n';
        const guarded = `${types}function take(session: Session): void\n    if session.connection ~= nil then\n        local text: string = session.connection\n    end\nend\n`;
        const written = `${types}function take(session: Session): void\n    if session.connection ~= nil then\n        session.connection = nil\n\n        local text: string = session.connection\n    end\nend\n`;

        service.update(SERVER_FILE, 1, guarded);

        expect(service.diagnostics(SERVER_FILE)).toHaveLength(0);

        service.update(SERVER_FILE, 2, written);

        expect(service.diagnostics(SERVER_FILE).map((diagnostic) => diagnostic.code)).toEqual(['check-type-mismatch']);
    });
});
