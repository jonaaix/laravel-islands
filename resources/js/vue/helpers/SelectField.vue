<script setup>
import { computed, useAttrs } from 'vue';
import { fieldClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [String, Number, Boolean, null], default: null },
    /**
     * Simple `{ value, label }` list. Ignored when the default slot is used.
     * @type {import('vue').PropType<Array<{ value: any, label: string }>>}
     */
    options: { type: Array, default: () => [] },
    /** The theme decides when unset. */
    shape: { type: String, default: null },
    size: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();
const field = useTheme('field');

const classes = computed(() =>
    fieldClasses({
        shape: props.shape ?? field.shape,
        size: props.size ?? field.size,
        shapes: field.shapes,
        sizes: field.sizes,
        extra: (attrs.class ?? '') + ' pr-8 appearance-none bg-no-repeat',
    }),
);

/* A small caret drawn as a background — the browser default caret sits in the
 * padding and clips at h-9. Using bg-image keeps the field flush with the other
 * inputs and colours cleanly in dark mode via currentColor. */
const chevron = "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236b7280'%3E%3Cpath d='M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z'/%3E%3C/svg%3E\")";
</script>

<template>
    <select
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="['il-select-field', classes]"
        :data-size="size ?? field.size"
        :data-shape="shape ?? field.shape"
        :style="{ backgroundImage: chevron, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }"
        v-bind="{ ...attrs, class: undefined }"
        @change="$emit('update:modelValue', $event.target.value)"
    >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <slot>
            <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </slot>
    </select>
</template>
