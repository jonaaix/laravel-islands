<script setup>
defineProps({
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Required when no visible label sits beside the switch. */
    ariaLabel: { type: String, default: '' },
    /** What being on means: ordinary business, or something to be careful about. */
    tone: { type: String, default: 'primary' },
});

const emit = defineEmits(['update:modelValue']);

const TRACKS = {
    primary: 'bg-primary-600 dark:bg-primary-500',
    danger: 'bg-red-500',
    success: 'bg-emerald-500',
};

const ICONS = {
    primary: 'text-primary-600 dark:text-primary-500',
    danger: 'text-red-500',
    success: 'text-emerald-500',
};

const LAYERS = {
    primary: 'bg-primary-500',
    danger: 'bg-red-500',
    success: 'bg-emerald-500',
};
</script>

<template>
    <!--
        A switch says what happens from now on, where a checkbox says what has happened.
        The handle carries a mark of its own state, so the answer survives being read at a
        glance, in greyscale, or by someone who cannot tell the two track colours apart.
    -->
    <span class="relative inline-flex h-7 w-11 shrink-0 items-center" :class="disabled ? 'opacity-50' : ''">
        <input
            type="checkbox"
            role="switch"
            class="peer absolute -inset-x-1 -inset-y-1.5 z-10 m-0 cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
            :checked="modelValue"
            :disabled="disabled"
            :aria-label="ariaLabel || undefined"
            @change="emit('update:modelValue', $event.target.checked)"
        />

        <!-- Off is an outline, on is a fill: the state reads even before the colour does. -->
        <span
            aria-hidden="true"
            class="pointer-events-none absolute inset-0 rounded-full transition-colors duration-150"
            :class="modelValue
                ? (TRACKS[tone] || TRACKS.primary)
                : 'bg-gray-200 ring-2 ring-inset ring-gray-400 dark:bg-gray-700 dark:ring-gray-500'"
        ></span>

        <!-- Centred on the handle and travelling with it, so the feedback belongs to what moves. -->
        <span
            aria-hidden="true"
            class="pointer-events-none absolute left-0 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full opacity-0 transition-[opacity,transform] duration-150 ease-out peer-hover:opacity-[0.08] peer-focus-visible:opacity-[0.14] peer-active:opacity-[0.18] peer-disabled:opacity-0"
            :class="[
                modelValue ? 'translate-x-2.5' : '-translate-x-1.5',
                modelValue ? (LAYERS[tone] || LAYERS.primary) : 'bg-gray-500 dark:bg-gray-300',
            ]"
        ></span>

        <span
            aria-hidden="true"
            class="pointer-events-none absolute left-0 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full transition-[transform,background-color] duration-150 ease-out"
            :class="[
                modelValue ? 'translate-x-5' : 'translate-x-1',
                modelValue ? 'bg-white' : 'bg-gray-400 dark:bg-gray-500',
            ]"
        >
            <svg
                v-if="modelValue"
                class="h-3.5 w-3.5"
                :class="ICONS[tone] || ICONS.primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
            ><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7"/></svg>
            <svg
                v-else
                class="h-3 w-3 text-gray-100 dark:text-gray-800"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </span>
    </span>
</template>
