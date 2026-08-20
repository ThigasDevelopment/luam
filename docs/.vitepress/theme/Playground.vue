<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, withBase } from 'vitepress';

import PlaygroundCode from './PlaygroundCode.vue';
import PlaygroundEditor from './PlaygroundEditor.vue';
import { type EditorBridge } from './playground/editor-lsp';
import { type LspSymbol } from './playground/lsp-protocol';
import { LspSession } from './playground/lsp-client';
import { DEFAULT_DOCUMENT } from './playground/starting-document';
import { ENVIRONMENTS, type PlaygroundDiagnostic, type PlaygroundEnvironment } from './playground/protocol';

import type { PlaygroundStrings } from '../locale-theme';

const { theme } = useData();

const strings = computed(() => (theme.value.luam as { playground: PlaygroundStrings }).playground);

const home = computed(() => withBase(`/${(theme.value.luam as { locale: string }).locale}/`));

const opening = ref(DEFAULT_DOCUMENT.source);
const source = ref(DEFAULT_DOCUMENT.source);
const environment = ref<PlaygroundEnvironment>(DEFAULT_DOCUMENT.environment);
const oop = ref(DEFAULT_DOCUMENT.oop);

const code = ref<string | null>(null);
const diagnostics = ref<PlaygroundDiagnostic[]>([]);
const failure = ref<string | null>(null);
const busy = ref(false);
const ready = ref(false);
const copied = ref(false);
const symbols = ref<LspSymbol[]>([]);
const shared = ref('');
const split = ref(50);

const STORAGE_KEY = 'luam-playground';

let dragging = false;



function startDrag(): void {
    dragging = true;
}

function onDrag(event: MouseEvent): void {
    if (!dragging) {
        return;
    }

    const box = (event.currentTarget as HTMLElement).getBoundingClientRect();

    split.value = Math.min(80, Math.max(20, ((event.clientX - box.left) / box.width) * 100));
}

function persist(): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ source: source.value, environment: environment.value, oop: oop.value }));
}

function restore(): boolean {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
        return false;
    }

    try {
        const parsed = JSON.parse(saved) as { source?: string; environment?: PlaygroundEnvironment; oop?: boolean };

        if (typeof parsed.source !== 'string' || parsed.source === '') {
            return false;
        }

        opening.value = parsed.source;
        source.value = parsed.source;
        environment.value = parsed.environment ?? DEFAULT_DOCUMENT.environment;
        oop.value = parsed.oop ?? false;

        return true;
    } catch {
        return false;
    }
}

let session: LspSession | null = null;
let debounce: ReturnType<typeof setTimeout> | null = null;

const sourceFile = computed(() => `src/${environment.value}/main.luam`);

const outputFile = computed(() => `build/luam-demo/src/${environment.value}.lua`);

function query(): { source: string; environment: PlaygroundEnvironment; oop: boolean } {
    return { source: source.value, environment: environment.value, oop: oop.value };
}

async function run(): Promise<void> {
    if (session === null) {
        return;
    }

    busy.value = true;

    const response = await session.ask({ kind: 'compile', ...query() });

    busy.value = false;
    code.value = response.code;
    diagnostics.value = response.diagnostics;
    failure.value = response.failure;

    void refreshSymbols();
}

const bridge: EditorBridge = {
    complete: async (offset) => (session === null ? [] : (await session.ask({ kind: 'completion', offset, ...query() })).items),
    describe: async (offset) => (session === null ? null : (await session.ask({ kind: 'hover', offset, ...query() })).hover),
    signatureAt: async (offset) => (session === null ? null : (await session.ask({ kind: 'signature', offset, ...query() })).signature),
    locate: async (offset) => (session === null ? [] : (await session.ask({ kind: 'definition', offset, ...query() })).ranges),
    occurrences: async (offset) => (session === null ? [] : (await session.ask({ kind: 'references', offset, ...query() })).ranges),
    renameTo: async (offset, newName) => (session === null ? [] : (await session.ask({ kind: 'rename', offset, newName, ...query() })).edits),
};

async function refreshSymbols(): Promise<void> {
    if (session !== null) {
        symbols.value = (await session.ask({ kind: 'symbols', ...query() })).symbols;
    }
}

async function share(): Promise<void> {
    const link = `${window.location.origin}${window.location.pathname}?c=${encodeURIComponent(btoa(unescape(encodeURIComponent(source.value))))}`;

    await navigator.clipboard.writeText(link);

    shared.value = strings.value.copied;

    setTimeout(() => (shared.value = ''), 1600);
}

function schedule(): void {
    if (debounce !== null) {
        clearTimeout(debounce);
    }

    debounce = setTimeout(() => void run(), 220);
}

