<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, withBase } from 'vitepress';

interface LuamTheme {
    version?: string;
    locale?: string;
    bannerText?: string;
    bannerLink?: string;
    bannerLinkText?: string;
}

const LAYOUT_TOP_HEIGHT = '--vp-layout-top-height';

const { theme } = useData();

const element = ref<HTMLElement | null>(null);

let observer: ResizeObserver | null = null;

const banner = computed(() => {
    const luam = theme.value.luam as LuamTheme | undefined;

    if (luam === undefined || luam.locale === 'root' || luam.bannerText === undefined) {
        return null;
    }

    return {
        text: `${luam.bannerText} ${luam.version}.`,
        link: withBase(luam.bannerLink ?? '/'),
        linkText: luam.bannerLinkText ?? '',
    };
});

function setLayoutTop(height: string): void {
    document.documentElement.style.setProperty(LAYOUT_TOP_HEIGHT, height);
}

function stopObserving(): void {
    observer?.disconnect();
    observer = null;
}

function track(current: HTMLElement | null): void {
    stopObserving();

    if (current === null) {
        setLayoutTop('0px');

        return;
    }

    observer = new ResizeObserver(([entry]) => {
        if (entry !== undefined) {
            setLayoutTop(`${Math.round(entry.target.getBoundingClientRect().height)}px`);
        }
    });

    observer.observe(current);
}

onMounted(() => {
    track(element.value);
});

watch(element, track);

onBeforeUnmount(() => {
    stopObserving();
    setLayoutTop('0px');
});
</script>

<template>
    <div v-if="banner" ref="element" class="luam-version-banner">
        <p>
            <span>{{ banner.text }}</span>
            <a :href="banner.link">{{ banner.linkText }}</a>
        </p>
    </div>
</template>
