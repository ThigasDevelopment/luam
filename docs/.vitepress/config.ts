import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitepress';

import { browserPath } from './browser-path';
import { liveExamples } from './live-examples';
import { localeSearchOptions, localeThemeConfig } from './locale-theme';
import { en } from './locales/en';
import { ptBR } from './locales/pt-br';
import { wrapTables } from './table-wrapper';
import { replaceVersionToken } from './version-token';

const require = createRequire(import.meta.url);

const { version } = require('../../packages/cli/package.json') as { version: string };

const luamGrammar = require('../../packages/vscode/syntaxes/luam.tmLanguage.json') as Record<string, unknown>;

const luamLanguage = { ...luamGrammar, name: 'luam', displayName: 'Luam' };

const SITE = 'https://luam.dracon.dev/';

const packageSource = (name: string): string => fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url));

const pathShim = fileURLToPath(new URL('./theme/playground/path-shim.ts', import.meta.url));

const LSP_SCOPE = '/packages/lsp/';

export default defineConfig({
    base: '/',
    title: 'Luam',
    description: en.description,
    lang: 'en-US',
    cleanUrls: true,
    lastUpdated: true,
    metaChunk: true,
    srcExclude: ['adr/**', 'generated/**', 'snippets/**'],
    sitemap: { hostname: SITE },
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/luam-mark.svg' }],
        ['link', { rel: 'alternate icon', type: 'image/png', href: '/luam-icon.png' }],
        ['meta', { name: 'theme-color', content: '#0891b2' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:site_name', content: 'Luam' }],
        ['meta', { property: 'og:url', content: SITE }],
    ],
    vite: {
        resolve: {
            alias: {
                '@compiler': packageSource('compiler'),
                '@runtime': packageSource('runtime'),
                '@mta-types': packageSource('mta-types'),
                '@lsp': packageSource('lsp'),
            },
        },
        plugins: [browserPath(pathShim, LSP_SCOPE)],
        worker: { format: 'es', plugins: () => [browserPath(pathShim, LSP_SCOPE)] },
    },
    markdown: {
        languages: [luamLanguage],
        theme: { light: 'github-light', dark: 'github-dark' },
        lineNumbers: false,
        config: (md) => {
            replaceVersionToken(md, version);
            liveExamples(md);
            wrapTables(md);
        },
    },
    themeConfig: {
        search: {
            provider: 'local',
            options: {
                locales: {
                    en: localeSearchOptions(en),
                    'pt-br': localeSearchOptions(ptBR),
                },
            },
        },
    },
    locales: {
        root: {
            label: 'Languages',
            lang: 'en-US',
            title: 'Luam',
            description: en.description,
            themeConfig: { nav: [], sidebar: [], luam: { version, locale: 'root' } },
        },
        en: {
            label: en.label,
            lang: en.lang,
            title: 'Luam',
            description: en.description,
            themeConfig: localeThemeConfig('en', en, version),
        },
        'pt-br': {
            label: ptBR.label,
            lang: ptBR.lang,
            title: 'Luam',
            description: ptBR.description,
            themeConfig: localeThemeConfig('pt-br', ptBR, version),
        },
    },
});
