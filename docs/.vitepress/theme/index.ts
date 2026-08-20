import DefaultTheme from 'vitepress/theme';
import { defineAsyncComponent, h } from 'vue';
import type { Theme } from 'vitepress';

import VersionBanner from './VersionBanner.vue';
import './tokens.css';
import './shell.css';
import './content.css';
import './home.css';
import './playground.css';
import './custom.css';

const theme: Theme = {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, { 'layout-top': () => h(VersionBanner) }),
    enhanceApp({ app }) {
        app.component(
            'Playground',
            defineAsyncComponent(() => import('./Playground.vue')),
        );

        app.component(
            'LiveExample',
            defineAsyncComponent(() => import('./LiveExample.vue')),
        );
    },
};

export default theme;
