import { inject } from 'vue';
import { provideTheme, useTheme } from './theme.js';

/** The pre-theme way of seeding the Button: still honoured, and it wins over the theme where both are set. */
export const BUTTON_DEFAULTS_KEY = Symbol('islands-button-defaults');

/**
 * Hand the Button helper a set of application-wide defaults — shape, size, tone. The same as
 * `provideTheme({ button: defaults })`; kept for callers written before the theme existed.
 *
 * @param {{ shape?: 'pill' | 'rounded', size?: 'sm' | 'md' | 'lg', tone?: string }} defaults
 */
export function provideButtonDefaults(defaults) {
    provideTheme({ button: defaults ?? {} });
}

/**
 * @returns {{ shape?: string, size?: string, tone?: string, ripple?: boolean }}
 */
export function useButtonDefaults() {
    const theme = useTheme('button');
    const legacy = inject(BUTTON_DEFAULTS_KEY, null);

    return legacy ? { ...theme, ...legacy } : theme;
}
