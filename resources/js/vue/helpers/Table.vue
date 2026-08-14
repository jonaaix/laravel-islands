<template>
    <table>
        <slot />
    </table>
</template>

<style scoped>
@reference "tailwindcss";

table {
    @apply w-full text-sm;
}
table :where(th) {
    @apply whitespace-nowrap px-3 py-2 text-left align-middle text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400;
}
table :where(td) {
    @apply whitespace-nowrap px-3 py-2 align-middle;
}
</style>