function reset(): void {
    source.value = opening.value;
}

async function copy(): Promise<void> {
    await navigator.clipboard.writeText(code.value ?? '');

    copied.value = true;

    setTimeout(() => (copied.value = false), 1600);
}

const editor = ref<{ moveTo: (offset: number) => void } | null>(null);

function jump(line: number): void {
    const before = source.value.split('\n').slice(0, line - 1);

    editor.value?.moveTo(before.join('\n').length + (line > 1 ? 1 : 0));
}

function fromUrl(): boolean {
    const carried = new URLSearchParams(window.location.search).get('c');

    if (carried === null) {
        return false;
    }

    try {
        opening.value = decodeURIComponent(escape(atob(carried)));
        source.value = opening.value;

        return true;
    } catch {
        return false;
    }
}

onMounted(() => {
    document.documentElement.classList.add('luam-fullscreen');

    session = new LspSession();
    ready.value = true;

    if (!fromUrl()) {
        restore();
    }

    void run();
});

onBeforeUnmount(() => {
    document.documentElement.classList.remove('luam-fullscreen');

    if (debounce !== null) {
        clearTimeout(debounce);
    }

    session?.restart();
    session = null;
});

watch([source, environment, oop], () => {
    schedule();
    persist();
});
</script>

<template>
    <section class="luam-app" :aria-busy="busy">
        <div class="luam-toolbar">
            <a class="luam-toolbar-home" :href="home">
                <img src="/luam-mark.svg" alt="" width="18" height="18" />
                <span>Luam</span>
            </a>

            <label class="luam-visually-hidden" for="luam-lsp-env">{{ strings.environmentLabel }}</label>
            <select id="luam-lsp-env" v-model="environment">
                <option v-for="value in ENVIRONMENTS" :key="value" :value="value">{{ value }}</option>
            </select>

            <label class="luam-pane-toggle"><input v-model="oop" type="checkbox" /><span>oop</span></label>

            <span class="luam-toolbar-spacer"></span>

            <span v-if="busy" class="luam-pane-busy">{{ strings.compiling }}</span>

            <button type="button" @click="share">{{ shared || strings.share }}</button>
            <button type="button" @click="reset">{{ strings.reset }}</button>
        </div>

        <div class="luam-playground-grid" @mousemove="onDrag" @mouseup="dragging = false" @mouseleave="dragging = false">
            <article class="luam-pane" :style="{ flexGrow: split }">
                <header>
                    <span class="luam-pane-file">{{ sourceFile }}</span>
                </header>

                <nav v-if="symbols.length > 0" class="luam-outline" :aria-label="strings.outline">
                    <button v-for="symbol in symbols" :key="symbol.name" type="button" @click="jump(symbol.line)">
                        <span class="luam-outline-kind">{{ symbol.kind }}</span>{{ symbol.name }}
                    </button>
                </nav>

                <PlaygroundEditor ref="editor" v-model:source="source" :diagnostics="diagnostics" :label="strings.sourceLabel" :bridge="bridge" />
            </article>

            <div class="luam-divider" role="separator" @mousedown.prevent="startDrag"></div>

            <article class="luam-pane" :style="{ flexGrow: 100 - split }">
                <header>
                    <span class="luam-pane-file">{{ code ? outputFile : strings.diagnosticsTab }}</span>

                    <div class="luam-pane-actions">
                        <button v-if="code" type="button" @click="copy">{{ copied ? strings.copied : strings.copy }}</button>
                    </div>
                </header>

                <PlaygroundCode v-if="code" :code="code" />

                <div v-else class="luam-report">
                    <p v-if="failure" class="luam-report-note">{{ failure }}</p>

                    <ul v-else-if="diagnostics.length > 0">
                        <li v-for="(entry, index) in diagnostics" :key="index" :class="`is-${entry.severity}`">
                            <span class="luam-report-where">{{ entry.line }}:{{ entry.column }}</span>
                            <span class="luam-report-severity">{{ entry.severity }}</span>
                            <span class="luam-report-code">{{ entry.code }}</span>
                            <p>{{ entry.message }}</p>
                        </li>
                    </ul>

                    <p v-else class="luam-report-note">{{ strings.blocked }}</p>
                </div>
            </article>
        </div>

        <footer class="luam-statusbar">
            <span>{{ strings.shortcuts }}</span>
            <span class="luam-toolbar-spacer"></span>
            <span v-if="!ready">{{ strings.scriptRequired }}</span>
            <span v-else-if="code && diagnostics.length === 0" class="luam-playground-ok">{{ strings.clean }}</span>
        </footer>
    </section>
</template>
