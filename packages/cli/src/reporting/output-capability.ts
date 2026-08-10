export interface OutputTarget {
    isTTY?: boolean | undefined;
    columns?: number | undefined;
}

export interface OutputCapability {
    interactive: boolean;
    color: boolean;
    unicode: boolean;
    columns: number;
}

export interface CapabilityOptions {
    target?: OutputTarget | null;
    env?: Readonly<Record<string, string | undefined>>;
    noColor?: boolean;
}

export const DEFAULT_COLUMNS = 80;

export const PLAIN_CAPABILITY: OutputCapability = { interactive: false, color: false, unicode: false, columns: DEFAULT_COLUMNS };

export const RICH_CAPABILITY: OutputCapability = { interactive: true, color: true, unicode: true, columns: DEFAULT_COLUMNS };

function isColorDisabled(env: Readonly<Record<string, string | undefined>>, noColor: boolean): boolean {
    const value = env.NO_COLOR;

    return noColor || (value !== undefined && value !== '');
}

export function detectCapability(options: CapabilityOptions = {}): OutputCapability {
    const target = options.target ?? null;
    const env = options.env ?? process.env;
    const columns = target?.columns ?? DEFAULT_COLUMNS;
    const interactive = target?.isTTY === true;
    const rich = interactive && !isColorDisabled(env, options.noColor === true);

    return { interactive, color: rich, unicode: rich, columns };
}
