/*
 * Shared class strings for the input helpers. Every field renders identically
 * across islands, and any drift is caught at the source instead of the callsite.
 */

export const FIELD_SHAPES = {
    sharp: 'rounded-none',
    rounded: 'rounded-md',
    pill: 'rounded-full',
};

export const FIELD_SIZES = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
};

export const TEXTAREA_SIZES = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
};

const BASE_BOX =
    'block w-full border border-gray-200 bg-white px-2.5 ' +
    'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ' +
    'dark:border-white/10 dark:bg-gray-800 dark:text-gray-100';

const DISABLED = 'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-gray-800/60';

const READONLY = 'read-only:bg-gray-50 read-only:text-gray-600 dark:read-only:bg-gray-800/60 dark:read-only:text-gray-300';

/**
 * @param {{ shape?: string, size?: string, align?: string, mono?: boolean, tabular?: boolean, extra?: string }} opts
 */
export function fieldClasses(opts = {}) {
    const shape = FIELD_SHAPES[opts.shape ?? 'rounded'] ?? FIELD_SHAPES.rounded;
    const size = FIELD_SIZES[opts.size ?? 'md'] ?? FIELD_SIZES.md;

    return [
        BASE_BOX,
        shape,
        size,
        opts.align === 'right' ? 'text-right' : opts.align === 'center' ? 'text-center' : 'text-left',
        opts.mono ? 'font-mono' : '',
        opts.tabular ? 'tabular-nums' : '',
        DISABLED,
        READONLY,
        opts.extra ?? '',
    ]
        .filter(Boolean)
        .join(' ');
}

/**
 * @param {{ shape?: string, size?: string, mono?: boolean, extra?: string }} opts
 */
export function textareaClasses(opts = {}) {
    const shape = FIELD_SHAPES[opts.shape ?? 'rounded'] ?? FIELD_SHAPES.rounded;
    const size = TEXTAREA_SIZES[opts.size ?? 'md'] ?? TEXTAREA_SIZES.md;

    return [
        BASE_BOX,
        'py-2',
        shape,
        size,
        opts.mono ? 'font-mono' : '',
        DISABLED,
        READONLY,
        opts.extra ?? '',
    ]
        .filter(Boolean)
        .join(' ');
}
