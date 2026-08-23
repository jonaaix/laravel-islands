<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue';
import Popover from './Popover.vue';
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
    /** Material-style ripple on press. Skipped when the button is disabled or loading. */
    ripple: { type: Boolean, default: true },
    /** Accessible label of the chevron half when the `menu` slot turns this into a split button. */
    menuLabel: { type: String, default: 'Open menu' },
    /** Width of the popover in pixels — passed through to `Popover`. */
    menuWidth: { type: [String, Number], default: 240 },
});

const defaults = useButtonDefaults();

const emit = defineEmits(['click', 'menu-open', 'menu-close']);

const attrs = useAttrs();
const slots = useSlots();

const SIZES = {
    sm: {
        box: 'h-7 gap-1.5 px-3 text-xs',
        splitAction: 'h-7 gap-1.5 pl-3 pr-2 text-xs',
        splitMenu: 'h-7 w-6 text-xs',
        glyph: 'h-3.5 w-3.5',
        chevron: 'h-3 w-3',
    },
    md: {
        box: 'h-9 gap-1.5 px-3.5 text-sm',
        splitAction: 'h-9 gap-1.5 pl-3.5 pr-2.5 text-sm',
        splitMenu: 'h-9 w-7 text-sm',
        glyph: 'h-4 w-4',
        chevron: 'h-3.5 w-3.5',
    },
    lg: {
        box: 'h-10 gap-2 px-5 text-sm',
        splitAction: 'h-10 gap-2 pl-5 pr-3 text-sm',
        splitMenu: 'h-10 w-8 text-sm',
        glyph: 'h-4 w-4',
        chevron: 'h-4 w-4',
    },
};

const SHAPES = {
    pill: 'rounded-full',
    rounded: 'rounded-md',
};

const PACKAGE_DEFAULTS = { shape: 'rounded', size: 'md', tone: 'primary' };

const TONES = {
    cta: 'bg-primary-600 text-white font-medium shadow-sm hover:bg-primary-500 focus-visible:ring-primary-500',
    primary: 'bg-primary-100 text-primary-800 font-medium hover:bg-primary-200 focus-visible:ring-primary-500 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25',
    secondary: 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-700 font-medium ring-1 ring-gray-200 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/5',
    danger: 'bg-red-600 text-white font-medium shadow-sm hover:bg-red-500 focus-visible:ring-red-500',
};

const SPLIT_FRAME = {
    cta: 'shadow-sm',
    primary: '',
    secondary: '',
    ghost: 'ring-1 ring-gray-200 dark:ring-white/10',
    danger: 'shadow-sm',
};

const SPLIT_HALF = {
    cta: 'bg-primary-600 text-white font-medium hover:bg-primary-500 focus-visible:ring-primary-500',
    primary: 'bg-primary-100 text-primary-800 font-medium hover:bg-primary-200 focus-visible:ring-primary-500 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25',
    secondary: 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    ghost: 'bg-transparent text-gray-700 font-medium hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-200 dark:hover:bg-white/5',
    danger: 'bg-red-600 text-white font-medium hover:bg-red-500 focus-visible:ring-red-500',
};

const SPLIT_DIVIDER = {
    cta: 'bg-white/25',
    primary: 'bg-primary-800/15 dark:bg-primary-200/15',
    secondary: 'bg-gray-300 dark:bg-white/10',
    ghost: 'bg-gray-200 dark:bg-white/10',
    danger: 'bg-white/25',
};

const resolvedTone = computed(() => props.tone ?? defaults.tone ?? PACKAGE_DEFAULTS.tone);
const resolvedSize = computed(() => props.size ?? defaults.size ?? PACKAGE_DEFAULTS.size);
const resolvedShape = computed(() => props.shape ?? defaults.shape ?? PACKAGE_DEFAULTS.shape);

const size = computed(() => SIZES[resolvedSize.value] ?? SIZES.md);
const toneClass = computed(() => TONES[resolvedTone.value] ?? TONES.primary);
const shapeClass = computed(() => SHAPES[resolvedShape.value] ?? SHAPES.rounded);
const splitFrameClass = computed(() => SPLIT_FRAME[resolvedTone.value] ?? '');
const splitHalfClass = computed(() => SPLIT_HALF[resolvedTone.value] ?? SPLIT_HALF.primary);
const splitDividerClass = computed(() => SPLIT_DIVIDER[resolvedTone.value] ?? SPLIT_DIVIDER.secondary);

const isDisabled = computed(() => props.disabled || props.loading);
const hasMenu = computed(() => Boolean(slots.menu));

const actionRipples = ref([]);
const menuRipples = ref([]);
let rippleId = 0;

