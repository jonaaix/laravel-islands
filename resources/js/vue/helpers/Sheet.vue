<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import IconButton from './IconButton.vue';
import XMarkIcon from './XMarkIcon.vue';
import { overlayZIndex, registerOverlay, unregisterOverlay } from './overlayStack.js';
import { lockPageScroll, unlockPageScroll } from './scrollLock.js';
import { useTheme } from './theme.js';

/**
 * A panel that rises from the bottom edge on a phone — a menu, a form or a whole screen. Dragging it down, tapping
 * the overlay or pressing Escape emits `close`.
 */
const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    /** Takes the full height below the status bar instead of its content's. */
    full: { type: Boolean, default: false },
    /** Draws a line under the header and above the footer. */
    divided: { type: Boolean, default: false },
    /** Only the handle and header start a drag, so the content keeps every gesture. */
    handleOnly: { type: Boolean, default: false },
    /** Set, a close button ends the header; the text is its accessible name. */
    closeLabel: { type: String, default: '' },
    bodyClass: { type: [String, Array], default: 'px-4 pt-3' },
});

const emit = defineEmits(['close']);

const theme = useTheme('sheet');

const DISMISS_RATIO = 0.25;
const DISMISS_VELOCITY = 0.5;
const DRAG_THRESHOLD = 6;

const panel = ref(null);
const body = ref(null);
const offset = ref(0);
const dragging = ref(false);
const bodyDrags = ref(false);
const overlayId = ref(null);

let start = null;
let holdsScrollLock = false;
let returnFocusTo = null;

const layer = computed(() => (overlayId.value !== null ? overlayZIndex(overlayId.value) : 70));
const panelStyle = computed(() => ({
    zIndex: layer.value,
    transform: offset.value > 0 ? `translateY(${offset.value}px)` : undefined,
    transition: dragging.value ? 'none' : undefined,
}));
const divider = 'border-il-neutral-200 dark:border-white/10';

function holdPageScroll(hold) {
    if (hold === holdsScrollLock) {
        return;
    }
    holdsScrollLock = hold;
    hold ? lockPageScroll() : unlockPageScroll();
}

function measureBody() {
    const element = body.value;
    bodyDrags.value = !props.handleOnly && Boolean(element) && element.scrollHeight <= element.clientHeight;
}

function onPointerdown(event, fromBody) {
    if (event.button !== 0 || (fromBody && !bodyDrags.value)) {
        return;
    }
    start = { y: event.clientY, time: event.timeStamp, pointer: event.pointerId, moved: false };
}

function onPointermove(event) {
    if (!start || event.pointerId !== start.pointer) {
        return;
    }
    const distance = event.clientY - start.y;
    if (!start.moved && Math.abs(distance) < DRAG_THRESHOLD) {
        return;
    }
    if (!start.moved) {
        start.moved = true;
        dragging.value = true;
        panel.value?.setPointerCapture?.(event.pointerId);
    }
    offset.value = Math.max(0, distance);
}

function onPointerup(event) {
    if (!start || event.pointerId !== start.pointer) {
        return;
    }
    const moved = start.moved;
    const velocity = offset.value / Math.max(1, event.timeStamp - start.time);
    const height = panel.value?.offsetHeight ?? 1;
    start = null;
    dragging.value = false;
    if (!moved) {
        return;
    }
    panel.value?.releasePointerCapture?.(event.pointerId);
    if (offset.value > height * DISMISS_RATIO || velocity > DISMISS_VELOCITY) {
        emit('close');
        return;
    }
    offset.value = 0;
}

function onClickCapture(event) {
    if (offset.value > 0 || dragging.value) {
        event.stopPropagation();
        event.preventDefault();
    }
}

function onKeydown(event) {
    if (event.key === 'Escape') {
        event.stopPropagation();
        emit('close');
    }
}

watch(() => props.open, async (open) => {
    holdPageScroll(open);
    if (!open) {
        returnFocusTo?.focus?.();
        returnFocusTo = null;
        return;
    }
    offset.value = 0;
    overlayId.value = registerOverlay();
    returnFocusTo = document.activeElement;
    await nextTick();
    measureBody();
    panel.value?.focus?.({ preventScroll: true });
}, { immediate: true });

