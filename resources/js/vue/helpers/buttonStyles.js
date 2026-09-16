/*
 * The class tables behind Button. A theme replaces or extends any of them through
 * `theme.button`; a component never spells these classes itself.
 */

export const BUTTON_SIZES = {
    sm: {
        box: 'h-7 gap-1.5 px-3 text-xs',
        splitAction: 'h-7 gap-1.5 pl-3 pr-2 text-xs',
        splitMenu: 'h-7 w-6 text-xs',
        glyph: 'h-3.5 w-3.5',
        chevron: 'h-3 w-3',
    },
    md: {
        box: 'h-9 gap-1.5 px-3.5 text-sm',
        splitAction: 'h-9 gap-1.5 pl-3.5 pr-2.5 text-sm',
        splitMenu: 'h-9 w-7 text-sm',
        glyph: 'h-4 w-4',
        chevron: 'h-3.5 w-3.5',
    },
    lg: {
        box: 'h-10 gap-2 px-5 text-sm',
        splitAction: 'h-10 gap-2 pl-5 pr-3 text-sm',
        splitMenu: 'h-10 w-8 text-sm',
        glyph: 'h-4 w-4',
        chevron: 'h-4 w-4',
    },
};

export const BUTTON_SHAPES = {
    pill: 'rounded-full',
    rounded: 'rounded-md',
};

export const BUTTON_TONES = {
    cta: 'bg-primary-600 text-white font-medium shadow-sm hover:bg-primary-500 focus-visible:ring-primary-500',
    primary: 'bg-primary-100 text-primary-800 font-medium hover:bg-primary-200 focus-visible:ring-primary-500 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25',
    secondary: 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    outlined: 'bg-transparent text-gray-700 font-medium ring-1 ring-gray-200 hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/5',
    ghost: 'bg-transparent text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100',
    danger: 'bg-red-600 text-white font-medium shadow-sm hover:bg-red-500 focus-visible:ring-red-500',
};

/** A split button draws its frame, its two halves and the divider between them per tone. */
export const BUTTON_SPLIT = {
    frame: {
        cta: 'shadow-sm',
        primary: '',
        secondary: '',
        outlined: 'ring-1 ring-gray-200 dark:ring-white/10',
        ghost: '',
        danger: 'shadow-sm',
    },
    half: {
        cta: 'bg-primary-600 text-white font-medium hover:bg-primary-500 focus-visible:ring-primary-500',
        primary: 'bg-primary-100 text-primary-800 font-medium hover:bg-primary-200 focus-visible:ring-primary-500 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25',
        secondary: 'bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 focus-visible:ring-gray-500 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
        outlined: 'bg-transparent text-gray-700 font-medium hover:bg-gray-100 focus-visible:ring-gray-500 dark:text-gray-200 dark:hover:bg-white/5',
        ghost: 'bg-transparent text-gray-600 font-medium hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100',
        danger: 'bg-red-600 text-white font-medium hover:bg-red-500 focus-visible:ring-red-500',
    },
    divider: {
        cta: 'bg-white/15',
        primary: 'bg-primary-800/10 dark:bg-primary-200/10',
        secondary: 'bg-gray-300/60 dark:bg-white/5',
        outlined: 'bg-gray-200/70 dark:bg-white/5',
        ghost: 'bg-gray-200/70 dark:bg-white/5',
        danger: 'bg-white/15',
    },
};

export const ICON_BUTTON_BOXES = { xs: 'h-6 w-6', sm: 'h-7 w-7', md: 'h-8 w-8', lg: 'h-9 w-9', xl: 'h-10 w-10' };

export const ICON_BUTTON_GLYPHS = { xs: 'h-4 w-4', sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5', xl: 'h-6 w-6' };

export const ICON_BUTTON_TONES = {
    quiet: 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200 dark:active:bg-white/15',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600',
    primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200 active:bg-primary-300 dark:bg-primary-500/15 dark:text-primary-200 dark:hover:bg-primary-500/25 dark:active:bg-primary-500/35',
    outlined: 'bg-transparent text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:ring-white/10 dark:hover:bg-white/5 dark:active:bg-white/15',
    danger: 'text-gray-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100 dark:hover:bg-red-500/15 dark:hover:text-red-400 dark:active:bg-red-500/25',
    active: 'bg-primary-500/10 text-primary-600 hover:bg-primary-500/15 active:bg-primary-500/25 dark:bg-primary-500/15 dark:text-primary-400 dark:hover:bg-primary-500/25 dark:active:bg-primary-500/35',
    /** No colour of its own — for a button whose hover tint is tied to whatever it sits in. */
    plain: '',
};

export const BADGE_TONES = {
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-500/15 dark:text-primary-200',
};
