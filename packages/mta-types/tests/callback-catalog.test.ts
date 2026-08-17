import { describe, expect, it } from 'vitest';

import { findDeclaration, globalsFor } from '@mta-types/catalog';

import type { ApiEnvironment } from '@mta-types/api-declaration';

import type { FunctionDescriptor, TypeDescriptor } from '@mta-types/type-descriptor';

function callableOptions(descriptor: TypeDescriptor | undefined): FunctionDescriptor[] {
    if (descriptor === undefined) {
        return [];
    }

    if (descriptor.kind === 'function') {
        return [descriptor];
    }

    if (descriptor.kind === 'optional') {
        return callableOptions(descriptor.element);
    }

    return descriptor.kind === 'union' ? descriptor.options.flatMap(callableOptions) : [];
}

function callbacksAt(name: string, index: number, environment?: ApiEnvironment): FunctionDescriptor[] {
    const descriptor = findDeclaration(name, environment)?.type;

    return descriptor?.kind === 'function' ? callableOptions(descriptor.parameters[index]) : [];
}

describe('generated callback catalog', () => {
    it('preserves representative shared callbacks', () => {
        expect(callbacksAt('addCommandHandler', 1)).not.toEqual([]);
        expect(callbacksAt('bindKey', 2)).not.toEqual([]);
        expect(callbacksAt('bindKey', 3)).not.toEqual([]);
        expect(callbacksAt('setTimer', 0)).not.toEqual([]);
    });

    it('selects exact addCommandHandler callbacks for server and client', () => {
        const server = callbacksAt('addCommandHandler', 1, 'server')[0];
        const client = callbacksAt('addCommandHandler', 1, 'client')[0];

        expect(server?.parameters).toEqual([{ kind: 'named', name: 'Player' }, { kind: 'string' }]);
        expect(server?.isVariadic).toBe(true);
        expect(server?.variadicType).toEqual({ kind: 'string' });
        expect(client?.parameters).toEqual([{ kind: 'string' }]);
        expect(client?.isVariadic).toBe(true);
        expect(client?.variadicType).toEqual({ kind: 'string' });
    });

    it('provides one addCommandHandler global in every environment', () => {
        for (const environment of ['shared', 'server', 'client'] as const) {
            expect(globalsFor(environment).filter((declaration) => declaration.name === 'addCommandHandler')).toHaveLength(1);
        }
    });

    it('preserves the server dbQuery callback overload', () => {
        expect(callbacksAt('dbQuery', 0)).not.toEqual([]);
    });

    it('preserves client browser callbacks', () => {
        expect(callbacksAt('requestBrowserDomains', 2)).not.toEqual([]);
        expect(callbacksAt('setBrowserAjaxHandler', 2)).not.toEqual([]);
    });
});
