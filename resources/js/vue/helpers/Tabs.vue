<script setup>
import { computed } from 'vue';
import Icon from './Icon.vue';
import Tooltip from './Tooltip.vue';
import { useTheme } from './theme.js';

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
    /** `underline` or `pills`; unset, the theme decides. */
    variant: { type: String, default: null },
});

const emit = defineEmits(['update:modelValue']);

const theme = useTheme('tabs');

const variant = computed(() => props.variant ?? theme.variant ?? 'underline');

const skin = computed(() => theme.skins[variant.value] ?? theme.skins.underline);

function stateOf(item) {
    if (props.modelValue === item.key) {
        return 'active';
    }

    return item.disabled === true ? 'disabled' : 'inactive';
}
</script>

<template>
    <div class="il-tabs" :class="skin.strip" :data-variant="variant">
        <button
            v-for="item in items"
            :key="item.key"
            type="button"
            :disabled="item.disabled === true"
            :tabindex="item.disabled === true ? -1 : 0"
            :data-state="stateOf(item)"
            @click.stop="emit('update:modelValue', item.key)"
            class="il-tabs__tab"
            :class="[skin.tab, skin[stateOf(item)]]"
        >
            <Icon v-if="item.icon" :name="item.icon" class="il-tabs__icon h-4 w-4 shrink-0" />

            {{ item.label }}<span
                v-if="item.count !== null && item.count !== undefined"
                class="il-tabs__count font-accent ml-0.5 rounded-il-control px-1.5 py-0.5 text-xs font-semibold tabular-nums"
                :class="modelValue === item.key ? skin.countActive : skin.countInactive"
            >{{ item.count }}</span>

            <!-- A verdict about what is inside, as a shape rather than a colour. -->
            <Tooltip v-if="item.mark" :text="item.mark.text || ''">
                <Icon :name="item.mark.icon" class="il-tabs__mark ml-0.5 h-3.5 w-3.5 text-il-neutral-400 dark:text-il-neutral-500" />
            </Tooltip>
        </button>

        <slot name="end" />
    </div>
</template>
