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

export function finalizeEmission(code: string, markers: readonly EmissionMarker[], sourceLineOffset = 0): { code: string; lines: SourceLineMapping[] } {
    const lines = code.split('\n');
    const output: string[] = [];
    const mappings: SourceLineMapping[] = [];
    let previous: SourceLineMapping | null = null;

    for (const line of lines) {
        const pattern = /\u0000luam:(\d+)\u0000/;
        const match = pattern.exec(line);

        if (match === null) {
            output.push(line);

            continue;
        }

        const marker = markers[Number(match[1])];
        const emitted = line.replace(pattern, '');

        if (marker === undefined) {
            output.push(emitted);

            continue;
        }

        while (output.length + 1 < marker.sourceLine - sourceLineOffset) {
            output.push('');
        }

        const mapping: SourceLineMapping = { generatedLine: output.length + 1, sourceLine: marker.sourceLine };

        if (marker.symbol !== undefined) {
            mapping.symbol = marker.symbol;
        }

        output.push(emitted);

        const sameSegment =
            previous !== null &&
            previous.symbol === mapping.symbol &&
            previous.sourceLine - previous.generatedLine === mapping.sourceLine - mapping.generatedLine;

        if (!sameSegment) {
            mappings.push(mapping);
            previous = mapping;
        }
    }

    return { code: output.join('\n'), lines: mappings };
}
