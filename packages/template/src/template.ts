export type TemplateFileKind = 'config';

export interface TemplateFile {
    source: string;
    path: string;
    kind: TemplateFileKind;
}

export const TEMPLATE_FILES: readonly TemplateFile[] = [{ source: 'luam.json', path: 'luam.json', kind: 'config' }];

export function resolveTemplateUrl(source: string): URL {
    return new URL(`../files/${source}`, import.meta.url);
}
