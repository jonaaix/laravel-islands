import { getCurrentInstance, inject, provide, ref } from 'vue';

export const TOASTS_KEY = Symbol('islands.toasts');

const TONES = ['info', 'success', 'warning', 'danger'];

const DURATIONS = {
    info: 5000,
    success: 5000,
    warning: 8000,
    danger: 10000,
};

/**
 * The messages an island floats over its content, oldest at the top.
 *
 * Wording never lives here — a caller passes the sentence it wants shown. Something that went
 * wrong stays on screen longer than something that went right, and everything leaves on its
 * own; a message that only disappears on a click piles up in a long session.
 */
export function createToasts() {
    const items = ref([]);

    let nextId = 1;

    function show(request = {}) {
        const toast = typeof request === 'string' ? { message: request } : request;
        const tone = TONES.includes(toast.tone) ? toast.tone : 'info';

        const entry = {
            id: nextId++,
            tone,
            title: toast.title ?? '',
            message: toast.message ?? '',
            duration: toast.duration ?? DURATIONS[tone],
        };

        items.value = [...items.value, entry];

        if (entry.duration > 0) {
            setTimeout(() => dismiss(entry.id), entry.duration);
        }

        return entry.id;
    }

    function dismiss(id) {
        items.value = items.value.filter((entry) => entry.id !== id);
    }

    function clear() {
        items.value = [];
    }

    const api = (request) => show(request);

    TONES.forEach((tone) => {
        api[tone] = (message, title = '') => show({ tone, message, title });
    });

    api.items = items;
    api.show = show;
    api.dismiss = dismiss;
    api.clear = clear;

    return api;
}

const providedHere = new WeakMap();

export function provideToasts() {
    const toasts = createToasts();
    provide(TOASTS_KEY, toasts);

    const instance = getCurrentInstance();
    if (instance) {
        providedHere.set(instance, toasts);
    }

    return toasts;
}

/**
 * The telling half, for the island root that provides it and any component below. Without a
 * host the messages go nowhere rather than throwing: a missing toast must never break the
 * action it reports on.
 */
export function useToast() {
    // inject() only reads ancestors, so the component that called provideToasts() finds its own here.
    const toasts = providedHere.get(getCurrentInstance()) ?? inject(TOASTS_KEY, null);

    if (!toasts) {
        if (import.meta.env?.DEV) {
            console.warn('[islands] useToast() found no provideToasts() in this component or above it; its messages are not shown.');
        }

        return createToasts();
    }

    return toasts;
}
