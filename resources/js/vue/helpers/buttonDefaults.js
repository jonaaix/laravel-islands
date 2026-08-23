import { inject, provide } from 'vue';

export const BUTTON_DEFAULTS_KEY = Symbol('islands-button-defaults');

/**
 * Hand the Button helper a set of application-wide defaults — shape, size, tone.
 *
 * Any of the returned Button props stays overridable per callsite; this only
 * seeds what unset props fall back to.
 *
 * For a global default across every island, call at boot time via
 * `app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' })` inside the
 * `startVueIslands({ setup(app) { … } })` hook.
 *
 * @param {{ shape?: 'pill' | 'rounded', size?: 'sm' | 'md' | 'lg', tone?: string }} defaults
 */
export function provideButtonDefaults(defaults) {
    provide(BUTTON_DEFAULTS_KEY, defaults ?? {});
}

/**
 * @returns {{ shape?: 'pill' | 'rounded', size?: 'sm' | 'md' | 'lg', tone?: string }}
 */
export function useButtonDefaults() {
    return inject(BUTTON_DEFAULTS_KEY, {});
}
