import type { CheckContext } from './context';
import { isMtaClass } from './oop-classes';

function isDeclaredType(context: CheckContext, name: string): boolean {
    const declarations = context.declarations;

    return declarations.lookupClass(name) !== null || declarations.lookupInterface(name) !== null || declarations.lookupEnum(name) !== null;
}

export function isKnownTypeName(context: CheckContext, name: string): boolean {
    if (context.binder.lookupAlias(name) !== null || context.isTypeParameter(name)) {
        return true;
    }

    return isDeclaredType(context, name) || isMtaClass(name);
}

export function reportUnknownTypes(context: CheckContext): void {
    for (const [name, position] of context.unknownTypes) {
        if (!isKnownTypeName(context, name)) {
            context.warn('check-unknown-type', `Type "${name}" is not defined.`, position);
        }
    }
}
