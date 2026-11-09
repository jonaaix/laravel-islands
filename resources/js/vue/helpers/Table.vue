<script setup>
defineProps({
    dividers: { type: Boolean, default: false },
    stickyHeader: { type: Boolean, default: false },
    keepLineBreaks: { type: Boolean, default: false },
});
</script>

<template>
    <table
        class="il-table"
        :data-dividers="dividers || null"
        :data-sticky-header="stickyHeader || null"
        :data-keep-line-breaks="keepLineBreaks || null">
        <slot />
    </table>
</template>

<style>
@reference "tailwindcss";
/* The il-* utilities come from the package's own tokens, which a component style block does not see by itself. */
@reference "../../../css/theme.css";
/* The block is compiled on its own and never sees the host's variant, so it restates the documented class strategy. */
@custom-variant dark (&:where(.dark, .dark *));

/* Zero specificity in the components layer, so any utility class on a cell still wins. */
@layer components {
    :where(.il-table) {
        @apply w-full text-sm;
    }
    :where(.il-table) :where(th) {
        @apply whitespace-nowrap px-3 py-2 text-start align-middle text-[10px] font-medium uppercase tracking-wide text-il-neutral-500 dark:text-il-neutral-400;
    }
    :where(.il-table) :where(td) {
        @apply whitespace-nowrap px-3 py-2 align-middle;
    }

    :where(.il-table[data-dividers]) :where(th, td) {
        @apply border-b border-il-neutral-200 dark:border-white/10;
    }
    :where(.il-table[data-dividers] > :last-child > tr:last-child > :is(th, td)) {
        @apply border-b-0;
    }

    /* Collapsed borders stay behind when a sticky cell moves, so the header's divider would scroll away. */
    :where(.il-table[data-sticky-header]) {
        @apply border-separate border-spacing-0;
    }
    :where(.il-table[data-sticky-header]) :where(thead th) {
        @apply sticky top-0 z-[1] bg-white dark:bg-il-neutral-900;
    }

    :where(.il-table[data-keep-line-breaks]) :where(th, td) {
        @apply whitespace-pre align-top;
    }
}
</style>
