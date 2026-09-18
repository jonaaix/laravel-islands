<script setup>
import { computed, onBeforeUnmount, onMounted, provide, ref } from 'vue';
import { SWIPE_ROW_KEY } from './swipeRow.js';

/**
 * A row of slides a thumb moves through: one slide per view, snapping into place, with a dot
 * per slide underneath and no scrollbar. Put `SwipeSlide` inside it and give the slides their
 * own look; the row only carries the movement.
 *
 * Below `sm` by default, because a pointer scrolls a wide row perfectly well — `always` makes
 * it a row at every width. The breakpoint itself cannot be a prop: a Tailwind variant assembled
 * at runtime never reaches the compiled stylesheet.
 */
const props = defineProps({
    always: { type: Boolean, default: false },
    dots: { type: Boolean, default: true },
    /** Classes for the rail itself — a frame it wears above the breakpoint, its own padding. */
    trackClass: { type: [String, Array, Object], default: '' },
});

provide(SWIPE_ROW_KEY, computed(() => props.always));

const TRACK = {
    always: 'flex snap-x snap-mandatory gap-x-3 overflow-x-auto p-0.5 scroll-p-0.5',
    phone: 'flex gap-x-3 max-sm:snap-x max-sm:snap-mandatory max-sm:overflow-x-auto max-sm:p-0.5 max-sm:scroll-p-0.5',
};

const DOTS = {
    always: 'flex justify-center gap-1.5',
    phone: 'flex justify-center gap-1.5 sm:hidden',
};

const mode = computed(() => (props.always ? 'always' : 'phone'));

const track = ref(null);
const slides = ref(0);
const active = ref(0);
let frame = null;

function measure() {
    const el = track.value;

    if (! el) {
        return;
    }

    slides.value = el.children.length;

    // The pitch is one slide plus the gap, read off the slides themselves rather than assumed.
    const pitch = el.children[1] ? el.children[1].offsetLeft - el.children[0].offsetLeft : el.clientWidth;

    active.value = pitch > 0 ? Math.round(el.scrollLeft / pitch) : 0;
}

function onScroll() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(measure);
}

onMounted(() => {
    measure();
    track.value?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
});

onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    track.value?.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
});

defineExpose({ active, slides });
</script>

<template>
    <div class="il-swipe-row">
        <div
            ref="track"
            class="il-swipe-row__track [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            :class="[TRACK[mode], trackClass]"
        >
            <slot />
        </div>

        <!-- Where the reader is, not a control: the thumb is what moves the row. -->
        <div v-if="dots && slides > 1" class="il-swipe-row__dots mt-2" :class="DOTS[mode]" aria-hidden="true">
            <span
                v-for="index in slides"
                :key="index"
                class="il-swipe-row__dot h-1.5 rounded-full transition-all duration-150 ease-out"
                :data-state="index - 1 === active ? 'active' : undefined"
                :class="index - 1 === active ? 'w-4 bg-il-neutral-400 dark:bg-il-neutral-500' : 'w-1.5 bg-il-neutral-200 dark:bg-white/20'"
            ></span>
        </div>
    </div>
</template>
