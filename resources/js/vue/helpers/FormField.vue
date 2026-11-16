<script setup>
import { computed, useId } from 'vue';
import { provideFormField } from './formField.js';

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
});

const id = useId();
const descriptionId = `${id}-description`;
const errorId = `${id}-error`;

const errorText = computed(() => (typeof props.error === 'string' ? props.error : ''));

provideFormField({
    id,
    describedBy: computed(() => [props.description ? descriptionId : null, errorText.value ? errorId : null].filter(Boolean).join(' ') || undefined),
    invalid: computed(() => Boolean(props.error)),
});
</script>

<template>
    <div class="il-form-field text-sm" :data-invalid="error ? true : undefined">
        <div v-if="label || hint || $slots.label || $slots.hint" class="il-form-field__head flex items-center justify-between gap-2">
            <label :for="id" class="il-form-field__label block font-medium text-il-neutral-900 dark:text-white">
                <slot name="label">{{ label }}</slot><span v-if="required" class="il-form-field__required ms-0.5 text-il-danger-600 dark:text-il-danger-400" aria-hidden="true">*</span>
            </label>
            <span v-if="hint || $slots.hint" class="il-form-field__hint text-il-neutral-500 dark:text-il-neutral-400"><slot name="hint">{{ hint }}</slot></span>
        </div>
        <p v-if="description || $slots.description" :id="descriptionId" class="il-form-field__description text-il-neutral-500 dark:text-il-neutral-400">
            <slot name="description">{{ description }}</slot>
        </p>
        <div class="il-form-field__control relative" :class="label || description || $slots.label ? 'mt-1' : ''">
            <slot />
        </div>
        <p v-if="errorText" :id="errorId" class="il-form-field__error mt-2 text-il-danger-600 dark:text-il-danger-400">{{ errorText }}</p>
    </div>
</template>
