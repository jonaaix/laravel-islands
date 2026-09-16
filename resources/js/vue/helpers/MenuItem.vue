<script setup>
import { computed } from 'vue';

const props = defineProps({
    href: { type: String, default: '' },
    tone: { type: String, default: 'default' },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

const TONES = {
    default: 'text-il-neutral-700 hover:bg-il-neutral-50 dark:text-il-neutral-200 dark:hover:bg-white/5',
    danger: 'text-il-danger-600 hover:bg-il-danger-50 dark:text-il-danger-400 dark:hover:bg-il-danger-500/10',
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
        :data-tone="tone"
        class="il-menu-item flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :class="toneClass"
        @click.stop="emit('click', $event)"
    >
        <slot name="icon" />
        <slot />
    </component>
</template>
