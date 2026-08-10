import type { ApiCatalog } from './api-declaration';
import { ANY, arrayOf, BOOLEAN, fn, NUMBER, STRING, TABLE, type TypeDescriptor } from './type-descriptor';

export type LibraryName = 'math' | 'string' | 'table';

const MATH_MEMBERS: ApiCatalog = {
    abs: fn([NUMBER], NUMBER, 1),
    ceil: fn([NUMBER], NUMBER, 1),
    clamp: fn([NUMBER, NUMBER, NUMBER], NUMBER, 3),
    floor: fn([NUMBER], NUMBER, 1),
    huge: NUMBER,
    max: fn([NUMBER], NUMBER, 1, true),
    min: fn([NUMBER], NUMBER, 1, true),
    pi: NUMBER,
    random: fn([NUMBER, NUMBER], NUMBER, 0),
    round: fn([NUMBER, NUMBER], NUMBER, 1),
    sqrt: fn([NUMBER], NUMBER, 1),
};

const STRING_MEMBERS: ApiCatalog = {
    byte: fn([STRING, NUMBER], NUMBER, 1),
    char: fn([NUMBER], STRING, 1, true),
    endsWith: fn([STRING, STRING], BOOLEAN, 2),
    find: fn([STRING, STRING], ANY, 2, true),
    format: fn([STRING], STRING, 1, true),
    gmatch: fn([STRING, STRING], ANY, 2),
    gsub: fn([STRING, STRING, ANY], ANY, 3, true),
    len: fn([STRING], NUMBER, 1),
    lower: fn([STRING], STRING, 1),
    match: fn([STRING, STRING], ANY, 2, true),
    rep: fn([STRING, NUMBER], STRING, 2),
    reverse: fn([STRING], STRING, 1),
    split: fn([STRING, STRING], arrayOf(STRING), 2),
    startsWith: fn([STRING, STRING], BOOLEAN, 2),
    sub: fn([STRING, NUMBER, NUMBER], STRING, 2),
    template: fn([STRING, TABLE], STRING, 1),
    trim: fn([STRING], STRING, 1),
    upper: fn([STRING], STRING, 1),
};

const TABLE_MEMBERS: ApiCatalog = {
    concat: fn([TABLE, STRING], STRING, 1),
    copy: fn([TABLE, BOOLEAN], TABLE, 1),
    includes: fn([TABLE, ANY], BOOLEAN, 2),
    insert: fn([TABLE, ANY], ANY, 2, true),
    isEmpty: fn([TABLE], BOOLEAN, 1),
    keys: fn([TABLE], TABLE, 1),
    remove: fn([TABLE, NUMBER], ANY, 1),
    size: fn([TABLE], NUMBER, 1),
    sort: fn([TABLE, ANY], ANY, 1),
    values: fn([TABLE], TABLE, 1),
};

export const LIBRARY_MEMBERS: Readonly<Record<LibraryName, ApiCatalog>> = {
    math: MATH_MEMBERS,
    string: STRING_MEMBERS,
    table: TABLE_MEMBERS,
};

export function isLibrary(name: string): name is LibraryName {
    return name === 'math' || name === 'string' || name === 'table';
}

export function findLibraryMember(library: LibraryName, member: string): TypeDescriptor | null {
    return LIBRARY_MEMBERS[library][member] ?? null;
}
