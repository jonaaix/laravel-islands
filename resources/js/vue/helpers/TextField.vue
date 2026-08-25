<script setup>
import { computed, useAttrs } from 'vue';
import { fieldClasses } from './fieldStyles.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [String, Number, null], default: '' },
    /** Allowed: text | email | url | tel | password | search */
    type: { type: String, default: 'text' },
    shape: { type: String, default: 'rounded' },
    size: { type: String, default: 'md' },
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

const classes = computed(() =>
    fieldClasses({
        shape: props.shape,
        size: props.size,
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
        :class="classes"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', $event.target.value)"
    />
</template>
