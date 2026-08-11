import { normalizePath } from '@compiler/environment/environment';
import type { SourceLineMapping } from '@compiler/emitter/source-map';

export const RESOURCE_MAP_VERSION = 1;

export type OutputLayout = 'tree' | 'bundle';

export interface ResourceMapSegment {
    kind: 'module' | 'helper';
    generatedStartLine: number;
    generatedEndLine: number;
    contentStartLine: number;
    source: string;
    lines: SourceLineMapping[];
}

export interface ResourceMapFile {
    path: string;
    segments: ResourceMapSegment[];
}

export interface ResourceMap {
    version: number;
    resource: string;
    layout: OutputLayout;
    minified?: boolean;
    files: ResourceMapFile[];
}

export interface ResolvedSourcePosition {
    file: string;
    line: number;
    symbol?: string;
}

export type ResourcePositionResolution =
    | { status: 'resolved'; position: ResolvedSourcePosition }
    | { status: 'unknown-version'; version: number }
    | { status: 'uncovered' };

function findSegment(segments: readonly ResourceMapSegment[], line: number): ResourceMapSegment | null {
    let low = 0;
    let high = segments.length - 1;

    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const segment = segments[middle];

        if (segment === undefined) {
            return null;
        }

        if (line < segment.generatedStartLine) {
            high = middle - 1;
        } else if (line > segment.generatedEndLine) {
            low = middle + 1;
        } else {
            return segment;
        }
    }

    return null;
}

function findMapping(lines: readonly SourceLineMapping[], generatedLine: number): SourceLineMapping | null {
    let low = 0;
    let high = lines.length - 1;
    let found: SourceLineMapping | null = null;

    while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const mapping = lines[middle];

        if (mapping === undefined) {
            break;
        }

        if (mapping.generatedLine <= generatedLine) {
            found = mapping;
            low = middle + 1;
        } else {
            high = middle - 1;
        }
    }

    return found;
}

export function resolveResourcePosition(map: ResourceMap, generatedFile: string, generatedLine: number): ResourcePositionResolution {
    if (map.version !== RESOURCE_MAP_VERSION) {
        return { status: 'unknown-version', version: map.version };
    }

    const path = normalizePath(generatedFile).replace(/^\.\//, '');
    const file = map.files.find((entry) => entry.path === path);
    const segment = file === undefined ? null : findSegment(file.segments, generatedLine);

    if (segment === null || segment.kind !== 'module') {
        return { status: 'uncovered' };
    }

    const localLine = generatedLine - segment.contentStartLine + 1;
    const mapping = findMapping(segment.lines, localLine);

    if (localLine < 1 || mapping === null) {
        return { status: 'uncovered' };
    }

    const position: ResolvedSourcePosition = { file: segment.source, line: mapping.sourceLine + localLine - mapping.generatedLine };

    if (mapping.symbol !== undefined) {
        position.symbol = mapping.symbol;
    }

    return { status: 'resolved', position };
}

export function serializeResourceMap(map: ResourceMap): string {
    return `${JSON.stringify(map, null, 4)}\n`;
}
