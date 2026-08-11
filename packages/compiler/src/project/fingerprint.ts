import type { AmbientDeclarations } from '@compiler/checker/ambient';
import type { ClassInfo, EnumInfo, GlobalInfo, InterfaceInfo, MemberInfo } from '@compiler/checker/registry';
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

export function fingerprintDeclarations(declarations: AmbientDeclarations): string {
    const classes = declarations.classes.map(classText);
    const interfaces = declarations.interfaces.map(interfaceText);
    const enums = declarations.enums.map(enumText);
    const globals = declarations.globals.map(globalText);

    return hashString([...classes, ...interfaces, ...enums, ...globals].sort(compareText).join(';'));
}