function releaseOverlay() {
    offset.value = 0;
    if (overlayId.value === null) {
        return;
    }
    unregisterOverlay(overlayId.value);
    overlayId.value = null;
}

onBeforeUnmount(() => {
    holdPageScroll(false);
    returnFocusTo = null;
    releaseOverlay();
});
</script>

<template>
    <Teleport to="body">
        <Transition name="il-sheet-overlay">
            <div v-if="open" class="il-sheet__overlay fixed inset-0 bg-il-neutral-900/50 dark:bg-black/60" :style="{ zIndex: layer }" @click="emit('close')"></div>
        </Transition>
        <Transition name="il-sheet" @after-leave="releaseOverlay">
            <div
                v-if="open"
                ref="panel"
                role="dialog"
                aria-modal="true"
                tabindex="-1"
                :aria-label="title || undefined"
                class="il-sheet fixed inset-x-0 bottom-0 flex flex-col rounded-t-il-card focus:outline-none"
                :class="[theme.surface, full ? 'h-[calc(100dvh-max(1rem,env(safe-area-inset-top)))]' : 'max-h-[calc(100dvh-max(1rem,env(safe-area-inset-top)))]']"
                :style="panelStyle"
                :data-dragging="dragging || undefined"
                @pointermove="onPointermove"
                @pointerup="onPointerup"
                @pointercancel="onPointerup"
                @click.capture="onClickCapture"
                @keydown="onKeydown"
            >
                <div class="il-sheet__grip shrink-0 touch-none" @pointerdown="onPointerdown($event, false)">
                    <span class="il-sheet__handle mx-auto mt-2 block h-1.5 w-10 rounded-full bg-il-neutral-300 dark:bg-white/20" aria-hidden="true"></span>
                    <div v-if="title || description || $slots.title || $slots.actions || closeLabel" class="il-sheet__header flex items-center gap-3 px-4 pt-2 pb-3" :class="divided ? ['border-b', divider] : ''">
                        <div class="min-w-0 flex-1">
                            <slot name="title">
                                <p class="il-sheet__title truncate text-base font-semibold text-il-neutral-900 dark:text-il-neutral-100">{{ title }}</p>
                            </slot>
                            <p v-if="description" class="il-sheet__description truncate text-sm text-il-neutral-500 dark:text-il-neutral-400">{{ description }}</p>
                        </div>
                        <div v-if="$slots.actions" class="il-sheet__actions flex shrink-0 items-center gap-2">
                            <slot name="actions" />
                        </div>
                        <IconButton v-if="closeLabel" :label="closeLabel" :tooltip="false" tone="quiet" @click="emit('close')">
                            <XMarkIcon />
                        </IconButton>
                    </div>
                    <div v-else class="h-3"></div>
                </div>
                <div
                    ref="body"
                    class="il-sheet__body min-h-0 flex-1 overflow-y-auto overscroll-contain"
                    :class="[bodyClass, bodyDrags ? 'touch-none' : '', $slots.footer ? 'pb-3' : 'pb-[max(1rem,env(safe-area-inset-bottom))]']"
                    @pointerdown="onPointerdown($event, true)"
                >
                    <slot />
                </div>
                <div v-if="$slots.footer" class="il-sheet__footer flex shrink-0 items-center gap-3 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]" :class="divided ? ['border-t', divider] : ''">
                    <slot name="footer" />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.il-sheet-overlay-enter-active {
    transition: opacity 260ms ease-out;
}

.il-sheet-overlay-leave-active {
    transition: opacity 200ms ease-in;
}

.il-sheet-overlay-enter-from,
.il-sheet-overlay-leave-to {
    opacity: 0;
}

.il-sheet {
    transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}

.il-sheet-enter-active {
    transition: transform 350ms cubic-bezier(0.22, 1, 0.36, 1);
}

.il-sheet-leave-active {
    transition: transform 200ms ease-in;
}

.il-sheet-enter-from,
.il-sheet-leave-to {
    transform: translateY(100%) !important;
}
</style>
