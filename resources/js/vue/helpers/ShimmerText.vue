<script setup>
/**
 * Text that a soft shine runs across while something is in progress — "Thinking …", "Loading the report …".
 */
defineProps({
    text: { type: String, required: true },
});
</script>

<template>
    <span class="il-shimmer-text relative inline-block max-w-full truncate align-bottom text-il-neutral-500 dark:text-il-neutral-400">
        {{ text }}
        <span class="il-shimmer-text__band pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden="true">
            <span class="il-shimmer-text__copy absolute inset-0 truncate text-il-neutral-900 dark:text-white">{{ text }}</span>
        </span>
    </span>
</template>

<style scoped>
/* The band and the copy inside it move in opposite directions, so the copy stays on the text while only the band travels; both are transforms, so the shine never repaints the text. */
.il-shimmer-text__band {
    mask-image: linear-gradient(90deg, transparent 35%, #000 50%, transparent 65%);
    animation: il-shimmer-band 2s linear infinite;
    will-change: transform;
}

.il-shimmer-text__copy {
    animation: il-shimmer-copy 2s linear infinite;
    will-change: transform;
}

@keyframes il-shimmer-band {
    from {
        transform: translateX(-65%);
    }
    to {
        transform: translateX(65%);
    }
}

@keyframes il-shimmer-copy {
    from {
        transform: translateX(65%);
    }
    to {
        transform: translateX(-65%);
    }
}
</style>
