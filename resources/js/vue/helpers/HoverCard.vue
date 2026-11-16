<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import Popover from './Popover.vue';

/**
 * A panel that opens while the pointer rests on its trigger — a preview, never an action. It waits `openDelay`
 * before it opens and `closeDelay` before it closes, so passing over the trigger does not flash it, and moving the
 * pointer from the trigger into the panel keeps it open. Touch has no hover, so it never opens there.
 */
const props = defineProps({
    /** Bound with `v-model:open`; the card reports each change. */
    open: { type: Boolean, default: false },
    openDelay: { type: Number, default: 300 },
    closeDelay: { type: Number, default: 150 },
    side: { type: String, default: 'right' },
    align: { type: String, default: null },
    offset: { type: Number, default: 8 },
    width: { type: Number, default: 288 },
    disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:open']);

const anchor = ref(null);
const shown = ref(props.open);
let timer = null;

watch(() => props.open, (wanted) => {
    shown.value = wanted && !props.disabled;
});

function set(value) {
    clearTimeout(timer);
    if (shown.value === value) {
        return;
    }
    shown.value = value;
    emit('update:open', value);
}

function enter(event) {
    if (props.disabled || event.pointerType === 'touch') {
        return;
    }
    clearTimeout(timer);
    timer = setTimeout(() => set(true), shown.value ? 0 : props.openDelay);
}

function leave() {
    clearTimeout(timer);
    timer = setTimeout(() => set(false), props.closeDelay);
}

watch(() => props.disabled, (disabled) => disabled && set(false));

onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <span ref="anchor" class="il-hover-card inline-flex" @pointerenter="enter" @pointerleave="leave">
        <slot />
    </span>
    <Popover :anchor="anchor" :open="shown" :side="side" :align="align" :offset="offset" :width="width" :backdrop="false">
        <div class="il-hover-card__panel" @pointerenter="enter" @pointerleave="leave">
            <slot name="content" />
        </div>
    </Popover>
</template>
