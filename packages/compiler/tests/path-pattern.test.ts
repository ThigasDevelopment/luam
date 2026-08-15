import { describe, expect, it } from 'vitest';

import {
    createPatternMatcher,
    isExcludedPath,
    isLiteralPattern,
    matchesPattern,
    normalizePattern,
    patternProblem,
    patternRoot,
    watchRoots,
} from '@compiler/project/path-pattern';
import { createSourceResolver } from '@compiler/project/source-mapping';

describe('pattern normalization', () => {
    it('canonicalizes separators and strips a leading dot segment', () => {
        expect(normalizePattern('src\\server\\main.luam')).toBe('src/server/main.luam');
        expect(normalizePattern('./src/server')).toBe('src/server');
        expect(normalizePattern('src//server///main.luam')).toBe('src/server/main.luam');
    });

    it('separates a literal path from a pattern', () => {
        expect(isLiteralPattern('src/server/main.luam')).toBe(true);
        expect(isLiteralPattern('src/server/*.luam')).toBe(false);
        expect(isLiteralPattern('src/**/main.luam')).toBe(false);
    });

    it('reports the root a pattern scans', () => {
        expect(patternRoot('src/server/**/*.luam')).toBe('src/server');
        expect(patternRoot('src/*/main.luam')).toBe('src');
        expect(patternRoot('*.luam')).toBe('');
    });
});

describe('pattern problems', () => {
    it('accepts the grammar the manifest allows', () => {
        expect(patternProblem('src/**/*.luam')).toBeNull();
        expect(patternProblem('src/server/hud-?.luam')).toBeNull();
    });

    it('rejects everything outside the grammar', () => {
        expect(patternProblem('')).toBe('empty');
        expect(patternProblem('/etc/passwd')).toBe('absolute');
        expect(patternProblem('C:/windows')).toBe('absolute');
        expect(patternProblem('../elsewhere/**/*.luam')).toBe('traversal');
        expect(patternProblem('src/(a|b)/*.luam')).toBe('syntax');
        expect(patternProblem('src/{a,b}/*.luam')).toBe('syntax');
        expect(patternProblem('node_modules/**/*.luam')).toBe('excluded');
    });
});

describe('pattern matching', () => {
    it('keeps a single star inside one segment', () => {
        expect(matchesPattern('src/*.luam', 'src/main.luam')).toBe(true);
        expect(matchesPattern('src/*.luam', 'src/server/main.luam')).toBe(false);
    });

    it('lets a double star cross any number of segments, including none', () => {
        expect(matchesPattern('src/**/*.luam', 'src/main.luam')).toBe(true);
        expect(matchesPattern('src/**/*.luam', 'src/a/b/c/main.luam')).toBe(true);
        expect(matchesPattern('src/**/*.luam', 'other/main.luam')).toBe(false);
    });

    it('matches exactly one character for a question mark', () => {
        expect(matchesPattern('src/hud-?.luam', 'src/hud-1.luam')).toBe(true);
        expect(matchesPattern('src/hud-?.luam', 'src/hud-12.luam')).toBe(false);
    });

    it('stays linear on a pathological input', () => {
        const started = Date.now();

        expect(matchesPattern('a*a*a*a*a*a*a*a*b', `${'a'.repeat(2000)}c`)).toBe(false);
        expect(Date.now() - started).toBeLessThan(1000);
    });

    it('excludes generated and vendored directories from any match', () => {
        expect(isExcludedPath('node_modules/pkg/index.luam')).toBe(true);
        expect(isExcludedPath('.luam/cache.json')).toBe(true);
        expect(isExcludedPath('src/server/main.luam')).toBe(false);
    });
});

describe('watch roots', () => {
    it('collapses a nested root into its ancestor', () => {
        expect(watchRoots(['src/**/*.luam', 'src/server/**/*.luam'])).toEqual(['src']);
    });

    it('keeps siblings apart and takes the parent of a literal file', () => {
        expect(watchRoots(['src/server/**/*.luam', 'ui/**/*.luam'])).toEqual(['src/server', 'ui']);
        expect(watchRoots(['src/server/main.luam'])).toEqual(['src/server']);
    });

    it('collapses everything once a pattern reaches the project root', () => {
        expect(watchRoots(['**/*.luam', 'src/server/**/*.luam'])).toEqual(['']);
    });
});

describe('matcher', () => {
    it('reports which pattern matched', () => {
        const matcher = createPatternMatcher(['src/server/**/*.luam', 'legacy/main.luam']);

        expect(matcher.match('src/server/a/b.luam')).toBe('src/server/**/*.luam');
        expect(matcher.match('legacy/main.luam')).toBe('legacy/main.luam');
        expect(matcher.match('src/client/hud.luam')).toBeNull();
    });
});

describe('source resolver', () => {
    const mapping = {
        server: ['src/server/**/*.luam'],
        client: ['src/client/**/*.luam'],
        shared: ['src/shared/**/*.luam'],
    };

    it('resolves one side per file', () => {
        const resolver = createSourceResolver(mapping);

        expect(resolver.side('src/server/main.luam')).toBe('server');
        expect(resolver.side('src/client/hud.luam')).toBe('client');
        expect(resolver.side('docs/notes.luam')).toBeNull();
    });

    it('refuses to pick a side when two patterns claim the same file', () => {
        const resolver = createSourceResolver({ server: ['src/**/*.luam'], client: ['src/**/*.luam'], shared: [] });
        const resolution = resolver.resolve('src/main.luam');

        expect(resolution.environment).toBeNull();
        expect(resolution.matches.map((match) => match.environment)).toEqual(['server', 'client']);
    });

    it('derives the roots a watcher has to observe', () => {
        expect(createSourceResolver(mapping).roots).toEqual(['src/client', 'src/server', 'src/shared']);
    });
});
