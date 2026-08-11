export interface SourceLineMapping {
    generatedLine: number;
    sourceLine: number;
    symbol?: string;
}

export interface EmissionMarker {
    sourceLine: number;
    symbol?: string;
}

const MARKER_START = '\u0000luam:';

const MARKER_END = '\u0000';

export function emissionMarker(index: number): string {
    return `${MARKER_START}${index}${MARKER_END}`;
}

export function finalizeEmission(code: string, markers: readonly EmissionMarker[]): { code: string; lines: SourceLineMapping[] } {
    const lines = code.split('\n');
    const mappings: SourceLineMapping[] = [];
    let previous: SourceLineMapping | null = null;

    for (let index = 0; index < lines.length; index += 1) {
        const pattern = /\u0000luam:(\d+)\u0000/;
        const match = pattern.exec(lines[index] ?? '');

        if (match === null) {
            continue;
        }

        const marker = markers[Number(match[1])];

        lines[index] = (lines[index] ?? '').replace(pattern, '');

        if (marker === undefined) {
            continue;
        }

        const mapping: SourceLineMapping = { generatedLine: index + 1, sourceLine: marker.sourceLine };

        if (marker.symbol !== undefined) {
            mapping.symbol = marker.symbol;
        }

        const sameSegment =
            previous !== null &&
            previous.symbol === mapping.symbol &&
            previous.sourceLine - previous.generatedLine === mapping.sourceLine - mapping.generatedLine;

        if (!sameSegment) {
            mappings.push(mapping);
            previous = mapping;
        }
    }

    return { code: lines.join('\n'), lines: mappings };
}
