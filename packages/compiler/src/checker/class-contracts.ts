import type { ClassDeclaration } from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import type { ClassInfo, MemberInfo } from './registry';
import { isAssignable, typeToString } from './types';

function checkContract(context: CheckContext, info: ClassInfo, contract: string, member: MemberInfo): void {
    const actual = context.declarations.lookupClassMember(info.name, member.name);

    if (actual === null) {
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

export function checkInterfaces(context: CheckContext, info: ClassInfo): void {
    for (const name of info.interfaces) {
        const contract = context.declarations.lookupInterface(name);

        if (contract === null) {
            context.noteExternalReference(name, info.position);
            context.report('check-unknown-interface', `Class "${info.name}" implements "${name}", which is not defined.`, info.position);

            continue;
        }

        for (const member of context.declarations.collectInterfaceContract(contract.name)) {
            checkContract(context, info, name, member);
        }
    }
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
