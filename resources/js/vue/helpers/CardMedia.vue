<script setup>
import { computed } from 'vue';
import { useCardDefaults } from './cardDefaults.js';

/**
 * The picture area of a card.
 *
 * No shape of its own: which ratio pictures are shown in is the application's decision, and a
 * package that picks one imposes its house style on every project that installs it. An
 * application names it once through `provideCardDefaults`; a single callsite may still differ.
 */
const props = defineProps({
    /** Any CSS aspect ratio, e.g. `3 / 2`. Falls back to the application's, then to the content. */
    ratio: { type: String, default: '' },
});

const defaults = useCardDefaults();

const shape = computed(() => props.ratio || defaults.mediaRatio || '');
</script>

<template>
    <div
        class="card-media relative w-full overflow-hidden bg-gray-100 dark:bg-white/5"
        :style="shape ? { aspectRatio: shape } : {}"
    >
        <slot />
    </div>
</template>
