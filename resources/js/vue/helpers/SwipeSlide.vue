<script setup>
import { computed, inject } from 'vue';
import { SWIPE_ROW_KEY } from './swipeRow.js';

/**
 * One slide of a `SwipeRow`: as wide as the row, snapping to its middle. It brings no look of
 * its own — a card frame, a photo, a chip all come from what is put inside.
 */
const always = inject(SWIPE_ROW_KEY, null);

const GEOMETRY = {
    always: 'w-full shrink-0 snap-center',
    phone: 'max-sm:w-full max-sm:shrink-0 max-sm:snap-center',
};

const geometry = computed(() => (always?.value ? GEOMETRY.always : GEOMETRY.phone));
</script>

<template>
    <div class="il-swipe-slide" :class="geometry">
        <slot />
    </div>
</template>
