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
    <div class="il-tabs flex items-center gap-1 overflow-x-auto border-b border-il-neutral-200 px-3 dark:border-white/10">
        <button
            v-for="item in items"
            :key="item.key"
            type="button"
            :disabled="item.disabled === true"
            :tabindex="item.disabled === true ? -1 : 0"
            :data-state="modelValue === item.key ? 'active' : (item.disabled === true ? 'disabled' : 'inactive')"
            @click.stop="emit('update:modelValue', item.key)"
            class="il-tabs__tab flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
            :class="modelValue === item.key
                ? 'border-il-primary-500 text-il-primary-600 dark:text-il-primary-400'
                : item.disabled === true
                    ? 'cursor-default border-transparent text-il-neutral-300 dark:text-il-neutral-600'
                    : 'border-transparent text-il-neutral-500 hover:text-il-neutral-700 dark:text-il-neutral-400 dark:hover:text-il-neutral-300'"
        >
            <Icon v-if="item.icon" :name="item.icon" class="il-tabs__icon h-4 w-4 shrink-0" />

            {{ item.label }}<span
                v-if="item.count !== null && item.count !== undefined"
                class="il-tabs__count font-accent ml-0.5 rounded-il-control px-1.5 py-0.5 text-xs font-semibold tabular-nums"
                :class="modelValue === item.key
                    ? 'bg-il-primary-100 text-il-primary-700 dark:bg-il-primary-500/20 dark:text-il-primary-300'
                    : 'bg-il-neutral-100 text-il-neutral-500 dark:bg-il-neutral-800 dark:text-il-neutral-400'"
            >{{ item.count }}</span>

            <!-- A verdict about what is inside, as a shape rather than a colour. -->
            <Tooltip v-if="item.mark" :text="item.mark.text || ''">
                <Icon :name="item.mark.icon" class="il-tabs__mark ml-0.5 h-3.5 w-3.5 text-il-neutral-400 dark:text-il-neutral-500" />
            </Tooltip>
        </button>

        <slot name="end" />
    </div>
</template>
