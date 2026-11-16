<script setup>
defineProps({
    /** `horizontal` · `vertical` */
    orientation: { type: String, default: 'horizontal' },
    /** Off when the line separates sections a screen reader should announce. */
    decorative: { type: Boolean, default: true },
});
</script>

<template>
    <div
        class="il-separator shrink-0 bg-il-neutral-200 dark:bg-white/10"
        :class="orientation === 'vertical' ? 'h-full w-px self-stretch' : 'h-px w-full'"
        :role="decorative ? 'none' : 'separator'"
        :aria-orientation="decorative ? undefined : orientation"
        :data-orientation="orientation"
    ></div>
</template>
