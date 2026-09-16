<script setup>
import { computed } from 'vue';
import Icon from './Icon.vue';
import { useTheme } from './theme.js';

const props = defineProps({
    /** A key of the theme's badge tones; the theme decides when unset. */
    tone: { type: String, default: null },
    icon: { type: String, default: null },
    numeric: { type: Boolean, default: false },
});

const theme = useTheme('badge');

const toneClass = computed(() => theme.tones[props.tone ?? theme.tone] ?? theme.tones.gray);
</script>

<template>
    <span
        class="il-badge inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium"
        :class="[toneClass, numeric ? 'tabular-nums' : '']"
        :data-tone="tone ?? theme.tone"
    >
        <Icon v-if="icon" :name="icon" class="il-badge__icon h-3.5 w-3.5 shrink-0" />
        <slot />
    </span>
</template>
