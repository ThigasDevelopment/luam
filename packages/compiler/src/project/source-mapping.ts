import type { Environment } from '@compiler/environment/environment';
import { SOURCE_SIDES, type SourceMapping } from '@compiler/manifest/manifest-defaults';

import { createPatternMatcher, normalizePattern, watchRoots, type PatternMatcher } from './path-pattern';

export interface SideMatch {
    environment: Environment;
    pattern: string;
}

export interface SideResolution {
    environment: Environment | null;
    matches: SideMatch[];
}

export interface SourceResolver {
    readonly patterns: readonly string[];
    readonly roots: readonly string[];
    resolve(path: string): SideResolution;
    side(path: string): Environment | null;
}

export function createSourceResolver(mapping: SourceMapping): SourceResolver {
    const matchers = new Map<Environment, PatternMatcher>(SOURCE_SIDES.map((environment) => [environment, createPatternMatcher(mapping[environment])]));
    const patterns = SOURCE_SIDES.flatMap((environment) => [...(matchers.get(environment)?.patterns ?? [])]);

    function resolve(path: string): SideResolution {
        const normalized = normalizePattern(path);
        const matches: SideMatch[] = [];

        for (const environment of SOURCE_SIDES) {
            const pattern = matchers.get(environment)?.match(normalized) ?? null;

            if (pattern !== null) {
                matches.push({ environment, pattern });
            }
        }

        return { environment: matches.length === 1 ? (matches[0]?.environment ?? null) : null, matches };
    }

    return {
        patterns,
        roots: watchRoots(patterns),
        resolve,
        side: (path: string): Environment | null => resolve(path).environment,
    };
}

export function describeMatches(matches: readonly SideMatch[]): string {
    return matches.map((match) => `"${match.environment}" through "${match.pattern}"`).join(' and ');
}
