<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import Checkbox from './Checkbox.vue';
import IconButton from './IconButton.vue';
import Popover from './Popover.vue';
import { selectSkin } from './selectSkins.js';
import { useTheme } from './theme.js';
import { useOptionSearch } from '../composables/useOptionSearch.js';
import { useTranslations } from '../composables/useTranslations.js';

/**
 * Several answers from a searchable list — the Combobox's search, ranking, tree and server
 * fetching, with the MultiSelect's checkboxes and a trigger that names the first few picks.
 * The list stays open while picking; a click beside it or Escape closes it.
 */
const props = defineProps({
    /** @type {Array<string|number>} */
    modelValue: { type: Array, default: () => [] },
    /** `{ value: label }`, or `{ value, label, depth?, disabled? }[]` — a `disabled` entry is a heading: shown, searched past, never picked. */
    options: { type: [Object, Array], default: () => ({}) },
    placeholder: { type: String, default: 'Select…' },
    searchPlaceholder: { type: String, default: 'Search…' },
    /** Names the state of having picked nothing, and labels the control that returns to it. */
    allLabel: { type: String, default: 'All' },
    emptyLabel: { type: String, default: 'No match' },
    loadingLabel: { type: String, default: '' },
    searchValues: { type: Boolean, default: false },
    fetchOptions: { type: Function, default: null },
    fetchDelay: { type: Number, default: 150 },
    /** How many entries a list may show at once; zero or less shows all of them. */
    maxOptions: { type: Number, default: 60 },
    /** In a list whose entries carry a `depth`, a match keeps the entries it sits under. */
    keepAncestors: { type: Boolean, default: false },
    /** The row under the list that lets go of every pick — redundant where the trigger already carries a clear. */
    clearOption: { type: Boolean, default: true },
    /** How many picks the trigger names before it trails off. */
    previewLimit: { type: Number, default: 3 },
    /** How long a single name may get in the trigger; the list itself keeps the full wording. */
    previewChars: { type: Number, default: 14 },
    /** `field` is a plain form control; `filter`, `filter-card` and `filter-pill` colour a set value. */
    variant: { type: String, default: 'field' },
    menuWidth: { type: Number, default: 288 },
    menuHeight: { type: Number, default: 240 },
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const { t } = useTranslations();

const open = ref(false);
const query = ref('');
const highlighted = ref(0);
const triggerEl = ref(null);
const searchInput = ref(null);

const search = useOptionSearch(props, query);

/** A lazy list forgets its options on close, so every pick remembers its own label here. */
const picked = ref(new Map());

const skin = computed(() => selectSkin(props.variant, 'field', useTheme('select').skins));

const chosen = computed(() => new Set(props.modelValue.map((value) => String(value))));

const count = computed(() => chosen.value.size);

function labelOf(value) {
    const key = String(value);

    return search.known.value.find((option) => String(option.value) === key)?.label
        ?? picked.value.get(key)
        ?? key;
}

/** A long name would push the trigger over everything beside it, so it is cut, not wrapped. */
function shorten(name) {
    const limit = Math.max(4, props.previewChars);

    return name.length > limit ? `${name.slice(0, limit).trimEnd()}…` : name;
}

/**
 * In the order the options are offered, not the order they were ticked: the same selection
 * then always reads the same way. Picks the list no longer knows come last.
 */
const pickedInOrder = computed(() => {
    const offered = search.normalizedOptions.value
        .filter((option) => chosen.value.has(String(option.value)))
        .map((option) => option.value);
    const offeredKeys = new Set(offered.map((value) => String(value)));

    return [...offered, ...props.modelValue.filter((value) => !offeredKeys.has(String(value)))];
});

const labels = computed(() => pickedInOrder.value.map((value) => String(labelOf(value))));

const preview = computed(() => {
    if (count.value === 0) {
        return props.placeholder;
    }

    const shown = labels.value.slice(0, Math.max(1, props.previewLimit)).map(shorten);

    return shown.join(', ') + (labels.value.length > shown.length ? ' …' : '');
});

function isChecked(option) {
    return chosen.value.has(String(option.value));
}

function toggleOption(option) {
    if (option.disabled) {
        return;
    }

    const key = String(option.value);

    if (chosen.value.has(key)) {
        picked.value.delete(key);
        emit('update:modelValue', props.modelValue.filter((value) => String(value) !== key));

        return;
    }

    picked.value.set(key, String(option.label ?? option.value));
    emit('update:modelValue', [...props.modelValue, option.value]);
}

function clear() {
    picked.value.clear();
    emit('update:modelValue', []);
}

function show() {
    if (open.value) {
        return;
    }

    query.value = '';
    highlighted.value = 0;
    search.reset();
    open.value = true;
    emit('open');
    nextTick(() => searchInput.value?.focus());
}

function close() {
    if (!open.value) {
        return;
    }

    open.value = false;
    emit('close');
}

function toggleOpen() {
    open.value ? close() : show();
}

watch(query, () => {
    highlighted.value = 0;
});

// A heading row (`disabled`) is read past, never landed on.
function nextPickable(from, step) {
    const list = search.filtered.value;
    let i = from;

    do {
        i += step;
    } while (i >= 0 && i < list.length && list[i].disabled);

    return i < 0 || i >= list.length ? from : i;
}

function onKeydown(e) {
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlighted.value = nextPickable(highlighted.value, 1);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlighted.value = nextPickable(highlighted.value, -1);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const hit = search.filtered.value[highlighted.value];

        if (hit) {
            toggleOption(hit);
        }
    } else if (e.key === 'Escape') {
        close();
    }
}

function indent(option) {
    const depth = Number(option.depth ?? 0);

    return depth > 0 ? { paddingLeft: `${0.75 + depth}rem` } : null;
}

defineExpose({ show, close });
</script>

<template>
    <div class="il-multi-combobox relative" :data-variant="variant" :data-state="open ? 'open' : (count > 0 ? 'set' : 'empty')" :data-count="count">
        <!--
            The whole surface opens the list, not just the words on it. The button inside stays
            the control a keyboard reaches, and its click arrives here just the same.
        -->
        <div
            ref="triggerEl"
            @click="toggleOpen"
            :class="['il-multi-combobox__trigger', skin.base, 'cursor-pointer', count > 0 ? skin.on : skin.off]"
        >
            <button
                type="button"
                role="combobox"
                aria-haspopup="listbox"
                :aria-expanded="open"
                class="flex min-w-0 flex-1 items-center text-left focus:outline-none"
            >
                <slot v-if="count > 0 && $slots.selected" name="selected" :values="pickedInOrder" :labels="labels" :count="count" />
                <span v-else class="max-w-[18rem] truncate">{{ preview }}</span>
            </button>

            <IconButton
                v-if="count > 0"
                :label="allLabel"
                size="xs"
                tone="plain"
                :tooltip="false"
                class="ml-1"
                :class="skin.clear"
                @click.stop="clear"
            >
                <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
            </IconButton>
            <span v-else class="ml-1 flex h-6 w-6 shrink-0 items-center justify-center" aria-hidden="true">
                <svg class="h-4 w-4 opacity-50 transition-transform" :class="open ? 'rotate-180' : ''" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                </svg>
            </span>
        </div>

        <Popover :anchor="triggerEl" :open="open" :width="menuWidth" @close="close">
            <div class="il-multi-combobox__search relative border-b border-gray-100 p-2 dark:border-white/10">
                <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd"/></svg>
                </span>
                <input
                    ref="searchInput"
                    v-model="query"
                    type="search"
                    :placeholder="searchPlaceholder"
                    @keydown="onKeydown"
                    class="h-8 w-full rounded-md border border-gray-200 bg-white pl-8 pr-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-white/10 dark:bg-gray-900 dark:text-gray-100"
                />
            </div>

            <ul role="listbox" aria-multiselectable="true" class="il-multi-combobox__list slim-scrollbar overflow-y-auto py-1" :style="{ maxHeight: `${menuHeight}px` }">
                <li v-if="search.loadingOptions.value" class="il-multi-combobox__loading flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z" />
                    </svg>
                    {{ loadingLabel || t('Loading…') }}
                </li>
                <template v-else>
                    <li
                        v-for="(option, i) in search.filtered.value"
                        :key="option.value"
                        role="option"
                        :aria-selected="isChecked(option)"
                        :aria-disabled="option.disabled || undefined"
                    >
                        <p
                            v-if="option.disabled"
                            class="il-multi-combobox__heading px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400"
                            :style="indent(option)"
                        >
                            <slot name="option" :key-value="option.value" :label="option.label" :option="option" :checked="false">
                                <span class="truncate">{{ option.label }}</span>
                            </slot>
                        </p>
                        <label
                            v-else
                            class="il-multi-combobox__option flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm transition-colors"
                            :data-state="isChecked(option) ? 'checked' : (i === highlighted ? 'highlighted' : undefined)"
                            :class="[
                                i === highlighted ? 'bg-gray-50 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5',
                                isChecked(option) ? 'font-medium text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200',
                            ]"
                            :style="indent(option)"
                            @mouseenter="highlighted = i"
                        >
                            <Checkbox :model-value="isChecked(option)" @update:model-value="toggleOption(option)" />
                            <slot name="option" :key-value="option.value" :label="option.label" :option="option" :checked="isChecked(option)">
                                <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
                            </slot>
                        </label>
                    </li>
                    <li v-if="!search.filtered.value.length" class="il-multi-combobox__empty py-6 text-center text-sm text-gray-400">{{ emptyLabel }}</li>
                </template>
            </ul>

            <button
                v-if="count > 0 && clearOption"
                type="button"
                @click="clear"
                class="il-multi-combobox__clear-option flex w-full items-center justify-center border-t border-gray-100 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
            >{{ allLabel }}</button>
        </Popover>
    </div>
</template>
