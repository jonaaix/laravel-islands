<script setup>
import { computed } from 'vue';
import { useButtonDefaults } from './buttonDefaults.js';

/**
 * Joins the Buttons placed directly inside it into one strip: the ends keep the buttons' shape,
 * the seams share a single hairline. Meant for `tone="outlined"` buttons of one size; put
 * anything that is not a Button (a hidden file input, a tooltip wrapper) outside the group.
 */
const props = defineProps({
    /** Follows the Button defaults when left empty. */
    shape: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
});

const defaults = useButtonDefaults();

const ENDS = {
    pill: '[&>*:first-child]:rounded-l-full [&>*:last-child]:rounded-r-full',
    rounded: '[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md',
};

const ends = computed(() => ENDS[props.shape || defaults.shape] ?? ENDS.rounded);
</script>

<template>
    <div
        role="group"
        :aria-label="ariaLabel || undefined"
        class="inline-flex items-center [&>*]:rounded-none [&>*+*]:ml-px [&>*:focus-visible]:relative [&>*:focus-visible]:z-10 [&>*:hover]:relative [&>*:hover]:z-10"
        :class="ends"
    >
        <slot />
    </div>
</template>
