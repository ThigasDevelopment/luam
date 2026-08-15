import { isManifestObject, type ManifestObject } from './manifest-value';

export function readString(source: ManifestObject, field: string): string | null {
    const value = source[field];

    return typeof value === 'string' ? value : null;
}

export function readNumber(source: ManifestObject, field: string): number | null {
    const value = source[field];

    return typeof value === 'number' ? value : null;
}

export function readBoolean(source: ManifestObject, field: string): boolean | null {
    const value = source[field];

    return typeof value === 'boolean' ? value : null;
}

export function readStrings(source: ManifestObject, field: string): string[] {
    const value = source[field];

    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];
}

export function readTable(source: ManifestObject, field: string): ManifestObject | null {
    const value = source[field];

    return isManifestObject(value) ? value : null;
}

export function readTables(source: ManifestObject, field: string): ManifestObject[] {
    const value = source[field];

    return Array.isArray(value) ? value.filter(isManifestObject) : [];
}
