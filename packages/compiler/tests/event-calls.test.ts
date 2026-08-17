import { describe, expect, it } from 'vitest';

import { check } from '@compiler/checker/checker';
import { typeToString } from '@compiler/checker/types';
import type { Environment } from '@compiler/environment/environment';
import { parse } from '@compiler/parser/parser';
import { createProjectCache } from '@compiler/project/project-cache';

const CONTRACT = "declare event 'onMatchStart'(round: number)\n";

function callbacks(source: string, environment: Environment = 'server'): string[] {
    const parsed = parse(source);
    const checked = check(parsed.program, 'strict', environment);
    const found: string[] = [];

    for (const [expression, type] of checked.types) {
        if (expression.kind === 'function-expression') {
            found.push(typeToString(type));
        }
    }

    return found;
}

function codes(source: string, environment: Environment = 'server'): string[] {
    const parsed = parse(source);

    return check(parsed.program, 'strict', environment).diagnostics.map((diagnostic) => diagnostic.code);
}

function projectCodes(source: string, contract = CONTRACT, contractPath = 'src/shared/events.d.luam'): string[] {
    const result = createProjectCache().compile([
        { path: contractPath, source: contract },
        { path: 'src/server/main.luam', source },
    ]);

    return result.diagnostics.map((entry) => entry.diagnostic.code);
}

describe('event call specialization', () => {
    it('types an addEventHandler callback from the built-in signature of the event', () => {
        expect(callbacks("addEventHandler('onPlayerQuit', root, function (quitType, reason, element) end)\n")).toEqual([
            'fun(string, string, Element): void',
        ]);
    });

    it('resolves the built-in signature in the environment of the file', () => {
        expect(callbacks("addEventHandler('onClientRender', root, function () end)\n", 'client')).toEqual(['fun(): void']);
        expect(callbacks("addEventHandler('onClientRender', root, function () end)\n")).toEqual(['fun(): void']);
        expect(codes("addEventHandler('onClientRender', root, function () end)\n")).toEqual(['check-environment-event']);
    });

    it('types a removeEventHandler callback like the matching subscription', () => {
        expect(callbacks("removeEventHandler('onPlayerQuit', root, function (quitType, reason, element) end)\n")).toEqual(['fun(string, string, Element): void']);
    });

    it('reports a callback that does not match the event signature', () => {
        expect(codes("addEventHandler('onPlayerQuit', root, function (quitType: number) end)\n")).toEqual(['check-type-mismatch']);
    });

    it('checks the payload of a built-in trigger against the event signature', () => {
        expect(codes("triggerEvent('onPlayerQuit', root, 'quit', 'reason', root)\n")).toEqual([]);
        expect(codes("triggerEvent('onPlayerQuit', root, 1, 'reason', root)\n")).toEqual(['check-type-mismatch']);
        expect(codes("triggerEvent('onPlayerQuit', root, 'quit')\n")).toEqual(['check-argument-count']);
    });

    it('stays permissive for dynamic and unknown event names', () => {
        expect(codes("local name = 'onPlayerQuit'\naddEventHandler(name, root, function (a, b) end)\n")).toEqual([]);
        expect(codes("addEventHandler('onWhateverHappens', root, function (a) end)\n")).toEqual([]);
        expect(codes("triggerEvent('onWhateverHappens', root, 1, 2, 3)\n")).toEqual([]);
    });

    it('types a callback from a declared project contract', () => {
        const contract = "declare event 'onMatchStart'(player: Player, round: number)\n";
        const source = "addEventHandler('onMatchStart', root, function (player, round) local text: string = round end)\n";

        expect(projectCodes(source, contract)).toEqual(['check-type-mismatch']);
    });

    it('checks the payload of a declared contract on every trigger form', () => {
        expect(projectCodes("triggerEvent('onMatchStart', root, 1)\n")).toEqual([]);
        expect(projectCodes("triggerEvent('onMatchStart', root, 'first')\n")).toEqual(['check-type-mismatch']);
        expect(projectCodes("triggerEvent('onMatchStart', root)\n")).toEqual(['check-argument-count']);
        expect(projectCodes("triggerClientEvent(root, 'onMatchStart', root, 1)\n")).toEqual([]);
        expect(projectCodes("triggerClientEvent(root, 'onMatchStart', root, 'first')\n")).toEqual(['check-type-mismatch']);
    });

    it('picks the latent trigger form that matches the fixed arguments', () => {
        expect(projectCodes("triggerLatentClientEvent(root, 'onMatchStart', 5000, true, root, 1)\n")).toEqual([]);
        expect(projectCodes("triggerLatentClientEvent(root, 'onMatchStart', 5000, true, root, 'first')\n")).toEqual(['check-type-mismatch']);
        expect(projectCodes("triggerLatentClientEvent(root, 'onMatchStart', root, 1)\n")).toEqual([]);
    });

    it('ignores a contract that belongs to another environment', () => {
        const contract = "declare event 'onMatchStart'(round: number)\n";

        expect(projectCodes("triggerClientEvent(root, 'onMatchStart', root, 'first')\n", contract, 'src/client/events.d.luam')).toEqual([]);
        expect(projectCodes("triggerEvent('onMatchStart', root, 'first')\n", contract, 'src/client/events.d.luam')).toEqual([]);
    });
});
