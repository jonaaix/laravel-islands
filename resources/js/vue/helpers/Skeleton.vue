<script setup>
import { computed } from 'vue';
import { useTheme } from './theme.js';

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
    rounded: { type: String, default: 'rounded-il-control' },
});

const px = (value) => (typeof value === 'number' ? `${value}px` : value);

const SURFACE = useTheme('skeleton').surface;

const blockStyle = computed(() => ({ width: px(props.width), height: px(props.height) }));

// The last line stops short, as the last line of a paragraph does.
const lineWidths = computed(() => Array.from({ length: Math.max(1, props.lines) }, (_, i) => (i === props.lines - 1 && props.lines > 1 ? '60%' : '100%')));
</script>

<template>
    <span v-if="variant === 'circle'" :class="['il-skeleton', SURFACE, 'inline-block rounded-full']" data-variant="circle" :style="{ width: px(width), height: px(width) }" aria-hidden="true"></span>

    <span v-else-if="variant === 'text'" class="il-skeleton flex flex-col gap-2" data-variant="text" :style="{ width: px(width) }" aria-hidden="true">
        <span v-for="(lineWidth, i) in lineWidths" :key="i" :class="['il-skeleton__line', SURFACE, 'block h-3 rounded']" :style="{ width: lineWidth }"></span>
    </span>

    <span v-else :class="['il-skeleton', SURFACE, 'block', rounded]" data-variant="block" :style="blockStyle" aria-hidden="true"></span>
</template>
