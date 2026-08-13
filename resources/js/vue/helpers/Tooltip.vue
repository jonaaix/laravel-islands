<script setup>
import { computed, ref, nextTick, onBeforeUnmount } from 'vue';

const props = defineProps({
    text: { type: String, default: '' },
    placement: { type: String, default: 'top' },
    delay: { type: Number, default: 80 },
});

// The tip stands off by exactly as much as the arrow sticks out, so the arrow touches
// the trigger and the body of the tip does not.
const ARROW = 5;
const OFFSET = ARROW;
const EDGE = 8;

const visible = ref(false);
const coords = ref({ top: 0, left: 0 });
const arrow = ref({ side: 'top', offset: 0 });
const triggerRef = ref(null);
const tipRef = ref(null);
let showTimer = null;

function reposition() {
    const trigger = triggerRef.value;
    const tip = tipRef.value;
    if (!trigger || !tip) {
        return;
    }

    // Anchored to the trigger, not to the pointer: the tip belongs to the element, sits
    // beside it and stays put while the pointer moves within it.
    //
    // Measured on the wrapped element rather than the wrapper. For an ordinary child the
    // two boxes coincide, but one that is absolutely positioned leaves the wrapper behind
    // as an empty box somewhere else entirely — and the tip would follow that box.
    const anchor = trigger.children.length === 1 ? trigger.firstElementChild : trigger;
    const tr = anchor.getBoundingClientRect();
    const tp = tip.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let placement = props.placement;
    if (placement === 'top' && tr.top - tp.height - OFFSET < EDGE) {
        placement = 'bottom';
    } else if (placement === 'bottom' && tr.bottom + tp.height + OFFSET > vh - EDGE) {
        placement = 'top';
    }

    let top;
    let left;
    if (placement === 'top') {
        top = tr.top - tp.height - OFFSET;
        left = tr.left + tr.width / 2 - tp.width / 2;
    } else if (placement === 'bottom') {
        top = tr.bottom + OFFSET;
        left = tr.left + tr.width / 2 - tp.width / 2;
    } else if (placement === 'left') {
        top = tr.top + tr.height / 2 - tp.height / 2;
        left = tr.left - tp.width - OFFSET;
    } else {
        top = tr.top + tr.height / 2 - tp.height / 2;
        left = tr.right + OFFSET;
    }

    left = Math.max(EDGE, Math.min(left, vw - tp.width - EDGE));
    top = Math.max(EDGE, Math.min(top, vh - tp.height - EDGE));
    coords.value = { top, left };

    // The arrow points at the trigger's middle, not at the tip's: near a viewport edge the
    // tip slides sideways, and an arrow that slid with it would point past the target.
    const along = placement === 'top' || placement === 'bottom'
        ? { centre: tr.left + tr.width / 2 - left, span: tp.width }
        : { centre: tr.top + tr.height / 2 - top, span: tp.height };

    arrow.value = {
        side: placement,
        offset: Math.max(ARROW + 2, Math.min(along.centre, along.span - ARROW - 2)),
    };
}

/** Half the rotated square hides behind the tip; the other half is the arrow. */
const arrowStyle = computed(() => {
    const shift = '-4px';

    if (arrow.value.side === 'top') {
        return { bottom: shift, left: `${arrow.value.offset}px`, marginLeft: '-4px' };
    }

    if (arrow.value.side === 'bottom') {
        return { top: shift, left: `${arrow.value.offset}px`, marginLeft: '-4px' };
    }

    if (arrow.value.side === 'left') {
        return { right: shift, top: `${arrow.value.offset}px`, marginTop: '-4px' };
    }

    return { left: shift, top: `${arrow.value.offset}px`, marginTop: '-4px' };
});

function bindViewportListeners() {
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
}

function unbindViewportListeners() {
    window.removeEventListener('scroll', reposition, true);
    window.removeEventListener('resize', reposition);
}

function show() {
    if (!props.text) {
        return;
    }
    clearTimeout(showTimer);
    showTimer = setTimeout(async () => {
        visible.value = true;
        await nextTick();
        reposition();
        bindViewportListeners();
    }, props.delay);
}

function hide() {
    clearTimeout(showTimer);
    visible.value = false;
    unbindViewportListeners();
}

onBeforeUnmount(() => {
    clearTimeout(showTimer);
    unbindViewportListeners();
});
</script>

<template>
    <span
        ref="triggerRef"
        class="inline-flex"
        @mouseenter="show"
        @mouseleave="hide"
        @focusin="show"
        @focusout="hide"
    >
        <slot />
    </span>

    <Teleport to="body">
        <transition name="tooltip-fade">
            <div
                v-if="visible && text"
                ref="tipRef"
                role="tooltip"
                class="pointer-events-none fixed z-[9999] max-w-xs rounded-md bg-gray-900 px-2 py-1 text-xs font-medium leading-snug text-white shadow-lg ring-1 ring-white/10 dark:bg-gray-700 dark:ring-white/10"
                :style="{ top: `${coords.top}px`, left: `${coords.left}px` }"
            >
                {{ text }}

                <!-- A square on its corner: two of its sides show, which is the point. -->
                <span
                    aria-hidden="true"
                    class="absolute h-2 w-2 rotate-45 bg-gray-900 dark:bg-gray-700"
                    :style="arrowStyle"
                ></span>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
    transition: opacity 0.12s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
    opacity: 0;
}
</style>
