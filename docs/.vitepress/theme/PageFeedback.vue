<script setup lang="ts">
import { computed } from 'vue';
import { useData, useRoute, withBase } from 'vitepress';

interface FeedbackStrings {
    question?: string;
    action?: string;
    note?: string;
    issues?: string;
    site?: string;
}

interface LuamTheme {
    version?: string;
    locale?: string;
    feedback?: FeedbackStrings;
}

const { lang, page, theme } = useData();

const route = useRoute();

const feedback = computed(() => {
    const luam = theme.value.luam as LuamTheme | undefined;
    const strings = luam?.feedback;

    if (luam === undefined || luam.locale === 'root' || strings === undefined || strings.question === undefined) {
        return null;
    }

    const site = (strings.site ?? '/').replace(/\/$/, '');
    const address = `${site}${withBase(route.path)}`;
    const title = `docs: ${page.value.title}`;
    const body = [
        `Page: ${address}`,
        `Language: ${lang.value}`,
        `Version: ${luam.version ?? 'unknown'}`,
        '',
        '## What is wrong',
        '',
        '',
        '## What you expected',
        '',
    ].join('\n');

    const query = new URLSearchParams({ title, body });

    return {
        question: strings.question,
        action: strings.action ?? '',
        note: strings.note ?? '',
        href: `${strings.issues ?? ''}?${query.toString()}`,
    };
});
</script>

<template>
    <aside v-if="feedback" class="luam-feedback">
        <p class="luam-feedback-question">{{ feedback.question }}</p>
        <p class="luam-feedback-action">
            <a :href="feedback.href" target="_blank" rel="noreferrer">{{ feedback.action }}</a>
        </p>
        <p class="luam-feedback-note">{{ feedback.note }}</p>
    </aside>
</template>
