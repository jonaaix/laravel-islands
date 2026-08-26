<script setup>
import { computed, useAttrs } from 'vue';
import Tooltip from './Tooltip.vue';
import { vRipple } from './ripple.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    /** Doubles as the accessible name and the tooltip text — never a native title. */
    label: { type: String, required: true },
    size: { type: String, default: 'md' },
    tone: { type: String, default: 'quiet' },
    tooltip: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    /** Material-style ripple on press. Skipped when the button is disabled. */
    ripple: { type: Boolean, default: true },
});

const emit = defineEmits(['click']);

function onClick(event) {
    if (props.disabled) return;

    emit('click', event);
}

const attrs = useAttrs();

/**
 * Box/glyph pairs are lifted from the toolbar buttons already in use across the
 * datagrid package (FilterPanel's minimize = md, ColumnPicker's trigger = lg,
 * the various inline clear buttons = xs) — xl extrapolates the same step.
 */
const BOXES = { xs: 'h-6 w-6', sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-9 w-9', xl: 'h-10 w-10' };
const GLYPHS = { xs: 'h-4 w-4', sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5', xl: 'h-6 w-6' };

const TONES = {
    quiet: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 dark:active:bg-white/15',
    danger: 'text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100 dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:active:bg-red-500/25',
    active: 'bg-primary-500/10 text-primary-600 hover:bg-primary-500/15 active:bg-primary-500/25 dark:bg-primary-500/15 dark:text-primary-400 dark:hover:bg-primary-500/25 dark:active:bg-primary-500/35',
    /** No colour of its own — for a button whose hover tint is tied to whatever it sits in. */
    plain: '',
};

const box = computed(() => BOXES[props.size] ?? BOXES.md);
const glyph = computed(() => GLYPHS[props.size] ?? GLYPHS.md);
const tone = computed(() => TONES[props.tone] ?? TONES.quiet);
</script>

<template>
    <Tooltip :text="tooltip ? label : ''">
        <button
            type="button"
            v-bind="attrs"
            v-ripple="ripple && !disabled"
            @click="onClick"
            :aria-label="label"
            :disabled="disabled"
            class="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-[250ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            :class="[box, tone]"
        >
                <span :class="glyph" class="flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                <slot />
            </span>
        </button>
    </Tooltip>
</template>

