import { inject, provide } from 'vue';

export const CARD_DEFAULTS_KEY = Symbol('islands-card-defaults');

/**
 * Hand the Card helpers a set of application-wide defaults.
 *
 * `mediaRatio` is the shape pictures are shown in — a house decision, not the package's, so it
 * has no value here until an application names one.
 *
 * For a global default across every island, call at boot time via
 * `app.provide(CARD_DEFAULTS_KEY, { mediaRatio: '3 / 2' })` inside the
 * `startVueIslands({ setup(app) { … } })` hook.
 *
 * @param {{ mediaRatio?: string }} defaults
 */
export function provideCardDefaults(defaults) {
    provide(CARD_DEFAULTS_KEY, defaults ?? {});
}

/**
 * @returns {{ mediaRatio?: string }}
 */
export function useCardDefaults() {
    return inject(CARD_DEFAULTS_KEY, {});
}
