import { readTemplateSource } from '@cli/scaffold/template-files';
import { CONFIG_FILE_NAME } from '@cli/config/config-schema';
import { TEMPLATE_FILES, type TemplateFile } from '@template/template';

export interface ScaffoldFile {
    path: string;
    content: string;
}

export interface ScaffoldPlan {
    name: string;
    files: ScaffoldFile[];
}

function renderConfig(source: string, name: string): string {
    const parsed: unknown = JSON.parse(source);
    const config = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};

    return `${JSON.stringify({ ...config, name, description: `The ${name} resource, scaffolded by luam init.` }, null, 4)}\n`;
}

function renderFile(file: TemplateFile, name: string): ScaffoldFile {
    const source = readTemplateSource(file.source);

    if (file.path !== CONFIG_FILE_NAME) {
        return { path: file.path, content: source };
    }

    return { path: file.path, content: renderConfig(source, name) };
}

export function buildScaffoldPlan(name: string): ScaffoldPlan {
    return { name, files: TEMPLATE_FILES.map((file) => renderFile(file, name)) };
}
