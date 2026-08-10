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
    const declared = name === null ? null : eventEnvironment(name);

    if (name === null || declared === null || declared === context.environment) {
        return;
    }

    const message = `Event "${name}" is ${scopeLabel(declared)} and cannot be used in a "${context.environment}" file.`;

    context.report('check-environment-event', message, expression.position);
}
