<script setup>
import { computed, ref } from 'vue';

/**
 * Two ways to use it: a list of `options` picks one of a few named stops; `min`/`max`/`step`
 * without options runs a plain number. `update:modelValue` follows the pointer, `commit` fires
 * once it lets go — the place to save from.
 */
const props = defineProps({
    modelValue: { type: [Number, String], default: null },
    /** `{ value, label }[]`; leave out for a numeric range. */
    options: { type: Array, default: null },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    /** The words at either end of a numeric range — the application owns them. */
    minLabel: { type: String, default: '' },
    maxLabel: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue', 'commit']);

const trackRef = ref(null);
let dragging = false;

const stepped = computed(() => Array.isArray(props.options));

const currentIndex = computed(() => {
    if (!stepped.value) {
        return 0;
    }

    const idx = props.options.findIndex((o) => String(o.value) === String(props.modelValue));

    return idx === -1 ? 0 : idx;
});

const lastIndex = computed(() => (stepped.value ? Math.max(0, props.options.length - 1) : 0));

const numeric = computed(() => {
    const value = Number(props.modelValue);

    return Number.isFinite(value) ? Math.min(props.max, Math.max(props.min, value)) : props.min;
});

const ratio = computed(() => {
    if (stepped.value) {
        return lastIndex.value === 0 ? 0 : currentIndex.value / lastIndex.value;
    }

    return props.max === props.min ? 0 : (numeric.value - props.min) / (props.max - props.min);
});

const positionPct = computed(() => ratio.value * 100);

const marked = computed(() => (stepped.value ? currentIndex.value > 0 : numeric.value > props.min));

function valueAtRatio(r) {
    const clamped = Math.max(0, Math.min(1, r));

    if (stepped.value) {
        return props.options[Math.round(clamped * lastIndex.value)]?.value;
    }

    const raw = props.min + clamped * (props.max - props.min);

    return Math.min(props.max, Math.max(props.min, props.min + Math.round((raw - props.min) / props.step) * props.step));
}

function pick(value) {
    if (props.disabled || value === undefined) {
        return;
    }

    if (String(value) !== String(props.modelValue)) {
        emit('update:modelValue', value);
    }
}

function commit() {
    emit('commit', stepped.value ? props.options[currentIndex.value]?.value : numeric.value);
}

function ratioAtClientX(clientX) {
    const rect = trackRef.value?.getBoundingClientRect();

    if (!rect || rect.width === 0) {
        return ratio.value;
    }

    return (clientX - rect.left) / rect.width;
}

function onPointerDown(event) {
    if (props.disabled) {
        return;
    }

    dragging = true;
    event.target?.setPointerCapture?.(event.pointerId);
    pick(valueAtRatio(ratioAtClientX(event.clientX)));
}

function onPointerMove(event) {
    if (!dragging) {
        return;
    }

    pick(valueAtRatio(ratioAtClientX(event.clientX)));
}

function onPointerUp(event) {
    if (!dragging) {
        return;
    }

    dragging = false;
    event.target?.releasePointerCapture?.(event.pointerId);
    commit();
}

function stepBy(direction) {
    if (stepped.value) {
        pick(props.options[Math.max(0, Math.min(lastIndex.value, currentIndex.value + direction))]?.value);

        return;
    }

    pick(Math.min(props.max, Math.max(props.min, numeric.value + direction * props.step)));
}

function onKeydown(event) {
    if (props.disabled) {
        return;
    }

    const keys = {
        ArrowLeft: () => stepBy(-1),
        ArrowDown: () => stepBy(-1),
        ArrowRight: () => stepBy(1),
        ArrowUp: () => stepBy(1),
        Home: () => pick(stepped.value ? props.options[0]?.value : props.min),
        End: () => pick(stepped.value ? props.options[lastIndex.value]?.value : props.max),
    };

    if (!keys[event.key]) {
        return;
    }

    event.preventDefault();
    keys[event.key]();
    commit();
}

const ariaValue = computed(() => (stepped.value
    ? { min: 0, max: lastIndex.value, now: currentIndex.value, text: props.options[currentIndex.value]?.label }
    : { min: props.min, max: props.max, now: numeric.value, text: String(numeric.value) }));
</script>

<template>
    <div class="slider inline-flex w-full flex-col select-none" :class="disabled ? 'opacity-50' : ''">
        <div class="relative h-[18px] px-[9px]">
            <div
                ref="trackRef"
                class="relative h-full w-full touch-none"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
            >
                <span
                    aria-hidden="true"
                    class="pointer-events-none absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-gray-300 dark:bg-gray-600"
                ></span>

                <span
                    v-if="marked"
                    aria-hidden="true"
                    class="pointer-events-none absolute left-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-primary-600 transition-[width] duration-150 dark:bg-primary-500"
                    :style="{ width: positionPct + '%' }"
                ></span>

                <template v-if="stepped">
                    <span
                        v-for="(opt, i) in options"
                        :key="'tick-' + opt.value"
                        aria-hidden="true"
                        class="pointer-events-none absolute top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-150"
                        :class="i <= currentIndex && marked
                            ? 'bg-primary-600 dark:bg-primary-500'
                            : 'bg-gray-400 dark:bg-gray-500'"
                        :style="{ left: (lastIndex === 0 ? 0 : (i / lastIndex) * 100) + '%' }"
                    ></span>
                </template>

                <div
                    class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    :style="{ left: positionPct + '%' }"
                >
                    <button
                        type="button"
                        class="handle focus-visible:ring-primary-500 peer relative z-10 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-2 bg-white transition-colors duration-150 before:absolute before:-inset-[11px] before:rounded-full before:content-[''] focus-visible:outline-none focus-visible:ring-2 dark:bg-gray-900"
                        :class="marked
                            ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500'
                            : 'border-gray-400 dark:border-gray-500'"
                        style="pointer-events: auto"
                        role="slider"
                        tabindex="0"
                        :aria-label="ariaLabel || undefined"
                        :aria-valuemin="ariaValue.min"
                        :aria-valuemax="ariaValue.max"
                        :aria-valuenow="ariaValue.now"
                        :aria-valuetext="ariaValue.text"
                        :aria-disabled="disabled ? 'true' : undefined"
                        :disabled="disabled"
                        @keydown="onKeydown"
                    ></button>

                    <span
                        aria-hidden="true"
                        class="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0 transition-opacity duration-150 peer-hover:opacity-[0.08] peer-focus-visible:opacity-[0.14] peer-active:opacity-[0.18] peer-disabled:opacity-0"
                        :class="marked ? 'bg-primary-500' : 'bg-gray-500 dark:bg-gray-300'"
                    ></span>
                </div>
            </div>
        </div>

        <div v-if="stepped" class="relative mt-1.5 h-4 px-[9px] text-xs tabular-nums">
            <div class="relative h-full w-full">
                <span
                    v-for="(opt, i) in options"
                    :key="'label-' + opt.value"
                    class="absolute top-0 -translate-x-1/2 whitespace-nowrap transition-colors duration-150"
                    :class="i === currentIndex && marked
                        ? 'font-semibold text-primary-700 dark:text-primary-300'
                        : 'text-gray-500 dark:text-gray-400'"
                    :style="{ left: (lastIndex === 0 ? 0 : (i / lastIndex) * 100) + '%' }"
                >{{ opt.label }}</span>
            </div>
        </div>

        <div v-else-if="minLabel || maxLabel" class="mt-1.5 flex justify-between px-[9px] text-xs text-gray-500 dark:text-gray-400">
            <span>{{ minLabel }}</span>
            <span>{{ maxLabel }}</span>
        </div>
    </div>
</template>
