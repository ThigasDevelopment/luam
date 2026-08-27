import type { ClassMember, ClassMethodDeclaration } from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import { typeToString, type Type } from './types';

export interface MetamethodContract {
    name: string;
    parameters: number;
    returns: 'string' | 'boolean' | 'number' | 'any';
    documentation: string;
}

const CONTRACTS: readonly MetamethodContract[] = [
    { name: '__tostring', parameters: 0, returns: 'string', documentation: 'Renders the instance for "tostring" and string coercion.' },
    { name: '__eq', parameters: 1, returns: 'boolean', documentation: 'Compares two instances of the same class with "==".' },
    { name: '__lt', parameters: 1, returns: 'boolean', documentation: 'Orders two instances with "<" and ">".' },
    { name: '__le', parameters: 1, returns: 'boolean', documentation: 'Orders two instances with "<=" and ">=".' },
    { name: '__len', parameters: 0, returns: 'number', documentation: 'Answers the length operator "#".' },
    { name: '__concat', parameters: 1, returns: 'any', documentation: 'Answers the concatenation operator "..".' },
    { name: '__unm', parameters: 0, returns: 'any', documentation: 'Answers unary minus.' },
    { name: '__add', parameters: 1, returns: 'any', documentation: 'Answers "+".' },
    { name: '__sub', parameters: 1, returns: 'any', documentation: 'Answers "-".' },
    { name: '__mul', parameters: 1, returns: 'any', documentation: 'Answers "*".' },
    { name: '__div', parameters: 1, returns: 'any', documentation: 'Answers "/".' },
    { name: '__mod', parameters: 1, returns: 'any', documentation: 'Answers "%".' },
    { name: '__pow', parameters: 1, returns: 'any', documentation: 'Answers "^".' },
];

const BLOCKED: Readonly<Record<string, string>> = {
    __index: 'it replaces member lookup, which the class helper owns',
    __newindex: 'it swallows a field write, which the class helper owns',
    __call: 'it makes an instance callable, which hides construction',
    __gc: 'Lua 5.1 does not run it for a table',
    __metatable: 'it hides the metatable the class helper needs',
    __mode: 'it turns instances into weak references the class helper cannot track',
};

export const METAMETHOD_CONTRACTS: ReadonlyMap<string, MetamethodContract> = new Map(CONTRACTS.map((contract) => [contract.name, contract]));

export function isMetamethodName(name: string): boolean {
    return name.startsWith('__');
}

export function isAllowedMetamethod(name: string): boolean {
    return METAMETHOD_CONTRACTS.has(name);
}

export function isMetamethodMember(member: ClassMember): boolean {
    return member.kind === 'class-method' && !member.isStatic && isAllowedMetamethod(member.name);
}

function reportReturn(context: CheckContext, className: string, contract: MetamethodContract, type: Type, member: ClassMethodDeclaration): void {
    if (contract.returns === 'any' || type.kind === 'any' || type.kind === contract.returns) {
        return;
    }

    const message = `Metamethod "${contract.name}" of class "${className}" must return "${contract.returns}" but returns "${typeToString(type)}".`;

    context.report('check-invalid-metamethod', message, member.position);
}

export function checkMetamethod(context: CheckContext, className: string, member: ClassMethodDeclaration, type: Type): void {
    const contract = METAMETHOD_CONTRACTS.get(member.name);

    if (contract === undefined || type.kind !== 'function') {
        return;
    }

    if (type.parameters.length !== contract.parameters) {
        const expected = contract.parameters === 1 ? '1 parameter' : `${contract.parameters} parameters`;
        const message = `Metamethod "${contract.name}" of class "${className}" takes ${expected} beside "self" but declares ${type.parameters.length}.`;

        context.report('check-invalid-metamethod', message, member.position);
    }

    reportReturn(context, className, contract, type.returnType, member);
}

export function reportRejectedMetamethod(context: CheckContext, className: string, member: ClassMember): void {
    if (member.kind !== 'class-method' || !isMetamethodName(member.name) || isAllowedMetamethod(member.name)) {
        return;
    }

    const blocked = BLOCKED[member.name];

    if (blocked !== undefined) {
        context.report('check-blocked-metamethod', `Metamethod "${member.name}" cannot be declared on class "${className}" because ${blocked}.`, member.position);

        return;
    }

    const known = [...METAMETHOD_CONTRACTS.keys()].map((name) => `"${name}"`).join(', ');
    const message = `"${member.name}" is not a metamethod Luam exposes on class "${className}". Declared metamethods are ${known}.`;

    context.report('check-blocked-metamethod', message, member.position);
}
