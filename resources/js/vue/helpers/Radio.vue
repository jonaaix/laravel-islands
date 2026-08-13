<script setup>
import { computed, inject } from 'vue';
import { RADIO_GROUP_KEY } from './radioGroup.js';

const props = defineProps({
    value: { type: [String, Number, Boolean, Object], default: null },
    modelValue: { type: [String, Number, Boolean, Object], default: undefined },
    name: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const group = inject(RADIO_GROUP_KEY, null);

function sameChoice(a, b) {
    if (a === b) {
        return true;
    }

    if (a === null || b === null || a === undefined || b === undefined) {
        return false;
    }

    if (typeof a === 'object' || typeof b === 'object') {
        return false;
    }

    return String(a) === String(b);
}

const marked = computed(() => sameChoice(group ? group.modelValue.value : props.modelValue, props.value));

const isDisabled = computed(() => props.disabled || (group?.disabled.value ?? false));

const name = computed(() => props.name || group?.name.value || undefined);

function pick() {
    if (group) {
        group.select(props.value);

        return;
    }

    emit('update:modelValue', props.value);
}
</script>

<template>
    <span class="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center" :class="isDisabled ? 'opacity-50' : ''">
        <input
            type="radio"
            class="peer absolute -inset-[11px] z-10 m-0 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
            :name="name"
            :checked="marked"
            :disabled="isDisabled"
            :aria-label="ariaLabel || undefined"
            @change="pick"
        />

        <span
            aria-hidden="true"
            class="pointer-events-none absolute -inset-[11px] rounded-full opacity-0 transition-opacity duration-150 peer-hover:opacity-[0.08] peer-focus-visible:opacity-[0.14] peer-active:opacity-[0.18] peer-disabled:opacity-0"
            :class="marked ? 'bg-primary-500' : 'bg-gray-500 dark:bg-gray-300'"
        ></span>

        <span
            aria-hidden="true"
            class="pointer-events-none relative flex h-full w-full items-center justify-center rounded-full border-2 transition-colors duration-150"
            :class="marked
                ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500'
                : 'border-gray-400 bg-transparent dark:border-gray-500'"
        >
            <span
                class="h-1.5 w-1.5 rounded-full bg-white transition-transform duration-150 ease-out"
                :class="marked ? 'scale-100' : 'scale-0'"
            ></span>
        </span>
    </span>
</template>
