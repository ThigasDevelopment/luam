import { describe, expect, it } from 'vitest';

import { eventDocumentation, findEventDocumentation } from '#mta-types/event-documentation-lookup';
import { wikiEventDocumentation } from '@generator/event-documentation-parser';

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
        const documentation = wikiEventDocumentation('OnVehicleEnter', PAGE);

        expect(documentation.summary).toBe('This event is triggered when a player or ped enters a vehicle.');
        expect(documentation.parameters).toEqual([
            { name: 'thePed', isOptional: false, isVariadic: false, summary: 'a player or ped element who is entering the vehicle.' },
            { name: 'seat', isOptional: false, isVariadic: false, summary: 'an int representing the seat. Seat 0 is the driver.' },
        ]);
        expect(documentation.source).toBe('The source of this event is the vehicle that was entered.');
        expect(documentation.cancel).toBe('If this event is canceled, the ped will not enter.');
        expect(documentation.wiki).toBe('https://wiki.multitheftauto.com/wiki/OnVehicleEnter');
    });

    it('serves the generated catalog for every built-in event side', () => {
        expect(findEventDocumentation('onPlayerJoin')?.summary).toContain('triggered when a player joins the server');
        expect(findEventDocumentation('onClientKey')?.cancel).toContain('bound to the canceled key');
        expect(findEventDocumentation('onNeverDeclared')).toBeNull();
        expect(eventDocumentation('onNeverDeclared')).toEqual({ summary: '', parameters: [], source: '', cancel: '', wiki: '' });
    });
});
