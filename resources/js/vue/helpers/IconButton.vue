<script setup>
import { computed, useAttrs } from 'vue';
import Tooltip from './Tooltip.vue';
import { vRipple } from './ripple.js';
import { useTheme } from './theme.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    /** Doubles as the accessible name and the tooltip text — never a native title. */
    label: { type: String, required: true },
    /** `xs` … `xl`; the theme decides when unset. */
    size: { type: String, default: null },
    tone: { type: String, default: null },
    tooltip: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    /** Set to open a link instead of acting in place; `target` follows it. */
    href: { type: String, default: '' },
    target: { type: String, default: '_blank' },
    /** Material-style ripple on press. Skipped when the button is disabled; the theme decides when unset. */
    ripple: { type: Boolean, default: null },
});

const theme = useTheme('iconButton');

const emit = defineEmits(['click']);

function onClick(event) {
    if (props.disabled) {
        // A disabled anchor still follows its href, so the navigation has to be called off.
        event.preventDefault();

        return;
    }

    emit('click', event);
}

const attrs = useAttrs();

const resolvedSize = computed(() => props.size ?? theme.size ?? 'md');
const resolvedTone = computed(() => props.tone ?? theme.tone ?? 'quiet');

const box = computed(() => theme.boxes[resolvedSize.value] ?? theme.boxes.md);
const glyph = computed(() => theme.glyphs[resolvedSize.value] ?? theme.glyphs.md);
const tone = computed(() => theme.tones[resolvedTone.value] ?? theme.tones.quiet);
const rippleOn = computed(() => (props.ripple ?? theme.ripple ?? true) && !props.disabled);
</script>

<template>
    <Tooltip :text="tooltip ? label : ''">
        <component
            :is="href ? 'a' : 'button'"
            :type="href ? undefined : 'button'"
            :href="href || undefined"
            :target="href ? target : undefined"
            :rel="href ? 'noopener' : undefined"
            v-bind="attrs"
            v-ripple="rippleOn"
            @click="onClick"
            :aria-label="label"
            :disabled="href ? undefined : disabled"
            :aria-disabled="href && disabled ? 'true' : undefined"
            :data-tone="resolvedTone"
            :data-size="resolvedSize"
            class="il-icon-button relative flex shrink-0 items-center justify-center overflow-hidden rounded-full transition-colors duration-[250ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-il-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            :class="[box, tone]"
        >
                <span :class="glyph" class="il-icon-button__glyph flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
                <slot />
            </span>
        </component>
    </Tooltip>
</template>

