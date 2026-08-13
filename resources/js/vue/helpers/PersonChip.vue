<script setup>
import { computed } from 'vue';

const props = defineProps({
    name: { type: String, required: true },
    /** Any source an `img` accepts, including an inline one. Absent leaves the initial. */
    image: { type: String, default: null },
});

const initial = computed(() => props.name.trim().charAt(0));
</script>

<template>
    <!--
        A name is easier to place with a face beside it, and the pair reads as one thing rather
        than as a value with something appended. Without a picture the initial keeps the shape,
        so a row of these never loses its rhythm over a missing image.
    -->
    <span class="person-chip inline-flex items-center gap-1 rounded-full bg-gray-100 py-0.5 pl-0.5 pr-1.5 text-[10px] font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
        <img
            v-if="image"
            :src="image"
            :alt="name"
            loading="lazy"
            class="h-3.5 w-3.5 shrink-0 rounded-full object-cover"
        />
        <span
            v-else
            aria-hidden="true"
            class="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[8px] font-semibold uppercase text-white dark:bg-white/20"
        >{{ initial }}</span>

        {{ name }}
    </span>
</template>
