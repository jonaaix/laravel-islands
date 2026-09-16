/*
 * The class tables behind Button. A theme replaces or extends any of them through
 * `theme.button`; a component never spells these classes itself.
 */

export const BUTTON_SIZES = {
    sm: {
        box: 'h-il-control-xs gap-1.5 px-3 text-xs',
        splitAction: 'h-il-control-xs gap-1.5 pl-3 pr-2 text-xs',
        splitMenu: 'h-il-control-xs w-6 text-xs',
        glyph: 'h-3.5 w-3.5',
        chevron: 'h-3 w-3',
    },
    md: {
        box: 'h-il-control gap-1.5 px-3.5 text-sm',
        splitAction: 'h-il-control gap-1.5 pl-3.5 pr-2.5 text-sm',
        splitMenu: 'h-il-control w-7 text-sm',
        glyph: 'h-4 w-4',
        chevron: 'h-3.5 w-3.5',
    },
    lg: {
        box: 'h-il-control-lg gap-2 px-5 text-sm',
        splitAction: 'h-il-control-lg gap-2 pl-5 pr-3 text-sm',
        splitMenu: 'h-il-control-lg w-8 text-sm',
        glyph: 'h-4 w-4',
        chevron: 'h-4 w-4',
    },
};

export const BUTTON_SHAPES = {
    pill: 'rounded-full',
    rounded: 'rounded-il-control',
};

export const BUTTON_TONES = {
    cta: 'bg-il-primary-600 text-white font-medium shadow-sm hover:bg-il-primary-500 focus-visible:ring-il-primary-500',
    primary: 'bg-il-primary-100 text-il-primary-800 font-medium hover:bg-il-primary-200 focus-visible:ring-il-primary-500 dark:bg-il-primary-500/15 dark:text-il-primary-200 dark:hover:bg-il-primary-500/25',
    secondary: 'bg-il-neutral-100 text-il-neutral-700 font-medium hover:bg-il-neutral-200 focus-visible:ring-il-neutral-500 dark:bg-il-neutral-800 dark:text-il-neutral-200 dark:hover:bg-il-neutral-700',
    outlined: 'bg-transparent text-il-neutral-700 font-medium ring-1 ring-il-neutral-200 hover:bg-il-neutral-100 focus-visible:ring-il-neutral-500 dark:text-il-neutral-200 dark:ring-white/10 dark:hover:bg-white/5',
    ghost: 'bg-transparent text-il-neutral-600 font-medium hover:bg-il-neutral-100 hover:text-il-neutral-900 focus-visible:ring-il-neutral-500 dark:text-il-neutral-300 dark:hover:bg-white/5 dark:hover:text-il-neutral-100',
    danger: 'bg-il-danger-600 text-white font-medium shadow-sm hover:bg-il-danger-500 focus-visible:ring-il-danger-500',
};

/** A split button draws its frame, its two halves and the divider between them per tone. */
export const BUTTON_SPLIT = {
    frame: {
        cta: 'shadow-sm',
        primary: '',
        secondary: '',
        outlined: 'ring-1 ring-il-neutral-200 dark:ring-white/10',
        ghost: '',
        danger: 'shadow-sm',
    },
    half: {
        cta: 'bg-il-primary-600 text-white font-medium hover:bg-il-primary-500 focus-visible:ring-il-primary-500',
        primary: 'bg-il-primary-100 text-il-primary-800 font-medium hover:bg-il-primary-200 focus-visible:ring-il-primary-500 dark:bg-il-primary-500/15 dark:text-il-primary-200 dark:hover:bg-il-primary-500/25',
        secondary: 'bg-il-neutral-100 text-il-neutral-700 font-medium hover:bg-il-neutral-200 focus-visible:ring-il-neutral-500 dark:bg-il-neutral-800 dark:text-il-neutral-200 dark:hover:bg-il-neutral-700',
        outlined: 'bg-transparent text-il-neutral-700 font-medium hover:bg-il-neutral-100 focus-visible:ring-il-neutral-500 dark:text-il-neutral-200 dark:hover:bg-white/5',
        ghost: 'bg-transparent text-il-neutral-600 font-medium hover:bg-il-neutral-100 hover:text-il-neutral-900 focus-visible:ring-il-neutral-500 dark:text-il-neutral-300 dark:hover:bg-white/5 dark:hover:text-il-neutral-100',
        danger: 'bg-il-danger-600 text-white font-medium hover:bg-il-danger-500 focus-visible:ring-il-danger-500',
    },
    divider: {
        cta: 'bg-white/15',
        primary: 'bg-il-primary-800/10 dark:bg-il-primary-200/10',
        secondary: 'bg-il-neutral-300/60 dark:bg-white/5',
        outlined: 'bg-il-neutral-200/70 dark:bg-white/5',
        ghost: 'bg-il-neutral-200/70 dark:bg-white/5',
        danger: 'bg-white/15',
    },
};

