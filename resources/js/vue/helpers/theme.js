import { inject, provide } from 'vue';
import { BADGE_TONES, BUTTON_SHAPES, BUTTON_SIZES, BUTTON_SPLIT, BUTTON_TONES, ICON_BUTTON_BOXES, ICON_BUTTON_GLYPHS, ICON_BUTTON_TONES } from './buttonStyles.js';
import { FIELD_BASE, FIELD_FRAME, FIELD_FRAME_INVALID, FIELD_SHAPES, FIELD_SIZES, TEXTAREA_SIZES } from './fieldStyles.js';
import { SELECT_SKINS } from './selectSkins.js';
import {
    EDIT_BUTTON_SIZES,
    FIELD_GROUP_SURFACES,
    FIELD_GROUP_TONES,
    LIST_ITEM_TONES,
    MENU_ITEM_TONES,
    MODAL_DIVIDER,
    MODAL_SIZES,
    MODAL_SURFACE,
    OPTION_STRIP_FRAMES,
    OPTION_STRIP_SIZES,
    OPTION_STRIP_SKINS,
    POPOVER_SURFACE,
    SELECT_MENU_SURFACE,
    SWITCH_TONES,
    TABS_SKINS,
    TOAST_SURFACE,
    TOAST_TONES,
} from './surfaceStyles.js';

export const THEME_KEY = Symbol.for('aaix.laravel-islands.theme');

/**
 * The package's own look, one section per component family. A section carries the defaults a
 * helper falls back to when a prop is unset (`shape`, `size`, `tone`, …) and the class tables
 * it draws from (`tones`, `sizes`, `shapes`, `skins`). A theme overrides any part of it; a
 * table entry it does not name stays.
 */
export const defaultTheme = {
    button: {
        shape: 'rounded',
        size: 'md',
        tone: 'primary',
        ripple: true,
        shapes: BUTTON_SHAPES,
        sizes: BUTTON_SIZES,
        tones: BUTTON_TONES,
        split: BUTTON_SPLIT,
    },
    iconButton: {
        size: 'md',
        tone: 'quiet',
        ripple: true,
        boxes: ICON_BUTTON_BOXES,
        glyphs: ICON_BUTTON_GLYPHS,
        tones: ICON_BUTTON_TONES,
    },
    field: {
        shape: 'rounded',
        size: 'md',
        base: FIELD_BASE,
        frame: FIELD_FRAME,
        frameInvalid: FIELD_FRAME_INVALID,
        shapes: FIELD_SHAPES,
        sizes: FIELD_SIZES,
        textareaSizes: TEXTAREA_SIZES,
    },
    select: {
        skins: SELECT_SKINS,
        menu: SELECT_MENU_SURFACE,
    },
    popover: {
        surface: POPOVER_SURFACE,
    },
    badge: {
        tone: 'gray',
        tones: BADGE_TONES,
    },
    card: {
        /** The shape pictures are shown in — a house decision, so it has no value until an application names one. */
        mediaRatio: '',
    },
    modal: {
        size: 'md',
        sizes: MODAL_SIZES,
        surface: MODAL_SURFACE,
        divider: MODAL_DIVIDER,
    },
    toast: {
        surface: TOAST_SURFACE,
        tones: TOAST_TONES,
    },
    optionStrip: {
        variant: 'pills',
        size: 'md',
        frames: OPTION_STRIP_FRAMES,
        sizes: OPTION_STRIP_SIZES,
        skins: OPTION_STRIP_SKINS,
    },
    switch: {
        tone: 'primary',
        tones: SWITCH_TONES,
    },
    tabs: {
        variant: 'underline',
        skins: TABS_SKINS,
    },
    fieldGroup: {
        surfaces: FIELD_GROUP_SURFACES,
        tones: FIELD_GROUP_TONES,
    },
    listItem: {
        tones: LIST_ITEM_TONES,
    },
    menuItem: {
        tone: 'default',
        tones: MENU_ITEM_TONES,
    },
    editButton: {
        size: 'sm',
        sizes: EDIT_BUTTON_SIZES,
    },
};

function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** `patch` wins; nested objects merge key by key, so a theme can add one tone without restating the rest. */
export function mergeTheme(base, patch) {
    if (!isPlainObject(patch)) {
        return base;
    }

    const merged = { ...base };

    for (const [key, value] of Object.entries(patch)) {
        merged[key] = isPlainObject(value) && isPlainObject(base?.[key]) ? mergeTheme(base[key], value) : value;
    }

    return merged;
}

/** Names a theme where it is written; it returns the object unchanged and exists for the reader. */
export function defineTheme(theme) {
    return theme;
}

/**
 * Hands a theme to the current subtree, layered over whatever theme is already in effect. For
 * every island at once, pass `theme` to `startVueIslands` instead.
 */
export function provideTheme(theme) {
    const parent = inject(THEME_KEY, defaultTheme);

    provide(THEME_KEY, mergeTheme(parent, theme));
}

/**
 * The theme in effect, or one section of it. Components read their defaults and class tables
 * from here and never from the style modules directly.
 */
export function useTheme(section = null) {
    const theme = inject(THEME_KEY, defaultTheme);

    return section === null ? theme : (theme[section] ?? defaultTheme[section] ?? {});
}

/** The theme `startVueIslands` provides: the defaults, with the application's theme layered on. */
export function resolveTheme(theme) {
    return theme ? mergeTheme(defaultTheme, theme) : defaultTheme;
}
