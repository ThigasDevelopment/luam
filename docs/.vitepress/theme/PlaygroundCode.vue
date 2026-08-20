<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import { highlight, lineCount } from './playground/highlight';

const props = withDefaults(
    defineProps<{
        code: string;
        editable?: boolean;
        errorLines?: number[];
        label?: string;
        inputId?: string;
    }>(),
    { editable: false, errorLines: () => [], label: '', inputId: '' },
);

const emit = defineEmits<{ (event: 'update:code', value: string): void }>();

const field = ref<HTMLTextAreaElement | null>(null);

const body = ref<HTMLElement | null>(null);

const html = computed(() => highlight(props.code));

const lines = computed(() => lineCount(props.code));

const errors = computed(() => new Set(props.errorLines));

function resize(): void {
    const element = field.value;

    if (element === null) {
        return;
    }

    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;

    const measured = body.value?.querySelector('pre');

    if (measured !== null && measured !== undefined) {
        element.style.width = `${measured.scrollWidth}px`;
    }
}

function onInput(event: Event): void {
    emit('update:code', (event.target as HTMLTextAreaElement).value);
}

watch(
    () => props.code,
    () => void nextTick(resize),
    { immediate: true },
);
</script>

<template>
    <div class="luam-code" :class="{ 'is-editable': editable }">
        <div class="luam-code-gutter" aria-hidden="true">
            <span v-for="line in lines" :key="line" :class="{ 'has-error': errors.has(line) }">{{ line }}</span>
        </div>

        <div ref="body" class="luam-code-body">
            <pre aria-hidden="true"><code v-html="html"></code></pre>

            <textarea
                v-if="editable"
                :id="inputId"
                ref="field"
                :value="code"
                :aria-label="label"
                spellcheck="false"
                autocapitalize="off"
                autocorrect="off"
                autocomplete="off"
                @input="onInput"
            ></textarea>
        </div>
    </div>
</template>
