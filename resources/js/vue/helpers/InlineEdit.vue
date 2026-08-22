<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useTranslations } from '@aaix/laravel-islands/vue';
import { modifierKey } from './platform.js';

const props = defineProps({
    value: { type: [Number, String, Object], default: null },
    parts: { type: Array, default: () => [{ key: '' }] },
    type: { type: String, default: 'text' },
    separator: { type: String, default: '' },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    emptyLabel: { type: String, default: '' },
    label: { type: String, default: '' },
    size: { type: String, default: 'sm' },
    showPrevious: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
    error: { type: String, default: '' },
    autoStart: { type: Boolean, default: false },
});

const emit = defineEmits(['save', 'cancel']);

const { t } = useTranslations();

const editing = ref(false);
const draft = reactive({});
const box = ref(null);
const previous = ref(undefined);

const scalar = computed(() => props.parts.length === 1 && !props.parts[0].key);
const multiline = computed(() => props.type === 'textarea');
const numeric = computed(() => props.type === 'decimal' || props.type === 'integer');

function current(key) {
    return key ? (props.value?.[key] ?? null) : props.value;
}

const filled = computed(() => props.parts.some((part) => {
    const value = current(part.key);
    return value !== null && value !== undefined && value !== '';
}));

const display = computed(() => {
    const rendered = props.parts
        .map((part) => current(part.key))
        .filter((value) => value !== null && value !== undefined && value !== '')
        .join(` ${props.separator} `);

    return [props.prefix, rendered, props.suffix].filter(Boolean).join(' ');
});

async function start() {
    for (const part of props.parts) {
        const value = current(part.key);
        draft[part.key] = value === null || value === undefined ? '' : String(value);
    }

    editing.value = true;
    await nextTick();

    const field = box.value?.querySelector('input, textarea');
    field?.focus();
    field?.select();
}

function cancel() {
    editing.value = false;
    emit('cancel');
}

/** Returns `undefined` for input the field refuses, so a bad value never reaches the server. */
function parse(raw) {
    const value = String(raw ?? '').trim();

    if (value === '') {
        return null;
    }

    if (!numeric.value) {
        return value;
    }

    const number = Number(value.replace(',', '.'));

    if (Number.isNaN(number) || number < 0) {
        return undefined;
    }

    return props.type === 'integer' ? Math.round(number) : number;
}

function commit() {
    const next = {};

    for (const part of props.parts) {
        const value = parse(draft[part.key]);

        if (value === undefined) {
            return;
        }

        next[part.key] = value;
    }

    const unchanged = props.parts.every((part) => next[part.key] === current(part.key));

    if (unchanged) {
        editing.value = false;
        return;
    }

    previous.value = scalar.value
        ? current('')
        : Object.fromEntries(props.parts.map((part) => [part.key, current(part.key)]));

    emit('save', scalar.value ? next[''] : next);
}

onMounted(() => {
    if (props.autoStart) {
        start();
    }
});

watch(
    () => props.saving,
    (isSaving, wasSaving) => {
        if (wasSaving && !isSaving && !props.error) {
            editing.value = false;
        }
    },
);
</script>

<template>
    <div class="group flex flex-wrap items-center gap-x-2 gap-y-1" :class="multiline && editing ? 'w-full' : ''">
        <template v-if="!editing">
            <slot name="display" :value="value" :filled="filled">
                <span
                    class="tabular-nums"
                    :class="[
                        size === 'lg' ? 'font-accent text-xl font-semibold tracking-tight' : 'text-sm',
                        filled ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400',
                        multiline ? 'whitespace-pre-line' : '',
                    ]"
                >{{ filled ? display : (emptyLabel || '—') }}</span>
            </slot>

            <button
                type="button"
                @click.stop="start()"
                :aria-label="label || t('Edit')"
                class="flex shrink-0 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary-500 group-hover:text-gray-500 dark:text-gray-700 dark:hover:bg-white/10 dark:group-hover:text-gray-400"
                :class="size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'"
            >
                <svg :class="size === 'lg' ? 'h-3.5 w-3.5' : 'h-3 w-3'" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-.793.793-2.828-2.828.793-.793ZM11.379 5.793 3 14.172V17h2.828l8.38-8.379-2.83-2.828Z"/></svg>
            </button>

            <slot v-if="showPrevious && previous !== undefined && !saving" name="previous" :value="previous">
                <span class="text-xs tabular-nums text-gray-400 dark:text-gray-500">{{ t('was') }} {{ previous ?? '—' }}</span>
            </slot>
        </template>

        <template v-else>
            <div class="flex items-center gap-1" :class="multiline ? 'w-full flex-col items-stretch gap-2' : ''">
                <div ref="box" class="flex items-center gap-1" :class="multiline ? 'w-full' : ''">
                    <template v-for="(part, index) in parts" :key="part.key || index">
                        <span v-if="index > 0 && separator" class="text-xs text-gray-400 dark:text-gray-500">{{ separator }}</span>

                        <textarea
                            v-if="multiline"
                            v-model="draft[part.key]"
                            rows="4"
                            @click.stop
                            @keydown.esc.prevent="cancel()"
                            @keydown.enter.ctrl.prevent="commit()"
                            @keydown.enter.meta.prevent="commit()"
                            :disabled="saving"
                            :placeholder="part.placeholder || ''"
                            class="slim-scrollbar w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                        ></textarea>

                        <div v-else class="relative">
                            <span v-if="index === 0 && prefix" class="pointer-events-none absolute inset-y-0 left-2 flex items-center text-xs text-gray-400">{{ prefix }}</span>
                            <input
                                v-model="draft[part.key]"
                                type="text"
                                :inputmode="numeric ? 'decimal' : 'text'"
                                @click.stop
                                @keydown.enter.prevent="commit()"
                                @keydown.esc.prevent="cancel()"
                                :disabled="saving"
                                :placeholder="part.placeholder || ''"
                                :aria-label="part.label || label"
                                class="rounded-md border border-gray-200 bg-white px-2 text-gray-900 tabular-nums focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60 dark:border-white/10 dark:bg-gray-900 dark:text-white"
                                :class="[
                                    size === 'lg' ? 'h-8 font-accent text-base' : 'h-7 text-sm',
                                    index === 0 && prefix ? 'pl-6' : '',
                                    part.width || (parts.length > 1 ? 'w-16' : 'w-28'),
                                ]"
                            />
                        </div>
                    </template>

                    <span v-if="suffix && !multiline" class="text-xs text-gray-400 dark:text-gray-500">{{ suffix }}</span>
                </div>

                <div class="flex items-center gap-1" :class="multiline ? 'justify-end' : ''">
                    <button
                        type="button"
                        @click.stop="commit()"
                        :disabled="saving"
                        :aria-label="t('Save')"
                        class="flex items-center justify-center rounded-md bg-primary-600 text-white transition-colors hover:bg-primary-500 disabled:opacity-60"
                        :class="size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'"
                    >
                        <svg v-if="!saving" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
                        <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9"/></svg>
                    </button>
                    <button
                        type="button"
                        @click.stop="cancel()"
                        :aria-label="t('Cancel')"
                        class="flex items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10 dark:hover:text-gray-200"
                        :class="size === 'lg' ? 'h-8 w-8' : 'h-7 w-7'"
                    >
                        <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>
                    </button>
                </div>
            </div>

            <span class="whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">{{ multiline ? t(':key+Enter to save · Esc to cancel', { key: modifierKey }) : t('Enter to save · Esc to cancel') }}</span>
        </template>

        <span v-if="error" class="text-xs font-medium text-red-600 dark:text-red-400">{{ error }}</span>
    </div>
</template>
