export type TemplateFileKind = 'manifest';

export interface TemplateFile {
    source: string;
    path: string;
    kind: TemplateFileKind;
}

export const MANIFEST_FILE_NAME = '.luam.manifest';

export const TEMPLATE_FILES: readonly TemplateFile[] = [{ source: 'luam.manifest', path: MANIFEST_FILE_NAME, kind: 'manifest' }];

export function resolveTemplateUrl(source: string): URL {
    return new URL(`../files/${source}`, import.meta.url);
}
