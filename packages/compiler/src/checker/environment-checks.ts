import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { CallExpression } from '@compiler/parser/ast';
import type { ApiEnvironment } from '@mta-types/api-declaration';
import { declarationEnvironment } from '@mta-types/catalog';
import { eventEnvironment } from '@mta-types/event-lookup';

import type { CheckContext } from './context';
import { reportEnvironment, scopeLabel, unavailableTail, unusableTail } from './environment-message';

const EVENT_FUNCTIONS: ReadonlySet<string> = new Set(['addEventHandler', 'removeEventHandler', 'triggerEvent']);

function reportProject(context: CheckContext, name: string, declared: ApiEnvironment, position: SourcePosition): void {
    const message = `"${name}" is declared by the project, is ${scopeLabel(declared)}, and ${unavailableTail(context.environment)}`;

    reportEnvironment(context, 'check-environment-api', message, position);
}

function reportApi(context: CheckContext, name: string, declared: ApiEnvironment, position: SourcePosition): void {
    const message = `API "${name}" is ${scopeLabel(declared)} and ${unavailableTail(context.environment)}`;

    reportEnvironment(context, 'check-environment-api', message, position);
}

export function checkGlobalReference(context: CheckContext, name: string, position: SourcePosition): void {
    if (name === 'self') {
        const message = 'A "self" is only bound inside a class method or a "function Name:method()"; here it reads a global that is "nil".';

        context.report('check-invalid-self', message, position);

        return;
    }

    const project = context.projectEnvironmentOf(name);

    if (project !== null) {
        reportProject(context, name, project, position);

        return;
    }

    const declared = declarationEnvironment(name);

    if (declared === null) {
        context.noteExternalReference(name, position);

        return;
    }

    reportApi(context, name, declared, position);
}

export function checkSharedReference(context: CheckContext, name: string, position: SourcePosition): void {
    if (context.environment !== 'shared' || context.moduleGlobals.has(name)) {
        return;
    }

    const project = context.projectEnvironmentOf(name);

    if (project !== null) {
        if (project !== 'shared') {
            reportProject(context, name, project, position);
        }

        return;
    }

    if (!context.binder.isBuiltinReference(name)) {
        return;
    }

    const declared = declarationEnvironment(name);

    if (declared !== null && declared !== 'shared') {
        reportApi(context, name, declared, position);
    }
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

    const message = `Event "${name}" is ${scopeLabel(declared)} and ${unusableTail(context.environment)}`;

    reportEnvironment(context, 'check-environment-event', message, expression.position);
}
