<script setup>
import { useId } from 'vue';

defineProps({
    label: { type: String, default: '' },
});

const id = useId();
</script>

<template>
    <div role="group" class="il-menu-group" :aria-labelledby="label || $slots.label ? id : undefined">
        <div
            v-if="label || $slots.label"
            :id="id"
            class="il-menu-group__label px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-il-neutral-500 dark:text-il-neutral-400"
        >
            <slot name="label">{{ label }}</slot>
        </div>
        <slot />
    </div>
</template>
