import type { DefaultTheme } from 'vitepress';

import { pagePath, SECTIONS, type LocaleId } from './structure';

export interface PlaygroundStrings {
    environmentLabel: string;
    oopLabel: string;
    sourceLabel: string;
    outputTab: string;
    diagnosticsTab: string;
    copy: string;
    copied: string;
    reset: string;
    compiling: string;
    clean: string;
    blocked: string;
    privacy: string;
    scriptRequired: string;
    lspHint: string;
    tryIt: string;
    openInPlayground: string;
    expectedError: string;
    share: string;
    outline: string;
    shortcuts: string;
}

export interface LocaleStrings {
    label: string;
    lang: string;
    description: string;
    playground: PlaygroundStrings;
    sectionTitles: Record<string, string>;
    pageTitles: Record<string, string>;
    editLinkText: string;
    lastUpdatedText: string;
    outlineTitle: string;
    returnToTopLabel: string;
    sidebarMenuLabel: string;
    darkModeSwitchLabel: string;
    lightModeSwitchTitle: string;
    darkModeSwitchTitle: string;
    languageMenuLabel: string;
    docFooterPrev: string;
    docFooterNext: string;
    notFoundTitle: string;
    notFoundQuote: string;
    notFoundLink: string;
    searchButtonText: string;
    searchPlaceholder: string;
    searchNoResults: string;
    searchResetLabel: string;
    searchFooterNavigate: string;
    searchFooterSelect: string;
    searchFooterClose: string;
    footerMessage: string;
    footerCopyright: string;
    versionBanner: string;
    versionBannerLink: string;
    feedbackQuestion: string;
    feedbackAction: string;
    feedbackNote: string;
}

const REPOSITORY = 'https://github.com/ThigasDevelopment/luam';

export const SITE = 'https://luam.dracon.dev/';

function localeRoot(locale: LocaleId): string {
    return `/${locale}/`;
}

function sidebarGroups(locale: LocaleId, strings: LocaleStrings, active: string): DefaultTheme.SidebarItem[] {
    return SECTIONS.map((section) => ({
        text: strings.sectionTitles[section.id] ?? section.id,
        collapsed: section.id !== active,
        items: section.pages.map((page) => ({
            text: strings.pageTitles[`${section.id}/${page}`] ?? page,
            link: `${localeRoot(locale)}${pagePath(section.id, page)}`,
        })),
    }));
}

export function localeSidebar(locale: LocaleId, strings: LocaleStrings): DefaultTheme.Sidebar {
    const sidebar: Record<string, DefaultTheme.SidebarItem[]> = {};

    for (const section of SECTIONS) {
        sidebar[`${localeRoot(locale)}${section.id}/`] = sidebarGroups(locale, strings, section.id);
    }

    sidebar[localeRoot(locale)] = sidebarGroups(locale, strings, 'guide');

    return sidebar;
}

export function localeNav(locale: LocaleId, strings: LocaleStrings): DefaultTheme.NavItem[] {
    const sections = SECTIONS.map((section) => ({
        text: strings.sectionTitles[section.id] ?? section.id,
        link: `${localeRoot(locale)}${pagePath(section.id, 'index')}`,
        activeMatch: `${localeRoot(locale)}${section.id}/`,
    }));

    return [...sections, { text: 'Playground', link: `${localeRoot(locale)}playground`, activeMatch: `${localeRoot(locale)}playground` }];
}

export function localeSearchOptions(strings: LocaleStrings): Record<string, unknown> {
    return {
        translations: {
            button: { buttonText: strings.searchButtonText, buttonAriaLabel: strings.searchButtonText },
            modal: {
                displayDetails: strings.searchButtonText,
                resetButtonTitle: strings.searchResetLabel,
                backButtonTitle: strings.returnToTopLabel,
                noResultsText: strings.searchNoResults,
                footer: {
                    selectText: strings.searchFooterSelect,
                    navigateText: strings.searchFooterNavigate,
                    closeText: strings.searchFooterClose,
                },
            },
        },
    };
}

export function localeThemeConfig(locale: LocaleId, strings: LocaleStrings, version: string): DefaultTheme.Config {
    return {
        logo: '/luam-mark.svg',
        siteTitle: 'Luam',
        nav: localeNav(locale, strings),
        sidebar: localeSidebar(locale, strings),
        outline: { level: [2, 3], label: strings.outlineTitle },
        socialLinks: [{ icon: 'github', link: REPOSITORY }],
        editLink: {
            pattern: `${REPOSITORY}/edit/main/docs/:path`,
            text: strings.editLinkText,
        },
        lastUpdatedText: strings.lastUpdatedText,
        returnToTopLabel: strings.returnToTopLabel,
        sidebarMenuLabel: strings.sidebarMenuLabel,
        darkModeSwitchLabel: strings.darkModeSwitchLabel,
        lightModeSwitchTitle: strings.lightModeSwitchTitle,
        darkModeSwitchTitle: strings.darkModeSwitchTitle,
        langMenuLabel: strings.languageMenuLabel,
        docFooter: { prev: strings.docFooterPrev, next: strings.docFooterNext },
        notFound: {
            title: strings.notFoundTitle,
            quote: strings.notFoundQuote,
            linkText: strings.notFoundLink,
            linkLabel: strings.notFoundLink,
        },
        footer: { message: strings.footerMessage, copyright: strings.footerCopyright },
        luam: {
            version,
            locale,
            bannerText: strings.versionBanner,
            bannerLink: `${localeRoot(locale)}changelog`,
            bannerLinkText: strings.versionBannerLink,
            playground: strings.playground,
            feedback: {
                question: strings.feedbackQuestion,
                action: strings.feedbackAction,
                note: strings.feedbackNote,
                issues: `${REPOSITORY}/issues/new`,
                site: SITE,
            },
        },
    } as DefaultTheme.Config;
}
