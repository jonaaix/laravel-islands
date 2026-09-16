/*
 * The class tables behind the surfaces and small helpers — modal, toast, option strip, switch,
 * field group, list item, menu item, edit button. A theme replaces or extends any of them
 * through its section of the theme object.
 */

export const MODAL_SIZES = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-5xl',
    xl: 'max-w-[1800px]',
    full: 'max-w-none',
};

export const TOAST_SURFACE = 'bg-white ring-il-neutral-200 dark:bg-il-neutral-900 dark:ring-white/10';

/** The status colour appears in the rail down the left edge and in the icon, nowhere else. */
export const TOAST_TONES = {
    info: { rail: 'bg-il-neutral-400 dark:bg-il-neutral-500', accent: 'text-il-neutral-400 dark:text-il-neutral-500' },
    success: { rail: 'bg-il-success-500', accent: 'text-il-success-500' },
    warning: { rail: 'bg-il-warning-500', accent: 'text-il-warning-500' },
    danger: { rail: 'bg-il-danger-500', accent: 'text-il-danger-500' },
};

export const OPTION_STRIP_FRAMES = {
    pills: 'inline-flex items-center gap-2',
    // One pixel all round, so the surface meets the frame's own ring instead of floating inside it.
    segmented: 'inline-flex items-center gap-0.5 rounded-full p-px ring-1 ring-inset ring-il-neutral-200 dark:ring-white/10',
};

// The frame is one pixel taller than its options on either side, so the surface never touches the ring.
export const OPTION_STRIP_SIZES = {
    md: { frame: 'h-il-control-sm', option: 'h-il-control-xs px-2.5', iconOnly: 'px-2', glyph: 'h-4 w-4' },
    sm: { frame: 'h-il-control-xs', option: 'h-6 px-2', iconOnly: 'px-1.5', glyph: 'h-3.5 w-3.5' },
};

export const OPTION_STRIP_SKINS = {
    pills: {
        base: 'inline-flex items-center gap-1.5 rounded-full text-xs font-medium ring-1 ring-inset transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-il-primary-500',
        on: 'bg-il-primary-500/10 text-il-primary-700 ring-il-primary-500/25 hover:bg-il-primary-500/15 dark:text-il-primary-300',
        off: 'bg-transparent text-il-neutral-500 ring-il-neutral-200 hover:bg-il-neutral-50 hover:text-il-neutral-700 dark:text-il-neutral-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-il-neutral-200',
    },
    segmented: {
        // Inset like the pills variant: drawn outward the ring lands exactly on the frame's own edge.
        base: 'relative z-10 inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-il-primary-500',
        on: 'text-il-neutral-900 dark:text-white',
        off: 'text-il-neutral-500 hover:text-il-neutral-700 dark:text-il-neutral-400 dark:hover:text-il-neutral-200',
        surface: 'bg-white shadow-sm ring-1 ring-il-neutral-200 dark:bg-il-neutral-800 dark:ring-white/10',
    },
};

/**
 * The strip and its tabs: `underline` draws a rule under the row and marks the active tab on it,
 * `pills` sets the tabs in a filled track and lifts the active one out as a pill.
 */
export const TABS_SKINS = {
    underline: {
        strip: 'flex items-center gap-1 overflow-x-auto border-b border-il-neutral-200 px-3 dark:border-white/10',
        tab: 'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        active: 'border-il-primary-500 text-il-primary-600 dark:text-il-primary-400',
        inactive: 'border-transparent text-il-neutral-500 hover:text-il-neutral-700 dark:text-il-neutral-400 dark:hover:text-il-neutral-300',
        disabled: 'cursor-default border-transparent text-il-neutral-300 dark:text-il-neutral-600',
        countActive: 'bg-il-primary-100 text-il-primary-700 dark:bg-il-primary-500/20 dark:text-il-primary-300',
        countInactive: 'bg-il-neutral-100 text-il-neutral-500 dark:bg-il-neutral-800 dark:text-il-neutral-400',
    },
    pills: {
        strip: 'flex items-center gap-1 overflow-x-auto rounded-il-menu bg-il-neutral-100 p-1 dark:bg-white/5',
        tab: 'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-il-control px-3.5 py-1.5 text-sm font-medium transition-colors duration-[var(--il-duration-fast)]',
        active: 'bg-white text-il-neutral-900 shadow-sm dark:bg-il-neutral-800 dark:text-white',
        inactive: 'text-il-neutral-500 hover:bg-white/60 hover:text-il-neutral-700 dark:text-il-neutral-400 dark:hover:bg-white/5 dark:hover:text-il-neutral-200',
        disabled: 'cursor-default text-il-neutral-300 dark:text-il-neutral-600',
        countActive: 'bg-il-primary-500/10 text-il-primary-700 dark:bg-il-primary-500/20 dark:text-il-primary-300',
        countInactive: 'bg-il-neutral-200/70 text-il-neutral-500 dark:bg-white/10 dark:text-il-neutral-400',
    },
};

/** Track, the mark on the handle and the pointer halo, per meaning of being on. */
export const SWITCH_TONES = {
    primary: { track: 'bg-il-primary-600 dark:bg-il-primary-500', icon: 'text-il-primary-600 dark:text-il-primary-500', halo: 'bg-il-primary-500' },
    danger: { track: 'bg-il-danger-500', icon: 'text-il-danger-500', halo: 'bg-il-danger-500' },
    success: { track: 'bg-il-success-500', icon: 'text-il-success-500', halo: 'bg-il-success-500' },
};

export const FIELD_GROUP_SURFACES = {
    plain: 'bg-white ring-il-neutral-200 divide-il-neutral-100 dark:bg-il-neutral-900 dark:ring-white/10 dark:divide-white/10',
    muted: 'bg-il-neutral-50 ring-il-neutral-200 divide-il-neutral-100 dark:bg-white/5 dark:ring-white/10 dark:divide-white/10',
};

export const FIELD_GROUP_TONES = {
    ok: 'bg-il-success-50 ring-il-success-200 divide-il-success-200 dark:bg-il-success-500/10 dark:ring-il-success-500/30 dark:divide-il-success-500/30',
    blocked: 'bg-il-warning-50 ring-il-warning-200 divide-il-warning-200 dark:bg-il-warning-500/10 dark:ring-il-warning-500/30 dark:divide-il-warning-500/30',
    critical: 'bg-il-danger-50 ring-il-danger-200 divide-il-danger-200 dark:bg-il-danger-500/10 dark:ring-il-danger-500/30 dark:divide-il-danger-500/30',
    off: 'bg-il-neutral-50 ring-il-neutral-200 divide-il-neutral-200 dark:bg-white/5 dark:ring-white/10 dark:divide-white/10',
};

export const LIST_ITEM_TONES = {
    muted: 'text-il-neutral-500 dark:text-il-neutral-400',
    danger: 'text-il-danger-600 dark:text-il-danger-400',
};

export const MENU_ITEM_TONES = {
    default: 'text-il-neutral-700 hover:bg-il-neutral-50 dark:text-il-neutral-200 dark:hover:bg-white/5',
    danger: 'text-il-danger-600 hover:bg-il-danger-50 dark:text-il-danger-400 dark:hover:bg-il-danger-500/10',
};

export const EDIT_BUTTON_SIZES = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4' };
