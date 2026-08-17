import type { Diagnostic, SourcePosition } from '@compiler/diagnostics/diagnostic';

import { manifestWarning } from './manifest-diagnostics';
import type { Evaluated } from './manifest-evaluated';

interface LocalBinding {
    evaluated: Evaluated;
    position: SourcePosition;
    read: boolean;
}

const UNUSED_LOCAL = 'check-unused-local';

const OPT_OUT = 'Read it, remove it, or rename it with a leading "_" to keep it on purpose.';

export class ManifestLocals {
    private readonly bindings = new Map<string, LocalBinding>();

    declare(name: string, evaluated: Evaluated, position: SourcePosition): void {
        this.bindings.set(name, { evaluated, position, read: false });
    }

    read(name: string): Evaluated | null {
        const binding = this.bindings.get(name);

        if (binding === undefined) {
            return null;
        }

        binding.read = true;

        return binding.evaluated;
    }

    unused(): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];

        for (const [name, binding] of this.bindings) {
            if (binding.read || name.startsWith('_')) {
                continue;
            }

            diagnostics.push(manifestWarning(UNUSED_LOCAL, `"${name}" is declared but never read. ${OPT_OUT}`, binding.position));
        }

        return diagnostics;
    }
}
