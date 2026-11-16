<script setup>
import { computed } from 'vue';
import Icon from './Icon.vue';
import XMarkIcon from './XMarkIcon.vue';
import { useTheme } from './theme.js';

/**
 * A message inside the view, beside what it talks about — never a toast. A medium first line names the state, a
 * muted sentence says what follows; actions sit under the text, a close button at the end.
 */
const props = defineProps({
    /** `neutral` · `info` · `success` · `warning` · `danger`; the theme decides when unset. */
    tone: { type: String, default: null },
    /** An icon from your icon set; also the `#icon` slot. */
    icon: { type: String, default: null },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    /** Set, a close button ends the alert and emits `close`; the text is the button's accessible name. */
    closeLabel: { type: String, default: '' },
});

const emit = defineEmits(['close']);

const theme = useTheme('alert');

const resolvedTone = computed(() => props.tone ?? theme.tone ?? 'neutral');
const look = computed(() => theme.tones?.[resolvedTone.value] ?? theme.tones?.neutral ?? {});
const role = computed(() => (resolvedTone.value === 'danger' || resolvedTone.value === 'warning' ? 'alert' : 'status'));
</script>

<template>
    <div :class="['il-alert', theme.base, look.frame, closeLabel ? 'pe-10' : '']" :role="role" :data-tone="resolvedTone">
        <span v-if="icon || $slots.icon" :class="['il-alert__icon flex h-5 items-center', look.icon]">
            <slot name="icon"><Icon :name="icon" class="h-4 w-4" /></slot>
        </span>
        <p v-if="title || $slots.title" class="il-alert__title col-start-2 font-medium tracking-tight">
            <slot name="title">{{ title }}</slot>
        </p>
        <div v-if="description || $slots.default" :class="['il-alert__description col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed', look.description]">
            <slot>{{ description }}</slot>
        </div>
        <div v-if="$slots.actions" class="il-alert__actions col-start-2 mt-2 flex flex-wrap items-center gap-2">
            <slot name="actions" />
        </div>
        <button
            v-if="closeLabel"
            type="button"
            class="il-alert__close absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-il-primary-500"
            :aria-label="closeLabel"
            @click="emit('close')"
        >
            <XMarkIcon class="h-4 w-4" />
        </button>
    </div>
</template>
