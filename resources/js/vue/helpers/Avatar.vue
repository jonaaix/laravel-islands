<script setup>
import { computed, ref, watch } from 'vue';

/**
 * A face for a person or an agent. Without a picture, or when it fails to load, the initials keep the shape.
 */
const props = defineProps({
    src: { type: String, default: null },
    /** The picture's alternative text; empty when a name stands beside it. */
    alt: { type: String, default: '' },
    /** Gives the initials when there is no picture. */
    name: { type: String, default: '' },
    /** `2xs` · `xs` · `sm` · `md` · `lg` */
    size: { type: String, default: 'md' },
});

const SIZES = {
    '2xs': 'h-5 w-5 text-[9px]',
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-7 w-7 text-xs',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
};

const failed = ref(false);
watch(() => props.src, () => { failed.value = false; });

const initials = computed(() => props.name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase());
</script>

<template>
    <span class="il-avatar relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-il-neutral-300 font-medium text-il-neutral-700 dark:bg-white/20 dark:text-il-neutral-200" :class="SIZES[size] ?? SIZES.md">
        <img v-if="src && !failed" :src="src" :alt="alt" loading="lazy" class="il-avatar__image h-full w-full object-cover" @error="failed = true" />
        <span v-else class="il-avatar__initials" aria-hidden="true">{{ initials }}</span>
    </span>
</template>
