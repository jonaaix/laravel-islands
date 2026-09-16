import { defineTheme } from '../helpers/theme.js';

/**
 * A soft, modern look: filled fields without a border, generous corners, tinted rather than
 * saturated actions, a cooler neutral. Pair it with `themes/soft.css`, which sets the radius
 * and neutral tokens; this object covers what CSS cannot reach.
 *
 *     import { softTheme } from '@aaix/laravel-islands/vue/themes';
 *     startVueIslands(islands, { theme: softTheme });
 */
export const softTheme = defineTheme({
    button: {
        shape: 'rounded',
        tones: {
            cta: 'bg-il-primary-600 text-white font-medium shadow-sm shadow-il-primary-600/20 hover:bg-il-primary-500 focus-visible:ring-il-primary-500',
            primary: 'bg-il-primary-500/10 text-il-primary-700 font-medium hover:bg-il-primary-500/15 focus-visible:ring-il-primary-500 dark:text-il-primary-300 dark:hover:bg-il-primary-500/20',
            secondary: 'bg-il-neutral-100 text-il-neutral-700 font-medium hover:bg-il-neutral-200/70 focus-visible:ring-il-neutral-400 dark:bg-white/10 dark:text-il-neutral-200 dark:hover:bg-white/15',
            outlined: 'bg-transparent text-il-neutral-700 font-medium ring-1 ring-il-neutral-200/80 hover:bg-il-neutral-100 focus-visible:ring-il-neutral-400 dark:text-il-neutral-200 dark:ring-white/10 dark:hover:bg-white/5',
            danger: 'bg-il-danger-500/10 text-il-danger-700 font-medium hover:bg-il-danger-500/15 focus-visible:ring-il-danger-500 dark:text-il-danger-300',
        },
    },
    field: {
        base: 'block w-full border border-transparent bg-il-neutral-100 px-3 '
            + 'focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-il-primary-500/40 '
            + 'dark:bg-white/10 dark:text-il-neutral-100 dark:focus:bg-il-neutral-800',
    },
    select: {
        skins: {
            field: {
                base: 'flex h-il-control items-center rounded-il-control border border-transparent pl-3 pr-1 text-sm transition-colors focus-within:ring-2 focus-within:ring-il-primary-500/40',
                on: 'bg-il-neutral-100 font-medium text-il-neutral-900 hover:bg-il-neutral-200/70 dark:bg-white/10 dark:text-il-neutral-100 dark:hover:bg-white/15',
                off: 'bg-il-neutral-100 text-il-neutral-500 hover:bg-il-neutral-200/70 dark:bg-white/10 dark:text-il-neutral-400 dark:hover:bg-white/15',
                clear: 'hover:bg-il-neutral-200 dark:hover:bg-white/10',
            },
            filter: {
                base: 'flex h-il-control items-center rounded-il-control border border-transparent pl-3 pr-1 text-sm transition-colors focus-within:ring-2 focus-within:ring-il-primary-500/40',
                on: 'bg-il-primary-500/10 font-medium text-il-primary-800 dark:bg-il-primary-500/15 dark:text-il-primary-200',
                off: 'bg-il-neutral-100 text-il-neutral-600 hover:bg-il-neutral-200/70 dark:bg-white/10 dark:text-il-neutral-300 dark:hover:bg-white/15',
                clear: 'hover:bg-il-primary-200/60 dark:hover:bg-il-primary-500/25',
            },
        },
    },
    optionStrip: {
        variant: 'segmented',
    },
});
