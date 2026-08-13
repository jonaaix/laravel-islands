<script setup>
import Tooltip from './Tooltip.vue';

defineProps({
    /** Says what will be edited — the tooltip and the accessible name in one. */
    label: { type: String, required: true },
    /** Matches the value it sits beside; `sm` is the default everywhere. */
    size: { type: String, default: 'sm' },
});

const emit = defineEmits(['click']);

const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4' };
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
            class="rounded p-0.5 text-gray-400 opacity-0 transition-opacity duration-500 hover:text-gray-700 focus-visible:opacity-100 group-hover/edit:opacity-100 dark:text-gray-500 dark:hover:text-gray-300"
        >
            <svg
                :class="SIZES[size] || SIZES.sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
            ><path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/></svg>
        </button>
    </Tooltip>
</template>
