<script setup>
import { useToast } from './toasts.js';

const props = defineProps({
    /** `Close` in the app's own words; the package never ships wording. */
    closeLabel: { type: String, default: 'Close' },
});

const toasts = useToast();

const SURFACE = 'bg-white ring-gray-200 dark:bg-gray-900 dark:ring-white/10';

/**
 * The status colour appears twice and only twice: in the rail down the left edge and in the
 * icon. Tinting the surface as well would drown the message it is meant to mark.
 */
const TONES = {
    info: { rail: 'bg-gray-400 dark:bg-gray-500', accent: 'text-gray-400 dark:text-gray-500' },
    success: { rail: 'bg-emerald-500', accent: 'text-emerald-500' },
    warning: { rail: 'bg-amber-500', accent: 'text-amber-500' },
    danger: { rail: 'bg-red-500', accent: 'text-red-500' },
};

const PATHS = {
    info: 'M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
    success: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    warning: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
    danger: 'M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z',
};

function tone(name) {
    return TONES[name] ?? TONES.info;
}
</script>

<template>
    <Teleport to="body">
        <div class="pointer-events-none fixed inset-x-0 top-4 z-[80] flex flex-col items-end gap-2 px-4 sm:left-auto sm:right-4 sm:px-0">
            <TransitionGroup
                enter-active-class="transition duration-[180ms] ease-out"
                enter-from-class="translate-x-4 opacity-0"
                leave-active-class="transition duration-[160ms] ease-in"
                leave-to-class="translate-x-4 opacity-0"
                move-class="transition duration-200"
            >
                <div
                    v-for="toast in toasts.items.value"
                    :key="toast.id"
                    class="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-lg py-3 pl-5 pr-3 shadow-lg ring-1"
                    :class="SURFACE"
                    role="status"
                    aria-live="polite"
                >
                    <!--
                        The rail says what kind of message this is. Rounded on the outside by the
                        card it sits in, square on the inside, so it reads as a marked edge rather
                        than a border.
                    -->
                    <span class="absolute inset-y-0 left-0 w-1" :class="tone(toast.tone).rail"></span>

                    <div class="flex items-start gap-2.5">
                        <svg
                            class="h-5 w-5 shrink-0"
                            :class="tone(toast.tone).accent"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.6"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" :d="PATHS[toast.tone] ?? PATHS.info" />
                        </svg>

                        <div class="min-w-0 flex-1">
                            <p v-if="toast.title" class="text-sm font-semibold leading-5 text-gray-900 dark:text-white">{{ toast.title }}</p>
                            <p class="text-sm leading-5 text-gray-700 dark:text-gray-300">{{ toast.message }}</p>
                        </div>

                        <button
                            type="button"
                            :aria-label="closeLabel"
                            class="flex h-5 w-5 shrink-0 items-center justify-center text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                            @click="toasts.dismiss(toast.id)"
                        >
                            <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                            </svg>
                        </button>
                    </div>

                    <!-- How much of its time is left, quietly, so a message that goes is no surprise. -->
                    <span
                        v-if="toast.duration > 0"
                        class="toast-timer absolute inset-x-0 bottom-0 h-px origin-left bg-gray-300 dark:bg-white/20"
                        :style="{ animationDuration: `${toast.duration}ms` }"
                    ></span>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
@keyframes toast-timer {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}

.toast-timer {
    animation-name: toast-timer;
    animation-timing-function: linear;
    animation-fill-mode: forwards;
}

@media (prefers-reduced-motion: reduce) {
    .toast-timer {
        animation: none;
    }
}
</style>
