import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { TemplateSegment } from '@compiler/lexer/token';

export interface TemplateInterpolation {
    raw: string;
    path: string;
    root: string;
    fallback: string | null;
    position: SourcePosition;
}

export function parseInterpolation(segment: TemplateSegment): TemplateInterpolation {
    const separator = segment.value.indexOf(':');
    const path = (separator === -1 ? segment.value : segment.value.slice(0, separator)).trim();
    const fallback = separator === -1 ? null : segment.value.slice(separator + 1).trim();
    const root = path.split('.')[0] ?? '';

    return { raw: segment.value, path, root, fallback, position: segment.position };
}

export function collectInterpolations(segments: readonly TemplateSegment[]): TemplateInterpolation[] {
    return segments.filter((segment) => segment.kind === 'interpolation').map(parseInterpolation);
}

export function templateLiteralText(segments: readonly TemplateSegment[]): string {
    return segments.map((segment) => (segment.kind === 'text' ? segment.value : `\${${segment.value}}`)).join('');
}
