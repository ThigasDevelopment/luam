import { FORMATTER_FIELDS, isFormatterPath } from '@compiler/format/formatter-fields';
import { findField, type ManifestField } from '@compiler/manifest/manifest-field';
import { findManifestField, MANIFEST_FIELDS } from '@compiler/manifest/manifest-fields';
import { isServerFilePath, SERVER_FIELDS } from '@compiler/workspace/workspace-fields';

interface ConfigFileKind {
    matches(path: string): boolean;
    fields: readonly ManifestField[];
}

const CONFIG_FILE_KINDS: readonly ConfigFileKind[] = [
    { matches: isFormatterPath, fields: FORMATTER_FIELDS },
    { matches: isServerFilePath, fields: SERVER_FIELDS },
];

function kindOf(path: string): ConfigFileKind | null {
    return CONFIG_FILE_KINDS.find((entry) => entry.matches(path)) ?? null;
}

export function rootFields(path: string): readonly ManifestField[] {
    return kindOf(path)?.fields ?? MANIFEST_FIELDS;
}

export function fieldAt(path: string, keys: readonly string[]): ManifestField | null {
    const kind = kindOf(path);

    if (kind === null) {
        return findManifestField(keys);
    }

    let fields: readonly ManifestField[] | null = kind.fields;
    let found: ManifestField | null = null;

    for (const segment of keys) {
        found = fields === null ? null : findField(fields, segment);

        if (found === null) {
            return null;
        }

        fields = found.members;
    }

    return found;
}
