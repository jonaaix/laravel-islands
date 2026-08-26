<script setup>
import { ref } from 'vue';
import Popover from './Popover.vue';

defineProps({
    width: { type: Number, default: 200 },
    zIndex: { type: Number, default: 60 },
});

const anchor = ref(null);
const open = ref(false);

function toggle() {
    open.value = !open.value;
}

function close() {
    open.value = false;
}
</script>

<template>
    <span ref="anchor" class="inline-flex">
        <slot name="trigger" :toggle="toggle" :open="open" />
    </span>

    <Popover :anchor="anchor" :open="open" :width="width" :z-index="zIndex" @close="close">
        <div class="py-1">
            <slot :close="close" />
        </div>
    </Popover>
</template>
