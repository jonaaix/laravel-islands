<script setup>
defineProps({
    /** The key as shown; also the default slot. */
    value: { type: String, default: '' },
});
</script>

<template>
    <kbd class="il-kbd inline-flex h-5 min-w-5 items-center justify-center rounded-[0.5rem] bg-white px-1 font-sans text-[11px] font-medium uppercase leading-none text-il-neutral-700 ring-1 ring-inset ring-il-neutral-300 dark:bg-il-neutral-900 dark:text-il-neutral-200 dark:ring-white/20"><slot>{{ value }}</slot></kbd>
</template>
