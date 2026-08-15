import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { ApiEnvironment } from '@mta-types/api-declaration';

import type { Type } from './types';

export interface MemberInfo {
    name: string;
    type: Type;
    isMethod: boolean;
    position: SourcePosition;
    environment?: ApiEnvironment;
    procedural?: string;
}

export interface ClassInfo {
    name: string;
    superClass: string | null;
    interfaces: string[];
    members: Map<string, MemberInfo>;
    position: SourcePosition;
}

export interface InterfaceInfo {
    name: string;
    superInterfaces: string[];
    members: Map<string, MemberInfo>;
    position: SourcePosition;
}

export interface EnumInfo {
    name: string;
    members: string[];
    position: SourcePosition;
}

export interface GlobalInfo {
    name: string;
    type: Type;
    position: SourcePosition;
}

export class DeclarationRegistry {
    private readonly classes = new Map<string, ClassInfo>();

    private readonly interfaces = new Map<string, InterfaceInfo>();

    private readonly enums = new Map<string, EnumInfo>();

    private readonly globals = new Map<string, GlobalInfo>();

    declareGlobal(info: GlobalInfo): void {
        this.globals.set(info.name, info);
    }

    allGlobals(): GlobalInfo[] {
        return [...this.globals.values()];
    }

    declareClass(info: ClassInfo): void {
        this.classes.set(info.name, info);
    }

    lookupClass(name: string): ClassInfo | null {
        return this.classes.get(name) ?? null;
    }

    declareInterface(info: InterfaceInfo): void {
        this.interfaces.set(info.name, info);
    }

    lookupInterface(name: string): InterfaceInfo | null {
        return this.interfaces.get(name) ?? null;
    }

    interfaceExtends(name: string, target: string, visited: Set<string> = new Set()): boolean {
        const current = this.lookupInterface(name);

        if (current === null || visited.has(name)) {
            return false;
        }

        visited.add(name);

        return current.superInterfaces.some((parent) => parent === target || this.interfaceExtends(parent, target, visited));
    }

    declareEnum(info: EnumInfo): void {
        this.enums.set(info.name, info);
    }

    lookupEnum(name: string): EnumInfo | null {
        return this.enums.get(name) ?? null;
    }

    allClasses(): ClassInfo[] {
        return [...this.classes.values()];
    }

    allInterfaces(): InterfaceInfo[] {
        return [...this.interfaces.values()];
    }

    allEnums(): EnumInfo[] {
        return [...this.enums.values()];
    }

    private collectInterfaceMembers(name: string, collected: Map<string, MemberInfo>, visited: Set<string>): void {
        const current = this.lookupInterface(name);

        if (current === null || visited.has(current.name)) {
            return;
        }

        visited.add(current.name);

        for (const [memberName, member] of current.members) {
            if (!collected.has(memberName)) {
                collected.set(memberName, member);
            }
        }

        for (const parent of current.superInterfaces) {
            this.collectInterfaceMembers(parent, collected, visited);
        }
    }

    collectInterfaceContract(name: string): MemberInfo[] {
        const collected = new Map<string, MemberInfo>();

        this.collectInterfaceMembers(name, collected, new Set());

        return [...collected.values()];
    }

    collectMembers(name: string): MemberInfo[] {
        const collected = new Map<string, MemberInfo>();
        const visited = new Set<string>();

        let current = this.lookupClass(name);

        while (current !== null && !visited.has(current.name)) {
            for (const [name, member] of current.members) {
                if (!collected.has(name)) {
                    collected.set(name, member);
                }
            }

            visited.add(current.name);

            current = current.superClass === null ? null : this.lookupClass(current.superClass);
        }

        if (current === null && this.lookupClass(name) === null) {
            this.collectInterfaceMembers(name, collected, visited);
        }

        return [...collected.values()];
    }

    lookupClassMember(name: string, member: string, visited: Set<string> = new Set()): MemberInfo | null {
        let current = this.lookupClass(name);

        while (current !== null && !visited.has(current.name)) {
            const found = current.members.get(member);

            if (found !== undefined) {
                return found;
            }

            visited.add(current.name);

            current = current.superClass === null ? null : this.lookupClass(current.superClass);
        }

        return null;
    }

    lookupMember(name: string, member: string): MemberInfo | null {
        const visited = new Set<string>();
        const found = this.lookupClassMember(name, member, visited);

        if (found !== null) {
            return found;
        }

        const collected = new Map<string, MemberInfo>();

        this.collectInterfaceMembers(name, collected, visited);

        return collected.get(member) ?? null;
    }
}