function spawnRipple(list, event) {
    if (!props.ripple || isDisabled.value) return;
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = (event.clientX ?? rect.left + rect.width / 2) - rect.left;
    const y = (event.clientY ?? rect.top + rect.height / 2) - rect.top;
    const rippleSize = Math.max(rect.width, rect.height) * 2;

    const id = ++rippleId;
    list.value.push({ id, x, y, size: rippleSize });
    setTimeout(() => {
        list.value = list.value.filter((r) => r.id !== id);
    }, 400);
}

function onActionClick(event) {
    if (isDisabled.value) {
        event.preventDefault();
        return;
    }
    spawnRipple(actionRipples, event);
    emit('click', event);
}

const menuOpen = ref(false);
const rootEl = ref(null);

function onMenuClick(event) {
    if (isDisabled.value) {
        event.preventDefault();
        return;
    }
    spawnRipple(menuRipples, event);
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
        :class="[
            'relative inline-flex shrink-0 items-center justify-center overflow-hidden whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60',
            isAnchor && isDisabled ? 'cursor-not-allowed opacity-60' : '',
            size.box,
            shapeClass,
            toneClass,
            fullWidth ? 'w-full' : '',
        ]"
        @click="onActionClick"
    >
        <span
            v-for="r in actionRipples"
            :key="r.id"
            class="pointer-events-none absolute rounded-full bg-current opacity-30 aaix-ripple"
            :style="{
                left: `${r.x - r.size / 2}px`,
                top: `${r.y - r.size / 2}px`,
                width: `${r.size}px`,
                height: `${r.size}px`,
            }"
        ></span>
        <span v-if="loading" :class="[size.glyph, 'flex items-center justify-center']">
            <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
            </svg>
        </span>
        <span
            v-else-if="$slots.icon"
            :class="[size.glyph, 'flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']"
        >
            <slot name="icon" />
        </span>

        <span v-if="$slots.default || label"><slot>{{ label }}</slot></span>

        <span v-if="$slots.chip" class="flex items-center"><slot name="chip" /></span>

        <span
            v-if="$slots.iconRight && !loading"
            :class="[size.glyph, 'flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']"
        >
            <slot name="iconRight" />
        </span>
    </component>

    <span
        v-else
        ref="rootEl"
        :class="[
            'relative isolate inline-flex shrink-0 overflow-hidden whitespace-nowrap align-middle disabled:cursor-not-allowed disabled:opacity-60',
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
                'relative inline-flex flex-1 items-center justify-center overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                isAnchor && isDisabled ? 'cursor-not-allowed opacity-60' : '',
                size.splitAction,
                splitHalfClass,
            ]"
            @click="onActionClick"
        >
            <span
                v-for="r in actionRipples"
                :key="r.id"
                class="pointer-events-none absolute rounded-full bg-current opacity-30 aaix-ripple"
                :style="{ left: `${r.x - r.size / 2}px`, top: `${r.y - r.size / 2}px`, width: `${r.size}px`, height: `${r.size}px` }"
            ></span>
            <span v-if="loading" :class="[size.glyph, 'flex items-center justify-center']">
                <svg class="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" d="M12 3a9 9 0 1 0 9 9" />
                </svg>
            </span>
            <span v-else-if="$slots.icon" :class="[size.glyph, 'flex items-center justify-center [&>svg]:h-full [&>svg]:w-full']">
                <slot name="icon" />
            </span>

            <span v-if="$slots.default || label"><slot>{{ label }}</slot></span>

            <span v-if="$slots.chip" class="flex items-center"><slot name="chip" /></span>
        </component>

        <span aria-hidden="true" :class="['w-px self-stretch', splitDividerClass]"></span>

        <button
            type="button"
            :disabled="isDisabled"
            :aria-label="menuLabel"
            :aria-expanded="menuOpen ? 'true' : 'false'"
            :aria-haspopup="'menu'"
            :class="[
                'relative inline-flex shrink-0 items-center justify-center overflow-hidden transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset',
                size.splitMenu,
                splitHalfClass,
            ]"
            @click="onMenuClick"
        >
            <span
                v-for="r in menuRipples"
                :key="r.id"
                class="pointer-events-none absolute rounded-full bg-current opacity-30 aaix-ripple"
                :style="{ left: `${r.x - r.size / 2}px`, top: `${r.y - r.size / 2}px`, width: `${r.size}px`, height: `${r.size}px` }"
            ></span>
            <svg :class="[size.chevron, 'transition-transform']" :style="{ transform: menuOpen ? 'rotate(180deg)' : 'none' }" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
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

<style scoped>
.aaix-ripple {
    transform: scale(0);
    opacity: 0.35;
    animation-name: aaix-ripple-scale, aaix-ripple-fade;
    animation-duration: 220ms, 400ms;
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1), linear;
    animation-fill-mode: forwards, forwards;
}

@keyframes aaix-ripple-scale {
    to { transform: scale(1); }
}

@keyframes aaix-ripple-fade {
    0% { opacity: 0.35; }
    100% { opacity: 0; }
}
</style>
