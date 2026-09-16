/**
 * The looks a select trigger can take: `field` is a plain form control, `filter` and
 * `filter-card` colour a set value in a toolbar, `filter-pill` is the compact strip version.
 * Every select helper draws from this one map, so a set value reads the same everywhere.
 */
const FOCUS = 'focus-within:border-il-primary-500 focus-within:ring-1 focus-within:ring-il-primary-500';

export const SELECT_SKINS = {
    field: {
        base: `flex h-il-control items-center rounded-il-control border pl-2.5 pr-1 text-sm transition-colors ${FOCUS}`,
        on: 'border-il-neutral-200 bg-white text-il-neutral-900 hover:bg-il-neutral-50 dark:border-white/10 dark:bg-il-neutral-900 dark:text-il-neutral-100 dark:hover:bg-white/5',
        off: 'border-il-neutral-200 bg-white text-il-neutral-400 hover:bg-il-neutral-50 dark:border-white/10 dark:bg-il-neutral-900 dark:text-il-neutral-500 dark:hover:bg-white/5',
        clear: 'hover:bg-il-neutral-100 dark:hover:bg-white/10',
    },
    filter: {
        base: `flex h-il-control items-center rounded-il-control border pl-2.5 pr-1 text-sm transition-colors ${FOCUS}`,
        on: 'border-il-primary-200 bg-il-primary-50 text-il-primary-800 dark:border-il-primary-500/30 dark:bg-il-primary-500/15 dark:text-il-primary-200',
        off: 'border-il-neutral-200 bg-white text-il-neutral-700 hover:bg-il-neutral-50 dark:border-white/10 dark:bg-il-neutral-900 dark:text-il-neutral-200 dark:hover:bg-white/5',
        clear: 'hover:bg-il-primary-200/60 dark:hover:bg-il-primary-500/25',
    },
    'filter-card': {
        base: `flex h-il-control items-center rounded-il-menu pl-3 pr-1.5 text-sm font-medium transition-colors ${FOCUS}`,
        on: 'bg-il-primary-500/15 text-il-primary-800 dark:text-il-primary-200',
        off: 'bg-il-neutral-50 text-il-neutral-700 hover:bg-il-neutral-100 dark:bg-white/5 dark:text-il-neutral-200 dark:hover:bg-white/10',
        clear: 'hover:bg-il-primary-200/60 dark:hover:bg-il-primary-500/25',
    },
    'filter-pill': {
        base: `flex h-il-control-sm items-center rounded-full pl-3 pr-1 text-xs font-medium ring-1 ring-inset transition-colors ${FOCUS}`,
        on: 'bg-il-primary-500/10 text-il-primary-700 ring-il-primary-500/25 hover:bg-il-primary-500/15 dark:text-il-primary-300',
        off: 'bg-transparent text-il-neutral-500 ring-il-neutral-200 hover:bg-il-neutral-50 hover:text-il-neutral-700 dark:text-il-neutral-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-il-neutral-200',
        clear: 'hover:bg-il-primary-200/60 dark:hover:bg-il-primary-500/25',
    },
};

/** `skins` is the theme's table; the package's own applies when a caller passes none. */
export function selectSkin(variant, fallback = 'field', skins = SELECT_SKINS) {
    return skins[variant] ?? skins[fallback] ?? SELECT_SKINS[fallback];
}
