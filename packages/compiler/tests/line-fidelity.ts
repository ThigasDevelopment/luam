import { expect } from 'vitest';

import { compile } from '@compiler/index';

const FILE_PATH = 'src/server/main.luam';

export interface FidelityOptions {
    lowered?: readonly number[];
}

export function toLines(text: string): string[] {
    return text.replace(/\r?\n$/, '').split('\n');
}

function emitted(source: string, development: boolean): string {
    const result = compile(source, { filePath: FILE_PATH, development });
    const errors = result.diagnostics.filter((diagnostic) => diagnostic.severity === 'error');

    expect(errors.map((diagnostic) => `${diagnostic.code}: ${diagnostic.message}`)).toEqual([]);

    return result.code ?? '';
}

export function developmentCode(source: string): string {
    return emitted(source, true);
}

export function releaseCode(source: string): string {
    return emitted(source, false);
}

export function expectLineFidelity(source: string, options: FidelityOptions = {}): void {
    const authored = toLines(source);
    const generated = toLines(developmentCode(source));
    const lowered = new Set(options.lowered ?? []);
    const report: string[] = [];

    if (authored.length !== generated.length) {
        report.push(`line count: ${authored.length} authored, ${generated.length} generated`);
    }

    for (let index = 0; index < Math.max(authored.length, generated.length); index += 1) {
        const left = authored[index] ?? '<missing>';
        const right = generated[index] ?? '<missing>';

        if (lowered.has(index + 1) === (left === right)) {
            report.push(`${index + 1}: ${JSON.stringify(left)} | ${JSON.stringify(right)}`);
        }
    }

    expect(report).toEqual([]);
}
