<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useData, withBase } from 'vitepress';

import PlaygroundCode from './PlaygroundCode.vue';
import { PlaygroundCompiler } from './playground/worker-client';
import { type PlaygroundDiagnostic, type PlaygroundEnvironment } from './playground/protocol';

import type { PlaygroundStrings } from '../locale-theme';

const props = withDefaults(
    defineProps<{
        source: string;
        environment?: PlaygroundEnvironment;
        oop?: boolean;
        expectError?: boolean;
    }>(),
    { environment: 'shared', oop: false, expectError: false },
);

const { theme, localeIndex } = useData();

const strings = computed(() => (theme.value.luam as { playground: PlaygroundStrings }).playground);

const decoded = computed(() => decodeURIComponent(escape(atob(props.source))));

const draft = ref('');
const editing = ref(false);
const code = ref<string | null>(null);
const diagnostics = ref<PlaygroundDiagnostic[]>([]);
const failure = ref<string | null>(null);
const busy = ref(false);
const shown = ref(false);

let compiler: PlaygroundCompiler | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;

const errorLines = computed(() => diagnostics.value.filter((entry) => entry.severity === 'error').map((entry) => entry.line));

const playgroundLink = computed(() => withBase(`/${localeIndex.value === 'pt-br' ? 'pt-br' : 'en'}/playground?c=${encodeURIComponent(props.source)}`));

async function run(): Promise<void> {
    compiler ??= new PlaygroundCompiler();
    busy.value = true;

    const response = await compiler.compile({ source: draft.value, environment: props.environment, oop: props.oop });

    if (response === null) {
        return;
    }

    busy.value = false;
    code.value = response.code;
    diagnostics.value = response.diagnostics;
    failure.value = response.failure;
    shown.value = true;
}

function begin(): void {
    if (draft.value === '') {
        draft.value = decoded.value;
    }

    editing.value = true;

    void run();
}

function reset(): void {
    draft.value = decoded.value;
    editing.value = false;
    shown.value = false;
    code.value = null;
    diagnostics.value = [];
}

function onEdit(value: string): void {
    draft.value = value;

    if (debounce !== null) {
        clearTimeout(debounce);
    }

    debounce = setTimeout(() => void run(), 260);
}

onBeforeUnmount(() => {
    if (debounce !== null) {
        clearTimeout(debounce);
    }

    compiler?.restart();
    compiler = null;
});
</script>

<template>
    <div class="luam-example" :class="{ 'is-editing': editing }">
        <div v-if="!editing" class="luam-example-static">
            <slot />
        </div>

        <div v-else class="luam-example-live">
            <PlaygroundCode :code="draft" editable :error-lines="errorLines" :label="strings.sourceLabel" @update:code="onEdit" />
        </div>

        <div class="luam-example-bar">
            <span class="luam-example-env">{{ environment }}<template v-if="oop"> · oop</template></span>

            <span v-if="expectError" class="luam-example-flag">{{ strings.expectedError }}</span>

            <span class="luam-example-spacer"></span>

            <button v-if="!editing" type="button" @click="begin">{{ strings.tryIt }}</button>
            <button v-else type="button" @click="reset">{{ strings.reset }}</button>

            <a :href="playgroundLink">{{ strings.openInPlayground }}</a>
        </div>

        <div v-if="shown" class="luam-example-result">
            <p v-if="busy" class="luam-eyebrow">{{ strings.compiling }}</p>

            <ul v-if="diagnostics.length > 0" class="luam-example-diagnostics">
                <li v-for="(entry, index) in diagnostics" :key="index" :class="`is-${entry.severity}`">
                    <span class="luam-report-where">{{ entry.line }}:{{ entry.column }}</span>
                    <span class="luam-report-code">{{ entry.code }}</span>
                    <span>{{ entry.message }}</span>
                </li>
            </ul>

            <details v-if="code" class="luam-example-output" open>
                <summary>{{ strings.outputTab }}</summary>
                <PlaygroundCode :code="code" />
            </details>

            <p v-if="failure" class="luam-report-note">{{ failure }}</p>
        </div>
    </div>
</template>
