<script setup>
import { computed } from 'vue';

const props = defineProps({
    /** Given, the row becomes a link that opens in a new tab. */
    href: { type: String, default: '' },
    tone: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

const TONES = {
    default: 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5',
    danger: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10',
};

const tag = computed(() => (props.href ? 'a' : 'button'));
const toneClass = computed(() => TONES[props.tone] ?? TONES.default);
</script>

<template>
    <component
        :is="tag"
        :href="href || undefined"
        :target="href ? '_blank' : undefined"
        :rel="href ? 'noopener' : undefined"
        :type="href ? undefined : 'button'"
        :disabled="tag === 'button' ? disabled : undefined"
        :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
        class="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :class="toneClass"
        @click.stop="emit('click', $event)"
    >
        <slot name="icon" />
        <slot />
    </component>
</template>
