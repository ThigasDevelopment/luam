<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { type Cell, currentWord, measureCell, offsetToPlace, placeToOffset, shouldSuggest, wordStart } from './playground/caret';
import { applyEdits, type EditorBridge, highlightStyle, rangeToOffset } from './playground/editor-lsp';
import { highlight, lineCount } from './playground/highlight';
import { type LspCompletionItem, type LspRange } from './playground/lsp-protocol';
import { type PlaygroundDiagnostic } from './playground/protocol';

const props = defineProps<{ source: string; diagnostics: PlaygroundDiagnostic[]; label: string; bridge: EditorBridge }>();

const emit = defineEmits<{ (event: 'update:source', value: string): void }>();

const field = ref<HTMLTextAreaElement | null>(null);
const body = ref<HTMLElement | null>(null);

const items = ref<LspCompletionItem[]>([]);
const chosen = ref(0);
const caret = ref({ line: 0, column: 0 });
const hover = ref<{ text: string; line: number; column: number } | null>(null);
const signature = ref<{ label: string; activeParameter: number } | null>(null);
const marks = ref<LspRange[]>([]);
const renaming = ref(false);
const draftName = ref('');

let cell: Cell = { width: 7.7, height: 21.7 };
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

const html = computed(() => highlight(props.source));
const lines = computed(() => lineCount(props.source));
const errors = computed(() => new Set(props.diagnostics.filter((entry) => entry.severity === 'error').map((entry) => entry.line)));

const squiggles = computed(() =>
    props.diagnostics.map((entry) => ({
        severity: entry.severity,
        range: { line: entry.line, column: entry.column, endLine: entry.endLine, endColumn: entry.endLine === entry.line ? entry.endColumn : entry.column + 1 },
    })),
);
const open = computed(() => items.value.length > 0);

const anchor = computed(() => ({ left: `${caret.value.column * cell.width}px`, top: `${(caret.value.line + 1) * cell.height + 4}px` }));

const hoverStyle = computed(() => ({ left: `${(hover.value?.column ?? 0) * cell.width}px`, top: `${(hover.value?.line ?? 0) * cell.height - 8}px` }));

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

function dismiss(): void {
    items.value = [];
    chosen.value = 0;
}

function moveTo(offset: number): void {
    const element = field.value;

    if (element === null) {
        return;
    }

    element.focus();
    element.selectionStart = offset;
    element.selectionEnd = offset;
    caret.value = offsetToPlace(props.source, offset);
}

async function refreshSignature(offset: number): Promise<void> {
    signature.value = await props.bridge.signatureAt(offset);
}

async function suggest(): Promise<void> {
    const element = field.value;

    if (element === null) {
        return;
    }

    const offset = element.selectionStart;

    caret.value = offsetToPlace(props.source, offset);

    const word = currentWord(props.source, offset).toLowerCase();
    const found = await props.bridge.complete(offset);

    items.value = (word === '' ? found : found.filter((item) => item.label.toLowerCase().startsWith(word))).slice(0, 40);
    chosen.value = 0;
}

function accept(item: LspCompletionItem | undefined): void {
    const element = field.value;

    if (element === null || item === undefined) {
        return;
    }

    const start = wordStart(props.source, element.selectionStart);
    const next = `${props.source.slice(0, start)}${item.insert}${props.source.slice(element.selectionStart)}`;

    emit('update:source', next);
    dismiss();

    void nextTick(() => moveTo(start + item.insert.length));
}

function indent(element: HTMLTextAreaElement): void {
    const start = element.selectionStart;

    emit('update:source', `${props.source.slice(0, start)}    ${props.source.slice(element.selectionEnd)}`);

    void nextTick(() => moveTo(start + 4));
}

async function goToDefinition(): Promise<void> {
    const element = field.value;

    if (element === null) {
        return;
    }

    const [target] = await props.bridge.locate(element.selectionStart);

    if (target !== undefined) {
        marks.value = [target];
        moveTo(rangeToOffset(props.source, target));
    }
}

async function showReferences(): Promise<void> {
    const element = field.value;

    if (element !== null) {
        marks.value = await props.bridge.occurrences(element.selectionStart);
    }
}

function beginRename(): void {
    const element = field.value;

    if (element === null) {
        return;
    }

    draftName.value = currentWord(props.source, element.selectionEnd + 40) || '';
    caret.value = offsetToPlace(props.source, element.selectionStart);
    renaming.value = true;
}

