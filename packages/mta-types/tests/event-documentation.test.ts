import { describe, expect, it } from 'vitest';

import { eventDocumentation, findEventDocumentation } from '#mta-types/event-documentation-lookup';
import { eventHandler } from '#mta-types/event-lookup';
import { MTA_EVENTS } from '#mta-types/generated/mta-events';
import { wikiEventDocumentation } from '@generator/event-documentation-parser';

const EVENT_NAMES = [...MTA_EVENTS.shared, ...MTA_EVENTS.server, ...MTA_EVENTS.client];

const PAGE = [
    '__NOTOC__',
    '{{Server event}}',
    'This event is triggered when a player or ped enters a vehicle.',
    '',
    '==Parameters==',
    '<syntaxhighlight lang="lua">',
    'ped thePed, int seat',
    '</syntaxhighlight>',
    "*'''thePed''': a [[player]] or [[ped]] element who is entering the [[vehicle]].",
    "*'''seat''': an [[int]] representing the seat. Seat 0 is the driver.",
    '',
    '==Source==',
    'The [[event system#Event source|source]] of this event is the [[vehicle]] that was entered.',
    '',
    '==Cancel effect==',
    '{{New items|5620|1.4|',
    'If this event is [[Event system#Canceling|canceled]], the ped will not enter.',
    '}}',
].join('\n');

describe('wiki event documentation', () => {
    it('reads the summary, parameters, source, and cancel effect of an event page', () => {
        const documentation = wikiEventDocumentation('OnVehicleEnter', PAGE, ['thePed', 'seat']);

        expect(documentation.summary).toBe('This event is triggered when a player or ped enters a vehicle.');
        expect(documentation.parameters).toEqual([
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'a player or ped element who is entering the vehicle.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'an int representing the seat. Seat 0 is the driver.' },
        ]);
        expect(documentation.source).toBe('The source of this event is the vehicle that was entered.');
        expect(documentation.cancel).toBe('If this event is canceled, the ped will not enter.');
        expect(documentation.wiki).toBe('https://wiki.multitheftauto.com/wiki/OnVehicleEnter');
    });

    it('summarizes every built-in event, including the ones the wiki wraps in a version template', () => {
        const unexplained = EVENT_NAMES.filter((name) => eventDocumentation(name).summary.length === 0);

        expect(unexplained).toEqual([]);
        expect(eventDocumentation('onPedVehicleEnter').summary).toBe('This event is triggered when a ped enters a vehicle.');
    });

    it('documents the parameters the handler signature declares, in order', () => {
        const drifted: string[] = [];

        for (const environment of ['server', 'client'] as const) {
            for (const name of MTA_EVENTS[environment]) {
                const signature = eventHandler(name, environment)?.parameterNames ?? [];
                const documented = eventDocumentation(name).parameters.map((parameter) => parameter.name);

                if (signature.join() !== documented.join()) {
                    drifted.push(`${name}: ${signature.join()} vs ${documented.join()}`);
                }
            }
        }

        expect(drifted).toEqual([]);
    });

    it('documents every parameter the wiki page lists', () => {
        expect(eventDocumentation('onPlayerWasted').parameters.map((parameter) => parameter.name)).toEqual([
            'totalAmmo',
            'killer',
            'killerWeapon',
            'bodypart',
            'stealth',
            'animGroup',
            'animID',
        ]);
        expect(eventDocumentation('onDebugMessage').parameters.map((parameter) => parameter.name)).toEqual(['message', 'level', 'file', 'line', 'r', 'g', 'b']);
    });

    it('links every built-in event to its wiki page', () => {
        const unlinked = EVENT_NAMES.filter((name) => !eventDocumentation(name).wiki.startsWith('https://wiki.multitheftauto.com/wiki/'));

        expect(unlinked).toEqual([]);
    });

    it('serves the generated catalog for every built-in event side', () => {
        expect(findEventDocumentation('onPlayerJoin')?.summary).toContain('triggered when a player joins the server');
        expect(findEventDocumentation('onClientKey')?.cancel).toContain('bound to the canceled key');
        expect(findEventDocumentation('onNeverDeclared')).toBeNull();
        expect(eventDocumentation('onNeverDeclared')).toEqual({ summary: '', parameters: [], source: '', cancel: '', wiki: '' });
    });
});
