<script setup>
defineProps({
    /** The key as shown; also the default slot. */
    value: { type: String, default: '' },
});
</script>

<template>
    <kbd class="il-kbd inline-flex h-5 min-w-5 items-center justify-center rounded bg-il-neutral-100 px-1 font-sans text-[11px] font-medium leading-none text-il-neutral-600 ring-1 ring-inset ring-il-neutral-200 dark:bg-white/10 dark:text-il-neutral-300 dark:ring-white/10"><slot>{{ value }}</slot></kbd>
</template>
