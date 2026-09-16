<script setup>
import { computed } from 'vue';
import Tooltip from './Tooltip.vue';
import { useTheme } from './theme.js';

const props = defineProps({
    /** Says what will be edited — the tooltip and the accessible name in one. */
    label: { type: String, required: true },
    /** Matches the value it sits beside; the theme decides when unset (`sm`). */
    size: { type: String, default: null },
});

const emit = defineEmits(['click']);

const theme = useTheme('editButton');

const resolvedSize = computed(() => props.size ?? theme.size ?? 'sm');
const glyphClass = computed(() => theme.sizes[resolvedSize.value] ?? theme.sizes.sm);
</script>

<template>
    <!--
        Quiet until wanted: it appears when the pointer rests on what it edits, and slowly
        enough not to flicker while the pointer crosses the page. The container it belongs to
        carries `group/edit`.
    -->
    <Tooltip :text="label">
        <button
            type="button"
            @click="emit('click', $event)"
            :aria-label="label"
            :data-size="resolvedSize"
            class="il-edit-button rounded p-0.5 text-il-neutral-400 opacity-0 transition-opacity duration-[var(--il-duration-hover)] hover:text-il-neutral-700 focus-visible:opacity-100 group-hover/edit:opacity-100 dark:text-il-neutral-500 dark:hover:text-il-neutral-300"
        >
            <svg
                class="il-edit-button__glyph"
                :class="glyphClass"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
            ><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
        </button>
    </Tooltip>
</template>
