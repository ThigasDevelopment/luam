import type { CheckContext } from './context';
import { typeToString, type Type } from './types';

const MAX_EXPANSION = 8;

export interface DescriptorResult {
    lua: string | null;
    unreifiable: string | null;
}

const PRIMITIVE_KINDS: Readonly<Record<string, string>> = {
    nil: 'nil',
    boolean: 'boolean',
    number: 'number',
    string: 'string',
    table: 'table',
    thread: 'thread',
    userdata: 'userdata',
    function: 'function',
};

function quote(value: string): string {
    return `'${value.replace(/([\\'])/g, '\\$1').replace(/\n/g, '\\n')}'`;
}

function failed(type: Type): DescriptorResult {
    return { lua: null, unreifiable: typeToString(type) };
}

function entries(parts: readonly string[]): string {
    return `{ ${parts.join(', ')} }`;
}

function combine(parts: readonly DescriptorResult[], render: (values: readonly string[]) => string): DescriptorResult {
    const broken = parts.find((part) => part.lua === null);

    if (broken !== undefined) {
        return broken;
    }

    return { lua: render(parts.map((part) => part.lua as string)), unreifiable: null };
}

function namedDescriptor(context: CheckContext, type: Type, name: string, seen: Set<string>): DescriptorResult {
    if (context.declarations.lookupClass(name) !== null) {
        return { lua: entries([`kind = 'instance'`, `name = ${quote(name)}`]), unreifiable: null };
    }

    if (context.declarations.lookupEnum(name) !== null) {
        return { lua: entries([`kind = 'number'`]), unreifiable: null };
    }

    if (context.declarations.lookupInterface(name) === null || seen.has(name) || seen.size >= MAX_EXPANSION) {
        return failed(type);
    }

    const members = context.declarations.collectMembers(name);
    const nested = new Set([...seen, name]);
    const parts = members.map((member) => describe(context, member.type, nested));

    return combine(parts, (values) => {
        const rendered = members.map((member, index) => entries([`key = ${quote(member.name)}`, `value = ${values[index] ?? ''}`]));

        return entries([`kind = 'record'`, `name = ${quote(name)}`, `members = ${entries(rendered)}`]);
    });
}

export function describe(context: CheckContext, type: Type, seen: Set<string> = new Set()): DescriptorResult {
    const primitive = PRIMITIVE_KINDS[type.kind];

    if (primitive !== undefined) {
        return { lua: entries([`kind = ${quote(primitive)}`]), unreifiable: null };
    }

    if (type.kind === 'string-literal') {
        return { lua: entries([`kind = 'literal'`, `value = ${quote(type.value)}`]), unreifiable: null };
    }

    if (type.kind === 'boolean-literal' || type.kind === 'number-literal') {
        return { lua: entries([`kind = 'literal'`, `value = ${String(type.value)}`]), unreifiable: null };
    }

    if (type.kind === 'optional') {
        return combine([describe(context, type.element, seen)], (values) => entries([`kind = 'optional'`, `element = ${values[0] ?? ''}`]));
    }

    if (type.kind === 'array') {
        return combine([describe(context, type.element, seen)], (values) => entries([`kind = 'array'`, `element = ${values[0] ?? ''}`]));
    }

    if (type.kind === 'map') {
        return combine([describe(context, type.key, seen), describe(context, type.value, seen)], (values) =>
            entries([`kind = 'map'`, `key = ${values[0] ?? ''}`, `value = ${values[1] ?? ''}`]),
        );
    }

    if (type.kind === 'union') {
        return combine(
            type.options.map((option) => describe(context, option, seen)),
            (values) => entries([`kind = 'union'`, `options = ${entries(values)}`]),
        );
    }

    if (type.kind === 'record') {
        const members = [...type.members];
        const parts = members.map(([, member]) => describe(context, member, seen));

        return combine(parts, (values) => {
            const rendered = members.map(([key], index) => entries([`key = ${quote(key)}`, `value = ${values[index] ?? ''}`]));

            return entries([`kind = 'record'`, `name = ${quote(type.name)}`, `members = ${entries(rendered)}`]);
        });
    }

    if (type.kind === 'named') {
        return namedDescriptor(context, type, type.name, seen);
    }

    return failed(type);
}

export function classDescriptor(context: CheckContext, className: string, fields: readonly { name: string; type: Type }[]): DescriptorResult {
    const parts = fields.map((field) => describe(context, field.type));

    return combine(parts, (values) => {
        const rendered = fields.map((field, index) => entries([`key = ${quote(field.name)}`, `value = ${values[index] ?? ''}`]));

        return entries([`kind = 'record'`, `name = ${quote(className)}`, `members = ${entries(rendered)}`]);
    });
}
