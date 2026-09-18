<script setup>
import Icon from './Icon.vue';
import IconButton from './IconButton.vue';

defineProps({
    /** The wording of the remove button, which the application owns. */
    removeLabel: { type: String, required: true },
    disabled: { type: Boolean, default: false },
});

defineEmits(['remove']);
</script>

<template>
    <!--
        A value a list can be taken out of: the chip carries the wording, the cross sits inside it
        rather than beside it, so a wrapped row of them keeps every value and its handle together.
    -->
    <span class="il-removable-chip removable-chip inline-flex items-center gap-1 rounded-full bg-il-neutral-100 pl-2.5 pr-1 text-xs text-il-neutral-700 dark:bg-il-neutral-800 dark:text-il-neutral-300">
        <slot />

        <IconButton size="sm" :label="removeLabel" :disabled="disabled" @click="$emit('remove')">
            <Icon name="o-x-mark" />
        </IconButton>
    </span>
</template>
