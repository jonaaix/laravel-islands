<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

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

/**
 * Under the anchor, aligned to its left edge — pulled back only far enough to stay on
 * screen. Recomputed while open because the page underneath can still scroll and resize.
 */
function position() {
    const el = props.anchor?.$el ?? props.anchor;

    if (!el?.getBoundingClientRect) {
        return;
    }

    const rect = el.getBoundingClientRect();
    const rightmost = window.innerWidth - props.width - props.margin;

    style.value = {
        top: `${rect.bottom + props.offset}px`,
        left: `${Math.max(8, Math.min(rect.left, rightmost))}px`,
        width: `${props.width}px`,
    };
}

watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) {
            window.removeEventListener('resize', position);
            window.removeEventListener('scroll', position, true);

            return;
        }

        position();
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
            class="fixed overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 dark:bg-gray-800 dark:ring-white/10"
            :style="{ ...style, zIndex: zIndex + 1 }"
            @keydown.esc.stop="emit('close')"
            @click.stop
        >
            <slot />
        </div>
    </Teleport>
</template>
