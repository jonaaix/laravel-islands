import { ref } from 'vue';

const stack = ref([]);
let seq = 0;

const BASE_Z_INDEX = 70;
const STEP = 5;

export function registerOverlay() {
    const id = ++seq;
    stack.value = [...stack.value, id];

    return id;
}

export function unregisterOverlay(id) {
    stack.value = stack.value.filter((entry) => entry !== id);
}

export function overlayZIndex(id) {
    const depth = stack.value.indexOf(id);

    return BASE_Z_INDEX + Math.max(0, depth) * STEP;
}