async function commitRename(): Promise<void> {
    const element = field.value;
    const name = draftName.value.trim();

    renaming.value = false;

    if (element === null || name === '') {
        return;
    }

    const edits = await props.bridge.renameTo(element.selectionStart, name);

    if (edits.length > 0) {
        emit('update:source', applyEdits(props.source, edits));
    }
}

async function onKeydown(event: KeyboardEvent): Promise<void> {
    const element = event.target as HTMLTextAreaElement;

    if (event.key === ' ' && event.ctrlKey) {
        event.preventDefault();

        return void suggest();
    }

    if (!open.value && event.key === 'Tab') {
        event.preventDefault();

        return indent(element);
    }

    if (event.key === 'F12' || (event.key === 'Enter' && event.ctrlKey)) {
        event.preventDefault();

        return void goToDefinition();
    }

    if (event.key === 'F2') {
        event.preventDefault();

        return beginRename();
    }

    if (event.key === 'F7' && event.altKey) {
        event.preventDefault();

        return void showReferences();
    }

    if (!open.value) {
        return;
    }

    if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        chosen.value = (chosen.value + (event.key === 'ArrowDown' ? 1 : items.value.length - 1)) % items.value.length;
    } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        accept(items.value[chosen.value]);
    }
}

function onInput(event: Event): void {
    const element = event.target as HTMLTextAreaElement;

    emit('update:source', element.value);
    marks.value = [];

    void nextTick(() => void refreshSignature(element.selectionStart));

    if (shouldSuggest(element.value, element.selectionStart)) {
        void nextTick(suggest);
    } else {
        dismiss();
    }
}

function onPointerMove(event: MouseEvent): void {
    const container = body.value;

    if (container === null) {
        return;
    }

    if (hoverTimer !== null) {
        clearTimeout(hoverTimer);
    }

    const box = container.getBoundingClientRect();
    const line = Math.floor((event.clientY - box.top) / cell.height);
    const column = Math.round((event.clientX - box.left) / cell.width);

    hoverTimer = setTimeout(async () => {
        const text = await props.bridge.describe(placeToOffset(props.source, line, column));

        hover.value = text === null ? null : { text, line, column };
    }, 260);
}

function onClick(event: MouseEvent): void {
    const element = field.value;

    if (element !== null && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();

        void goToDefinition();
    }

    void refreshSignature(element?.selectionStart ?? 0);
}

onMounted(() => {
    if (body.value !== null) {
        cell = measureCell(body.value);
    }

    resize();
});

watch(() => props.source, () => void nextTick(resize), { immediate: true });

defineExpose({ moveTo });
</script>

<template>
    <div class="luam-code is-editable" @mouseleave="hover = null">
        <div class="luam-code-gutter" aria-hidden="true">
            <span v-for="line in lines" :key="line" :class="{ 'has-error': errors.has(line) }">{{ line }}</span>
        </div>

        <div ref="body" class="luam-code-body" @mousemove="onPointerMove">
            <pre aria-hidden="true"><code v-html="html"></code></pre>

            <span v-for="(mark, index) in marks" :key="index" class="luam-mark" :style="highlightStyle(mark, cell.width, cell.height)"></span>

            <span
                v-for="(squiggle, index) in squiggles"
                :key="`d${index}`"
                class="luam-squiggle"
                :class="`is-${squiggle.severity}`"
                :style="highlightStyle(squiggle.range, cell.width, cell.height)"
            ></span>

            <textarea
                ref="field"
                :value="source"
                :aria-label="label"
                spellcheck="false"
                autocapitalize="off"
                autocorrect="off"
                autocomplete="off"
                @input="onInput"
                @keydown="onKeydown"
                @click="onClick"
                @blur="dismiss"
            ></textarea>

            <div v-if="signature && !open" class="luam-signature" :style="anchor">{{ signature.label }}</div>

            <div v-if="renaming" class="luam-rename" :style="anchor">
                <input v-model="draftName" type="text" @keydown.enter.prevent="commitRename" @keydown.esc.prevent="renaming = false" />
            </div>

            <ul v-if="open" class="luam-suggest" :style="anchor">
                <li v-for="(item, index) in items" :key="item.label" :class="{ 'is-chosen': index === chosen }" @mousedown.prevent="accept(item)">
                    <span class="luam-suggest-kind">{{ item.kind }}</span>
                    <span class="luam-suggest-label">{{ item.label }}</span>
                    <span v-if="item.detail" class="luam-suggest-detail">{{ item.detail }}</span>
                </li>
            </ul>

            <div v-if="hover && !open && !renaming" class="luam-hover" :style="hoverStyle">{{ hover.text }}</div>
        </div>
    </div>
</template>
