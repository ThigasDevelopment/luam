import { FORMATTER_FIELDS, isFormatterPath } from '@compiler/format/formatter-fields';
import { findField, type ManifestField } from '@compiler/manifest/manifest-field';
import { findManifestField, MANIFEST_FIELDS } from '@compiler/manifest/manifest-fields';

export function rootFields(path: string): readonly ManifestField[] {
    return isFormatterPath(path) ? FORMATTER_FIELDS : MANIFEST_FIELDS;
}

export function fieldAt(path: string, keys: readonly string[]): ManifestField | null {
    if (!isFormatterPath(path)) {
        return findManifestField(keys);
    }

    return keys.length === 1 ? findField(FORMATTER_FIELDS, keys[0] ?? '') : null;
}
