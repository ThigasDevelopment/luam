import type { EventDeclaration } from '@compiler/parser/declaration-nodes';

import type { CheckContext } from './context';
import type { EventParameterInfo } from './registry';

function resolveParameters(context: CheckContext, declaration: EventDeclaration): { parameters: EventParameterInfo[]; invalid: boolean } {
    const parameters: EventParameterInfo[] = [];
    const names = new Set<string>();
    let invalid = false;

    declaration.parameters.forEach((parameter, index) => {
        const type = context.resolveAnnotation(parameter.annotation);

        if (parameter.name.length > 0 && names.has(parameter.name)) {
            context.report('check-duplicate-event-parameter', `Event "${declaration.name}" declares parameter "${parameter.name}" more than once.`, parameter.position);
            invalid = true;
        }

        if (parameter.isVararg && index !== declaration.parameters.length - 1) {
            context.report('check-invalid-event-parameter', `Variadic parameter of event "${declaration.name}" must be last.`, parameter.position);
            invalid = true;
        }

        if (parameter.name.length > 0) {
            names.add(parameter.name);
        }

        parameters.push({ name: parameter.name, type, isVariadic: parameter.isVararg, position: parameter.position });
    });

    return { parameters, invalid };
}

export function checkEventDeclaration(context: CheckContext, declaration: EventDeclaration): void {
    if (context.declarations.lookupEvent(declaration.name) !== null) {
        context.report('check-duplicate-event', `Event "${declaration.name}" is already defined.`, declaration.position);

        return;
    }

    let invalid = declaration.name.length === 0;

    if (invalid) {
        context.report('check-invalid-event-name', 'An event name cannot be empty.', declaration.position);
    }

    const resolved = resolveParameters(context, declaration);

    invalid = invalid || resolved.invalid;

    if (declaration.returnAnnotation !== null && context.resolveAnnotation(declaration.returnAnnotation).kind !== 'void') {
        context.report('check-event-return-type', `Event "${declaration.name}" can only declare a "void" return type.`, declaration.returnAnnotation.position);
        invalid = true;
    }

    if (!invalid) {
        context.declarations.declareEvent({
            name: declaration.name,
            parameters: resolved.parameters,
            environment: context.environment,
            position: declaration.position,
        });
    }
}
