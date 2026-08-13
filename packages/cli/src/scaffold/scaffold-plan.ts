import type { InitProjectDetails } from '@cli/commands/init-prompt';
import { renderManifest } from '@cli/scaffold/manifest-template';
import { readTemplateSource } from '@cli/scaffold/template-files';
import { TEMPLATE_FILES, type TemplateFile } from '@template/template';

export interface ScaffoldFile {
    path: string;
    content: string;
}

export interface ScaffoldPlan {
    name: string;
    files: ScaffoldFile[];
}

function renderFile(file: TemplateFile, details: InitProjectDetails): ScaffoldFile {
    const source = readTemplateSource(file.source);

    if (file.kind !== 'manifest') {
        return { path: file.path, content: source };
    }

    return { path: file.path, content: renderManifest(source, details) };
}

export function buildScaffoldPlan(details: InitProjectDetails): ScaffoldPlan {
    return { name: details.name, files: TEMPLATE_FILES.map((file) => renderFile(file, details)) };
}
