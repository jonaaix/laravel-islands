<script setup>
import { computed } from 'vue';

/**
 * The shape of content that has not arrived: a pulsing block, a run of text lines or a
 * circle. It reserves the room, so the view does not jump when the data lands.
 */
const props = defineProps({
    /** `block` · `text` · `circle` */
    variant: { type: String, default: 'block' },
    /** CSS lengths; a number is pixels. `text` ignores `height` and draws `lines` rows. */
    width: { type: [String, Number], default: '100%' },
    height: { type: [String, Number], default: '1rem' },
    lines: { type: Number, default: 3 },
    /** The rounding of a block; a circle is always round. */
    rounded: { type: String, default: 'rounded-md' },
});

const px = (value) => (typeof value === 'number' ? `${value}px` : value);

const SURFACE = 'animate-pulse bg-gray-200 dark:bg-white/10';

const blockStyle = computed(() => ({ width: px(props.width), height: px(props.height) }));

// The last line stops short, as the last line of a paragraph does.
const lineWidths = computed(() => Array.from({ length: Math.max(1, props.lines) }, (_, i) => (i === props.lines - 1 && props.lines > 1 ? '60%' : '100%')));
</script>

<template>
    <span v-if="variant === 'circle'" :class="[SURFACE, 'inline-block rounded-full']" :style="{ width: px(width), height: px(width) }" aria-hidden="true"></span>

    <span v-else-if="variant === 'text'" class="flex flex-col gap-2" :style="{ width: px(width) }" aria-hidden="true">
        <span v-for="(lineWidth, i) in lineWidths" :key="i" :class="[SURFACE, 'block h-3 rounded']" :style="{ width: lineWidth }"></span>
    </span>

    <span v-else :class="[SURFACE, 'block', rounded]" :style="blockStyle" aria-hidden="true"></span>
</template>
