<script setup>
defineProps({
    /** What `useRipple().on(key)` handed back. */
    items: { type: Array, default: () => [] },
});
</script>

<template>
    <span
        v-for="item in items"
        :key="item.id"
        class="aaix-ripple pointer-events-none absolute rounded-full bg-current opacity-30"
        :style="{
            left: `${item.x - item.size / 2}px`,
            top: `${item.y - item.size / 2}px`,
            width: `${item.size}px`,
            height: `${item.size}px`,
        }"
    ></span>
</template>

<style scoped>
.aaix-ripple {
    transform: scale(0);
    opacity: 0.35;
    animation-name: aaix-ripple-scale, aaix-ripple-fade;
    animation-duration: 220ms, 400ms;
    animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1), linear;
    animation-fill-mode: forwards, forwards;
}

@keyframes aaix-ripple-scale {
    to { transform: scale(1); }
}

@keyframes aaix-ripple-fade {
    0% { opacity: 0.35; }
    100% { opacity: 0; }
}
</style>
