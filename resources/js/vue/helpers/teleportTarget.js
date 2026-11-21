import { computed, inject, provide, unref } from 'vue';

export const TELEPORT_TARGET_KEY = Symbol('islands-teleport-target');

/**
 * @param {string | HTMLElement | import('vue').Ref<string | HTMLElement | null>} target
 */
export function provideTeleportTarget(target) {
    provide(TELEPORT_TARGET_KEY, target);
}

export function useTeleportTarget() {
    const target = inject(TELEPORT_TARGET_KEY, null);

    return computed(() => unref(target) || 'body');
}
