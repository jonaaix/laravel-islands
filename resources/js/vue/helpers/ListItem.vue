<script setup>
defineProps({
    label: { type: String, default: '' },
    /** A second, quieter line under the label — an explanation or an error. */
    description: { type: String, default: '' },
    /** Colours the description when it carries a problem rather than a hint. */
    descriptionTone: { type: String, default: 'muted' },
});

const TONES = {
    muted: 'text-gray-500 dark:text-gray-400',
    danger: 'text-red-600 dark:text-red-400',
};
</script>

<template>
    <!--
        One row, one statement: what it is on the left, what it says on the right. The right
        side takes a value or a control alike, so a panel of settings and a panel of figures
        keep the same rhythm.
    -->
    <div class="flex items-center justify-between gap-3 py-3">
        <div class="min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
                <slot name="label">{{ label }}</slot>
            </p>
            <p v-if="description || $slots.description" class="text-xs" :class="TONES[descriptionTone] || TONES.muted">
                <slot name="description">{{ description }}</slot>
            </p>
        </div>
        <div class="min-w-0 text-right text-sm text-gray-700 dark:text-gray-300">
            <slot />
        </div>
    </div>
</template>
