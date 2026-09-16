<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Tooltip from './Tooltip.vue';
import { useTheme } from './theme.js';

const props = defineProps({
    /**
     * `{ value, label, hint?, count?, icon?, hideLabel?, disabled? }` — the application owns
     * every word of it. A single option can be closed off while the rest stay open, for an
     * answer the state does not allow yet.
     */
    options: { type: Array, default: () => [] },
    /** One value when picking one of them, an array of values when each is its own switch. */
    modelValue: { type: [String, Number, Boolean, Object, Array], default: null },
    multiple: { type: Boolean, default: false },
    /** Picking the one already taken lets go of it again. Ignored while `multiple`. */
    clearable: { type: Boolean, default: false },
    /**
     * `pills` gives every option its own outline — a row of switches beside other controls.
     * `segmented` puts them in one frame, which reads as one question with n answers.
     */
    variant: { type: String, default: null },
    /** `md` stands beside 36px fields; `sm` sits in a dense toolbar beside small buttons. The theme decides when unset. */
    size: { type: String, default: null },
    /** A dot marks what is taken. Off where the tint alone is enough. */
    marker: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const taken = computed(() => (props.multiple ? [...(props.modelValue ?? [])] : []));

function isTaken(value) {
    return props.multiple
        ? taken.value.some((entry) => entry === value)
        : props.modelValue === value;
}

function closed(option) {
    return props.disabled || option.disabled === true;
}

function pick(value) {
    const option = props.options.find((entry) => entry.value === value);

    if (props.disabled || option?.disabled === true) {
        return;
    }

    if (props.multiple) {
        const next = isTaken(value) ? taken.value.filter((entry) => entry !== value) : [...taken.value, value];

        emit('update:modelValue', next);

        return;
    }

    emit('update:modelValue', props.clearable && isTaken(value) ? null : value);
}

const theme = useTheme('optionStrip');

const variant = computed(() => props.variant ?? theme.variant ?? 'pills');
const size = computed(() => props.size ?? theme.size ?? 'md');
const skin = computed(() => theme.skins[variant.value] ?? theme.skins.pills);
const scale = computed(() => theme.sizes[size.value] ?? theme.sizes.md);
const frame = computed(() => [theme.frames[variant.value] ?? theme.frames.pills, variant.value === 'segmented' ? scale.value.frame : '']);

/*
 * One frame, one answer: rather than lighting up a different segment, the surface travels to it.
 * The movement is what says the two belong to the same question — a surface that blinks from
 * here to there reads as two separate things.
 *
 * Only where a single answer is picked; with several switches on at once there is nothing for one
 * surface to point at, so those keep their own.
 */
const slides = computed(() => variant.value === 'segmented' && !props.multiple);

const stripEl = ref(null);
const surface = ref({ x: 0, width: 0, shown: false, still: true, moving: false });

// Long enough to be felt, short enough that nobody waits for it.
const TRAVEL_MS = 260;

let watcher = null;
let settle = null;

function measure() {
    const strip = stripEl.value;

    if (!slides.value || strip === null) {
        return;
    }

    const index = props.options.findIndex((option) => isTaken(option.value));
    const button = index < 0 ? null : strip.querySelectorAll('button')[index];
    // Measured, not read off `offsetLeft`: whole pixels there leave the last segment short.
    const box = button?.getBoundingClientRect();

    if (!button || !box.width) {
        surface.value = { ...surface.value, shown: false, still: true, moving: false };

        return;
    }

    const x = box.left - strip.getBoundingClientRect().left;

    // The first placement must not travel in from the left edge.
    const still = !surface.value.shown;
    const moves = !still && surface.value.x !== x;

    surface.value = { x, width: box.width, shown: true, still, moving: moves };

    if (still) {
        requestAnimationFrame(() => { surface.value = { ...surface.value, still: false }; });
    }

    if (moves) {
        // Stretched while under way, round again on arrival — a hint of a bubble, no bounce house.
        window.clearTimeout(settle);
        settle = window.setTimeout(() => { surface.value = { ...surface.value, moving: false }; }, TRAVEL_MS * 0.55);
    }
}

function remeasure() {
    nextTick(measure);
}

onMounted(() => {
    remeasure();

    if (window.ResizeObserver && stripEl.value) {
        watcher = new ResizeObserver(remeasure);
        watcher.observe(stripEl.value);
    }
});

onBeforeUnmount(() => {
    watcher?.disconnect();
    window.clearTimeout(settle);
});

watch(() => [props.modelValue, props.options, variant.value], remeasure, { deep: true });
</script>

<template>
    <div
        ref="stripEl"
        class="il-option-strip option-strip"
        :class="[frame, slides ? 'relative' : '']"
        :role="multiple ? 'group' : 'radiogroup'"
        :aria-label="ariaLabel || undefined"
        :data-variant="variant"
        :data-size="size"
        :data-disabled="disabled || undefined"
    >
        <span
            v-if="slides && surface.shown"
            aria-hidden="true"
            class="il-option-strip__surface absolute inset-y-px origin-center rounded-full motion-reduce:transition-none motion-reduce:scale-100"
            :class="[
                skin.surface,
                surface.still ? '' : 'transition-[transform,width] duration-[260ms] [transition-timing-function:cubic-bezier(0.34,1.32,0.64,1)]',
            ]"
            :style="{
                transform: `translateX(${surface.x}px) scaleX(${surface.moving ? 1.06 : 1}) scaleY(${surface.moving ? 0.94 : 1})`,
                width: `${surface.width}px`,
                left: 0,
            }"
        ></span>

        <template v-for="option in options" :key="String(option.value)">
            <Tooltip v-if="option.hideLabel" :text="option.label">
                <button
                    type="button"
                    :disabled="closed(option)"
                    :aria-pressed="multiple ? (isTaken(option.value) ? 'true' : 'false') : undefined"
                    :aria-checked="multiple ? undefined : (isTaken(option.value) ? 'true' : 'false')"
                    :aria-label="option.label"
                    :role="multiple ? undefined : 'radio'"
                    :data-state="isTaken(option.value) ? 'on' : 'off'"
                    :class="['il-option-strip__option', skin.base, option.icon ? scale.iconOnly : scale.option, isTaken(option.value) ? skin.on : skin.off, !slides && isTaken(option.value) ? skin.surface ?? '' : '', closed(option) ? 'cursor-not-allowed opacity-50' : '']"
                    @click="pick(option.value)"
                >
                    <component :is="option.icon" v-if="option.icon" class="shrink-0" :class="scale.glyph" />
                    <span v-else class="sr-only">{{ option.label }}</span>
                </button>
            </Tooltip>

            <button
                v-else
                type="button"
                :disabled="closed(option)"
                :aria-pressed="multiple ? (isTaken(option.value) ? 'true' : 'false') : undefined"
                :aria-checked="multiple ? undefined : (isTaken(option.value) ? 'true' : 'false')"
                :role="multiple ? undefined : 'radio'"
                :data-state="isTaken(option.value) ? 'on' : 'off'"
                :class="['il-option-strip__option', skin.base, scale.option, isTaken(option.value) ? skin.on : skin.off, !slides && isTaken(option.value) ? skin.surface ?? '' : '', closed(option) ? 'cursor-not-allowed opacity-50' : '']"
                @click="pick(option.value)"
            >
                <span
                    v-if="marker && variant === 'pills' && isTaken(option.value)"
                    class="il-option-strip__marker h-1.5 w-1.5 shrink-0 rounded-full bg-il-primary-600 dark:bg-il-primary-400"
                ></span>
                <component :is="option.icon" v-if="option.icon" class="shrink-0" :class="scale.glyph" />
                {{ option.label }}
                <span v-if="option.count !== undefined" class="tabular-nums opacity-70">{{ option.count }}</span>
            </button>
        </template>
    </div>
</template>
