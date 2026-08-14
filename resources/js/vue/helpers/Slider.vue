<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    modelValue: { type: [Number, String], default: null },
    options: { type: Array, required: true },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

const trackRef = ref(null);
let dragging = false;

const currentIndex = computed(() => {
    const idx = props.options.findIndex((o) => String(o.value) === String(props.modelValue));

    return idx === -1 ? 0 : idx;
});

const lastIndex = computed(() => Math.max(0, props.options.length - 1));

const positionPct = computed(() => (lastIndex.value === 0 ? 0 : (currentIndex.value / lastIndex.value) * 100));

const marked = computed(() => currentIndex.value > 0);

function pick(index) {
    if (props.disabled) {
        return;
    }

    const opt = props.options[index];

    if (opt && String(opt.value) !== String(props.modelValue)) {
        emit('update:modelValue', opt.value);
    }
}

function indexAtClientX(clientX) {
    const rect = trackRef.value?.getBoundingClientRect();

    if (!rect || rect.width === 0) {
        return currentIndex.value;
    }

    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    return Math.round(ratio * lastIndex.value);
}

function onPointerDown(event) {
    if (props.disabled) {
        return;
    }

    dragging = true;
    event.target?.setPointerCapture?.(event.pointerId);
    pick(indexAtClientX(event.clientX));
}

function onPointerMove(event) {
    if (!dragging) {
        return;
    }

    pick(indexAtClientX(event.clientX));
}

function onPointerUp(event) {
    if (!dragging) {
        return;
    }

    dragging = false;
    event.target?.releasePointerCapture?.(event.pointerId);
}

function onKeydown(event) {
    if (props.disabled) {
        return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        pick(Math.max(0, currentIndex.value - 1));
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        pick(Math.min(lastIndex.value, currentIndex.value + 1));
    } else if (event.key === 'Home') {
        event.preventDefault();
        pick(0);
    } else if (event.key === 'End') {
        event.preventDefault();
        pick(lastIndex.value);
    }
}
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

                <div
                    class="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    :style="{ left: positionPct + '%' }"
                >
                    <button
                        type="button"
                        class="handle focus-visible:ring-primary-500 peer relative z-10 flex h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-2 bg-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 dark:bg-gray-900"
                        :class="marked
                            ? 'border-primary-600 bg-primary-600 dark:border-primary-500 dark:bg-primary-500'
                            : 'border-gray-400 dark:border-gray-500'"
                        style="pointer-events: auto"
                        role="slider"
                        tabindex="0"
                        :aria-label="ariaLabel || undefined"
                        :aria-valuemin="0"
                        :aria-valuemax="lastIndex"
                        :aria-valuenow="currentIndex"
                        :aria-valuetext="options[currentIndex]?.label"
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

        <div class="relative mt-1.5 h-4 px-[9px] text-xs tabular-nums">
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
    </div>
</template>
