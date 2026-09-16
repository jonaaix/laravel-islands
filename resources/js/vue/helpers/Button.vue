<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue';
import Popover from './Popover.vue';
import { vRipple } from './ripple.js';
import { useButtonDefaults } from './buttonDefaults.js';

defineOptions({ inheritAttrs: false });

const props = defineProps({
    /** Fallback label — the default slot wins when both are set. */
    label: { type: String, default: '' },
    /** `cta` is the one-off ask, `primary` the persistent action, the rest quiet neighbours. */
    tone: { type: String, default: null },
    size: { type: String, default: null },
    /** Renders a spinner in the leading slot, disables the button. */
    loading: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    fullWidth: { type: Boolean, default: false },
    /** For submit buttons inside forms. Ignored when `href` is set. */
    type: { type: String, default: 'button' },
    /** When set, the helper renders as `<a href>` instead of `<button>` — same look, keeps native link behaviour (middle-click, right-click "open in new tab"). */
    href: { type: String, default: null },
    target: { type: String, default: null },
    rel: { type: String, default: null },
    /** `pill` is full-rounded (Material-style), `rounded` a soft-corner rectangle. */
    shape: { type: String, default: null },
    /** Material-style ripple on press. Skipped when the button is disabled or loading; the theme decides when unset. */
    ripple: { type: Boolean, default: null },
    /** Accessible label of the chevron half when the `menu` slot turns this into a split button. */
    menuLabel: { type: String, default: 'Open menu' },
    /** Width of the popover in pixels — passed through to `Popover`. */
    menuWidth: { type: [String, Number], default: 240 },
});

const defaults = useButtonDefaults();

const emit = defineEmits(['click', 'menu-open', 'menu-close']);

const attrs = useAttrs();
const slots = useSlots();

const resolvedTone = computed(() => props.tone ?? defaults.tone ?? 'primary');
const resolvedSize = computed(() => props.size ?? defaults.size ?? 'md');
const resolvedShape = computed(() => props.shape ?? defaults.shape ?? 'rounded');

const size = computed(() => defaults.sizes[resolvedSize.value] ?? defaults.sizes.md);
const toneClass = computed(() => defaults.tones[resolvedTone.value] ?? defaults.tones.primary);
const shapeClass = computed(() => defaults.shapes[resolvedShape.value] ?? defaults.shapes.rounded);
const splitFrameClass = computed(() => defaults.split.frame[resolvedTone.value] ?? '');
const splitHalfClass = computed(() => defaults.split.half[resolvedTone.value] ?? defaults.split.half.primary);
const splitDividerClass = computed(() => defaults.split.divider[resolvedTone.value] ?? defaults.split.divider.secondary);

const isDisabled = computed(() => props.disabled || props.loading);
const hasMenu = computed(() => Boolean(slots.menu));

const rippleOn = computed(() => (props.ripple ?? defaults.ripple ?? true) && !isDisabled.value);

function onActionClick(event) {
    if (isDisabled.value) {
        event.preventDefault();
        return;
    }
    emit('click', event);
}

const menuOpen = ref(false);
const rootEl = ref(null);

function onMenuClick(event) {
    if (isDisabled.value) {
        event.preventDefault();
        return;
    }
    menuOpen.value = !menuOpen.value;
    emit(menuOpen.value ? 'menu-open' : 'menu-close');
}

function closeMenu() {
    if (menuOpen.value) {
        menuOpen.value = false;
        emit('menu-close');
    }
}

const isAnchor = computed(() => props.href !== null);
const resolvedRel = computed(() => props.rel ?? (props.target === '_blank' ? 'noopener' : null));
</script>

