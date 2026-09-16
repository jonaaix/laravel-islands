/**
 * The looks a select trigger can take: `field` is a plain form control, `filter` and
 * `filter-card` colour a set value in a toolbar, `filter-pill` is the compact strip version.
 * Every select helper draws from this one map, so a set value reads the same everywhere.
 */
const FOCUS = 'focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500';

export const SELECT_SKINS = {
    field: {
        base: `flex h-9 items-center rounded-md border pl-2.5 pr-1 text-sm transition-colors ${FOCUS}`,
        on: 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-white/5',
        off: 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-500 dark:hover:bg-white/5',
        clear: 'hover:bg-gray-100 dark:hover:bg-white/10',
    },
    filter: {
        base: `flex h-9 items-center rounded-md border pl-2.5 pr-1 text-sm transition-colors ${FOCUS}`,
        on: 'border-primary-200 bg-primary-50 text-primary-800 dark:border-primary-500/30 dark:bg-primary-500/15 dark:text-primary-200',
        off: 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-white/5',
        clear: 'hover:bg-primary-200/60 dark:hover:bg-primary-500/25',
    },
    'filter-card': {
        base: `flex h-9 items-center rounded-lg pl-3 pr-1.5 text-sm font-medium transition-colors ${FOCUS}`,
        on: 'bg-primary-500/15 text-primary-800 dark:text-primary-200',
        off: 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-white/5 dark:text-gray-200 dark:hover:bg-white/10',
        clear: 'hover:bg-primary-200/60 dark:hover:bg-primary-500/25',
    },
    'filter-pill': {
        base: `flex h-8 items-center rounded-full pl-3 pr-1 text-xs font-medium ring-1 ring-inset transition-colors ${FOCUS}`,
        on: 'bg-primary-500/10 text-primary-700 ring-primary-500/25 hover:bg-primary-500/15 dark:text-primary-300',
        off: 'bg-transparent text-gray-500 ring-gray-200 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:ring-white/10 dark:hover:bg-white/5 dark:hover:text-gray-200',
        clear: 'hover:bg-primary-200/60 dark:hover:bg-primary-500/25',
    },
};

export function selectSkin(variant, fallback = 'field') {
    return SELECT_SKINS[variant] ?? SELECT_SKINS[fallback];
}
