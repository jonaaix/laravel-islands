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
    <span ref="anchor" class="il-menu inline-flex" :data-state="open ? 'open' : 'closed'">
        <slot name="trigger" :toggle="toggle" :open="open" />
    </span>

    <Popover :anchor="anchor" :open="open" :width="width" :z-index="zIndex" @close="close">
        <div class="il-menu__panel py-1">
            <slot :close="close" />
        </div>
    </Popover>
</template>
