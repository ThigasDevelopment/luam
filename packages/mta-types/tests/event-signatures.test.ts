import { describe, expect, it } from 'vitest';

import { eventHandler } from '@mta-types/event-lookup';
import { MTA_EVENT_SIGNATURES } from '@mta-types/generated/events/mta-event-signatures';
import { MTA_EVENTS } from '@mta-types/generated/mta-events';

describe('event signatures', () => {
    it('provides exactly one signature for every built-in event', () => {
        expect(Object.keys(MTA_EVENT_SIGNATURES.server)).toHaveLength(79);
        expect(Object.keys(MTA_EVENT_SIGNATURES.client)).toHaveLength(124);
        expect(Object.keys(MTA_EVENT_SIGNATURES.shared)).toHaveLength(0);
        expect(MTA_EVENTS.server.every((name) => eventHandler(name, 'server') !== null)).toBe(true);
        expect(MTA_EVENTS.client.every((name) => eventHandler(name, 'client') !== null)).toBe(true);
    });

    it('looks up the exact onPlayerQuit handler only in its environment', () => {
        expect(eventHandler('onPlayerQuit', 'server')).toEqual({
            kind: 'function',
            parameters: [{ kind: 'string' }, { kind: 'string' }, { kind: 'named', name: 'Element' }],
            parameterNames: ['quitType', 'reason', 'responsibleElement'],
            returnType: { kind: 'void' },
            minimumArguments: 3,
            isVariadic: false,
        });
        expect(eventHandler('onPlayerQuit', 'client')).toBeNull();
        expect(eventHandler('onCustomResourceEvent', 'server')).toBeNull();
    });

    it('keeps the optional client player damage argument in the signature', () => {
        const handler = eventHandler('onClientPlayerDamage', 'client');

        expect(handler?.parameters).toEqual([
            { kind: 'named', name: 'Element' },
            { kind: 'number' },
            { kind: 'number' },
            { kind: 'number' },
        ]);
        expect(handler?.parameterNames).toEqual(['attacker', 'damage_causing', 'bodypart', 'loss']);
        expect(handler?.minimumArguments).toBe(3);
    });
});
