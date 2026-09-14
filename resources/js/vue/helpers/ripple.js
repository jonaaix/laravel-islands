import { attachRipple } from '../../core/ripple.js';

const detachers = new WeakMap();

const enabled = new WeakMap();

export const vRipple = {
    mounted(el, binding) {
        enabled.set(el, binding.value !== false);
        detachers.set(el, attachRipple(el, () => enabled.get(el) !== false));
    },

    updated(el, binding) {
        enabled.set(el, binding.value !== false);
    },

    unmounted(el) {
        detachers.get(el)?.();
        detachers.delete(el);
        enabled.delete(el);
    },
};
