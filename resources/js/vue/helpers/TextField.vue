<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue';
import Icon from './Icon.vue';
import { fieldClasses } from './fieldStyles.js';
import { useTheme } from './theme.js';
import { useFormFieldAttributes } from './formField.js';

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
    /** An icon from your icon set at the start, such as a magnifier on a search field. */
    icon: { type: String, default: null },
    /** A spinner at the end while a value is being saved or looked up; it takes the place of `#trailing`. */
    loading: { type: Boolean, default: false },
    /** Draws the field red. Inside a FormField with an error this happens on its own. */
    invalid: { type: Boolean, default: false },
});

defineEmits(['update:modelValue']);

const attrs = useAttrs();
const slots = useSlots();
const fieldAttributes = useFormFieldAttributes(attrs);
const field = useTheme('field');
const input = ref(null);

const leading = computed(() => Boolean(props.icon || slots.leading));
const trailing = computed(() => Boolean(props.loading || slots.trailing));
const affixed = computed(() => leading.value || trailing.value);
const isInvalid = computed(() => props.invalid || Boolean(fieldAttributes.value['aria-invalid']));

const classes = computed(() =>
    fieldClasses({
        shape: props.shape ?? field.shape,
        size: props.size ?? field.size,
        base: field.base,
        shapes: field.shapes,
        sizes: field.sizes,
        align: props.align,
        mono: props.mono,
        tabular: props.tabular,
        // With something inside the field the caller's class dresses the wrapper, so widths and margins keep their place.
        extra: [isInvalid.value ? field.invalid ?? '' : '', affixed.value ? '' : attrs.class ?? ''].join(' '),
    }),
);

const AFFIX = 'il-text-field__affix pointer-events-none absolute inset-y-0 flex items-center text-il-neutral-400 dark:text-il-neutral-500';

defineExpose({
    focus: () => input.value?.focus(),
    select: () => input.value?.select(),
    input,
});
</script>

<template>
    <span v-if="affixed" class="il-text-field-frame relative block" :class="attrs.class">
        <span v-if="leading" :class="[AFFIX, 'left-0 pl-2.5']">
            <slot name="leading"><Icon :name="icon" class="h-4 w-4" /></slot>
        </span>
        <input
            ref="input"
            :type="type"
            :value="modelValue"
            :disabled="disabled"
            :readonly="readonly"
            :required="required"
            :placeholder="placeholder"
            :class="['il-text-field', classes, leading ? 'pl-8' : '', trailing ? 'pr-9' : '']"
            :data-size="size ?? field.size"
            :data-shape="shape ?? field.shape"
            :aria-invalid="isInvalid || undefined"
            v-bind="{ ...attrs, ...fieldAttributes, class: undefined }"
            @input="$emit('update:modelValue', $event.target.value)"
        />
        <span v-if="trailing" :class="[AFFIX, 'right-0 pr-2.5']">
            <svg v-if="loading" class="il-text-field__spinner h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            </svg>
            <span v-else class="pointer-events-auto flex items-center"><slot name="trailing" /></span>
        </span>
    </span>
    <input
        v-else
        ref="input"
        :type="type"
        :value="modelValue"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :placeholder="placeholder"
        :class="['il-text-field', classes]"
        :data-size="size ?? field.size"
        :data-shape="shape ?? field.shape"
        :aria-invalid="isInvalid || undefined"
        v-bind="{ ...attrs, ...fieldAttributes, class: undefined }"
        @input="$emit('update:modelValue', $event.target.value)"
    />
</template>
