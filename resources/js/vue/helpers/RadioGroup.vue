<script setup>
import { computed, provide } from 'vue';
import { nextRadioGroupName, RADIO_GROUP_KEY } from './radioGroup.js';

const props = defineProps({
    modelValue: { type: [String, Number, Boolean, Object], default: null },
    name: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    orientation: { type: String, default: 'vertical' },
    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const fallbackName = nextRadioGroupName();

provide(RADIO_GROUP_KEY, {
    name: computed(() => props.name || fallbackName),
    modelValue: computed(() => props.modelValue),
    disabled: computed(() => props.disabled),
    select: (value) => emit('update:modelValue', value),
});
</script>

<template>
    <div
        role="radiogroup"
        :aria-label="ariaLabel || undefined"
        class="flex"
        :class="orientation === 'horizontal' ? 'flex-row flex-wrap items-center gap-x-5 gap-y-2' : 'flex-col gap-2'"
    >
        <slot />
    </div>
</template>
