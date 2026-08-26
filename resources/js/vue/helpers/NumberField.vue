<script setup>
import { computed, useAttrs } from 'vue';
import { fieldClasses, FIELD_SHAPES } from './fieldStyles.js';

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
    /** A short unit shown inside the field — "kg", "cm", "%". Long words do not fit. */
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();

const affixed = computed(() => Boolean(props.prefix || props.suffix));

const classes = computed(() =>
    fieldClasses({
        shape: props.shape,
        size: props.size,
        align: props.align,
        tabular: props.tabular,
        // With a unit in the field the caller's class dresses the frame around it, so the
        // margins and rings it brings keep sitting where they did.
        extra: affixed.value ? '' : (attrs.class ?? ''),
    }),
);

const affixClasses = computed(() => [
    'relative block',
    FIELD_SHAPES[props.shape] ?? FIELD_SHAPES.rounded,
    attrs.class ?? '',
]);

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
    <span v-if="affixed" :class="affixClasses">
        <span v-if="prefix" class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs text-gray-500 dark:text-gray-400">
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

        <span v-if="suffix" class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-gray-500 dark:text-gray-400">
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
        :class="classes"
        v-bind="{ ...attrs, class: undefined }"
        @input="$emit('update:modelValue', onInput($event))"
    />
</template>
