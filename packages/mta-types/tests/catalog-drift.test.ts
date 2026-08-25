import { describe, expect, it } from 'vitest';

import { allDeclarations, isApiAvailable } from '@mta-types/catalog';
import { DEFERRED_ENVIRONMENTS, DEFERRED_FUNCTIONS, deferredNames } from '@generator/catalog-drift-allowlist';
import { coveredRelease, formatDrift, reportDrift } from '@generator/catalog-drift';
import { readSnapshot, snapshotEnvironments } from '@generator/wiki-snapshot';

import type { ApiEnvironment } from '@mta-types/api-declaration';

const ENVIRONMENTS: readonly ApiEnvironment[] = ['server', 'client', 'shared'];

const SNAPSHOT = readSnapshot();

const DECLARED: ReadonlyMap<string, ApiEnvironment> = new Map(
    allDeclarations()
        .filter((declaration) => declaration.source === 'mta')
        .map((declaration) => [declaration.name, declaration.environment]),
);

const REPORT = reportDrift(SNAPSHOT, DECLARED);

describe('mta catalog drift', () => {
    it('reports the gap grouped by theme', () => {
        expect(formatDrift(REPORT)).toContain('missing:');
        expect(REPORT.missing.length + REPORT.declared).toBeGreaterThanOrEqual(REPORT.listed);
        expect(REPORT.missingByEnvironment.client + REPORT.missingByEnvironment.server + REPORT.missingByEnvironment.shared).toBe(REPORT.missing.length);
    });

    it('declares every function the wiki lists unless the allowlist defers it', () => {
        expect(REPORT.undeclaredDeferrals).toEqual([]);
    });

    it('carries no allowlist entry the catalog already declares', () => {
        expect(REPORT.resolvedFunctionDeferrals).toEqual([]);
    });

    it('agrees with the wiki on every environment unless the allowlist defers it', () => {
        expect(REPORT.disagreements.filter((entry) => entry.theme === 'not deferred')).toEqual([]);
    });

    it('carries no environment allowlist entry the catalog already agrees with', () => {
        expect(REPORT.resolvedEnvironmentDeferrals).toEqual([]);
    });

    it('gives every deferred name a theme and a reason', () => {
        const reasons = [...deferredNames(DEFERRED_FUNCTIONS).values(), ...deferredNames(DEFERRED_ENVIRONMENTS).values()];

        expect(reasons.every((reason) => reason.includes(': ') && reason.length > 20)).toBe(true);
    });

    it('names the MTA release the snapshot covers beside its newest revision', () => {
        expect(coveredRelease(SNAPSHOT)).toMatch(/^\d+\.\d+/);
        expect(REPORT.latestRevision).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(formatDrift(REPORT)).toContain(`covers MTA ${REPORT.coveredRelease}`);
    });

    it('keeps every declared function the wiki no longer lists', () => {
        expect(REPORT.unlisted).toContain('root');
        expect(REPORT.unlisted).toContain('getBlurLevel');
    });

    it('resolves every shared declaration in every environment', () => {
        const everywhere = (name: string): boolean => ENVIRONMENTS.every((environment) => isApiAvailable(name, environment));
        const unavailable = allDeclarations()
            .filter((declaration) => declaration.environment === 'shared')
            .filter((declaration) => !everywhere(declaration.name));

        expect(unavailable.map((declaration) => declaration.name)).toEqual([]);
    });

    it('keeps a one-sided declaration one-sided', () => {
        expect(isApiAvailable('usePickup', 'server')).toBe(true);
        expect(isApiAvailable('usePickup', 'client')).toBe(false);
        expect(isApiAvailable('getPlayerACInfo', 'client')).toBe(false);
        expect(isApiAvailable('dxDrawText', 'server')).toBe(false);
    });

    it('derives shared from membership of both curated lists', () => {
        const environments = snapshotEnvironments(SNAPSHOT);

        expect(environments.get('outputChatBox')).toBe('shared');
        expect(environments.get('dxDrawText')).toBe('client');
        expect(environments.get('banPlayer')).toBe('server');
    });
});
