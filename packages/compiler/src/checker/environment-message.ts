import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { Environment } from '@compiler/environment/environment';

import type { CheckContext } from './context';

export function scopeLabel(environment: string): string {
    return environment === 'shared' ? 'shared' : `${environment}-only`;
}

export function unavailableTail(environment: Environment): string {
    return `is not available in a "${environment}" file.`;
}

export function unusableTail(environment: Environment): string {
    return `cannot be used in a "${environment}" file.`;
}

export function reportEnvironment(context: CheckContext, code: string, message: string, position: SourcePosition): void {
    if (context.environment === 'shared') {
        return;
    }

    context.report(code, message, position);
}
