import { readTemplateSource } from '@cli/scaffold/template-files';
import type { InitProjectDetails } from '@cli/commands/init-prompt';
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

function renderConfig(source: string, details: InitProjectDetails): string {
    const parsed: unknown = JSON.parse(source);
    const config = typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    const { name: _name, version: _version, description: _description, author: _author, ...template } = config;

    const metadata = {
        ...template,
        name: details.name,
        version: details.version,
        ...(details.description === null ? {} : { description: details.description }),
        ...(details.author === null ? {} : { author: details.author }),
    };

    return `${JSON.stringify(metadata, null, 4)}\n`;
}

function renderFile(file: TemplateFile, details: InitProjectDetails): ScaffoldFile {
    const source = readTemplateSource(file.source);

    if (file.path !== CONFIG_FILE_NAME) {
        return { path: file.path, content: source };
    }

    return { path: file.path, content: renderConfig(source, details) };
}

export function buildScaffoldPlan(details: InitProjectDetails): ScaffoldPlan {
    return { name: details.name, files: TEMPLATE_FILES.map((file) => renderFile(file, details)) };
}
