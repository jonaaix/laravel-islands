<script setup>
import { computed } from 'vue';
import { useTheme } from './theme.js';

const props = defineProps({
    label: { type: String, default: '' },
    /** A second, quieter line under the label — an explanation or an error. */
    description: { type: String, default: '' },
    /** Colours the description when it carries a problem rather than a hint. */
    descriptionTone: { type: String, default: 'muted' },
});

const theme = useTheme('listItem');

const descriptionClass = computed(() => theme.tones[props.descriptionTone] ?? theme.tones.muted);
</script>

<template>
    <!--
        One row, one statement: what it is on the left, what it says on the right. The right
        side takes a value or a control alike, so a panel of settings and a panel of figures
        keep the same rhythm.
    -->
    <div class="il-list-item flex items-center justify-between gap-3 py-3">
        <div class="il-list-item__text min-w-0">
            <p class="il-list-item__label text-sm font-medium text-il-neutral-900 dark:text-il-neutral-100">
                <slot name="label">{{ label }}</slot>
            </p>
            <p v-if="description || $slots.description" class="il-list-item__description text-xs" :class="descriptionClass" :data-tone="descriptionTone">
                <slot name="description">{{ description }}</slot>
            </p>
        </div>
        <div class="il-list-item__value min-w-0 text-right text-sm text-il-neutral-700 dark:text-il-neutral-300">
            <slot />
        </div>
    </div>
</template>