<template>
    <component
        v-if="!hasMenu"
        :is="isAnchor ? 'a' : 'button'"
        v-bind="attrs"
        :type="isAnchor ? null : type"
        :href="isAnchor ? (isDisabled ? null : href) : null"
        :target="isAnchor ? target : null"
        :rel="isAnchor ? resolvedRel : null"
        :disabled="isAnchor ? null : isDisabled"
        :aria-disabled="isAnchor && isDisabled ? 'true' : null"
        :data-tone="resolvedTone"
        :data-size="resolvedSize"
        :data-shape="resolvedShape"
        :data-state="loading ? 'loading' : (isDisabled ? 'disabled' : undefined)"
        :class="[
            'il-button relative inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
            isAnchor && isDisabled ? 'cursor-not-allowed opacity-60' : '',
            size.box,
            shapeClass,
            toneClass,
            fullWidth ? 'w-full' : '',
        ]"
        v-ripple="rippleOn"
        @click="onActionClick"
    >
        <span v-if="loading" :class="[size.glyph, 'il-button__spinner flex items-center justify-center']">
            <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
            </svg>
        </span>
        <span
            v-else-if="$slots.icon"
            :class="[size.glyph, 'il-button__icon flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']"
        >
            <slot name="icon" />
        </span>

        <span v-if="$slots.default || label" class="il-button__label"><slot>{{ label }}</slot></span>

        <span v-if="$slots.chip" class="il-button__chip flex items-center"><slot name="chip" /></span>

        <span
            v-if="$slots.iconRight && !loading"
            :class="[size.glyph, 'il-button__icon flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']"
        >
            <slot name="iconRight" />
        </span>
    </component>

    <span
        v-else
        ref="rootEl"
        :data-tone="resolvedTone"
        :data-size="resolvedSize"
        :data-shape="resolvedShape"
        :data-split="true"
        :data-state="loading ? 'loading' : (isDisabled ? 'disabled' : (menuOpen ? 'open' : undefined))"
        :class="[
            'il-button relative isolate inline-flex shrink-0 overflow-hidden whitespace-nowrap align-middle disabled:cursor-not-allowed disabled:opacity-60',
            shapeClass,
            splitFrameClass,
            fullWidth ? 'w-full' : '',
        ]"
    >
        <component
            :is="isAnchor ? 'a' : 'button'"
            v-bind="attrs"
            :type="isAnchor ? null : type"
            :href="isAnchor ? (isDisabled ? null : href) : null"
            :target="isAnchor ? target : null"
            :rel="isAnchor ? resolvedRel : null"
            :disabled="isAnchor ? null : isDisabled"
            :aria-disabled="isAnchor && isDisabled ? 'true' : null"
            :class="[
                'il-button__action relative inline-flex flex-1 items-center justify-center overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                isAnchor && isDisabled ? 'cursor-not-allowed opacity-60' : '',
                size.splitAction,
                splitHalfClass,
            ]"
            v-ripple="rippleOn"
            @click="onActionClick"
        >
                <span v-if="loading" :class="[size.glyph, 'il-button__spinner flex items-center justify-center']">
                <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
                </svg>
            </span>
            <span v-else-if="$slots.icon" :class="[size.glyph, 'il-button__icon flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']">
                <slot name="icon" />
            </span>

            <span v-if="$slots.default || label" class="il-button__label"><slot>{{ label }}</slot></span>

            <span v-if="$slots.chip" class="il-button__chip flex items-center"><slot name="chip" /></span>
        </component>

        <span aria-hidden="true" :class="['il-button__divider w-px self-stretch', splitDividerClass]"></span>

        <button
            type="button"
            :disabled="isDisabled"
            :aria-label="menuLabel"
            :aria-expanded="menuOpen ? 'true' : 'false'"
            :aria-haspopup="'menu'"
            :class="[
                'il-button__menu relative inline-flex shrink-0 items-center justify-center overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                size.splitMenu,
                splitHalfClass,
            ]"
            v-ripple="rippleOn"
            @click="onMenuClick"
        >
            <svg :class="[size.chevron, 'il-button__chevron transition-transform']" :style="{ transform: menuOpen ? 'rotate(180deg)' : 'none' }" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.25a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clip-rule="evenodd" />
            </svg>
        </button>

        <Popover
            :anchor="rootEl"
            :open="menuOpen"
            :width="menuWidth"
            @close="closeMenu"
        >
            <slot name="menu" :close="closeMenu" />
        </Popover>
    </span>
</template>

