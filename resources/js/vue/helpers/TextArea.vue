<script setup>
import { computed, nextTick, onMounted, ref, useAttrs, watch } from 'vue';
import { textareaClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';
import { useFormFieldAttributes } from './formField.js';

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
    /** Grows with its text from `rows` up to `maxRows`, then scrolls. */
    autoresize: { type: Boolean, default: false },
    maxRows: { type: Number, default: null },
    /** Draws the field red. Inside a FormField with an error this happens on its own. */
    invalid: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();
const fieldAttributes = useFormFieldAttributes(attrs);
const field = useTheme('field');
const area = ref(null);

const isInvalid = computed(() => props.invalid || Boolean(fieldAttributes.value['aria-invalid']));

const classes = computed(() =>
    textareaClasses({
        shape: props.shape ?? field.shape,
        size: props.size ?? field.size,
        base: field.base,
        shapes: field.shapes,
        sizes: field.textareaSizes,
        mono: props.mono,
        extra: [isInvalid.value ? field.invalid ?? '' : '', attrs.class ?? ''].join(' '),
    }),
);

function fit() {
    const element = area.value;

    if (!props.autoresize || !element) {
        return;
    }

    const style = getComputedStyle(element);
    const line = Number.parseFloat(style.lineHeight) || 20;
    const borders = Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth);
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const ceiling = props.maxRows ? props.maxRows * line + padding + borders : Infinity;

    element.style.height = 'auto';
    const wanted = element.scrollHeight + borders;
    element.style.height = `${Math.min(wanted, ceiling)}px`;
    element.style.overflowY = wanted > ceiling ? 'auto' : 'hidden';
}

onMounted(fit);
watch(() => props.modelValue, () => nextTick(fit));

defineExpose({
    focus: () => area.value?.focus(),
    select: () => area.value?.select(),
    area,
});
</script>

<template>
    <textarea
        ref="area"
        :value="modelValue"
        :rows="rows"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :placeholder="placeholder"
        :class="['il-text-area', classes, autoresize ? 'resize-none' : '']"
        :data-size="size ?? field.size"
        :data-shape="shape ?? field.shape"
        :aria-invalid="isInvalid || undefined"
        v-bind="{ ...attrs, ...fieldAttributes, class: undefined }"
        @input="$emit('update:modelValue', $event.target.value); fit()"
    ></textarea>
</template>
