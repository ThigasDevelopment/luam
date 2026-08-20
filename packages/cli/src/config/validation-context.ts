import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { manifestError } from '@compiler/manifest/manifest-diagnostics';
import { positionAt, type PositionLookup } from '@compiler/manifest/manifest-rules';

export type Environment = Readonly<Record<string, string | undefined>>;

export class ValidationContext {
    readonly diagnostics: Diagnostic[] = [];

    private readonly positions: PositionLookup;

    constructor(positions: PositionLookup) {
        this.positions = positions;
    }

    error(code: string, message: string, key: string): void {
        this.diagnostics.push(manifestError(code, message, positionAt(this.positions, key)));
    }
}
