import { describe, expect, it } from 'vitest';

import { normalize } from '@generator/catalog-normalizer';
import { parseUpstream } from '@generator/upstream-catalog';
import { parseSignature } from '@generator/wiki-signature';
import { parseWikiCatalog } from '@generator/wiki-declaration-parser';
import { ARITY_DISAGREEMENTS, MINIMUM_PARSE_RATE, MINIMUM_REQUIRED_ARITY_AGREEMENT, MINIMUM_TOTAL_ARITY_AGREEMENT } from '@generator/wiki-parse-classification';
import { formatParseReport, reportParseAccuracy } from '@generator/wiki-parse-report';
import { parseOopTemplate, parsePageFlags } from '@generator/wiki-templates';
import { wikiDocumentation } from '@generator/wiki-documentation';
import { readSnapshot } from '@generator/wiki-snapshot';
import { syntaxBlocks } from '@generator/wiki-syntax';
import { mapWikiReturn, mapWikiType } from '@generator/wiki-type-mapper';

import { fn, named, NUMBER, STRING, tupleOf, unionOf, type TypeDescriptor } from '@mta-types/type-descriptor';

const SNAPSHOT = readSnapshot();

const UPSTREAM = parseUpstream();

const FROZEN = normalize(UPSTREAM.server, UPSTREAM.client);

const CONTEXT = { elementTypes: UPSTREAM.contexts.server.elementTypes };

const PARSED = parseWikiCatalog(SNAPSHOT, CONTEXT);

const MERGED = normalize(PARSED.server, PARSED.client);

const TYPES: ReadonlyMap<string, TypeDescriptor> = new Map([...MERGED.shared, ...MERGED.server, ...MERGED.client].map((entry) => [entry.name, entry.type]));

const BASELINE: ReadonlyMap<string, TypeDescriptor> = new Map([...FROZEN.shared, ...FROZEN.server, ...FROZEN.client].map((entry) => [entry.name, entry.type]));

const REPORT = reportParseAccuracy(PARSED, SNAPSHOT.pages.length, TYPES, BASELINE);

