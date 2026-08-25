<script setup>
import { computed, useAttrs } from 'vue';
import { textareaClasses } from './fieldStyles.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [String, null], default: '' },
    rows: { type: [Number, String], default: 4 },
    shape: { type: String, default: 'rounded' },
    size: { type: String, default: 'md' },
    mono: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' },
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();

const classes = computed(() =>
    textareaClasses({
        shape: props.shape,
        size: props.size,
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
        :class="classes"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
</template>
