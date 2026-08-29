<script setup>
/**
 * The picture area of a card.
 *
 * No shape of its own: which ratio pictures are shown in is the application's decision, and a
 * package that picks one imposes its house style on every other project. Left unset, the box
 * takes the height its content asks for.
 */
defineProps({
    /** Any CSS aspect ratio, e.g. `3 / 2`. Unset lets the content decide. */
    ratio: { type: String, default: '' },
});
</script>

<template>
    <div
        class="card-media relative w-full overflow-hidden bg-gray-100 dark:bg-white/5"
        :style="ratio ? { aspectRatio: ratio } : {}"
    >
        <slot />
    </div>
</template>
