import { inject, provide } from 'vue';

export const ICONS_KEY = Symbol('islands-icons');

/**
 * Hand the Icon helper a set of icon definitions.
 *
 * The package renders icons but ships none, so an application stays free to
 * bring its own set — and pays for only the glyphs it actually uses.
 *
 * @param {Record<string, { box: string, html: string, stroke?: boolean }>} icons
 */
export function provideIcons(icons) {
    provide(ICONS_KEY, icons ?? {});
}

/**
 * @returns {Record<string, { box: string, html: string, stroke?: boolean }>}
 */
export function useIcons() {
    return inject(ICONS_KEY, {});
}
