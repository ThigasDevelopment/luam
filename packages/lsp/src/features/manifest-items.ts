import { typeToString } from '@compiler/checker/types';
import { defaultText, ruleText, type ManifestField } from '@compiler/manifest/manifest-fields';
import { CompletionItemKind, type CompletionItem } from 'vscode-languageserver';

export function fieldDocumentation(field: ManifestField): string {
    const lines = [field.summary, '', field.required ? 'Required.' : 'Optional.'];
    const fallback = defaultText(field);
    const rule = ruleText(field);

    if (fallback !== null) {
        lines.push(`Default: \`${fallback}\`.`);
    }

    if (rule !== null) {
        lines.push(rule);
    }

    return lines.join('\n');
}

export function fieldDescription(field: ManifestField): string {
    if (field.required) {
        return 'required';
    }

    const fallback = defaultText(field);

    return fallback === null ? 'optional' : `default ${fallback}`;
}

export function fieldItem(field: ManifestField): CompletionItem {
    return {
        label: field.name,
        kind: CompletionItemKind.Property,
        detail: typeToString(field.type),
        labelDetails: { description: fieldDescription(field) },
        sortText: `${field.required ? '0' : '1'}${field.name}`,
        documentation: { kind: 'markdown', value: fieldDocumentation(field) },
    };
}

export function valueItem(value: string, detail: string, quoted: boolean): CompletionItem {
    return { label: quoted ? `'${value}'` : value, kind: quoted ? CompletionItemKind.EnumMember : CompletionItemKind.Value, detail };
}

export function environmentItem(key: string): CompletionItem {
    return { label: key, kind: CompletionItemKind.Variable, detail: 'string?', documentation: 'Declared in ".env".' };
}
