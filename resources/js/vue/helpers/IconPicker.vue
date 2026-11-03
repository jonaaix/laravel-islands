<script setup>
import { computed, nextTick, ref, shallowRef, watch } from 'vue';
import Icon from './Icon.vue';
import IconButton from './IconButton.vue';
import OptionStrip from './OptionStrip.vue';
import Popover from './Popover.vue';
import Skeleton from './Skeleton.vue';
import TextField from './TextField.vue';
import Tooltip from './Tooltip.vue';
import { fieldClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';

const props = defineProps({
    modelValue: { type: String, default: '' },
    sets: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
    columns: { type: Number, default: 8 },
    width: { type: Number, default: 384 },
    labels: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const WORDS = computed(() => ({
    placeholder: 'Choose icon',
    search: 'Search icons',
    clear: 'Remove icon',
    empty: 'No icons found',
    ...props.labels,
}));

const field = useTheme('field');

const triggerClasses = computed(() => fieldClasses({
    shape: field.shape,
    size: field.size,
    base: field.base,
    shapes: field.shapes,
    sizes: field.sizes,
    extra: 'il-icon-picker__trigger flex items-center gap-2',
}));

const anchor = ref(null);
const grid = ref(null);
const open = ref(false);
const query = ref('');
const activeSet = ref(props.sets[0]?.value ?? '');
const icons = shallowRef([]);
const loading = ref(false);
const known = shallowRef(new Map());

const setOptions = computed(() => props.sets.map((set) => ({ value: set.value, label: set.label })));

const visible = computed(() => {
    const needle = query.value.trim().toLowerCase().replace(/\s+/g, '-');

    return needle ? icons.value.filter((icon) => icon.label.toLowerCase().includes(needle)) : icons.value;
});

const selectedComponent = computed(() => known.value.get(props.modelValue) ?? null);

function setOwning(value) {
    return props.sets.find((set) => set.owns?.(value)) ?? props.sets[0];
}

async function loadSet(name) {
    const set = props.sets.find((candidate) => candidate.value === name);

    if (!set) {
        return;
    }

    loading.value = true;

    const loaded = await set.load();

    if (activeSet.value !== name) {
        return;
    }

    icons.value = loaded;
    known.value = new Map([...known.value, ...loaded.map((icon) => [icon.value, icon.component])]);
    loading.value = false;

    await nextTick();
    revealChosen();
}

function revealChosen() {
    const chosen = grid.value?.querySelector('[data-state="selected"]');

    if (grid.value && chosen) {
        grid.value.scrollTop = chosen.offsetTop - (grid.value.clientHeight - chosen.offsetHeight) / 2;
    }
}

function openPicker() {
    if (props.disabled) {
        return;
    }

    activeSet.value = setOwning(props.modelValue)?.value ?? '';
    query.value = '';
    open.value = true;
}

function pick(value) {
    emit('update:modelValue', value);
    open.value = false;
}

watch([open, activeSet], ([isOpen, name]) => {
    if (isOpen) {
        loadSet(name);
    }
});
</script>

<template>
    <div ref="anchor" class="il-icon-picker flex items-center gap-1" :data-state="open ? 'open' : 'closed'" :data-disabled="disabled || undefined">
        <button type="button" :disabled="disabled" :class="triggerClasses" @click="openPicker()">
            <template v-if="modelValue">
                <slot name="selected" :value="modelValue">
                    <component :is="selectedComponent" v-if="selectedComponent" class="h-5 w-5 shrink-0 text-il-primary-500" aria-hidden="true" />
                </slot>
                <span class="min-w-0 flex-1 truncate text-il-neutral-900 dark:text-white">{{ modelValue }}</span>
            </template>
            <span v-else class="flex-1 text-il-neutral-400 dark:text-il-neutral-500">{{ WORDS.placeholder }}</span>
        </button>

        <IconButton v-if="modelValue && !disabled" size="sm" :label="WORDS.clear" @click="emit('update:modelValue', '')">
            <Icon name="o-x-mark" />
        </IconButton>

        <Popover :anchor="anchor" :open="open" :width="width" @close="open = false">
            <div class="il-icon-picker__panel space-y-3 p-3">
                <div class="flex items-center gap-2">
                    <TextField v-model="query" class="flex-1" type="search" :placeholder="WORDS.search" />
                    <OptionStrip v-if="sets.length > 1" v-model="activeSet" variant="segmented" :options="setOptions" />
                </div>

                <div
                    ref="grid"
                    class="il-icon-picker__grid slim-scrollbar relative grid max-h-64 gap-1 overflow-y-auto p-0.5 pr-2.5"
                    :style="{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }">
                    <template v-if="loading">
                        <Skeleton v-for="n in columns * 4" :key="n" height="2.25rem" />
                    </template>

                    <template v-else>
                        <Tooltip v-for="icon in visible" :key="icon.value" :text="icon.label">
                            <button
                                type="button"
                                :aria-label="icon.label"
                                :data-state="icon.value === modelValue ? 'selected' : undefined"
                                class="il-icon-picker__option flex h-il-control w-full items-center justify-center rounded-il-control text-il-neutral-600 transition-colors hover:bg-il-neutral-100 hover:text-il-neutral-900 dark:text-il-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
                                :class="icon.value === modelValue ? 'bg-il-primary-50 text-il-primary-600 ring-1 ring-il-primary-500 dark:bg-il-primary-500/15 dark:text-il-primary-300 dark:ring-il-primary-400' : ''"
                                @click="pick(icon.value)">
                                <component :is="icon.component" class="h-5 w-5" aria-hidden="true" />
                            </button>
                        </Tooltip>
                    </template>
                </div>

                <p v-if="!loading && !visible.length" class="il-icon-picker__empty text-xs text-il-neutral-500 dark:text-il-neutral-400">{{ WORDS.empty }}</p>
            </div>
        </Popover>
    </div>
</template>
