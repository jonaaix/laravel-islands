<script setup>
import { computed, ref } from 'vue';
import { useTranslations } from '@aaix/laravel-islands/vue';
import { Popover } from '@aaix/laravel-islands/vue/helpers';
import FieldSegment from './FieldSegment.vue';

const props = defineProps({
    label: { type: String, required: true },
    modelValue: { type: [String, Number, Boolean], default: null },
    options: { type: Array, default: () => [] },
    saving: { type: Boolean, default: false },
    error: { type: String, default: '' },
    zIndex: { type: Number, default: 60 },
});

const emit = defineEmits(['save']);

const { t } = useTranslations();

const open = ref(false);
const trigger = ref(null);

const selected = computed(() => props.options.find((option) => option.value === props.modelValue) || null);


function toggle() {
    open.value = !open.value;
}

function pick(option) {
    open.value = false;

    if (option.value !== props.modelValue) {
        emit('save', option.value);
    }
}


</script>

<template>
    <div ref="trigger" @click.stop="toggle()">
        <FieldSegment
            :label="label"
            :value="selected ? selected.label : null"
            :state="selected?.state || ''"
            :saving="saving"
            :error="error"
            interactive
            affordance="menu"
        />

        <Popover :anchor="trigger" :open="open" :width="224" :z-index="zIndex" @close="open = false">
            <div class="py-1">
                <button
                    v-for="option in options"
                    :key="String(option.value)"
                    type="button"
                    @click="pick(option)"
                    class="flex w-full items-start gap-2 px-3 py-1.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
                >
                    <span class="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                        <svg v-if="option.value === modelValue" class="h-4 w-4 text-primary-600 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>
                    </span>
                    <span class="min-w-0">
                        <span
                            class="block text-sm leading-tight"
                            :class="option.value === modelValue
                                ? 'font-semibold text-primary-700 dark:text-primary-300'
                                : 'text-gray-700 dark:text-gray-200'"
                        >{{ option.label }}</span>
                        <span v-if="option.hint" class="mt-0.5 block text-[11px] leading-tight text-gray-500 dark:text-gray-400">{{ option.hint }}</span>
                    </span>
                </button>
            </div>
        </Popover>
    </div>
</template>