export const ICON_BUTTON_BOXES = {
    xs: 'h-6 w-6',
    sm: 'h-il-control-xs w-il-control-xs',
    md: 'h-il-control-sm w-il-control-sm',
    lg: 'h-il-control w-il-control',
    xl: 'h-il-control-lg w-il-control-lg',
};

export const ICON_BUTTON_GLYPHS = { xs: 'h-4 w-4', sm: 'h-4 w-4', md: 'h-4 w-4', lg: 'h-5 w-5', xl: 'h-6 w-6' };

export const ICON_BUTTON_TONES = {
    quiet: 'text-il-neutral-500 hover:bg-il-neutral-100 hover:text-il-neutral-700 active:bg-il-neutral-200 dark:text-il-neutral-400 dark:hover:bg-white/5 dark:hover:text-il-neutral-200 dark:active:bg-white/15',
    secondary: 'bg-il-neutral-100 text-il-neutral-700 hover:bg-il-neutral-200 active:bg-il-neutral-300 dark:bg-il-neutral-800 dark:text-il-neutral-200 dark:hover:bg-il-neutral-700 dark:active:bg-il-neutral-600',
    primary: 'bg-il-primary-100 text-il-primary-800 hover:bg-il-primary-200 active:bg-il-primary-300 dark:bg-il-primary-500/15 dark:text-il-primary-200 dark:hover:bg-il-primary-500/25 dark:active:bg-il-primary-500/35',
    outlined: 'bg-transparent text-il-neutral-700 ring-1 ring-il-neutral-200 hover:bg-il-neutral-100 active:bg-il-neutral-200 dark:text-il-neutral-200 dark:ring-white/10 dark:hover:bg-white/5 dark:active:bg-white/15',
    danger: 'text-il-neutral-400 hover:bg-il-danger-50 hover:text-il-danger-600 active:bg-il-danger-100 dark:hover:bg-il-danger-500/15 dark:hover:text-il-danger-400 dark:active:bg-il-danger-500/25',
    active: 'bg-il-primary-500/10 text-il-primary-600 hover:bg-il-primary-500/15 active:bg-il-primary-500/25 dark:bg-il-primary-500/15 dark:text-il-primary-400 dark:hover:bg-il-primary-500/25 dark:active:bg-il-primary-500/35',
    /** No colour of its own — for a button whose hover tint is tied to whatever it sits in. */
    plain: '',
};

export const BADGE_TONES = {
    gray: 'bg-il-neutral-100 text-il-neutral-600 dark:bg-il-neutral-800 dark:text-il-neutral-300',
    emerald: 'bg-il-success-100 text-il-success-700 dark:bg-il-success-500/15 dark:text-il-success-300',
    amber: 'bg-il-warning-100 text-il-warning-700 dark:bg-il-warning-500/15 dark:text-il-warning-300',
    red: 'bg-il-danger-100 text-il-danger-700 dark:bg-il-danger-500/15 dark:text-il-danger-300',
    blue: 'bg-il-info-100 text-il-info-700 dark:bg-il-info-500/15 dark:text-il-info-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    primary: 'bg-il-primary-100 text-il-primary-800 dark:bg-il-primary-500/15 dark:text-il-primary-200',
};
