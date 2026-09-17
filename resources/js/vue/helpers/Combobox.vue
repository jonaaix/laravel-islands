<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import IconButton from './IconButton.vue';
import { overlayZIndex, registerOverlay, unregisterOverlay } from './overlayStack.js';
import { selectSkin } from './selectSkins.js';
import { useTheme } from './theme.js';
import { useOptionSearch } from '../composables/useOptionSearch.js';
import { useTranslations } from '../composables/useTranslations.js';

const props = defineProps({
    modelValue: { type: [String, Number], default: 0 },
    /** `{ value, label, depth?, disabled? }` — a `disabled` entry is a heading: shown, searched past, never picked. */
    options: { type: [Object, Array], default: () => ({}) },
    placeholder: { type: String, default: 'Select…' },
    searchPlaceholder: { type: String, default: 'Search…' },
    allLabel: { type: String, default: 'All' },
    emptyLabel: { type: String, default: 'No match' },
    emptyValue: { type: [String, Number], default: 0 },
    searchValues: { type: Boolean, default: false },
    fetchOptions: { type: Function, default: null },
    fetchDelay: { type: Number, default: 150 },
    loadingLabel: { type: String, default: '' },
    selectedLabel: { type: String, default: '' },
    /** `field` is a plain form control; `filter` and `filter-card` colour a set value. */
    variant: { type: String, default: 'field' },
    /** A long or deeply named list earns more room than the trigger it hangs under. */
    menuWidth: { type: Number, default: 288 },
    menuHeight: { type: Number, default: 240 },
    /** How many entries a list may show at once; zero or less shows all of them. */
    maxOptions: { type: Number, default: 60 },
    /** The row that resets the choice — redundant where the trigger already carries a clear. */
    clearOption: { type: Boolean, default: true },
    /**
     * In a list whose entries carry a `depth`, a match keeps the entries it sits under, so
     * searching narrows the tree instead of flattening it.
     */
    keepAncestors: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useTranslations();

const open = ref(false);
const query = ref('');
const searchInput = ref(null);
const highlighted = ref(0);
const triggerEl = ref(null);
const menuStyle = ref({});
const picked = ref(null);
const overlayId = ref(null);
const backdropStyle = computed(() => overlayId.value !== null ? { zIndex: overlayZIndex(overlayId.value) } : {});
const panelStyle = computed(() => overlayId.value !== null ? { zIndex: overlayZIndex(overlayId.value) + 1 } : {});

const { loadingOptions, known, filtered, reset } = useOptionSearch(props, query);

function updatePosition() {
    const el = triggerEl.value;
    if (!el) {
        return;
    }
    const r = el.getBoundingClientRect();

    // Pulled back only far enough to stay on screen, so a wide menu under a trigger near the
    // right edge does not run off it.
    const left = Math.max(8, Math.min(r.left, window.innerWidth - props.menuWidth - 8));

    menuStyle.value = { top: `${r.bottom + 4}px`, left: `${left}px`, width: `${props.menuWidth}px` };
}

const selectTheme = useTheme('select');

const skin = computed(() => selectSkin(props.variant, 'field', selectTheme.skins));

const menuSurface = selectTheme.menu;

const hasValue = computed(() => props.modelValue !== 0 && props.modelValue !== '' && props.modelValue != null);
const selectedName = computed(() => {
    const target = String(props.modelValue);

    // A lazy list forgets its options on close, so remember what was picked here.
    if (picked.value && String(picked.value.value) === target) {
        return picked.value.label;
    }

    const match = known.value.find((option) => String(option.value) === target)?.label;

    return match ?? props.selectedLabel ?? '';
});

watch(query, () => {
    highlighted.value = 0;
});

function toggle() {
    open.value = !open.value;
    if (open.value) {
        query.value = '';
        reset();
        highlighted.value = 0;
        overlayId.value = registerOverlay();
        updatePosition();
        nextTick(() => searchInput.value?.focus());
    } else {
        releaseOverlay();
    }
}
function close() {
    if (!open.value) return;
    open.value = false;
    releaseOverlay();
}
function releaseOverlay() {
    if (overlayId.value !== null) {
        unregisterOverlay(overlayId.value);
        overlayId.value = null;
    }
}
function select(key) {
    const option = filtered.value.find((o) => String(o.value) === String(key));
    if (option?.disabled) return;
    picked.value = option ? { value: option.value, label: option.label } : null;
    emit('update:modelValue', key);
    close();
}
function clear() { picked.value = null; emit('update:modelValue', props.emptyValue); close(); }
// A heading row (`disabled`) is read past, never landed on.
function nextPickable(from, step) {
    let i = from;
    do {
        i += step;
    } while (i >= 0 && i < filtered.value.length && filtered.value[i].disabled);
    return i < 0 || i >= filtered.value.length ? from : i;
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
        const hit = filtered.value[highlighted.value];
        if (hit && !hit.disabled) {
            select(hit.value);
        }
    } else if (e.key === 'Escape') {
        close();
    }
}
</script>

<template>
    <div class="il-combobox relative" :data-variant="variant" :data-state="open ? 'open' : (hasValue ? 'set' : 'empty')">
        <!--
            The whole surface opens the list, not just the words on it: the padding of a wide
            trigger is a large part of what a pointer aims at. The button inside stays the
            control a keyboard reaches, and its click arrives here just the same.
        -->
        <div
            ref="triggerEl"
            @click="toggle"
            :class="['il-combobox__trigger', skin.base, 'cursor-pointer', hasValue ? skin.on : skin.off]"
        >
            <button
                type="button"
                role="combobox"
                :aria-expanded="open"
                class="flex min-w-0 flex-1 items-center text-left focus:outline-none"
            >
                <template v-if="hasValue">
                    <slot v-if="$slots.selected" name="selected" :key-value="modelValue" :label="selectedName" />
                    <slot v-else name="option" :key-value="modelValue" :label="selectedName">
                        <span class="max-w-[12rem] truncate">{{ selectedName }}</span>
                    </slot>
                </template>
                <span v-else class="max-w-[12rem] truncate">{{ placeholder }}</span>
            </button>
            <IconButton
                v-if="hasValue"
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

        <Teleport to="body">
        <div v-if="open" class="il-combobox__backdrop fixed inset-0" :style="backdropStyle" @click="close"></div>
        <div v-if="open" class="il-combobox__menu fixed overflow-hidden rounded-il-menu" :class="menuSurface" :style="{ ...menuStyle, ...panelStyle }" :data-variant="variant">
            <div class="il-combobox__search relative border-b border-il-neutral-100 p-2 dark:border-white/10">
                <span class="pointer-events-none absolute inset-y-0 left-4 flex items-center text-il-neutral-400">
                    <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clip-rule="evenodd"/></svg>
                </span>
                <input
                    ref="searchInput"
                    v-model="query"
                    type="search"
                    :placeholder="searchPlaceholder"
                    @keydown="onKeydown"
                    class="h-8 w-full rounded-il-control border border-il-neutral-200 bg-white pl-8 pr-2 text-sm text-il-neutral-900 placeholder:text-il-neutral-400 focus:border-il-primary-500 focus:outline-none focus:ring-1 focus:ring-il-primary-500 dark:border-white/10 dark:bg-il-neutral-900 dark:text-il-neutral-100"
                />
            </div>
            <ul role="listbox" class="il-combobox__list overflow-y-auto py-1" :style="{ maxHeight: `${menuHeight}px` }">
                <li v-if="loadingOptions" class="il-combobox__loading flex items-center justify-center gap-2 py-6 text-sm text-il-neutral-400">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4Z" />
                    </svg>
                    {{ loadingLabel || t('Loading…') }}
                </li>
                <template v-else>
                <li v-if="hasValue && clearOption">
                    <button type="button" @click="clear" class="il-combobox__clear-option flex w-full items-center px-3 py-1.5 text-left text-sm text-il-primary-700 hover:bg-il-neutral-50 dark:text-il-primary-300 dark:hover:bg-white/5">
                        {{ allLabel }}
                    </button>
                </li>
                <li v-for="(option, i) in filtered" :key="option.value" role="option" :aria-selected="String(option.value) === String(modelValue)">
                    <button
                        type="button"
                        :disabled="option.disabled"
                        :data-state="String(option.value) === String(modelValue) ? 'selected' : (option.disabled ? 'heading' : (i === highlighted ? 'highlighted' : undefined))"
                        @click="select(option.value)"
                        @mouseenter="option.disabled ? null : (highlighted = i)"
                        class="il-combobox__option flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm"
                        :class="[
                            i === highlighted && !option.disabled ? 'bg-il-neutral-50 dark:bg-white/5' : '',
                            option.disabled ? 'cursor-default text-il-neutral-500 dark:text-il-neutral-400' : '',
                            String(option.value) === String(modelValue) ? 'font-semibold text-il-primary-700 dark:text-il-primary-300' : (option.disabled ? '' : 'text-il-neutral-700 dark:text-il-neutral-200'),
                        ]"
                    >
                        <slot name="option" :key-value="option.value" :label="option.label" :option="option">
                            <span class="truncate">{{ option.label }}</span>
                        </slot>
                        <svg v-if="String(option.value) === String(modelValue)" class="h-4 w-4 shrink-0 text-il-primary-600 dark:text-il-primary-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </li>
                <li v-if="!filtered.length" class="il-combobox__empty py-6 text-center text-sm text-il-neutral-400">{{ emptyLabel }}</li>
                </template>
            </ul>
        </div>
        </Teleport>
    </div>
</template>
