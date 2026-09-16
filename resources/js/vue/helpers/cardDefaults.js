import { inject } from 'vue';
import { provideTheme, useTheme } from './theme.js';

/** The pre-theme way of seeding the Card helpers: still honoured, and it wins over the theme where both are set. */
export const CARD_DEFAULTS_KEY = Symbol('islands-card-defaults');

/**
 * Hand the Card helpers a set of application-wide defaults. The same as
 * `provideTheme({ card: defaults })`; kept for callers written before the theme existed.
 *
 * @param {{ mediaRatio?: string }} defaults
 */
export function provideCardDefaults(defaults) {
    provideTheme({ card: defaults ?? {} });
}

/**
 * @returns {{ mediaRatio?: string }}
 */
export function useCardDefaults() {
    const theme = useTheme('card');
    const legacy = inject(CARD_DEFAULTS_KEY, null);

    return legacy ? { ...theme, ...legacy } : theme;
}
