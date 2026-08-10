import { describe, expect, it } from 'vitest';

import { canReference, environmentFromPath, resolveEnvironment } from '@compiler/environment/environment';
import { compile } from '@compiler/index';

function codes(source: string, filePath?: string): string[] {
    const options = filePath === undefined ? {} : { filePath };

    return compile(source, options).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('environment resolution', () => {
    it('resolves the environment from the source path', () => {
        expect(environmentFromPath('src/server/main.luam')).toBe('server');
        expect(environmentFromPath('src/client/hud.luam')).toBe('client');
        expect(environmentFromPath('src/shared/config.luam')).toBe('shared');
        expect(environmentFromPath('resources/demo/src/client/ui/menu.luam')).toBe('client');
        expect(environmentFromPath('C:\\projects\\demo\\src\\server\\main.luam')).toBe('server');
    });

    it('ignores a path that does not sit under a source environment folder', () => {
        expect(environmentFromPath('src/main.luam')).toBeNull();
        expect(environmentFromPath('server/main.luam')).toBeNull();
    });

    it('falls back to shared when nothing resolves the environment', () => {
        expect(resolveEnvironment(null, []).environment).toBe('shared');
        expect(resolveEnvironment('src/main.luam', []).environment).toBe('shared');
    });

    it('resolves the environment from a directive', () => {
        expect(resolveEnvironment(null, ['client']).environment).toBe('client');
        expect(resolveEnvironment(null, ['strict', 'server']).environment).toBe('server');
    });

    it('lets a directive override the path', () => {
        const resolution = resolveEnvironment('src/server/main.luam', ['client']);

        expect(resolution.environment).toBe('client');
        expect(resolution.fromPath).toBe('server');
        expect(resolution.fromDirective).toBe('client');
    });

    it('warns when the directive contradicts the path', () => {
        const [diagnostic] = resolveEnvironment('src/server/main.luam', ['client']).diagnostics;

        expect(diagnostic?.code).toBe('env-path-directive-conflict');
        expect(diagnostic?.severity).toBe('warning');
    });

    it('reports conflicting directives as an error', () => {
        const [diagnostic] = resolveEnvironment(null, ['server', 'client']).diagnostics;

        expect(diagnostic?.code).toBe('env-conflicting-directive');
        expect(diagnostic?.severity).toBe('error');
        expect(compile('--!server\n--!client\nlocal a = 1\n').code).toBeNull();
    });

    it('accepts the same directive twice', () => {
        expect(resolveEnvironment(null, ['shared', 'shared']).diagnostics).toEqual([]);
    });

    it('applies the import direction rules', () => {
        expect(canReference('server', 'shared')).toBe(true);
        expect(canReference('client', 'shared')).toBe(true);
        expect(canReference('server', 'client')).toBe(false);
        expect(canReference('client', 'server')).toBe(false);
        expect(canReference('shared', 'server')).toBe(false);
        expect(canReference('shared', 'shared')).toBe(true);
    });
});

describe('environment API validation', () => {
    it('reports a client-only API used in a server file', () => {
        const result = compile('dxDrawText("hi", 10, 10)\n', { filePath: 'src/server/main.luam' });
        const [diagnostic] = result.diagnostics;

        expect(diagnostic?.code).toBe('check-environment-api');
        expect(diagnostic?.message).toBe('API "dxDrawText" is client-only and is not available in a "server" file.');
        expect(result.code).toBeNull();
    });

    it('reports a server-only API used in a client file', () => {
        expect(codes('banPlayer(source)\n', 'src/client/hud.luam')).toEqual(['check-environment-api']);
    });

    it('reports a server-only API used in a shared file', () => {
        expect(codes('kickPlayer(source)\n', 'src/shared/util.luam')).toEqual(['check-environment-api']);
    });

    it('accepts an API declared for the resolved environment', () => {
        expect(codes('outputChatBox("hi", root)\n', 'src/server/main.luam')).toEqual([]);
        expect(codes('dxDrawText("hi", 10, 10)\n', 'src/client/hud.luam')).toEqual([]);
    });

    it('accepts shared APIs in every environment', () => {
        for (const path of ['src/server/main.luam', 'src/client/hud.luam', 'src/shared/util.luam']) {
            expect(codes('local player = getElementByID("spawn")\nprint(getElementType(root))\n', path)).toEqual([]);
        }
    });

    it('keeps an unresolved global untyped without a diagnostic', () => {
        expect(codes('myProjectHelper(1)\n', 'src/server/main.luam')).toEqual([]);
    });

    it('reports a client event handled in a server file', () => {
        const [diagnostic] = compile('addEventHandler("onClientRender", root, print)\n', { filePath: 'src/server/main.luam' }).diagnostics;

        expect(diagnostic?.code).toBe('check-environment-event');
        expect(diagnostic?.message).toBe('Event "onClientRender" is client-only and cannot be used in a "server" file.');
    });

    it('reports a server event handled in a client file', () => {
        expect(codes('addEventHandler("onPlayerJoin", root, print)\n', 'src/client/hud.luam')).toEqual(['check-environment-event']);
    });

    it('accepts a custom event name in any environment', () => {
        expect(codes('addEventHandler("onResourceReady", root, print)\n', 'src/client/hud.luam')).toEqual([]);
    });

    it('types the MTA and extension catalogs', () => {
        expect(codes('local name: number = getPlayerName(source)\n', 'src/server/main.luam')).toEqual(['check-type-mismatch']);
        expect(codes('local size: string = table.size({})\n', 'src/shared/util.luam')).toEqual(['check-type-mismatch']);
        expect(codes('local text: string = string.template("hi", {})\n', 'src/shared/util.luam')).toEqual([]);
    });

    it('reports the environment on the compile result', () => {
        expect(compile('local a = 1', { filePath: 'src/client/hud.luam' }).environment).toBe('client');
        expect(compile('--!server\nlocal a = 1').environment).toBe('server');
        expect(compile('local a = 1', { environment: 'server' }).environment).toBe('server');
    });
});
