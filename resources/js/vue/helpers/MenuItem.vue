<script setup>
import { computed, ref } from 'vue';
import CheckMarkIcon from './CheckMarkIcon.vue';
import { useMenuLevel } from './menuLevel.js';
import { useTheme } from './theme.js';

const props = defineProps({
    href: { type: String, default: '' },
    target: { type: String, default: '_blank' },
    /** `default` or `danger`; the theme decides when unset. */
    tone: { type: String, default: null },
    disabled: { type: Boolean, default: false },
    description: { type: String, default: '' },
    checked: { type: Boolean, default: null },
    multiple: { type: Boolean, default: false },
    keepOpen: { type: Boolean, default: false },
});

const emit = defineEmits(['click']);

const theme = useTheme('menuItem');
const level = useMenuLevel();

const el = ref(null);

const tag = computed(() => (props.href ? 'a' : 'button'));
const resolvedTone = computed(() => props.tone ?? theme.tone ?? 'default');
const toneClass = computed(() => theme.tones[resolvedTone.value] ?? theme.tones.default);
const isChoice = computed(() => props.checked !== null);
const role = computed(() => {
    if (!isChoice.value) {
        return level ? 'menuitem' : undefined;
    }

    return props.multiple ? 'menuitemcheckbox' : 'menuitemradio';
});
const staysOpen = computed(() => props.keepOpen || (isChoice.value && props.multiple));

function rootEl() {
    return el.value?.$el ?? el.value;
}

function activate(event) {
    if (props.disabled) {
        event.preventDefault();

        return;
    }

    emit('click', event);

    if (level && !staysOpen.value) {
        level.root.closeAll();
    }
}

function onPointerEnter() {
    if (!level) {
        return;
    }

    const node = rootEl();

    level.pointerEnteredItem(node);

    if (!props.disabled) {
        node?.focus({ preventScroll: true });
    }
}

function onPointerLeave() {
    const node = rootEl();

    if (level && document.activeElement === node) {
        node.closest('[role="menu"]')?.focus({ preventScroll: true });
    }
}
</script>

<template>
    <component
        :is="tag"
        ref="el"
        :href="href || undefined"
        :target="href ? target : undefined"
        :rel="href && target !== '_self' ? 'noopener' : undefined"
        :type="href ? undefined : 'button'"
        :role="role"
        :tabindex="level ? -1 : undefined"
        :aria-checked="isChoice ? String(checked) : undefined"
        :disabled="tag === 'button' ? disabled : undefined"
        :aria-disabled="tag === 'a' && disabled ? 'true' : undefined"
        :data-tone="resolvedTone"
        :data-state="checked ? 'checked' : undefined"
        class="il-menu-item flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        :class="toneClass"
        @click.stop="activate"
        @mouseenter="onPointerEnter"
        @mouseleave="onPointerLeave"
    >
        <slot name="leading"><slot name="icon" /></slot>
        <span class="il-menu-item__body flex min-w-0 flex-1 flex-col">
            <span class="il-menu-item__label flex items-center gap-2"><slot /></span>
            <span v-if="description || $slots.description" class="il-menu-item__description text-xs text-il-neutral-500 dark:text-il-neutral-400">
                <slot name="description">{{ description }}</slot>
            </span>
        </span>
        <slot name="trailing">
            <CheckMarkIcon v-if="checked" class="il-menu-item__check h-4 w-4 shrink-0 text-il-primary-600 dark:text-il-primary-400" />
        </slot>
    </component>
</template>
