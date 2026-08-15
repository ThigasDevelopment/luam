export type StrictMode = 'strict' | 'nonstrict' | 'nocheck';

export const DEFAULT_STRICT_MODE: StrictMode = 'strict';

const STRICT_MODES: ReadonlySet<string> = new Set(['strict', 'nonstrict', 'nocheck']);

export function isStrictMode(value: string): value is StrictMode {
    return STRICT_MODES.has(value);
}

export function resolveStrictMode(directives: readonly string[], projectStrict: boolean | null = null): StrictMode {
    for (const directive of directives) {
        const value = directive.trim();

        if (isStrictMode(value)) {
            return value;
        }
    }

    if (projectStrict === null) {
        return DEFAULT_STRICT_MODE;
    }

    return projectStrict ? 'strict' : 'nonstrict';
}
