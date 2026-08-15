export type PatternProblem = 'empty' | 'absolute' | 'traversal' | 'syntax' | 'excluded';

export interface PatternMatch {
    path: string;
    pattern: string;
}

export interface PatternMatcher {
    readonly patterns: readonly string[];
    readonly roots: readonly string[];
    match(path: string): string | null;
}

export const EXCLUDED_DIRECTORIES: readonly string[] = ['.git', '.luam', 'node_modules'];

const REGEX_SHAPED = /[[\]{}()+^$|@]/;

const WILDCARD = /[*?]/;

const PROBLEM_TEXT: Readonly<Record<PatternProblem, string>> = {
    empty: 'is empty',
    absolute: 'is an absolute path, and every pattern is relative to the project root',
    traversal: 'leaves the project directory through ".."',
    syntax: 'uses syntax outside the "*", "**", and "?" wildcards',
    excluded: `starts inside a generated or dependency directory (${EXCLUDED_DIRECTORIES.join(', ')})`,
};

export function normalizePattern(value: string): string {
    return value
        .replace(/\\/g, '/')
        .replace(/\/{2,}/g, '/')
        .replace(/^\.\//, '')
        .replace(/\/+$/, '');
}

export function splitSegments(value: string): string[] {
    return normalizePattern(value)
        .split('/')
        .filter((segment) => segment.length > 0 && segment !== '.');
}

export function isLiteralPattern(pattern: string): boolean {
    return !WILDCARD.test(pattern);
}

function segmentProblem(segment: string): PatternProblem | null {
    if (segment.startsWith('!') || REGEX_SHAPED.test(segment)) {
        return 'syntax';
    }

    return segment.includes('**') && segment !== '**' ? 'syntax' : null;
}

export function patternProblem(pattern: string): PatternProblem | null {
    const normalized = normalizePattern(pattern);

    if (normalized.length === 0) {
        return 'empty';
    }

    if (normalized.startsWith('/') || /^[A-Za-z]:/.test(normalized)) {
        return 'absolute';
    }

    const segments = splitSegments(normalized);

    if (segments.includes('..')) {
        return 'traversal';
    }

    for (const segment of segments) {
        const problem = segmentProblem(segment);

        if (problem !== null) {
            return problem;
        }
    }

    return EXCLUDED_DIRECTORIES.includes(segments[0] ?? '') ? 'excluded' : null;
}

export function patternProblemText(problem: PatternProblem): string {
    return PROBLEM_TEXT[problem];
}

export function parentPath(path: string): string {
    const segments = splitSegments(path);

    return segments.slice(0, -1).join('/');
}

export function patternRoot(pattern: string): string {
    const segments = splitSegments(pattern);
    const stop = segments.findIndex((segment) => WILDCARD.test(segment));

    return (stop === -1 ? segments : segments.slice(0, stop)).join('/');
}

function matchSegment(pattern: string, text: string): boolean {
    let patternIndex = 0;
    let textIndex = 0;
    let starPattern = -1;
    let starText = -1;

    while (textIndex < text.length) {
        const current = pattern[patternIndex];

        if (current !== undefined && (current === '?' || current === text[textIndex])) {
            patternIndex += 1;
            textIndex += 1;
        } else if (current === '*') {
            starPattern = patternIndex;
            starText = textIndex;
            patternIndex += 1;
        } else if (starPattern !== -1) {
            starText += 1;
            patternIndex = starPattern + 1;
            textIndex = starText;
        } else {
            return false;
        }
    }

    while (pattern[patternIndex] === '*') {
        patternIndex += 1;
    }

    return patternIndex === pattern.length;
}

export function matchesPattern(pattern: string, path: string): boolean {
    const patterns = splitSegments(pattern);
    const segments = splitSegments(path);
    let patternIndex = 0;
    let segmentIndex = 0;
    let starPattern = -1;
    let starSegment = -1;

    while (segmentIndex < segments.length) {
        const current = patterns[patternIndex];

        if (current === '**') {
            starPattern = patternIndex;
            starSegment = segmentIndex;
            patternIndex += 1;
        } else if (current !== undefined && matchSegment(current, segments[segmentIndex] ?? '')) {
            patternIndex += 1;
            segmentIndex += 1;
        } else if (starPattern !== -1) {
            starSegment += 1;
            patternIndex = starPattern + 1;
            segmentIndex = starSegment;
        } else {
            return false;
        }
    }

    while (patterns[patternIndex] === '**') {
        patternIndex += 1;
    }

    return patternIndex === patterns.length;
}

export function createPatternMatcher(patterns: readonly string[]): PatternMatcher {
    const normalized = [...new Set(patterns.map(normalizePattern))].filter((pattern) => pattern.length > 0);
    const roots = [...new Set(normalized.map(patternRoot))].sort();

    return {
        patterns: normalized,
        roots,
        match: (path: string): string | null => normalized.find((pattern) => matchesPattern(pattern, path)) ?? null,
    };
}

export function isExcludedPath(path: string, extra: readonly string[] = []): boolean {
    const segments = splitSegments(path);
    const blocked = new Set([...EXCLUDED_DIRECTORIES, ...extra.map(normalizePattern).filter((entry) => entry.length > 0)]);

    for (const entry of blocked) {
        const parts = splitSegments(entry);

        if (parts.length > 0 && parts.every((part, index) => segments[index] === part)) {
            return true;
        }
    }

    return false;
}

export function watchRoots(patterns: readonly string[]): string[] {
    const roots = [...new Set(patterns.map((pattern) => (isLiteralPattern(pattern) ? parentPath(patternRoot(pattern)) : patternRoot(pattern))))].sort();

    if (roots.includes('')) {
        return [''];
    }

    return roots.filter((root) => !roots.some((other) => other.length < root.length && root.startsWith(`${other}/`)));
}
