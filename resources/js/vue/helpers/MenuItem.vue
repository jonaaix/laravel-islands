<script setup>
import { computed } from 'vue';
import { useTheme } from './theme.js';

const props = defineProps({
    href: { type: String, default: '' },
    /** `default` or `danger`; the theme decides when unset. */
    tone: { type: String, default: null },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

const theme = useTheme('menuItem');

const tag = computed(() => (props.href ? 'a' : 'button'));
const resolvedTone = computed(() => props.tone ?? theme.tone ?? 'default');
const toneClass = computed(() => theme.tones[resolvedTone.value] ?? theme.tones.default);
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
        :data-tone="resolvedTone"
        class="il-menu-item flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        :class="toneClass"
        @click.stop="emit('click', $event)"
    >
        <slot name="icon" />
        <slot />
    </component>
</template>
