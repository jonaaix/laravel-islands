<script setup>
import { computed } from 'vue';
import { FieldCaption } from '@aaix/laravel-islands/vue/helpers';

const props = defineProps({
    label: { type: String, default: '' },
    muted: { type: Boolean, default: false },
    tone: { type: String, default: '' },
});

const TONES = {
    ok: 'bg-emerald-50 ring-emerald-200 divide-emerald-200 dark:bg-emerald-500/10 dark:ring-emerald-500/30 dark:divide-emerald-500/30',
    blocked: 'bg-amber-50 ring-amber-200 divide-amber-200 dark:bg-amber-500/10 dark:ring-amber-500/30 dark:divide-amber-500/30',
    critical: 'bg-red-50 ring-red-200 divide-red-200 dark:bg-red-500/10 dark:ring-red-500/30 dark:divide-red-500/30',
    off: 'bg-gray-50 ring-gray-200 divide-gray-200 dark:bg-white/5 dark:ring-white/10 dark:divide-white/10',
};

const surfaceClass = computed(() => {
    if (props.tone && TONES[props.tone]) {
        return TONES[props.tone];
    }

    return props.muted
        ? 'bg-gray-50 ring-gray-200 divide-gray-100 dark:bg-white/5 dark:ring-white/10 dark:divide-white/10'
        : 'bg-white ring-gray-200 divide-gray-100 dark:bg-gray-900 dark:ring-white/10 dark:divide-white/10';
});
</script>

<template>
    <div>
        <p v-if="label" class="mb-1"><FieldCaption>{{ label }}</FieldCaption></p>

        <div
            class="flex w-fit divide-x overflow-hidden rounded-lg ring-1"
            :class="surfaceClass"
        >
            <slot />
        </div>
    </div>
</template>
