<script setup>
import { computed, useId } from 'vue';
import { provideFormField } from './formField.js';
import { useTheme } from './theme.js';

/**
 * A control with its label, an optional hint beside the label, a description under it and an
 * error under the control. Islands controls inside pick up the label's id on their own.
 */
const props = defineProps({
    label: { type: String, default: '' },
    /** A short note at the label's end, such as "Optional" or a limit. */
    hint: { type: String, default: '' },
    description: { type: String, default: '' },
    /** A sentence shows under the control; `true` only marks the control as invalid. */
    error: { type: [String, Boolean], default: '' },
    required: { type: Boolean, default: false },
    /** `caption` · `label`; the theme decides when unset. */
    variant: { type: String, default: null },
});

const theme = useTheme('formField');

const id = useId();
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;

const resolvedVariant = computed(() => props.variant ?? theme.variant ?? 'caption');
const look = computed(() => theme.variants?.[resolvedVariant.value] ?? theme.variants?.caption ?? {});
const errorText = computed(() => (typeof props.error === 'string' ? props.error : ''));

provideFormField({
    id,
    describedBy: computed(() => [props.description ? descriptionId : null, errorText.value ? errorId : null].filter(Boolean).join(' ') || undefined),
    invalid: computed(() => Boolean(props.error)),
});
</script>

<template>
    <div class="il-form-field" :data-variant="resolvedVariant" :data-invalid="error ? true : undefined">
        <div v-if="label || hint || $slots.label || $slots.hint" :class="['il-form-field__head', look.head]">
            <label :for="id" :class="['il-form-field__label', look.label]">
                <slot name="label">{{ label }}</slot><span v-if="required" class="il-form-field__required ms-0.5 text-il-danger-600 dark:text-il-danger-400" aria-hidden="true">*</span>
            </label>
            <span v-if="hint || $slots.hint" :class="['il-form-field__hint', look.hint]"><slot name="hint">{{ hint }}</slot></span>
        </div>
        <p v-if="description || $slots.description" :id="descriptionId" :class="['il-form-field__description', look.description]">
            <slot name="description">{{ description }}</slot>
        </p>
        <div :class="['il-form-field__control relative', label || description || $slots.label ? look.control : '']">
            <slot />
        </div>
        <p v-if="errorText" :id="errorId" :class="['il-form-field__error', look.error]">{{ errorText }}</p>
    </div>
</template>
