export type LocaleId = 'en' | 'pt-br';

export interface Section {
    id: string;
    pages: string[];
}

export const LOCALES: readonly LocaleId[] = ['en', 'pt-br'];

export const SECTIONS: readonly Section[] = [
    {
        id: 'guide',
        pages: [
            'index',
            'comparison',
            'installation',
            'quick-start',
            'project-layout',
            'daily-development',
            'how-luam-works',
            'migration',
            'troubleshooting',
        ],
    },
    {
        id: 'language',
        pages: [
            'index',
            'syntax',
            'types',
            'functions',
            'template-strings',
            'enums-and-interfaces',
            'classes',
            'decorators',
            'extensions',
            'exports',
            'declaration-files',
            'strictness',
        ],
    },
    {
        id: 'mta',
        pages: ['index', 'environments', 'apis-and-events', 'oop', 'resources', 'configuration', 'security'],
    },
    {
        id: 'tooling',
        pages: ['index', 'cli', 'luam-manifest', 'editors', 'theme', 'language-server', 'ci-and-deployment'],
    },
    {
        id: 'recipes',
        pages: [
            'index',
            'first-resource',
            'shared-function',
            'client-hud',
            'server-command',
            'event-handler',
            'typed-class',
            'oop-api',
            'exported-function',
            'environment-configuration',
            'local-development',
        ],
    },
    {
        id: 'reference',
        pages: ['index', 'keywords', 'operators', 'directives', 'configuration-fields', 'output-layouts', 'diagnostics', 'limitations', 'compatibility'],
    },
];

export const ROOT_PAGES: readonly string[] = ['index', 'changelog', 'playground'];

export function pageId(section: string, page: string): string {
    return page === 'index' ? section : `${section}/${page}`;
}

export function pagePath(section: string, page: string): string {
    return page === 'index' ? `${section}/` : `${section}/${page}`;
}

export function pageFiles(): string[] {
    const sectionFiles = SECTIONS.flatMap((section) => section.pages.map((page) => `${section.id}/${page}.md`));

    return [...ROOT_PAGES.map((page) => `${page}.md`), ...sectionFiles];
}
