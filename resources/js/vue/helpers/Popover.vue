<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { anchoredLeft } from './anchoredLeft.js';
import { isTopOverlay, overlayZIndex, registerOverlay, unregisterOverlay } from './overlayStack.js';
import { useTheme } from './theme.js';

const props = defineProps({
    /** The element the panel hangs under. Pass the ref, not its value. */
    anchor: { type: Object, default: null },
    open: { type: Boolean, default: false },
    /** `null` leaves the width to the panel's own classes, for a menu that grows with its longest entry. */
    width: { type: Number, default: 260 },
    /** Distance between the anchor's edge and the panel. */
    offset: { type: Number, default: 4 },
    side: { type: String, default: 'bottom' },
    align: { type: String, default: null },
    flip: { type: Boolean, default: true },
    backdrop: { type: Boolean, default: true },
    /** Room kept between the panel and the window, so it never touches the edge. */
    margin: { type: Number, default: 16 },
    /**
     * The lowest layer to render on. While open the panel also joins the overlay stack, so a
     * popover inside a modal lands above that modal without the caller knowing the modal's layer.
     */
    zIndex: { type: Number, default: 60 },
});

const emit = defineEmits(['close']);

const surface = useTheme('popover').surface;

const style = ref({});

const overlayId = ref(null);

const layer = computed(() => overlayId.value === null ? props.zIndex : Math.max(props.zIndex, overlayZIndex(overlayId.value)));

function releaseOverlay() {
    if (overlayId.value !== null) {
        unregisterOverlay(overlayId.value);
        overlayId.value = null;
    }
}

const panel = ref(null);

/** Set once the panel has been measured, so the first frame is not spent in the wrong place. */
const placed = ref(false);

/**
 * Hidden by opacity rather than `visibility`, because a panel that is not visible cannot take
 * focus — a picker focusing its search field on the tick it opens would silently lose it.
 */
const unplacedStyle = { opacity: '0', pointerEvents: 'none' };

/**
 * Downwards, unless the panel would run past the bottom edge. Opening upwards from the
 * middle of a window just because the anchor sits there reads as a glitch, so the height of
 * the panel decides, not the position of the anchor.
 */
function top(rect, height) {
    const below = rect.bottom + props.offset;
    const above = rect.top - props.offset - height;
    const fitsBelow = below + height + props.margin <= window.innerHeight;
    const fitsAbove = above >= props.margin;

    if (props.side === 'top') {
        return height === 0 || fitsAbove || !props.flip || !fitsBelow ? Math.max(props.margin, above) : below;
    }

    if (height === 0 || fitsBelow || !props.flip) {
        return below;
    }

    return Math.max(props.margin, above);
}

function clamp(value, size, room) {
    return Math.max(props.margin, Math.min(value, room - size - props.margin));
}

function alignedStart(start, end, size, room) {
    if (props.align === 'end') {
        return clamp(end - size, size, room);
    }

    if (props.align === 'center') {
        return clamp((start + end - size) / 2, size, room);
    }

    return clamp(start, size, room);
}

function beside(rect, width) {
    const right = rect.right + props.offset;
    const left = rect.left - props.offset - width;
    const fitsRight = right + width + props.margin <= window.innerWidth;
    const fitsLeft = left >= props.margin;

    if (props.side === 'left') {
        return fitsLeft || !props.flip || !fitsRight ? left : right;
    }

    return fitsRight || !props.flip || !fitsLeft ? right : left;
}

function place(rect, width, height) {
    if (props.side === 'left' || props.side === 'right') {
        return {
            top: alignedStart(rect.top, rect.bottom, height, window.innerHeight),
            left: clamp(beside(rect, width), width, window.innerWidth),
        };
    }

    return {
        top: top(rect, height),
        left: props.align === null
            ? anchoredLeft(rect, width, props.margin)
            : alignedStart(rect.left, rect.right, width, window.innerWidth),
    };
}

/** Recomputed while open, because the page underneath can still scroll and resize. */
function position() {
    const el = props.anchor?.$el ?? props.anchor;

    if (!el?.getBoundingClientRect) {
        return;
    }

    const rect = el.getBoundingClientRect();
    const height = panel.value?.offsetHeight ?? 0;
    const width = props.width ?? panel.value?.offsetWidth ?? 0;

    const at = place(rect, width, height);

    style.value = {
        top: `${at.top}px`,
        left: `${at.left}px`,
        ...(props.width === null ? {} : { width: `${props.width}px` }),
    };

    if (height > 0) {
        placed.value = true;
    }
}

// Listened for on the window, because focus usually stays on the trigger or the page and never enters the panel.
function closeOnEscape(event) {
    if (event.key === 'Escape' && overlayId.value !== null && isTopOverlay(overlayId.value)) {
        event.stopPropagation();
        emit('close');
    }
}

function stopListening() {
    window.removeEventListener('resize', position);
    window.removeEventListener('scroll', position, true);
    window.removeEventListener('keydown', closeOnEscape, true);
}

watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) {
            placed.value = false;
            releaseOverlay();
            stopListening();

            return;
        }

        overlayId.value = registerOverlay();
        position();
        nextTick(position);
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, true);
        window.addEventListener('keydown', closeOnEscape, true);
    },
    { immediate: true },
);

watch(
    () => props.width,
    () => {
        if (props.open) {
            position();
        }
    },
);

onBeforeUnmount(() => {
    releaseOverlay();
    stopListening();
});

defineExpose({ position });
</script>

<template>
    <Teleport to="body">
        <!-- A click beside the panel means no, the same as Escape. -->
        <div v-if="open && backdrop" class="il-popover__backdrop fixed inset-0" :style="{ zIndex: layer }" @click="emit('close')"></div>

        <div
            v-if="open"
            ref="panel"
            class="il-popover fixed overflow-hidden rounded-il-card"
            :class="surface"
            :style="{ ...style, zIndex: layer + 1, ...(placed ? {} : unplacedStyle) }"
            @click.stop
        >
            <slot />
        </div>
    </Teleport>
</template>
