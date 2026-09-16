<script setup>
import { computed } from 'vue';
import { useTheme } from './theme.js';

const props = defineProps({
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Required when no visible label sits beside the switch. */
    ariaLabel: { type: String, default: '' },
    /** What being on means: ordinary business, or something to be careful about. The theme decides when unset. */
    tone: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue']);

const theme = useTheme('switch');

const resolvedTone = computed(() => props.tone ?? theme.tone ?? 'primary');
const skin = computed(() => theme.tones[resolvedTone.value] ?? theme.tones.primary);
</script>

<template>
    <!--
        A switch says what happens from now on, where a checkbox says what has happened.
        The handle carries a mark of its own state, so the answer survives being read at a
        glance, in greyscale, or by someone who cannot tell the two track colours apart.
    -->
    <span
        class="il-switch relative inline-flex h-7 w-11 shrink-0 items-center"
        :class="disabled ? 'opacity-50' : ''"
        :data-state="modelValue ? 'on' : 'off'"
        :data-tone="resolvedTone"
        :data-disabled="disabled || undefined"
    >
        <input
            type="checkbox"
            role="switch"
            class="il-switch__input peer absolute -inset-x-1 -inset-y-1.5 z-10 m-0 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
            :checked="modelValue"
            :disabled="disabled"
            :aria-label="ariaLabel || undefined"
            @change="emit('update:modelValue', $event.target.checked)"
        />

        <!-- Off is an outline, on is a fill: the state reads even before the colour does. -->
        <span
            aria-hidden="true"
            class="il-switch__track pointer-events-none absolute inset-0 rounded-full transition-colors duration-[var(--il-duration-fast)]"
            :class="modelValue
                ? skin.track
                : 'bg-il-neutral-200 ring-2 ring-inset ring-il-neutral-400 dark:bg-il-neutral-700 dark:ring-il-neutral-500'"
        ></span>

        <!-- Centred on the handle and travelling with it, so the feedback belongs to what moves. -->
        <span
            aria-hidden="true"
            class="il-switch__halo pointer-events-none absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 transition-[opacity,transform] duration-[var(--il-duration-fast)] ease-out peer-hover:opacity-[0.08] peer-focus-visible:opacity-[0.14] peer-active:opacity-[0.18] peer-disabled:opacity-0"
            :class="[
                modelValue ? 'translate-x-2.5' : '-translate-x-1.5',
                modelValue ? skin.halo : 'bg-il-neutral-500 dark:bg-il-neutral-300',
            ]"
        ></span>

        <span
            aria-hidden="true"
            class="il-switch__handle pointer-events-none absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full transition-[transform,background-color] duration-[var(--il-duration-fast)] ease-out"
            :class="[
                modelValue ? 'translate-x-5' : 'translate-x-1',
                modelValue ? 'bg-white' : 'bg-il-neutral-400 dark:bg-il-neutral-500',
            ]"
        >
            <svg
                v-if="modelValue"
                class="h-3.5 w-3.5"
                :class="skin.icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
            ><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>
            <svg
                v-else
                class="h-3 w-3 text-il-neutral-100 dark:text-il-neutral-800"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </span>
    </span>
</template>
