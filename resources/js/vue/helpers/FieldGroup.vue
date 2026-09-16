<script setup>
import { computed } from 'vue';
import FieldCaption from './FieldCaption.vue';
import { useTheme } from './theme.js';

const props = defineProps({
    label: { type: String, default: '' },
    muted: { type: Boolean, default: false },
    tone: { type: String, default: '' },
});

const theme = useTheme('fieldGroup');

const surfaceClass = computed(() => {
    if (props.tone && theme.tones[props.tone]) {
        return theme.tones[props.tone];
    }

    return props.muted ? theme.surfaces.muted : theme.surfaces.plain;
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
