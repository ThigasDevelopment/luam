import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Environment } from '@compiler/environment/environment';
import type { ApiEnvironment } from '@mta-types/api-declaration';

import type { Type } from './types';

export interface MemberInfo {
    name: string;
    type: Type;
    isMethod: boolean;
    position: SourcePosition;
    environment?: ApiEnvironment;
    procedural?: string;
    readOnly?: boolean;
    deprecated?: boolean;
}

export interface ClassInfo {
    name: string;
    typeParameters: readonly string[];
    interfaceArguments: readonly (readonly Type[])[];
    typeConstraints: readonly (Type | null)[];
    superClass: string | null;
    hasUnresolvedParent?: boolean;
    superArguments: readonly Type[];
    interfaces: string[];
    members: Map<string, MemberInfo>;
    statics: Map<string, MemberInfo>;
    position: SourcePosition;
}

export interface InterfaceInfo {
    name: string;
    typeParameters: readonly string[];
    typeConstraints: readonly (Type | null)[];
    superInterfaces: string[];
    members: Map<string, MemberInfo>;
    position: SourcePosition;
}

export interface AliasInfo {
    name: string;
    typeParameters: readonly string[];
    type: Type;
    position: SourcePosition;
}

export interface EnumInfo {
    name: string;
    members: string[];
    isLocal?: boolean;
    position: SourcePosition;
}

export interface GlobalInfo {
    name: string;
    type: Type;
    isDeclared?: boolean;
    position: SourcePosition;
}

export interface EventParameterInfo {
    name: string;
    type: Type;
    isVariadic: boolean;
    position: SourcePosition;
}

export interface EventInfo {
    name: string;
    parameters: readonly EventParameterInfo[];
    environment: Environment;
    position: SourcePosition;
}

export class DeclarationRegistry {
    private readonly classes = new Map<string, ClassInfo>();

    private readonly interfaces = new Map<string, InterfaceInfo>();

    private readonly enums = new Map<string, EnumInfo>();

    private readonly aliases = new Map<string, AliasInfo>();

    private readonly globals = new Map<string, GlobalInfo>();

    private readonly events = new Map<string, EventInfo>();

    declareGlobal(info: GlobalInfo): void {
        this.globals.set(info.name, info);
    }

    lookupGlobal(name: string): GlobalInfo | null {
        return this.globals.get(name) ?? null;
    }

    allGlobals(): GlobalInfo[] {
        return [...this.globals.values()];
    }

    declareEvent(info: EventInfo): void {
        this.events.set(info.name, info);
    }

    lookupEvent(name: string): EventInfo | null {
        return this.events.get(name) ?? null;
    }

    allEvents(): EventInfo[] {
        return [...this.events.values()];
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

    declareAlias(info: AliasInfo): void {
        this.aliases.set(info.name, info);
    }

    lookupAlias(name: string): AliasInfo | null {
        return this.aliases.get(name) ?? null;
    }

    allAliases(): AliasInfo[] {
        return [...this.aliases.values()];
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

    lookupMemberOwner(name: string, member: string): string | null {
        const visited = new Set<string>();

        let current = this.lookupClass(name);

        while (current !== null && !visited.has(current.name)) {
            if (current.members.has(member)) {
                return current.name;
            }

            visited.add(current.name);

            current = current.superClass === null ? null : this.lookupClass(current.superClass);
        }

        return null;
    }

    lookupStaticMember(name: string, member: string): MemberInfo | null {
        const visited = new Set<string>();

        let current = this.lookupClass(name);

        while (current !== null && !visited.has(current.name)) {
            const found = current.statics.get(member);

            if (found !== undefined) {
                return found;
            }

            visited.add(current.name);

            current = current.superClass === null ? null : this.lookupClass(current.superClass);
        }

        return null;
    }

    collectStatics(name: string): MemberInfo[] {
        const collected = new Map<string, MemberInfo>();
        const visited = new Set<string>();

        let current = this.lookupClass(name);

        while (current !== null && !visited.has(current.name)) {
            for (const [member, info] of current.statics) {
                if (!collected.has(member)) {
                    collected.set(member, info);
                }
            }

            visited.add(current.name);

            current = current.superClass === null ? null : this.lookupClass(current.superClass);
        }

        return [...collected.values()];
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
