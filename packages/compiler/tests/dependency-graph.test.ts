import { describe, expect, it } from 'vitest';

import type { Environment } from '@compiler/environment/environment';
import { createDependencyGraph, type GraphNode } from '@compiler/project/dependency-graph';

function node(path: string, environment: Environment, provides: Readonly<Record<string, string>>, requires: readonly string[]): GraphNode {
    return { path, environment, provides: new Map(Object.entries(provides)), requires: new Set(requires) };
}

describe('dependency graph', () => {
    it('reaches a declaration through a transitive edge', () => {
        const graph = createDependencyGraph([
            node('base.luam', 'shared', { Base: 'a' }, []),
            node('middle.luam', 'shared', { Middle: 'b' }, ['Base']),
            node('leaf.luam', 'shared', {}, ['Middle']),
        ]);

        expect([...(graph.closureOf('leaf.luam') ?? [])].sort()).toEqual(['Base', 'Middle']);
        expect([...graph.dependentsOf(new Set(['Base']))].sort()).toEqual(['base.luam', 'leaf.luam', 'middle.luam']);
    });

    it('keeps an unrelated file out of the reverse closure', () => {
        const graph = createDependencyGraph([
            node('shared.luam', 'shared', { Config: 'a' }, []),
            node('user.luam', 'server', {}, ['Config']),
            node('other.luam', 'server', {}, ['print']),
        ]);

        expect([...graph.dependentsOf(new Set(['Config']))].sort()).toEqual(['shared.luam', 'user.luam']);
    });

    it('changes the key when the declaration it depends on changes', () => {
        const before = createDependencyGraph([node('shared.luam', 'shared', { Config: 'a' }, []), node('user.luam', 'server', {}, ['Config'])]);
        const after = createDependencyGraph([node('shared.luam', 'shared', { Config: 'b' }, []), node('user.luam', 'server', {}, ['Config'])]);

        expect(before.keyOf('user.luam')).not.toBe(after.keyOf('user.luam'));
    });

    it('keeps the key stable when an unrelated declaration changes', () => {
        const before = createDependencyGraph([
            node('shared.luam', 'shared', { Config: 'a' }, []),
            node('other.luam', 'shared', { Other: 'a' }, []),
            node('user.luam', 'server', {}, ['Config']),
        ]);
        const after = createDependencyGraph([
            node('shared.luam', 'shared', { Config: 'a' }, []),
            node('other.luam', 'shared', { Other: 'b' }, []),
            node('user.luam', 'server', {}, ['Config']),
        ]);

        expect(before.keyOf('user.luam')).toBe(after.keyOf('user.luam'));
    });

    it('changes the key when a declaration appears or disappears', () => {
        const without = createDependencyGraph([node('user.luam', 'server', {}, ['Config'])]);
        const with_ = createDependencyGraph([node('shared.luam', 'shared', { Config: 'a' }, []), node('user.luam', 'server', {}, ['Config'])]);

        expect(without.keyOf('user.luam')).not.toBe(with_.keyOf('user.luam'));
    });

    it('changes the key when a declaration moves out of view', () => {
        const shared = createDependencyGraph([node('config.luam', 'shared', { Config: 'a' }, []), node('user.luam', 'server', {}, ['Config'])]);
        const client = createDependencyGraph([node('config.luam', 'client', { Config: 'a' }, []), node('user.luam', 'server', {}, ['Config'])]);

        expect(shared.keyOf('user.luam')).not.toBe(client.keyOf('user.luam'));
    });

    it('changes the key when a second file starts declaring the same name', () => {
        const single = createDependencyGraph([node('config.luam', 'shared', { Config: 'a' }, []), node('user.luam', 'server', {}, ['Config'])]);
        const ambiguous = createDependencyGraph([
            node('config.luam', 'shared', { Config: 'a' }, []),
            node('duplicate.luam', 'shared', { Config: 'a' }, []),
            node('user.luam', 'server', {}, ['Config']),
        ]);

        expect(single.keyOf('user.luam')).not.toBe(ambiguous.keyOf('user.luam'));
    });

    it('terminates on a cycle', () => {
        const graph = createDependencyGraph([
            node('left.luam', 'shared', { Left: 'a' }, ['Right']),
            node('right.luam', 'shared', { Right: 'a' }, ['Left']),
            node('user.luam', 'shared', {}, ['Left']),
        ]);

        expect([...(graph.closureOf('user.luam') ?? [])].sort()).toEqual(['Left', 'Right']);
    });

    it('reports every name a set of files declares', () => {
        const graph = createDependencyGraph([node('a.luam', 'shared', { One: 'a', Two: 'b' }, []), node('b.luam', 'shared', { Three: 'c' }, [])]);

        expect([...graph.providedBy(['a.luam', 'b.luam'])].sort()).toEqual(['One', 'Three', 'Two']);
    });

    it('gives up on a closure that grows past the bound', () => {
        const names = Array.from({ length: 600 }, (unused, index) => `Name${index}`);
        const graph = createDependencyGraph([node('user.luam', 'shared', {}, names)]);

        expect(graph.closureOf('user.luam')).toBeNull();
        expect(graph.keyOf('user.luam')).toBeNull();
        expect([...graph.dependentsOf(new Set(['Missing']))]).toEqual(['user.luam']);
    });
});
