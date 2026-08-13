<script setup>
import { computed } from 'vue';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    /** Neither on nor off — for a box standing in for several that disagree. */
    indeterminate: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Required when no visible label sits beside the box. */
    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const marked = computed(() => props.indeterminate || props.modelValue);

/** Long enough to cover the tick, so it can be wiped off and drawn back on. */
const TICK_LENGTH = 20;
</script>

<template>
    <!--
        The input itself is the target and it reaches well past the glyph: a box this small is
        hard to hit, so the pointer is answered before it arrives. Wrap this in a <label> and
        the words become part of the same target.
    -->
    <span class="relative inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center" :class="disabled ? 'opacity-50' : ''">
        <input
            type="checkbox"
            class="peer absolute -inset-[11px] z-10 m-0 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
            :checked="modelValue"
            :indeterminate="indeterminate"
            :disabled="disabled"
            :aria-label="ariaLabel || undefined"
            @change="emit('update:modelValue', $event.target.checked)"
        />

        <!--
            The state layer. It is the only part that reacts to the pointer, which keeps the box
            itself steady — nothing grows or moves, so a row of boxes never jitters.
        -->
        <span
            aria-hidden="true"
            class="pointer-events-none absolute -inset-[11px] rounded-full opacity-0 transition-opacity duration-150 peer-hover:opacity-[0.08] peer-focus-visible:opacity-[0.14] peer-active:opacity-[0.18] peer-disabled:opacity-0"
            :class="marked ? 'bg-primary-500' : 'bg-gray-500 dark:bg-gray-300'"
        ></span>

        <span
            aria-hidden="true"
            class="pointer-events-none relative flex h-full w-full items-center justify-center rounded-[4px] border-2 transition-colors duration-150"
            :class="marked
                ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500'
                : 'border-gray-400 bg-transparent dark:border-gray-500'"
        >
            <svg viewBox="0 0 18 18" class="h-full w-full text-white">
                <!-- Drawn rather than switched on: the stroke is wiped off and runs back in. -->
                <path
                    v-if="!indeterminate"
                    d="M4 9.3 7.1 12.4 14 5.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="transition-[stroke-dashoffset] duration-150 ease-out"
                    :style="{ strokeDasharray: TICK_LENGTH, strokeDashoffset: modelValue ? 0 : TICK_LENGTH }"
                />
                <path
                    v-else
                    d="M4.5 9h9"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                />
            </svg>
        </span>
    </span>
</template>
