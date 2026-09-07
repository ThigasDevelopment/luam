import type { Environment } from '@compiler/environment/environment';
import type { ScriptEntry } from '@compiler/manifest/manifest-defaults';

import { createPatternMatcher, normalizePattern, watchRoots, type PatternMatcher } from './path-pattern';

export interface ScriptMatch {
    index: number;
    pattern: string;
    environment: Environment;
}

export interface ScriptResolution {
    environment: Environment | null;
    matches: ScriptMatch[];
}

export interface ScriptResolver {
    readonly entries: readonly ScriptEntry[];
    readonly patterns: readonly string[];
    readonly roots: readonly string[];
    resolve(path: string): ScriptResolution;
    side(path: string): Environment | null;
}

export function createScriptResolver(entries: readonly ScriptEntry[]): ScriptResolver {
    const matchers: PatternMatcher[] = entries.map((entry) => createPatternMatcher([entry.path]));
    const patterns = entries.map((entry) => normalizePattern(entry.path));

    function resolve(path: string): ScriptResolution {
        const normalized = normalizePattern(path);
        const matches: ScriptMatch[] = [];

        for (const [index, entry] of entries.entries()) {
            const pattern = matchers[index]?.match(normalized) ?? null;

            if (pattern !== null) {
                matches.push({ index, pattern, environment: entry.type });
            }
        }

        return { environment: matches.length === 1 ? (matches[0]?.environment ?? null) : null, matches };
    }

    return {
        entries,
        patterns,
        roots: watchRoots(patterns),
        resolve,
        side: (path: string): Environment | null => resolve(path).environment,
    };
}

export function describeMatches(matches: readonly ScriptMatch[]): string {
    return matches.map((match) => `"${match.pattern}" as "${match.environment}"`).join(' and ');
}
