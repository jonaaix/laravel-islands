<script setup>
import { ref, watch } from 'vue';
import ChevronDownIcon from './ChevronDownIcon.vue';
import Icon from './Icon.vue';

/**
 * A quiet line that folds its details open beneath it — a step in a log, a tool call, a section of fine print. The
 * details are built on first opening, so a long list of closed lines stays cheap.
 */
const props = defineProps({
    /** Bound with `v-model:open`. */
    open: { type: Boolean, default: false },
    label: { type: String, required: true },
    /** An icon from your icon set; also the `#icon` slot. */
    icon: { type: String, default: null },
    /** Turns the icon, for a step still running. */
    spinning: { type: Boolean, default: false },
    /** `neutral` · `danger` — the colour of the icon. */
    tone: { type: String, default: 'neutral' },
});

const emit = defineEmits(['update:open']);

const opened = ref(props.open);

watch(() => props.open, (open) => {
    if (open) {
        opened.value = true;
    }
});
</script>

<template>
    <div class="il-collapsible" :data-state="open ? 'open' : 'closed'">
        <button
            type="button"
            class="il-collapsible__trigger group flex w-full min-w-0 items-center gap-1.5 rounded-sm text-sm text-il-neutral-500 outline-il-primary-500/25 transition-colors hover:text-il-neutral-800 focus-visible:outline-3 disabled:cursor-default disabled:hover:text-il-neutral-500 dark:text-il-neutral-400 dark:hover:text-il-neutral-200 dark:disabled:hover:text-il-neutral-400"
            :aria-expanded="$slots.default ? open : undefined"
            :disabled="!$slots.default"
            @click="emit('update:open', !open)"
        >
            <span v-if="icon || $slots.icon" class="il-collapsible__icon flex h-4 w-4 shrink-0" :class="[spinning ? 'animate-spin' : '', tone === 'danger' ? 'text-il-danger-600 dark:text-il-danger-400' : '']">
                <slot name="icon"><Icon :name="icon" class="h-4 w-4" /></slot>
            </span>
            <span class="il-collapsible__label truncate">{{ label }}</span>
            <ChevronDownIcon v-if="$slots.default" class="il-collapsible__chevron h-4 w-4 shrink-0 transition-transform duration-200 ease-out motion-reduce:transition-none" :class="open ? 'rotate-180' : ''" />
        </button>
        <div
            v-if="$slots.default"
            class="il-collapsible__content grid transition-[grid-template-rows,opacity] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            :class="open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
            :inert="!open"
        >
            <div class="-m-1 min-h-0 overflow-hidden p-1">
                <div v-if="opened" class="il-collapsible__body pt-2 text-sm whitespace-pre-wrap text-il-neutral-500 dark:text-il-neutral-400">
                    <slot />
                </div>
            </div>
        </div>
    </div>
</template>
