import type { BuildPhaseName } from '@cli/build/build-phase';
import type { OutputCapability } from '@cli/reporting/output-capability';

export type StyleTone = 'error' | 'warning' | 'success' | 'muted' | 'strong';

export type MarkerName = 'success' | 'warning' | 'failure' | 'pending';

const ESC = String.fromCharCode(27);

const RESET = `${ESC}[0m`;

const TONE_CODES: Readonly<Record<StyleTone, string>> = {
    error: `${ESC}[31m`,
    warning: `${ESC}[33m`,
    success: `${ESC}[32m`,
    muted: `${ESC}[90m`,
    strong: `${ESC}[1m`,
};

const UNICODE_MARKERS: Readonly<Record<MarkerName, string>> = { success: '✔', warning: '⚠', failure: '✖', pending: '·' };

const ASCII_MARKERS: Readonly<Record<MarkerName, string>> = { success: '+', warning: '!', failure: 'x', pending: '-' };

const UNICODE_PHASES: Readonly<Record<BuildPhaseName, string>> = {
    version: '🏷️',
    discovery: '🔍',
    compile: '⚙️',
    assembly: '📦',
    manifest: '📄',
    write: '💾',
    sync: '🔄',
    restart: '🚀',
};

const ASCII_PHASE_SYMBOL = '>';

const UNICODE_BAR = { filled: '█', empty: '░' };

const ASCII_BAR = { filled: '#', empty: '.' };

export const ERASE_LINE = `\r${ESC}[2K`;

export interface OutputStyle {
    capability: OutputCapability;
    paint(tone: StyleTone, text: string): string;
    marker(name: MarkerName): string;
    phaseSymbol(phase: BuildPhaseName): string;
    bar(completed: number, total: number, width: number): string;
    eraseLine(): string;
}

function clampRatio(completed: number, total: number): number {
    if (total <= 0) {
        return 0;
    }

    return Math.min(1, Math.max(0, completed / total));
}

export function createOutputStyle(capability: OutputCapability): OutputStyle {
    const markers = capability.unicode ? UNICODE_MARKERS : ASCII_MARKERS;
    const glyphs = capability.unicode ? UNICODE_BAR : ASCII_BAR;

    return {
        capability,
        paint: (tone: StyleTone, text: string): string => (capability.color ? `${TONE_CODES[tone]}${text}${RESET}` : text),
        marker: (name: MarkerName): string => markers[name],
        phaseSymbol: (phase: BuildPhaseName): string => (capability.unicode ? UNICODE_PHASES[phase] : ASCII_PHASE_SYMBOL),
        bar: (completed: number, total: number, width: number): string => {
            const size = Math.max(1, width);
            const filled = Math.round(clampRatio(completed, total) * size);

            return `${glyphs.filled.repeat(filled)}${glyphs.empty.repeat(size - filled)}`;
        },
        eraseLine: (): string => (capability.interactive ? ERASE_LINE : ''),
    };
}
