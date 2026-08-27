import { collectInterpolations, templateLiteralText } from '@compiler/checker/template';
import { LUA_KEYWORDS } from '@compiler/lexer/token';
import type { TemplateSegment } from '@compiler/lexer/token';

const SELF_PATH_PATTERN = /^self((?:\.[A-Za-z_][A-Za-z0-9_]*)+)$/;

export interface TemplateBinding {
    name: string;
    value: string;
}

export interface LoweredTemplate {
    literal: string;
    bindings: TemplateBinding[];
    isInterpolated: boolean;
}

function flattenedName(path: string): string | null {
    const fields = SELF_PATH_PATTERN.exec(path)?.[1] ?? null;

    if (fields === null) {
        return null;
    }

    const name = fields.slice(1).split('.').join('_');

    return LUA_KEYWORDS.has(name) ? null : name;
}

function collectFlattened(segments: readonly TemplateSegment[]): Map<string, string> {
    const interpolations = collectInterpolations(segments);
    const reserved = new Set<string>();
    const claims = new Map<string, string>();
    const conflicting = new Set<string>();

    for (const interpolation of interpolations) {
        const name = flattenedName(interpolation.path);

        if (name === null) {
            reserved.add(interpolation.root);

            continue;
        }

        const claimed = claims.get(name) ?? null;

        if (claimed !== null && claimed !== interpolation.path) {
            conflicting.add(name);

            continue;
        }

        claims.set(name, interpolation.path);
    }

    const flattened = new Map<string, string>();

    for (const interpolation of interpolations) {
        const name = flattenedName(interpolation.path);

        if (name !== null && !reserved.has(name) && !conflicting.has(name)) {
            flattened.set(interpolation.raw, name);
        }
    }

    return flattened;
}

function rewriteInterpolation(raw: string, name: string): string {
    const separator = raw.indexOf(':');
    const key = separator === -1 ? raw : raw.slice(0, separator);
    const rest = separator === -1 ? '' : raw.slice(separator);
    const path = key.trim();
    const start = key.indexOf(path);

    return `${key.slice(0, start)}${name}${key.slice(start + path.length)}${rest}`;
}

function flattenedLiteral(segments: readonly TemplateSegment[], flattened: ReadonlyMap<string, string>): string {
    if (flattened.size === 0) {
        return templateLiteralText(segments);
    }

    return segments
        .map((segment) => {
            if (segment.kind === 'text') {
                return segment.value;
            }

            const name = flattened.get(segment.value) ?? null;

            return `\${${name === null ? segment.value : rewriteInterpolation(segment.value, name)}}`;
        })
        .join('');
}

function collectBindings(segments: readonly TemplateSegment[], flattened: ReadonlyMap<string, string>): TemplateBinding[] {
    const bindings: TemplateBinding[] = [];
    const seen = new Set<string>();

    for (const interpolation of collectInterpolations(segments)) {
        const flatName = flattened.get(interpolation.raw) ?? null;
        const name = flatName ?? interpolation.root;

        if (name.length === 0 || seen.has(name)) {
            continue;
        }

        seen.add(name);
        bindings.push({ name, value: flatName === null ? name : interpolation.path });
    }

    return bindings;
}

export function lowerTemplate(segments: readonly TemplateSegment[]): LoweredTemplate {
    const flattened = collectFlattened(segments);
    const isInterpolated = segments.some((segment) => segment.kind === 'interpolation');

    return { literal: flattenedLiteral(segments, flattened), bindings: collectBindings(segments, flattened), isInterpolated };
}

export function templateContext(bindings: readonly TemplateBinding[]): string {
    if (bindings.length === 0) {
        return '{}';
    }

    return `{ ${bindings.map((binding) => `${binding.name} = ${binding.value}`).join(', ')} }`;
}
