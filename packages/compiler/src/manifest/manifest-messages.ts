import type { Type } from '@compiler/checker/types';

import { UNKNOWN_HELPER } from './manifest-diagnostics';
import { describeReceived, describeType, quoteList } from './manifest-value';
import type { ManifestField } from './manifest-fields';

export function quoteOr(values: readonly string[]): string {
    return values.map((value) => `"${value}"`).join(' or ');
}

export function typeMessage(path: string, field: ManifestField, received: Type | string): string {
    const actual = typeof received === 'string' ? received : describeReceived(received);

    return `"${path}" must be ${describeType(field.type)} but received ${actual}.`;
}

export function closedSetMessage(path: string, field: ManifestField, value: string): string {
    const values = field.values ?? [];

    if (field.valueCode === UNKNOWN_HELPER) {
        return `"${path}" received "${value}", which is not a runtime helper. Known helpers: ${quoteList(values)}.`;
    }

    return `"${path}" must be ${quoteOr(values)} but received "${value}".`;
}

export function unknownNameMessage(name: string): string {
    return `"${name}" is not defined in this manifest. Declare it with "local", or read "mode", "env", or "root".`;
}

export function missingMessage(path: string, field: ManifestField): string {
    return `"${path}" requires a "${field.name}" field. ${field.summary}`;
}
