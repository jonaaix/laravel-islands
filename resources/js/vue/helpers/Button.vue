<script setup>
import { computed, ref, useAttrs } from 'vue';
import { useButtonDefaults } from './buttonDefaults.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    /** Fallback label — the default slot wins when both are set. */
    label: { type: String, default: '' },
    /** `cta` is the one-off ask, `primary` the persistent action, the rest quiet neighbours. */
    tone: { type: String, default: null },
    size: { type: String, default: null },
    /** Renders a spinner in the leading slot, disables the button. */
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    /** For submit buttons inside forms. */
    type: { type: String, default: 'button' },
    /** `pill` is full-rounded (Material-style), `rounded` a soft-corner rectangle. */
    shape: { type: String, default: null },
    /** Material-style ripple on press. Skipped when the button is disabled or loading. */
    ripple: { type: Boolean, default: true },
});

const defaults = useButtonDefaults();

const emit = defineEmits(['click']);

const attrs = useAttrs();

const SIZES = {
    sm: {
        box: 'h-7 gap-1.5 px-3 text-xs',
        glyph: 'h-3.5 w-3.5',
    },
    md: {
        box: 'h-9 gap-1.5 px-3.5 text-sm',
        glyph: 'h-4 w-4',
    },
    lg: {
        box: 'h-10 gap-2 px-5 text-sm',
        glyph: 'h-4 w-4',
    },
};

const SHAPES = {
    pill: 'rounded-full',
    rounded: 'rounded-md',
};

const PACKAGE_DEFAULTS = { shape: 'rounded', size: 'md', tone: 'primary' };

const TONES = {
    cta: 'bg-primary-600 text-white font-medium shadow-sm hover:bg-primary-500 focus-visible:ring-primary-500',
    primary: 'bg-primary-100 text-primary-800 font-medium hover:bg-primary-200 focus-visible:ring-primary-500 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25',
    secondary: 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-700 font-medium ring-1 ring-gray-200 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/5',
    danger: 'bg-red-600 text-white font-medium shadow-sm hover:bg-red-500 focus-visible:ring-red-500',
};

const resolvedTone = computed(() => props.tone ?? defaults.tone ?? PACKAGE_DEFAULTS.tone);
const resolvedSize = computed(() => props.size ?? defaults.size ?? PACKAGE_DEFAULTS.size);
const resolvedShape = computed(() => props.shape ?? defaults.shape ?? PACKAGE_DEFAULTS.shape);

const size = computed(() => SIZES[resolvedSize.value] ?? SIZES.md);
const toneClass = computed(() => TONES[resolvedTone.value] ?? TONES.primary);
const shapeClass = computed(() => SHAPES[resolvedShape.value] ?? SHAPES.rounded);

const isDisabled = computed(() => props.disabled || props.loading);

const ripples = ref([]);
let rippleId = 0;

function spawnRipple(event) {
    if (!props.ripple || isDisabled.value) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (event.clientY ?? rect.top + rect.height / 2) - rect.top;
    const size = Math.max(rect.width, rect.height) * 2;

    const id = ++rippleId;
    ripples.value.push({ id, x, y, size });
    setTimeout(() => {
        ripples.value = ripples.value.filter((r) => r.id !== id);
    }, 400);
}

function onClick(event) {
    if (isDisabled.value) return;
    spawnRipple(event);
    emit('click', event);
}
</script>

<template>
    <button
        v-bind="attrs"
        :type="type"
        :disabled="isDisabled"
        :class="[
            'relative inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
            size.box,
            shapeClass,
            toneClass,
            fullWidth ? 'w-full' : '',
        ]"
        @click="onClick"
    >
        <span
            v-for="r in ripples"
            :key="r.id"
            class="pointer-events-none absolute rounded-full bg-current opacity-30 aaix-ripple"
            :style="{
                left: `${r.x - r.size / 2}px`,
                top: `${r.y - r.size / 2}px`,
                width: `${r.size}px`,
                height: `${r.size}px`,
            }"
        ></span>
        <span v-if="loading" :class="[size.glyph, 'flex items-center justify-center']">
            <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
            </svg>
        </span>
        <span
            v-else-if="$slots.icon"
            :class="[size.glyph, 'flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']"
        >
            <slot name="icon" />
        </span>

        <span v-if="$slots.default || label"><slot>{{ label }}</slot></span>

        <span
            v-if="$slots.iconRight && !loading"
            :class="[size.glyph, 'flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']"
        >
            <slot name="iconRight" />
        </span>
    </button>
</template>

<style scoped>
.aaix-ripple {
    transform: scale(0);
    opacity: 0.35;
    animation-name: aaix-ripple-scale, aaix-ripple-fade;
    animation-duration: 220ms, 400ms;
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1), linear;
    animation-fill-mode: forwards, forwards;
}

@keyframes aaix-ripple-scale {
    to { transform: scale(1); }
}

@keyframes aaix-ripple-fade {
    0% { opacity: 0.35; }
    100% { opacity: 0; }
}
</style>
