<script setup>
import { computed, useAttrs } from 'vue';
import { fieldClasses } from './fieldStyles.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    modelValue: { type: [Number, String, null], default: null },
    shape: { type: String, default: 'rounded' },
    size: { type: String, default: 'md' },
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
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();

const classes = computed(() =>
    fieldClasses({
        shape: props.shape,
        size: props.size,
        align: props.align,
        tabular: props.tabular,
        extra: attrs.class ?? '',
    }),
);

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
        :class="classes"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', onInput($event))"
    />
</template>
