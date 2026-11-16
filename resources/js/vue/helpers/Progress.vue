<script setup>
import { computed } from 'vue';

/**
 * How far something has come, as a filled bar. The tone carries the verdict — amber worth a look, red wrong — so
 * the bar can stand without a sentence beside it.
 */
const props = defineProps({
    value: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    /** `primary` · `neutral` · `success` · `warning` · `danger` */
    tone: { type: String, default: 'primary' },
    /** `xs` · `sm` · `md` */
    size: { type: String, default: 'sm' },
    ariaLabel: { type: String, default: '' },
});

const TONES = {
    primary: 'bg-il-primary-600 dark:bg-il-primary-500',
    neutral: 'bg-il-neutral-700 dark:bg-il-neutral-300',
    success: 'bg-il-success-600 dark:bg-il-success-500',
    warning: 'bg-il-warning-500 dark:bg-il-warning-400',
    danger: 'bg-il-danger-600 dark:bg-il-danger-500',
};
const SIZES = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

const percent = computed(() => (props.max > 0 ? Math.min(100, Math.max(0, (props.value / props.max) * 100)) : 0));
</script>

<template>
    <div
        class="il-progress relative w-full overflow-hidden rounded-full bg-il-neutral-200 dark:bg-white/10"
        :class="SIZES[size] ?? SIZES.sm"
        role="progressbar"
        :aria-valuemin="0"
        :aria-valuemax="max"
        :aria-valuenow="value"
        :aria-label="ariaLabel || undefined"
        :data-tone="tone"
    >
        <span class="il-progress__fill block h-full rounded-full transition-[width] duration-300 ease-out" :class="TONES[tone] ?? TONES.primary" :style="{ width: percent + '%' }"></span>
    </div>
</template>