describe('wiki signature parser', () => {
    it('reads only the Syntax section', () => {
        const outputChatBox = SNAPSHOT.pages.find((page) => page.name === 'outputChatBox');
        const blocks = syntaxBlocks(outputChatBox?.text ?? '', 'outputChatBox');

        expect(outputChatBox?.text).toContain('#FF0000Hello');
        expect(blocks.every((block) => block.source.startsWith('bool outputChatBox'))).toBe(true);
    });

    it('reads a per-side block whatever order the section attributes carry', () => {
        const target = SNAPSHOT.pages.find((page) => page.name === 'getCameraTarget');
        const blocks = syntaxBlocks(target?.text ?? '', 'getCameraTarget');

        expect(blocks.map((block) => block.environment)).toEqual(['server', 'client']);
    });

    it('joins a signature that wraps across lines', () => {
        const animation = SNAPSHOT.pages.find((page) => page.name === 'setPedAnimation');
        const signature = parseSignature(syntaxBlocks(animation?.text ?? '', 'setPedAnimation')[0]?.source ?? '', 'setPedAnimation');

        expect(signature?.parameters.length).toBe(10);
        expect(signature?.minimumArguments).toBe(1);
    });

    it('reads both optional notations the wiki uses', () => {
        const trailing = parseSignature('bool f ( int a [, int b, int c ] )', 'f');
        const leading = parseSignature('bool f ( int a, [ int b, int c ] )', 'f');
        const prefix = parseSignature('bool f ( [ int a, ] int b )', 'f');

        expect(trailing).toEqual(leading);
        expect(trailing?.minimumArguments).toBe(1);
        expect(prefix?.parameters.map((parameter) => parameter.isOptional)).toEqual([true, false]);
    });

    it('reads a variadic tail without counting it as a parameter', () => {
        expect(parseSignature('bool f ( string a, element b, [ var argument1, ... ] )', 'f')?.parameters.length).toBe(2);
        expect(parseSignature('timer f ( function a, int b [, var arguments... ] )', 'f')?.isVariadic).toBe(true);
        expect(parseSignature('bool f ( string a, table vertex1 [, table vertex2, ...] )', 'f')?.parameters.length).toBe(3);
    });

    it('maps the scalar and element spellings', () => {
        expect(mapWikiType('int', CONTEXT)).toEqual({ kind: 'number' });
        expect(mapWikiType('bool', CONTEXT)).toEqual({ kind: 'boolean' });
        expect(mapWikiType('var', CONTEXT)).toEqual({ kind: 'any' });
        expect(mapWikiType('gui-element', CONTEXT)).toEqual({ kind: 'named', name: 'GuiElement' });
        expect(mapWikiType('int/string', CONTEXT)).toEqual({ kind: 'union', options: [{ kind: 'number' }, { kind: 'string' }] });
    });

    it('reads a union whose sides each name their own parameter', () => {
        const both = unionOf([NUMBER, STRING]);

        expect(mapWikiType('int weaponID/string', CONTEXT)).toEqual(both);
        expect(mapWikiType('string filepath / string', CONTEXT)).toEqual({ kind: 'string' });
        expect(TYPES.get('getWeaponProperty')).toEqual(fn([both, STRING, STRING], NUMBER, 3));
    });

    it('reads a parameter whose type spells the callback out', () => {
        const parsed = parseSignature('svg f ( int width, int height [, string pathOrRawData, function callback ( element svg ) ] )', 'f');

        expect(parsed?.parameters.map((parameter) => parameter.type)).toEqual(['int', 'int', 'string', 'function']);
        expect(parsed?.parameters.map((parameter) => parameter.name)).toEqual(['width', 'height', 'pathOrRawData', 'callback']);
    });

    it('reads a bracketed multi-return head as a tuple of real types', () => {
        expect(parseSignature('int, int [, int] f ( element material )', 'f')?.returns).toEqual(['int', 'int', 'int']);
        expect(TYPES.get('dxGetMaterialSize')).toEqual(fn([named('Element')], tupleOf([NUMBER, NUMBER, NUMBER]), 1));
    });

    it('reads a multi-return head as a tuple', () => {
        expect(mapWikiReturn(['float', 'float', 'float'], CONTEXT)).toEqual({ kind: 'tuple', elements: [{ kind: 'number' }, { kind: 'number' }, { kind: 'number' }] });
        expect(TYPES.get('getElementPosition')).toEqual(BASELINE.get('getElementPosition'));
    });

    it('reads the prose without leaving wiki markup or repeating a per-side section', () => {
        const serial = SNAPSHOT.pages.find((page) => page.name === 'getPlayerSerial');
        const documentation = wikiDocumentation('GetPlayerSerial', serial?.text ?? '', [], false);
        const position = wikiDocumentation('GetElementPosition', SNAPSHOT.pages.find((page) => page.name === 'getElementPosition')?.text ?? '', [], false);

        expect(serial?.text.match(/^=+\s*Returns/gim)?.length).toBe(2);
        expect(documentation.returns).toBe('Returns the serial as a *string* if it was found, *false* otherwise.');
        expect(position.returns).not.toContain("''");
        expect(position.summary).not.toContain("''");
    });

    it('reads the OOP template into the surface model', () => {
        const position = parseOopTemplate('{{OOP||[[element]]:getPosition|position|setElementPosition}}');
        const statik = parseOopTemplate('{{OOP|note|[[aclgroup|ACLGroup]].get||}}');

        expect(position).toEqual({ className: 'element', member: 'getPosition', isStatic: false, property: 'position', counterpart: 'setElementPosition', note: '' });
        expect(statik?.isStatic).toBe(true);
        expect(statik?.className).toBe('ACLGroup');
    });

    it('reads the release and the review flags a page carries', () => {
        expect(parsePageFlags('{{New feature/item|3.0158|1.5.7|20397|added}}{{New feature/item|3.0160|1.6.0|1|later}}').since).toBe('1.6.0');
        expect(parsePageFlags('{{Deprecated}}').isDeprecated).toBe(true);
        expect(parsePageFlags('{{Needs_Checking|why}}').needsChecking).toBe(true);
        expect(PARSED.surfaces.filter((surface) => surface.oop !== null).length).toBeGreaterThan(800);
        expect(PARSED.surfaces.filter((surface) => surface.flags.since !== null).length).toBeGreaterThan(350);
    });

    it('parses every page and lists the reason for any it cannot', () => {
        expect(REPORT.unparsed).toEqual([]);
        expect(REPORT.parseRate).toBeGreaterThanOrEqual(MINIMUM_PARSE_RATE);
    });

    it('holds the measured arity agreement against the frozen catalog', () => {
        expect(REPORT.totalArityAgreement).toBeGreaterThanOrEqual(MINIMUM_TOTAL_ARITY_AGREEMENT);
        expect(REPORT.requiredArityAgreement).toBeGreaterThanOrEqual(MINIMUM_REQUIRED_ARITY_AGREEMENT);
        expect(formatParseReport(REPORT)).toContain('arity agreement over');
    });

    it('classifies every disagreement and carries no classification that no longer applies', () => {
        expect(REPORT.unclassified).toEqual([]);
        expect(REPORT.staleClassifications).toEqual([]);
        expect(ARITY_DISAGREEMENTS.every((entry) => entry.note.length > 20)).toBe(true);
    });

    it('names every disagreement that can reject code compiling today', () => {
        expect(REPORT.narrowing).toEqual(['addBan', 'createLight', 'dxCreateTexture', 'dxDrawText', 'engineRestoreObjectGroupPhysicalProperties', 'fetchRemote']);
    });

    it('is pure: the same snapshot yields the same model', () => {
        const again = parseWikiCatalog(SNAPSHOT, CONTEXT);

        expect(JSON.stringify(again.server)).toBe(JSON.stringify(PARSED.server));
        expect(JSON.stringify(again.client)).toBe(JSON.stringify(PARSED.client));
    });
});
