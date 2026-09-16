<script setup>
import { computed } from 'vue';
import { FieldCaption } from '@aaix/laravel-islands/vue/helpers';

const props = defineProps({
    label: { type: String, default: '' },
    muted: { type: Boolean, default: false },
    tone: { type: String, default: '' },
});

const TONES = {
    ok: 'bg-il-success-50 ring-il-success-200 divide-il-success-200 dark:bg-il-success-500/10 dark:ring-il-success-500/30 dark:divide-il-success-500/30',
    blocked: 'bg-il-warning-50 ring-il-warning-200 divide-il-warning-200 dark:bg-il-warning-500/10 dark:ring-il-warning-500/30 dark:divide-il-warning-500/30',
    critical: 'bg-il-danger-50 ring-il-danger-200 divide-il-danger-200 dark:bg-il-danger-500/10 dark:ring-il-danger-500/30 dark:divide-il-danger-500/30',
    off: 'bg-il-neutral-50 ring-il-neutral-200 divide-il-neutral-200 dark:bg-white/5 dark:ring-white/10 dark:divide-white/10',
};

const surfaceClass = computed(() => {
    if (props.tone && TONES[props.tone]) {
        return TONES[props.tone];
    }

    return props.muted
        ? 'bg-il-neutral-50 ring-il-neutral-200 divide-il-neutral-100 dark:bg-white/5 dark:ring-white/10 dark:divide-white/10'
        : 'bg-white ring-il-neutral-200 divide-il-neutral-100 dark:bg-il-neutral-900 dark:ring-white/10 dark:divide-white/10';
});
</script>

<template>
    <div class="il-field-group" :data-tone="tone || undefined" :data-muted="muted || undefined">
        <p v-if="label" class="il-field-group__label mb-1"><FieldCaption>{{ label }}</FieldCaption></p>

        <div
            class="il-field-group__frame flex w-fit divide-x overflow-hidden rounded-il-menu ring-1"
            :class="surfaceClass"
        >
            <slot />
        </div>
    </div>
</template>
