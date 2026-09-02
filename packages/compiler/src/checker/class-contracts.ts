import type { ClassDeclaration } from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import { parameterSubstitutions } from './generic-class';
import type { ClassInfo, MemberInfo } from './registry';
import { substituteType } from './type-substitution';
import { isAssignable, typeToString, type Type } from './types';

function checkContract(context: CheckContext, info: ClassInfo, contract: string, member: MemberInfo): void {
    const actual = context.declarations.lookupClassMember(info.name, member.name);

    if (actual === null) {
        if (member.type.kind === 'optional') {
            return;
        }

        context.report('check-unimplemented-interface', `Class "${info.name}" does not implement "${member.name}" required by interface "${contract}".`, info.position);

        return;
    }

    if (isAssignable(actual.type, member.type, { allowNil: context.allowNil })) {
        return;
    }

    const subject = `Member "${member.name}" of class "${info.name}"`;
    const message = `${subject} expects "${typeToString(member.type)}" from interface "${contract}" but is "${typeToString(actual.type)}".`;

    context.report('check-unimplemented-interface', message, actual.position);
}

function contractName(name: string, typeArguments: readonly Type[]): string {
    return typeArguments.length === 0 ? name : `${name}<${typeArguments.map(typeToString).join(', ')}>`;
}

export function checkInterfaces(context: CheckContext, info: ClassInfo): void {
    info.interfaces.forEach((name, index) => {
        const contract = context.declarations.lookupInterface(name);

        if (contract === null) {
            context.noteExternalReference(name, info.position);
            context.report('check-unknown-interface', `Class "${info.name}" implements "${name}", which is not defined.`, info.position);

            return;
        }

        const typeArguments = info.interfaceArguments[index] ?? [];

        if (contract.typeParameters.length > 0 && typeArguments.length !== contract.typeParameters.length) {
            const expected = contract.typeParameters.length === 1 ? '1 type argument' : `${contract.typeParameters.length} type arguments`;

            context.report('check-generic-arity', `Interface "${name}" expects ${expected} but received ${typeArguments.length}.`, info.position);
        }

        const substitutions = parameterSubstitutions(contract.typeParameters, typeArguments);
        const label = contractName(name, typeArguments);

        for (const member of context.declarations.collectInterfaceContract(contract.name)) {
            checkContract(context, info, label, substitutions.size === 0 ? member : { ...member, type: substituteType(member.type, substitutions) });
        }
    });
}

export function checkOverrides(context: CheckContext, info: ClassInfo, statement: ClassDeclaration): void {
    for (const member of statement.members) {
        if (member.kind !== 'class-method' || !member.decorators.some((decorator) => decorator.name === 'Override')) {
            continue;
        }

        const parent = info.superClass === null ? null : context.declarations.lookupClassMember(info.superClass, member.name);
        const actual = info.members.get(member.name);

        if (parent === null || actual === undefined || !isAssignable(actual.type, parent.type, { allowNil: context.allowNil }) || !isAssignable(parent.type, actual.type, { allowNil: context.allowNil })) {
            context.report('check-invalid-override', `Method "${member.name}" must match a method declared by the superclass.`, member.position);
        }
    }
}
