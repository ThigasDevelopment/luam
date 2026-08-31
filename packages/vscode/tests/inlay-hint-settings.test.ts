import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { beforeEach, describe, expect, it } from 'vitest';

import { createClientOptions } from '@vscode-extension/client/language-client';
import { DEFAULT_INLAY_HINTS, readInlayHints } from '@vscode-extension/config/settings';
import { activate, deactivate } from '@vscode-extension/extension';

import { clients, resetClients } from './support/language-client-mock';
import { resetMock, state } from './support/vscode-mock';

const manifestPath = fileURLToPath(new URL('../package.json', import.meta.url));

const SETTING_NAMES = ['localTypes', 'returnTypes', 'callbackParameterTypes', 'parameterNames'] as const;

interface Manifest {
    contributes: { configuration: { properties: Record<string, { type: string; default: unknown; description: string }> } };
}

function contributions(): Manifest['contributes']['configuration']['properties'] {
    return (JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest).contributes.configuration.properties;
}

function initializationOptions(): unknown {
    return createClientOptions().initializationOptions;
}

beforeEach(() => {
    resetMock();
    resetClients();
});

describe('the inlay hint settings', () => {
    it('are contributed once per kind', () => {
        const properties = contributions();

        for (const name of SETTING_NAMES) {
            const setting = properties[`luam.inlayHints.${name}`];

            expect(setting?.type).toBe('boolean');
            expect(setting?.description.length).toBeGreaterThan(0);
        }
    });

    it('default to the three type kinds', () => {
        const properties = contributions();

        expect(properties['luam.inlayHints.localTypes']?.default).toBe(true);
        expect(properties['luam.inlayHints.returnTypes']?.default).toBe(true);
        expect(properties['luam.inlayHints.callbackParameterTypes']?.default).toBe(true);
        expect(properties['luam.inlayHints.parameterNames']?.default).toBe(false);
        expect(readInlayHints()).toEqual(DEFAULT_INLAY_HINTS);
    });

    it('reach the server through the initialization options', () => {
        state.settings.set('luam.inlayHints.parameterNames', true);
        state.settings.set('luam.inlayHints.localTypes', false);

        expect(initializationOptions()).toEqual({ inlayHints: { ...DEFAULT_INLAY_HINTS, localTypes: false, parameterNames: true } });
    });

    it('restart the server when one of them changes', async () => {
        activate({ subscriptions: [], asAbsolutePath: (relative: string): string => `/extension/${relative}` } as never);

        const client = clients[clients.length - 1];
        const listener = state.configurationListeners[0];

        listener?.({ affectsConfiguration: (section: string): boolean => section === 'luam.cliPath' });

        expect(client?.restarted).toBe(0);

        listener?.({ affectsConfiguration: (section: string): boolean => section === 'luam.inlayHints' });

        expect(client?.restarted).toBe(1);

        await deactivate();
    });
});
