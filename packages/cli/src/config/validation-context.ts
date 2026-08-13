import type { Diagnostic } from '@compiler/diagnostics/diagnostic';
import { manifestError, manifestWarning } from '@compiler/manifest/manifest-diagnostics';
import { positionAt, type PositionLookup } from '@compiler/manifest/manifest-rules';

export type Environment = Readonly<Record<string, string | undefined>>;

export class ValidationContext {
    readonly diagnostics: Diagnostic[] = [];

    readonly env: Environment;

    private readonly positions: PositionLookup;

    constructor(positions: PositionLookup, env: Environment) {
        this.positions = positions;
        this.env = env;
    }

    error(code: string, message: string, key: string): void {
        this.diagnostics.push(manifestError(code, message, positionAt(this.positions, key)));
    }

    warn(code: string, message: string, key: string): void {
        this.diagnostics.push(manifestWarning(code, message, positionAt(this.positions, key)));
    }
}
