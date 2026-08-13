<script setup>
import Icon from './Icon.vue';
import Tooltip from './Tooltip.vue';

const props = defineProps({
    /**
     * A tab may be `disabled` — kept in place, greyed and out of reach. Hiding it instead would
     * make the strip jump and move click targets under the pointer, and "0 of these" is itself
     * an answer.
     *
     * @type {{ key: string, label: string, icon?: string, count?: number|null, disabled?: boolean,
     *          mark?: { icon: string, text?: string }|null }[]}
     */
    items: { type: Array, required: true },
    modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
    <div class="flex items-center gap-1 border-b border-gray-200 px-3 dark:border-white/10">
        <button
            v-for="item in items"
            :key="item.key"
            type="button"
            :disabled="item.disabled === true"
            :tabindex="item.disabled === true ? -1 : 0"
            @click.stop="emit('update:modelValue', item.key)"
            class="flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
            :class="modelValue === item.key
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : item.disabled === true
                    ? 'cursor-default border-transparent text-gray-300 dark:text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'"
        >
            <Icon v-if="item.icon" :name="item.icon" class="h-4 w-4 shrink-0" />

            {{ item.label }}<span
                v-if="item.count !== null && item.count !== undefined"
                class="ml-0.5 tabular-nums text-gray-400 dark:text-gray-500"
            >{{ item.count }}</span>

            <!-- A verdict about what is inside, as a shape rather than a colour. -->
            <Tooltip v-if="item.mark" :text="item.mark.text || ''">
                <Icon :name="item.mark.icon" class="ml-0.5 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            </Tooltip>
        </button>

        <slot name="end" />
    </div>
</template>
