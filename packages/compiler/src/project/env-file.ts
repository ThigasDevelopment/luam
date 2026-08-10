export type EnvValueKind = 'string' | 'number' | 'boolean';

export interface EnvEntry {
    key: string;
    value: string;
    kind: EnvValueKind;
    line: number;
}

export interface EnvParseError {
    line: number;
    message: string;
}

export interface EnvFile {
    entries: EnvEntry[];
    errors: EnvParseError[];
}

const ENTRY = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/;

const SENSITIVE = /(password|secret|token|key|credential|dsn|private)/i;

export const EMPTY_ENV_FILE: EnvFile = { entries: [], errors: [] };

function unquote(raw: string): string | null {
    const quote = raw.slice(0, 1);

    if (quote !== '"' && quote !== "'") {
        return null;
    }

    const closing = raw.lastIndexOf(quote);

    return closing > 0 ? raw.slice(1, closing) : null;
}

function stripComment(raw: string): string {
    return raw.replace(/\s+#.*$/, '').trim();
}

function classify(raw: string): { value: string; kind: EnvValueKind } {
    const quoted = unquote(raw);

    if (quoted !== null) {
        return { value: quoted, kind: 'string' };
    }

    const value = stripComment(raw);

    if (value === 'true' || value === 'false') {
        return { value, kind: 'boolean' };
    }

    return { value, kind: value.length > 0 && Number.isFinite(Number(value)) ? 'number' : 'string' };
}

export function parseEnvFile(source: string): EnvFile {
    const entries: EnvEntry[] = [];
    const errors: EnvParseError[] = [];

    source.split(/\r?\n/).forEach((raw, index) => {
        const trimmed = raw.trim();
        const line = index + 1;

        if (trimmed.length === 0 || trimmed.startsWith('#')) {
            return;
        }

        const match = ENTRY.exec(trimmed);

        if (match === null || match[1] === undefined || match[2] === undefined) {
            errors.push({ line, message: `Malformed entry on line ${line}. Expected "KEY=value".` });

            return;
        }

        const { value, kind } = classify(match[2]);

        entries.push({ key: match[1], value, kind, line });
    });

    return { entries, errors };
}

export function isSensitiveKey(key: string): boolean {
    return SENSITIVE.test(key);
}

export function mergeEnvFiles(base: EnvFile, overrides: EnvFile): EnvFile {
    const merged = new Map(base.entries.map((entry) => [entry.key, entry]));

    for (const entry of overrides.entries) {
        const declared = merged.get(entry.key);

        if (declared !== undefined) {
            merged.set(entry.key, { ...declared, value: entry.value });
        }
    }

    return { entries: [...merged.values()], errors: [...base.errors, ...overrides.errors] };
}
