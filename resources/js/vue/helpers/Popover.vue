<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
    /** The element the panel hangs under. Pass the ref, not its value. */
    anchor: { type: Object, default: null },
    open: { type: Boolean, default: false },
    width: { type: Number, default: 260 },
    /** Distance between the anchor's bottom edge and the panel. */
    offset: { type: Number, default: 4 },
    /** Room kept between the panel and the window, so it never touches the edge. */
    margin: { type: Number, default: 16 },
    /** Layer to render above (default 60 sits under modals 70; pass 80+ to overlay a modal). */
    zIndex: { type: Number, default: 60 },
});

const emit = defineEmits(['close']);

const style = ref({});

const panel = ref(null);

/** Set once the panel has been measured, so the first frame is not spent in the wrong place. */
const placed = ref(false);

/**
 * Which third of the window the anchor sits in decides where the panel grows from: on the
 * left it opens to the right, in the middle it stays centred under the anchor, on the right
 * it opens to the left. Then it is pulled back far enough to stay on screen.
 */
function left(rect) {
    const third = window.innerWidth / 3;
    const centre = rect.left + rect.width / 2;

    const preferred = centre < third
        ? rect.left
        : centre < third * 2
            ? centre - props.width / 2
            : rect.right - props.width;

    return Math.max(props.margin, Math.min(preferred, window.innerWidth - props.width - props.margin));
}

/**
 * Downwards, unless the panel would run past the bottom edge. Opening upwards from the
 * middle of a window just because the anchor sits there reads as a glitch, so the height of
 * the panel decides, not the position of the anchor.
 */
function top(rect, height) {
    const below = rect.bottom + props.offset;

    if (height === 0 || below + height + props.margin <= window.innerHeight) {
        return below;
    }

    return Math.max(props.margin, rect.top - props.offset - height);
}

/** Recomputed while open, because the page underneath can still scroll and resize. */
function position() {
    const el = props.anchor?.$el ?? props.anchor;

    if (!el?.getBoundingClientRect) {
        return;
    }

    const rect = el.getBoundingClientRect();
    const height = panel.value?.offsetHeight ?? 0;

    style.value = {
        top: `${top(rect, height)}px`,
        left: `${left(rect)}px`,
        width: `${props.width}px`,
    };

    if (height > 0) {
        placed.value = true;
    }
}

watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) {
            placed.value = false;
            window.removeEventListener('resize', position);
            window.removeEventListener('scroll', position, true);

            return;
        }

        position();
        nextTick(position);
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, true);
    },
    { immediate: true },
);

onBeforeUnmount(() => {
    window.removeEventListener('resize', position);
    window.removeEventListener('scroll', position, true);
});

defineExpose({ position });
</script>

<template>
    <Teleport to="body">
        <!-- A click beside the panel means no, the same as Escape. -->
        <div v-if="open" class="fixed inset-0" :style="{ zIndex }" @click="emit('close')"></div>

        <div
            v-if="open"
            ref="panel"
            class="fixed overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-white/10"
            :style="{ ...style, zIndex: zIndex + 1, visibility: placed ? undefined : 'hidden' }"
            @keydown.esc.stop="emit('close')"
            @click.stop
        >
            <slot />
        </div>
    </Teleport>
</template>
