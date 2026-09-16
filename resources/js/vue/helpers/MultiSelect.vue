<script setup>
import { computed, ref } from 'vue';
import Checkbox from './Checkbox.vue';
import IconButton from './IconButton.vue';
import Popover from './Popover.vue';
import { selectSkin } from './selectSkins.js';
import { useTheme } from './theme.js';

/**
 * Several answers to one question, where the Combobox takes exactly one.
 *
 * The trigger names what was picked, up to a few of them, and trails off beyond that: a
 * trigger that grew with every pick would move everything beside it in the toolbar.
 */
const props = defineProps({
    /** @type {Array<string|number>} */
    modelValue: { type: Array, default: () => [] },
    /** A plain map of value to label, or a list of `{ value, label }`. */
    options: { type: [Object, Array], default: () => ({}) },
    placeholder: { type: String, default: '' },
    /**
     * Names the state of having picked nothing, and labels the control that returns to it. Like
     * every other word here it comes from the application — the component owns no wording.
     */
    allLabel: { type: String, default: '' },
    emptyLabel: { type: String, default: '' },
    /** How many picks the trigger names before it trails off. */
    previewLimit: { type: Number, default: 3 },
    /** How long a single name may get in the trigger; the list itself keeps the full wording. */
    previewChars: { type: Number, default: 14 },
    variant: { type: String, default: 'filter' },
    menuWidth: { type: Number, default: 288 },
    menuHeight: { type: Number, default: 320 },
});

const emit = defineEmits(['update:modelValue']);


const open = ref(false);
const triggerEl = ref(null);

const skin = computed(() => selectSkin(props.variant, 'filter', useTheme('select').skins));

const entries = computed(() => (Array.isArray(props.options)
    ? props.options.map((option) => ({ value: option.value, label: String(option.label ?? option.value) }))
    : Object.entries(props.options).map(([value, label]) => ({ value, label: String(label) }))));

const chosen = computed(() => new Set(props.modelValue.map((value) => String(value))));

const count = computed(() => chosen.value.size);

/** A long name would push the trigger over everything beside it, so it is cut, not wrapped. */
function shorten(name) {
    const limit = Math.max(4, props.previewChars);

    return name.length > limit ? `${name.slice(0, limit).trimEnd()}…` : name;
}

const label = computed(() => {
    if (count.value === 0) {
        return props.placeholder;
    }

    // In the order the options are offered, not the order they were ticked: the same selection
    // then always reads the same way.
    const picked = entries.value.filter((entry) => chosen.value.has(String(entry.value)));
    const shown = picked.slice(0, Math.max(1, props.previewLimit)).map((entry) => shorten(entry.label));

    return shown.join(', ') + (picked.length > shown.length ? ' …' : '');
});

function toggle(value) {
    const key = String(value);
    const next = entries.value
        .filter((entry) => (String(entry.value) === key ? !chosen.value.has(key) : chosen.value.has(String(entry.value))))
        .map((entry) => entry.value);

    emit('update:modelValue', next);
}

function clear() {
    emit('update:modelValue', []);
}
</script>

<template>
    <div class="il-multi-select relative" :data-variant="variant" :data-state="open ? 'open' : (count > 0 ? 'set' : 'empty')" :data-count="count">
        <div
            ref="triggerEl"
            @click="open = !open"
            :class="['il-multi-select__trigger', skin.base, 'cursor-pointer', count > 0 ? skin.on : skin.off]"
        >
            <button
                type="button"
                :aria-expanded="open"
                class="flex min-w-0 flex-1 items-center text-left focus:outline-none"
            >
                <span class="max-w-[18rem] truncate">{{ label }}</span>
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

        <Popover :anchor="triggerEl" :open="open" :width="menuWidth" @close="open = false">
            <div class="il-multi-select__list slim-scrollbar overflow-y-auto py-1" :style="{ maxHeight: `${menuHeight}px` }">
                <label
                    v-for="entry in entries"
                    :key="entry.value"
                    class="il-multi-select__option flex cursor-pointer items-center gap-2 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5"
                    :data-state="chosen.has(String(entry.value)) ? 'checked' : undefined"
                >
                    <Checkbox :model-value="chosen.has(String(entry.value))" @update:model-value="toggle(entry.value)" />
                    <slot name="option" :option="entry" :label="entry.label">
                        <span class="min-w-0 flex-1 truncate">{{ entry.label }}</span>
                    </slot>
                </label>

                <p v-if="entries.length === 0" class="il-multi-select__empty px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ emptyLabel }}
                </p>
            </div>

            <button
                v-if="count > 0"
                type="button"
                @click="clear"
                class="il-multi-select__clear-option flex w-full items-center justify-center border-t border-gray-100 px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:border-white/10 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
            >{{ allLabel }}</button>
        </Popover>
    </div>
</template>
