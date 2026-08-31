import { describe, expect, it } from 'vitest';

import { parseWikiEvents } from '@generator/wiki-event-parser';

import type { WikiSnapshotPage } from '@generator/wiki-snapshot';

const CONTEXT = { elementTypes: new Set(['Element', 'Pickup', 'Player', 'Resource']) };

function page(name: string, text: string): WikiSnapshotPage {
    return { name, title: name, category: 'player', revision: 1, timestamp: '2026-01-01T00:00:00Z', text };
}

function eventPage(name: string, side: string, parameters: string): WikiSnapshotPage {
    return page(name, ['__NOTOC__', `{{${side} event}}`, 'A summary.', '==Parameters==', parameters, '==Source==', 'The source.'].join('\n'));
}

function luaBlock(source: string): string {
    return ['<syntaxhighlight lang="lua">', source, '</syntaxhighlight>'].join('\n');
}

describe('wiki event parser', () => {
    it('reads the parameter list and the side of an event page', () => {
        const parsed = parseWikiEvents([eventPage('onChatMessage', 'Server', luaBlock('string theMessage, element theElement'))], CONTEXT);

        expect(parsed.client).toEqual([]);
        expect(parsed.server).toEqual([
            {
                name: 'onChatMessage',
                type: {
                    kind: 'function',
                    parameters: [{ kind: 'string' }, { kind: 'named', name: 'Element' }],
                    parameterNames: ['theMessage', 'theElement'],
                    returnType: { kind: 'void' },
                    minimumArguments: 2,
                    isVariadic: false,
                },
            },
        ]);
    });

    it('keeps a bracketed trailing parameter out of the minimum argument count', () => {
        const parsed = parseWikiEvents([eventPage('onClientPlayerDamage', 'Client', luaBlock('element attacker, int bodypart [, float loss ]'))], CONTEXT);

        expect(parsed.client[0]?.type.parameterNames).toEqual(['attacker', 'bodypart', 'loss']);
        expect(parsed.client[0]?.type.minimumArguments).toBe(2);
    });

    it('accepts the wordings a page uses to declare that it carries no parameters', () => {
        const pages = [
            eventPage('onPlayerJoin', 'Server', 'No parameters.'),
            eventPage('onClientRender', 'Client', "''None''"),
            eventPage('onClientVehicleExplode', 'Client', 'This event has no parameters.'),
        ];
        const parsed = parseWikiEvents(pages, CONTEXT);

        expect(parsed.unparsed).toEqual([]);
        expect([...parsed.server, ...parsed.client].map((event) => event.type.parameters)).toEqual([[], [], []]);
    });

    it('reports a page whose parameter section carries neither a list nor a no-parameter notice', () => {
        const parsed = parseWikiEvents([eventPage('onPlayerChangesProtectedData2', 'Server', "*'''element''': The affected element.")], CONTEXT);

        expect(parsed.unparsed).toEqual(['onPlayerChangesProtectedData2']);
        expect(parsed.server).toEqual([]);
    });

    it('takes the declared signature of a page the wiki writes without a parameter block', () => {
        const parsed = parseWikiEvents([eventPage('onPlayerTriggerEventThreshold', 'Server', "{{New feature/item|3.0161|1.6.0|23281|'''eventName:''' the name.}}")], CONTEXT);

        expect(parsed.overridden).toEqual(['onPlayerTriggerEventThreshold']);
        expect(parsed.redundantOverrides).toEqual([]);
        expect(parsed.server[0]?.type.parameterNames).toEqual(['eventName']);
    });

    it('reports a hand-written signature the wiki page has caught up with', () => {
        const parsed = parseWikiEvents([eventPage('onPlayerTriggerEventThreshold', 'Server', luaBlock('string eventName'))], CONTEXT);

        expect(parsed.redundantOverrides).toEqual(['onPlayerTriggerEventThreshold']);
    });
});
