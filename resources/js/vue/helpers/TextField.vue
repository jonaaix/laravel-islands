<script setup>
import { computed, useAttrs } from 'vue';
import { fieldClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [String, Number, null], default: '' },
    /** Allowed: text | email | url | tel | password | search */
    type: { type: String, default: 'text' },
    /** The theme decides when unset. */
    shape: { type: String, default: null },
    size: { type: String, default: null },
    align: { type: String, default: 'left' },
    mono: { type: Boolean, default: false },
    tabular: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
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
        align: props.align,
        mono: props.mono,
        tabular: props.tabular,
        extra: attrs.class ?? '',
    }),
);
</script>

<template>
    <input
        :type="type"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :placeholder="placeholder"
        :class="['il-text-field', classes]"
        :data-size="size ?? field.size"
        :data-shape="shape ?? field.shape"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', $event.target.value)"
    />
</template>
