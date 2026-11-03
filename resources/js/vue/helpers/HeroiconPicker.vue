<script setup>
import { computed } from 'vue';
import IconPicker from './IconPicker.vue';
import NamedHeroicon from './NamedHeroicon.vue';
import { heroiconSets } from './heroiconSets.js';

const props = defineProps({
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    styles: { type: Array, default: () => ['o', 's'] },
    labels: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:modelValue']);

const sets = computed(() => heroiconSets(props.styles, props.labels));
</script>

<template>
    <IconPicker
        :model-value="modelValue"
        :sets="sets"
        :disabled="disabled"
        :labels="labels"
        @update:model-value="emit('update:modelValue', $event)">
        <template #selected="{ value }">
            <NamedHeroicon :name="value" class="h-5 w-5 shrink-0 text-il-primary-500" />
        </template>
    </IconPicker>
</template>
