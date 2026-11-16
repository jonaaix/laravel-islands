<script setup>
import { computed, useSlots } from 'vue';
import Icon from './Icon.vue';
import IconButton from './IconButton.vue';
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
const slots = useSlots();

const resolvedTone = computed(() => props.tone ?? theme.tone ?? 'neutral');
const look = computed(() => theme.tones?.[resolvedTone.value] ?? theme.tones?.neutral ?? {});
const hasIcon = computed(() => Boolean(props.icon || slots.icon));
// With an icon the halo sits as far from the left edge as from the top, and the title drops to its middle.
const columns = computed(() => (hasIcon.value ? 'grid-cols-[1.75rem_1fr] gap-x-3 ps-3' : 'grid-cols-[0_1fr]'));
const role = computed(() => (resolvedTone.value === 'danger' || resolvedTone.value === 'warning' ? 'alert' : 'status'));
</script>

<template>
    <div :class="['il-alert', theme.base, columns, look.frame, closeLabel ? 'pe-10' : '']" :role="role" :data-tone="resolvedTone">
        <span v-if="icon || $slots.icon" :class="['il-alert__icon -mb-1 flex h-7 w-7 items-center justify-center rounded-full', look.halo, look.icon]">
            <slot name="icon"><Icon :name="icon" class="h-4 w-4" /></slot>
        </span>
        <p v-if="title || $slots.title" :class="['il-alert__title col-start-2 font-medium tracking-tight', hasIcon ? 'pt-1' : '']">
            <slot name="title">{{ title }}</slot>
        </p>
        <div v-if="description || $slots.default" :class="['il-alert__description col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed', look.description]">
            <slot>{{ description }}</slot>
        </div>
        <div v-if="$slots.actions" class="il-alert__actions col-start-2 mt-2 flex flex-wrap items-center gap-2">
            <slot name="actions" />
        </div>
        <span v-if="closeLabel" class="il-alert__close absolute right-2 top-2.5 flex">
            <IconButton :label="closeLabel" size="xs" tone="plain" class="opacity-60 transition-opacity hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10" @click="emit('close')">
                <XMarkIcon />
            </IconButton>
        </span>
    </div>
</template>
