import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import { isAvailableIn } from '@mta-types/api-declaration';
import { isElementType } from '@mta-types/element-hierarchy';

import type { CheckContext } from './context';
import { isMtaClass, mtaConstructor, mtaMember, mtaStaticMember } from './oop-classes';
import type { DeclarationRegistry, MemberInfo } from './registry';
import type { FunctionType } from './types';

const OOP_HINT = 'Set "compiler = { oop = true }" in .luam.manifest to enable the MTA OOP API.';

function scopeLabel(environment: string): string {
    return environment === 'shared' ? 'shared' : `${environment}-only`;
}

export function isMtaElementName(declarations: DeclarationRegistry, className: string): boolean {
    if (!isElementType(className)) {
        return false;
    }

    return declarations.lookupClass(className) === null && declarations.lookupInterface(className) === null;
}

export function isMtaElement(context: CheckContext, className: string): boolean {
    return isMtaElementName(context.declarations, className);
}

function reportDisabled(context: CheckContext, className: string, name: string, position: SourcePosition): void {
    const member = mtaMember(className, name) ?? mtaStaticMember(className, name);

    if (member === null) {
        return;
    }

    const subject = `"${className}.${name}" is part of the MTA OOP API, which this project does not enable.`;

    context.report('check-oop-disabled', `${subject} Call "${member.procedural}" instead. ${OOP_HINT}`, position);
}

export function isMtaClassReference(context: CheckContext, className: string): boolean {
    return (
        isMtaClass(className) &&
        context.binder.lookup(className) === null &&
        context.declarations.lookupClass(className) === null &&
        context.declarations.lookupInterface(className) === null
    );
}

export function resolveMtaStaticMember(context: CheckContext, className: string, name: string, position: SourcePosition): MemberInfo | null {
    const member = mtaStaticMember(className, name);

    if (member === null) {
        if (context.mtaClasses !== null) {
            reportUnknown(context, className, name, position);
        }

        return null;
    }

    if (context.mtaClasses === null) {
        reportDisabled(context, className, name, position);

        return null;
    }

    if (member.environment !== undefined && !isAvailableIn(member.environment, context.environment)) {
        const subject = `"${className}.${name}" wraps "${member.procedural}", which is ${scopeLabel(member.environment)}`;

        context.report('check-environment-api', `${subject} and is not available in a "${context.environment}" file.`, position);

        return null;
    }

    return member;
}

export function resolveMtaConstructor(context: CheckContext, className: string, position: SourcePosition): FunctionType | null {
    const constructor = mtaConstructor(className);

    if (constructor === null) {
        if (context.mtaClasses !== null) {
            context.report('check-not-callable-class', `MTA class "${className}" is not callable.`, position);
        }

        return null;
    }

    if (context.mtaClasses === null) {
        context.report('check-oop-disabled', `"${className}(...)" is part of the MTA OOP API, which this project does not enable. ${OOP_HINT}`, position);

        return null;
    }

    if (!isAvailableIn(constructor.environment, context.environment)) {
        const subject = `"${className}(...)" is ${scopeLabel(constructor.environment)}`;

        context.report('check-environment-api', `${subject} and is not available in a "${context.environment}" file.`, position);

        return null;
    }

    return constructor.type;
}

function reportUnknown(context: CheckContext, className: string, name: string, position: SourcePosition): void {
    context.report('check-unknown-member', `Class "${className}" has no member "${name}".`, position);
}

export function resolveMtaMember(context: CheckContext, className: string, name: string, position: SourcePosition): MemberInfo | null {
    if (!isMtaElement(context, className)) {
        return null;
    }

    if (context.mtaClasses === null) {
        reportDisabled(context, className, name, position);

        return null;
    }

    const member = context.mtaClasses.lookupMember(className, name);

    if (member === null) {
        reportUnknown(context, className, name, position);

        return null;
    }

    if (member.environment !== undefined && !isAvailableIn(member.environment, context.environment)) {
        const subject = `"${className}.${name}" wraps "${member.procedural}", which is ${scopeLabel(member.environment)}`;

        context.report('check-environment-api', `${subject} and is not available in a "${context.environment}" file.`, position);

        return null;
    }

    return member;
}
