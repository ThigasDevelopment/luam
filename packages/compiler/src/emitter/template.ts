import { collectTemplateRoots, templateLiteralText } from '@compiler/checker/template';
import type { TemplateSegment } from '@compiler/lexer/token';

export interface LoweredTemplate {
    literal: string;
    roots: string[];
    isInterpolated: boolean;
}

export function lowerTemplate(segments: readonly TemplateSegment[]): LoweredTemplate {
    const roots = collectTemplateRoots(segments);
    const isInterpolated = segments.some((segment) => segment.kind === 'interpolation');

    return { literal: templateLiteralText(segments), roots, isInterpolated };
}

export function templateContext(roots: readonly string[]): string {
    if (roots.length === 0) {
        return '{}';
    }

    return `{ ${roots.map((root) => `${root} = ${root}`).join(', ')} }`;
}
