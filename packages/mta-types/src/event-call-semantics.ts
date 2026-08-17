import type { ApiEnvironment } from './api-declaration';

export type EventCallTarget = 'current' | ApiEnvironment;

export type EventCallOperation = 'register' | 'subscribe' | 'unsubscribe' | 'inspect' | 'trigger';

export interface EventCallArgumentKind {
    argument: number;
    kind: 'boolean' | 'number';
}

export interface EventCallForm {
    operation: EventCallOperation;
    target: EventCallTarget;
    eventNameArgument: number;
    callbackArgument?: number;
    payloadArgument?: number;
    fixedArgumentKinds?: readonly EventCallArgumentKind[];
}

export type EventCallApi =
    | 'addEvent'
    | 'addEventHandler'
    | 'removeEventHandler'
    | 'getEventHandlers'
    | 'triggerEvent'
    | 'triggerServerEvent'
    | 'triggerLatentServerEvent'
    | 'triggerClientEvent'
    | 'triggerLatentClientEvent';

export const EVENT_CALL_SEMANTICS: Readonly<Record<EventCallApi, readonly EventCallForm[]>> = {
    addEvent: [{ operation: 'register', target: 'current', eventNameArgument: 0 }],
    addEventHandler: [{ operation: 'subscribe', target: 'current', eventNameArgument: 0, callbackArgument: 2 }],
    removeEventHandler: [{ operation: 'unsubscribe', target: 'current', eventNameArgument: 0, callbackArgument: 2 }],
    getEventHandlers: [{ operation: 'inspect', target: 'current', eventNameArgument: 0 }],
    triggerEvent: [{ operation: 'trigger', target: 'current', eventNameArgument: 0, payloadArgument: 2 }],
    triggerServerEvent: [{ operation: 'trigger', target: 'server', eventNameArgument: 0, payloadArgument: 2 }],
    triggerLatentServerEvent: [
        {
            operation: 'trigger',
            target: 'server',
            eventNameArgument: 0,
            payloadArgument: 4,
            fixedArgumentKinds: [{ argument: 1, kind: 'number' }, { argument: 2, kind: 'boolean' }],
        },
        { operation: 'trigger', target: 'server', eventNameArgument: 0, payloadArgument: 2 },
    ],
    triggerClientEvent: [
        { operation: 'trigger', target: 'client', eventNameArgument: 1, payloadArgument: 3 },
        { operation: 'trigger', target: 'client', eventNameArgument: 0, payloadArgument: 2 },
    ],
    triggerLatentClientEvent: [
        {
            operation: 'trigger',
            target: 'client',
            eventNameArgument: 1,
            payloadArgument: 5,
            fixedArgumentKinds: [{ argument: 2, kind: 'number' }, { argument: 3, kind: 'boolean' }],
        },
        {
            operation: 'trigger',
            target: 'client',
            eventNameArgument: 0,
            payloadArgument: 4,
            fixedArgumentKinds: [{ argument: 1, kind: 'number' }, { argument: 2, kind: 'boolean' }],
        },
        { operation: 'trigger', target: 'client', eventNameArgument: 1, payloadArgument: 3 },
        { operation: 'trigger', target: 'client', eventNameArgument: 0, payloadArgument: 2 },
    ],
};

export function eventCallForms(name: string): readonly EventCallForm[] {
    return EVENT_CALL_SEMANTICS[name as EventCallApi] ?? [];
}
