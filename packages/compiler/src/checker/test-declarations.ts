import type { ApiDeclaration } from '@mta-types/api-declaration';
import { ANY, arrayOf, fn, optionalOf, record, STRING, TABLE, VOID, type RecordMember, type TypeDescriptor } from '@mta-types/type-descriptor';

export const TEST_ORIGIN = 'luam:test';

const CALLBACK: TypeDescriptor = fn([], VOID);

const EXPECTATION_MEMBERS: RecordMember[] = [
    { name: 'toBe', type: fn([ANY], VOID, 1, false, ['expected']) },
    { name: 'toBeFalsy', type: fn([], VOID) },
    { name: 'toBeNil', type: fn([], VOID) },
    { name: 'toBeTruthy', type: fn([], VOID) },
    { name: 'toContain', type: fn([ANY], VOID, 1, false, ['value']) },
    { name: 'toEqual', type: fn([ANY], VOID, 1, false, ['expected']) },
    { name: 'toNotBe', type: fn([ANY], VOID, 1, false, ['expected']) },
    { name: 'toNotEqual', type: fn([ANY], VOID, 1, false, ['expected']) },
    { name: 'toThrow', type: fn([optionalOf(STRING)], VOID, 0, false, ['message']) },
];

const STUB_MEMBERS: RecordMember[] = [
    { name: 'calls', type: fn([STRING], arrayOf(TABLE), 1, false, ['name']) },
    { name: 'reset', type: fn([], VOID) },
    { name: 'returns', type: fn([STRING, ANY], VOID, 2, false, ['name', 'value']) },
    { name: 'stub', type: fn([STRING, ANY], VOID, 2, false, ['name', 'implementation']) },
];

export const EXPECTATION_TYPE: TypeDescriptor = record('Expectation', EXPECTATION_MEMBERS, TEST_ORIGIN);

export const MTA_STUBS_TYPE: TypeDescriptor = record('MtaStubs', STUB_MEMBERS, TEST_ORIGIN);

export const TEST_GLOBAL_NAMES: readonly string[] = ['afterEach', 'beforeEach', 'describe', 'expect', 'mta', 'test'];

export const TEST_DECLARATIONS: readonly ApiDeclaration[] = [
    { name: 'afterEach', environment: 'shared', source: 'extension', type: fn([CALLBACK], VOID, 1, false, ['body']) },
    { name: 'beforeEach', environment: 'shared', source: 'extension', type: fn([CALLBACK], VOID, 1, false, ['body']) },
    { name: 'describe', environment: 'shared', source: 'extension', type: fn([STRING, CALLBACK], VOID, 2, false, ['name', 'body']) },
    { name: 'expect', environment: 'shared', source: 'extension', type: fn([ANY], EXPECTATION_TYPE, 1, false, ['value']) },
    { name: 'mta', environment: 'shared', source: 'extension', type: MTA_STUBS_TYPE },
    { name: 'test', environment: 'shared', source: 'extension', type: fn([STRING, CALLBACK], VOID, 2, false, ['name', 'body']) },
];
