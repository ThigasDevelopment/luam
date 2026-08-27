import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { CallExpression } from '@compiler/parser/ast';
import { declarationEnvironment } from '@mta-types/catalog';
import { eventEnvironment } from '@mta-types/event-lookup';

import type { CheckContext } from './context';

const EVENT_FUNCTIONS: ReadonlySet<string> = new Set(['addEventHandler', 'removeEventHandler', 'triggerEvent']);

function scopeLabel(environment: string): string {
    return environment === 'shared' ? 'shared' : `${environment}-only`;
}

export function checkGlobalReference(context: CheckContext, name: string, position: SourcePosition): void {
    if (name === 'self') {
        const message = 'A "self" is only bound inside a class method or a "function Name:method()"; here it reads a global that is "nil".';

        context.report('check-invalid-self', message, position);

        return;
    }

    const project = context.projectEnvironmentOf(name);

    if (project !== null) {
        const message = `"${name}" is declared by the project, is ${scopeLabel(project)}, and is not available in a "${context.environment}" file.`;

        context.report('check-environment-api', message, position);

        return;
    }

    const declared = declarationEnvironment(name);

    if (declared === null) {
        context.noteExternalReference(name, position);

        return;
    }

    const message = `API "${name}" is ${scopeLabel(declared)} and is not available in a "${context.environment}" file.`;

    context.report('check-environment-api', message, position);
}

function eventName(expression: CallExpression): string | null {
    const argument = expression.args[0];

    return argument !== undefined && argument.kind === 'string-literal' ? argument.value : null;
}

export function checkEventUsage(context: CheckContext, expression: CallExpression): void {
    if (expression.callee.kind !== 'identifier' || !EVENT_FUNCTIONS.has(expression.callee.name)) {
        return;
    }

    const name = eventName(expression);

    if (name !== null) {
        context.noteEventReference(name);
    }

    const custom = name === null ? null : context.declarations.lookupEvent(name);
    const declared = name === null ? null : eventEnvironment(name);

    if (name === null || custom?.environment === 'shared' || custom?.environment === context.environment || declared === null || declared === context.environment) {
        return;
    }

    const message = `Event "${name}" is ${scopeLabel(declared)} and cannot be used in a "${context.environment}" file.`;

    context.report('check-environment-event', message, expression.position);
}
