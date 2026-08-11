import DefaultTheme from 'vitepress/theme';
import { h } from 'vue';
import type { Theme } from 'vitepress';

import VersionBanner from './VersionBanner.vue';
import './custom.css';

const theme: Theme = {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, { 'layout-top': () => h(VersionBanner) }),
};

export default theme;
