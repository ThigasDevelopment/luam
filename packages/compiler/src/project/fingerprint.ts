import { EVENT_NAME_PREFIX, type AmbientDeclarations } from '@compiler/checker/ambient';
import type { ClassInfo, EnumInfo, EventInfo, GlobalInfo, InterfaceInfo, MemberInfo } from '@compiler/checker/registry';
import { typeToString } from '@compiler/checker/types';

const OFFSET_BASIS_LOW = 0x811c9dc5;

const OFFSET_BASIS_HIGH = 0x01000193;

const PRIME_LOW = 16777619;

const PRIME_HIGH = 2166136261;

function fold(value: string, basis: number, prime: number): number {
    let hash = basis;

    for (let index = 0; index < value.length; index += 1) {
        hash = Math.imul(hash ^ value.charCodeAt(index), prime);
    }

    return hash >>> 0;
}

function pad(value: number): string {
    return value.toString(16).padStart(8, '0');
}

export function hashString(value: string): string {
    return `${pad(fold(value, OFFSET_BASIS_LOW, PRIME_LOW))}${pad(fold(value, OFFSET_BASIS_HIGH, PRIME_HIGH))}${value.length.toString(36)}`;
}

function compareText(left: string, right: string): number {
    if (left === right) {
        return 0;
    }

    return left < right ? -1 : 1;
}

function memberText(member: MemberInfo): string {
    return `${member.name}${member.isMethod ? '()' : ''}:${typeToString(member.type)}`;
}

function membersText(members: ReadonlyMap<string, MemberInfo>): string {
    return [...members.values()].map(memberText).sort(compareText).join(',');
}

function classText(info: ClassInfo): string {
    return `class ${info.name}:${info.superClass ?? ''}:${[...info.interfaces].sort(compareText).join(',')}{${membersText(info.members)}}`;
}

function interfaceText(info: InterfaceInfo): string {
    return `interface ${info.name}:${[...info.superInterfaces].sort(compareText).join(',')}{${membersText(info.members)}}`;
}

function enumText(info: EnumInfo): string {
    return `enum ${info.name}{${info.members.join(',')}}`;
}

function globalText(info: GlobalInfo): string {
    return `declare ${info.name}:${typeToString(info.type)}`;
}

function eventText(info: EventInfo): string {
    const parameters = info.parameters.map((parameter) => `${parameter.isVariadic ? '...' : ''}${parameter.name}:${typeToString(parameter.type)}`).join(',');

    return `event ${info.environment} ${info.name}(${parameters})`;
}

export function fingerprintDeclarations(declarations: AmbientDeclarations): string {
    const classes = declarations.classes.map(classText);
    const interfaces = declarations.interfaces.map(interfaceText);
    const enums = declarations.enums.map(enumText);
    const globals = declarations.globals.map(globalText);
    const events = declarations.events.map(eventText);

    return hashString([...classes, ...interfaces, ...enums, ...globals, ...events].sort(compareText).join(';'));
}

function appendText(entries: Map<string, string>, name: string, text: string): void {
    const existing = entries.get(name);

    entries.set(name, existing === undefined ? text : `${existing}|${text}`);
}

export function fingerprintByName(declarations: AmbientDeclarations): Map<string, string> {
    const entries = new Map<string, string>();

    for (const info of declarations.classes) {
        appendText(entries, info.name, classText(info));
    }

    for (const info of declarations.interfaces) {
        appendText(entries, info.name, interfaceText(info));
    }

    for (const info of declarations.enums) {
        appendText(entries, info.name, enumText(info));
    }

    for (const info of declarations.globals) {
        appendText(entries, info.name, globalText(info));
    }

    for (const info of declarations.events) {
        appendText(entries, `${EVENT_NAME_PREFIX}${info.name}`, eventText(info));
    }

    return new Map([...entries].map(([name, text]) => [name, hashString(text)]));
}
