<script setup>
import { computed } from 'vue';
import Icon from './Icon.vue';

const props = defineProps({
    tone: { type: String, default: 'gray' },
    icon: { type: String, default: null },
    numeric: { type: Boolean, default: false },
});

const TONES = {
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-500/15 dark:text-primary-200',
};

const toneClass = computed(() => TONES[props.tone] ?? TONES.gray);
</script>

<template>
    <span
        class="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium"
        :class="[toneClass, numeric ? 'tabular-nums' : '']"
    >
        <Icon v-if="icon" :name="icon" class="h-3.5 w-3.5 shrink-0" />
        <slot />
    </span>
</template>
