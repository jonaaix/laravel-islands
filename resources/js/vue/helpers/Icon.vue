<script setup>
import { computed } from 'vue';
import { useIcons } from './icons.js';

const props = defineProps({
    name: { type: String, required: true },
});

const icons = useIcons();
const def = computed(() => icons[props.name] ?? null);
</script>

<template>
    <svg
        v-if="def"
        :viewBox="def.box"
        :fill="def.stroke ? 'none' : 'currentColor'"
        :stroke="def.stroke ? 'currentColor' : undefined"
        :stroke-width="def.stroke ? 1.5 : undefined"
        aria-hidden="true"
        v-html="def.html"
    />
</template>
