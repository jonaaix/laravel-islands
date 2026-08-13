import { inject, provide, ref } from 'vue';

export const CONFIRM_KEY = Symbol('islands.confirm');

const DEFAULTS = {
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    tone: 'primary',
};

/**
 * Holds the one dialog an island shows at a time. `ask()` hands back a promise that
 * settles when the user decides, so a caller reads as a plain question:
 *
 *     if (await confirm({ title: 'Delete photo?', tone: 'danger' })) { … }
 */
export function createConfirm() {
    const open = ref(false);
    const options = ref({ ...DEFAULTS });

    let settle = null;

    function ask(request = {}) {
        // A second question replaces the first; the one on screen counts as declined.
        settle?.(false);

        options.value = { ...DEFAULTS, ...request };
        open.value = true;

        return new Promise((resolve) => {
            settle = resolve;
        });
    }

    function answer(accepted) {
        open.value = false;
        settle?.(accepted);
        settle = null;
    }

    return { open, options, ask, answer };
}

export function provideConfirm() {
    const confirm = createConfirm();
    provide(CONFIRM_KEY, confirm);

    return confirm;
}

/**
 * The asking half, for any component below the island root. Without a host it resolves
 * to false rather than throwing: a missing dialog must never delete anything.
 */
export function useConfirm() {
    const confirm = inject(CONFIRM_KEY, null);

    if (!confirm) {
        return () => Promise.resolve(false);
    }

    return confirm.ask;
}
