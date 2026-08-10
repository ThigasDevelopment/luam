import { describe, expect, it } from 'vitest';

import { distManifest } from '@scripts/dist-manifest';

describe('the installable package', () => {
    const manifest: unknown = JSON.parse(distManifest('1.2.3'));

    function field(name: string): unknown {
        return typeof manifest === 'object' && manifest !== null ? (manifest as Record<string, unknown>)[name] : undefined;
    }

    it('publishes under the command name', () => {
        expect(field('name')).toBe('@thigasdevelopment/luam');
        expect(field('version')).toBe('1.2.3');
    });

    it('points the luam binary at the bundle', () => {
        expect(field('bin')).toEqual({ luam: 'luam.mjs' });
    });

    it('declares no dependencies, because the bundle carries everything', () => {
        expect(field('dependencies')).toBeUndefined();
        expect(JSON.stringify(manifest)).not.toContain('workspace:');
    });

    it('is not private, so a global install can resolve it', () => {
        expect(field('private')).toBeUndefined();
    });

    it('ships the runtime lua and the scaffold next to the bundle', () => {
        expect(field('files')).toEqual(['luam.mjs', 'lua', 'template']);
    });

    it('carries the metadata the registry renders', () => {
        expect(field('license')).toBe('MIT');
        expect(field('repository')).toEqual({ type: 'git', url: 'git+https://github.com/ThigasDevelopment/luam.git' });
        expect(field('homepage')).toBe('https://github.com/ThigasDevelopment/luam#readme');
    });
});
