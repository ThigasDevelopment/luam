import { createRequire } from 'node:module';

import { defineConfig } from 'vitepress';

import { localeSearchOptions, localeThemeConfig } from './locale-theme';
import { en } from './locales/en';
import { ptBR } from './locales/pt-br';

const require = createRequire(import.meta.url);

const { version } = require('../../packages/cli/package.json') as { version: string };

const luamGrammar = require('../../packages/vscode/syntaxes/luam.tmLanguage.json') as Record<string, unknown>;

const luamLanguage = { ...luamGrammar, name: 'luam', displayName: 'Luam' };

const SITE = 'https://thigasdevelopment.github.io/luam/';

export default defineConfig({
    base: '/luam/',
    title: 'Luam',
    description: en.description,
    lang: 'en-US',
    cleanUrls: true,
    lastUpdated: true,
    metaChunk: true,
    srcExclude: ['adr/**', 'snippets/**'],
    sitemap: { hostname: SITE },
    head: [
        ['link', { rel: 'icon', type: 'image/svg+xml', href: '/luam/luam-mark.svg' }],
        ['link', { rel: 'alternate icon', type: 'image/png', href: '/luam/luam-icon.png' }],
        ['meta', { name: 'theme-color', content: '#0891b2' }],
        ['meta', { property: 'og:type', content: 'website' }],
        ['meta', { property: 'og:site_name', content: 'Luam' }],
        ['meta', { property: 'og:url', content: SITE }],
    ],
    markdown: {
        languages: [luamLanguage],
        theme: { light: 'github-light', dark: 'github-dark' },
        lineNumbers: false,
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
