<script setup>
import { computed, useAttrs } from 'vue';
import { textareaClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [String, null], default: '' },
    rows: { type: [Number, String], default: 4 },
    /** The theme decides when unset. */
    shape: { type: String, default: null },
    size: { type: String, default: null },
    mono: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();
const field = useTheme('field');

const classes = computed(() =>
    textareaClasses({
        shape: props.shape ?? field.shape,
        size: props.size ?? field.size,
        shapes: field.shapes,
        sizes: field.textareaSizes,
        mono: props.mono,
        extra: attrs.class ?? '',
    }),
);
</script>

<template>
    <textarea
        :value="modelValue"
        :rows="rows"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :placeholder="placeholder"
        :class="['il-text-area', classes]"
        :data-size="size ?? field.size"
        :data-shape="shape ?? field.shape"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
</template>
