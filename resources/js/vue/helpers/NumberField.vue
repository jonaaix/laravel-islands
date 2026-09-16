<script setup>
import { computed, useAttrs } from 'vue';
import { fieldClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [Number, String, null], default: null },
    /** The theme decides when unset. */
    shape: { type: String, default: null },
    size: { type: String, default: null },
    /** Number fields default to right-aligned, tabular figures. */
    align: { type: String, default: 'right' },
    tabular: { type: Boolean, default: true },
    min: { type: [Number, String], default: null },
    max: { type: [Number, String], default: null },
    step: { type: [Number, String], default: null },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
    /** A short unit shown inside the field — "kg", "cm", "%". Long words do not fit. */
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    /** Puts a minus and a plus beside the value, for the small counts a pointer is faster at. */
    stepper: { type: Boolean, default: false },
    /** The accessible names of those two buttons — the application owns the words. */
    decreaseLabel: { type: String, default: '' },
    increaseLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const attrs = useAttrs();

const field = useTheme('field');
const shapeClass = computed(() => field.shapes[props.shape ?? field.shape] ?? field.shapes.rounded);
const sizeClass = computed(() => field.sizes[props.size ?? field.size] ?? field.sizes.md);

const affixed = computed(() => Boolean(props.prefix || props.suffix));

const classes = computed(() =>
    fieldClasses({
        shape: props.shape ?? field.shape,
        size: props.size ?? field.size,
        shapes: field.shapes,
        sizes: field.sizes,
        align: props.align,
        tabular: props.tabular,
        // With a unit in the field the caller's class dresses the frame around it, so the
        // margins and rings it brings keep sitting where they did.
        extra: affixed.value ? '' : (attrs.class ?? ''),
    }),
);

const affixClasses = computed(() => [
    'relative block',
    shapeClass.value,
    attrs.class ?? '',
]);

const stride = computed(() => {
    const parsed = Number(props.step);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
});

const current = computed(() => {
    const parsed = Number(props.modelValue);

    return Number.isFinite(parsed) ? parsed : 0;
});

const lower = computed(() => (props.min === null || props.min === '' ? null : Number(props.min)));

const upper = computed(() => (props.max === null || props.max === '' ? null : Number(props.max)));

const atLower = computed(() => lower.value !== null && current.value <= lower.value);

const atUpper = computed(() => upper.value !== null && current.value >= upper.value);

const stepperFrame = computed(() => [
    'inline-flex items-center overflow-hidden border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-800',
    shapeClass.value,
    sizeClass.value,
    props.disabled ? 'cursor-not-allowed opacity-60' : '',
    attrs.class ?? '',
]);

const STEP_BUTTON =
    'flex h-full shrink-0 items-center justify-center px-2 text-gray-500 transition-colors ' +
    'hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40 ' +
    'disabled:hover:bg-transparent dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 dark:active:bg-white/15';

/** The spin buttons of the native control would sit next to ours saying the same thing. */
const STEP_INPUT =
    'h-full w-full min-w-0 border-0 bg-transparent px-1 text-center tabular-nums focus:outline-none ' +
    'dark:text-gray-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ' +
    '[&::-webkit-outer-spin-button]:appearance-none';

function bump(direction) {
    if (props.disabled || props.readonly) {
        return;
    }

    let next = current.value + direction * stride.value;

    if (lower.value !== null) {
        next = Math.max(lower.value, next);
    }

    if (upper.value !== null) {
        next = Math.min(upper.value, next);
    }

    emit('update:modelValue', next);
}

function onInput(event) {
    const raw = event.target.value;
    if (raw === '' || raw === null) {
        return null;
    }
    const parsed = Number(raw);
    return Number.isNaN(parsed) ? raw : parsed;
}
</script>

<template>
    <span v-if="stepper" class="il-number-field" data-variant="stepper" :data-disabled="disabled || undefined" :class="stepperFrame">
        <button
            type="button"
            :class="['il-number-field__step', STEP_BUTTON]"
            :disabled="disabled || readonly || atLower"
            :aria-label="decreaseLabel || undefined"
            @click="bump(-1)"
        >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="h-4 w-4">
                <path d="M4.25 9.25a.75.75 0 0 0 0 1.5h11.5a.75.75 0 0 0 0-1.5H4.25Z" />
            </svg>
        </button>

        <input
            type="number"
            :value="modelValue"
            :min="min ?? undefined"
            :max="max ?? undefined"
            :step="step ?? undefined"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            :placeholder="placeholder"
            :class="STEP_INPUT"
            v-bind="{ ...attrs, class: undefined }"
            @input="$emit('update:modelValue', onInput($event))"
        />

        <button
            type="button"
            :class="['il-number-field__step', STEP_BUTTON]"
            :disabled="disabled || readonly || atUpper"
            :aria-label="increaseLabel || undefined"
            @click="bump(1)"
        >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="h-4 w-4">
                <path d="M10.75 4.25a.75.75 0 0 0-1.5 0v5h-5a.75.75 0 0 0 0 1.5h5v5a.75.75 0 0 0 1.5 0v-5h5a.75.75 0 0 0 0-1.5h-5v-5Z" />
            </svg>
        </button>
    </span>

    <span v-else-if="affixed" class="il-number-field" data-variant="affixed" :data-disabled="disabled || undefined" :class="affixClasses">
        <span v-if="prefix" class="il-number-field__affix pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-gray-500 dark:text-gray-400">
            {{ prefix }}
        </span>

        <input
            type="number"
            :value="modelValue"
            :min="min ?? undefined"
            :max="max ?? undefined"
            :step="step ?? undefined"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            :placeholder="placeholder"
            :class="[classes, prefix ? 'pl-8' : '', suffix ? 'pr-8' : '']"
            v-bind="{ ...attrs, class: undefined }"
            @input="$emit('update:modelValue', onInput($event))"
        />

        <span v-if="suffix" class="il-number-field__affix pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-gray-500 dark:text-gray-400">
            {{ suffix }}
        </span>
    </span>

    <input
        v-else
        type="number"
        :value="modelValue"
        :min="min ?? undefined"
        :max="max ?? undefined"
        :step="step ?? undefined"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :placeholder="placeholder"
        :class="['il-number-field', classes]"
        :data-size="size ?? field.size"
        :data-shape="shape ?? field.shape"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', onInput($event))"
    />
</template>
