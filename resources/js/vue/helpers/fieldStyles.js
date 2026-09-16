/*
 * Shared class strings for the input helpers. Every field renders identically
 * across islands, and any drift is caught at the source instead of the callsite.
 */

export const FIELD_SHAPES = {
    sharp: 'rounded-none',
    rounded: 'rounded-il-control',
    pill: 'rounded-full',
};

export const FIELD_SIZES = {
    sm: 'h-il-control-sm text-xs',
    md: 'h-il-control text-sm',
    lg: 'h-il-control-lg text-base',
};

export const TEXTAREA_SIZES = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
};

/** The box every input draws: border, fill and focus ring. A theme replaces it through `field.base`. */
export const FIELD_BASE =
    'block w-full border border-il-neutral-200 bg-white px-2.5 ' +
    'focus:border-il-primary-500 focus:outline-none focus:ring-1 focus:ring-il-primary-500 ' +
    'dark:border-white/10 dark:bg-il-neutral-800 dark:text-il-neutral-100';

const DISABLED = 'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-il-neutral-50 dark:disabled:bg-il-neutral-800/60';

const READONLY = 'read-only:bg-il-neutral-50 read-only:text-il-neutral-600 dark:read-only:bg-il-neutral-800/60 dark:read-only:text-il-neutral-300';

/**
 * `shapes` and `sizes` are the theme's tables; the package's own apply when a caller passes none.
 *
 * @param {{ shape?: string, size?: string, align?: string, mono?: boolean, tabular?: boolean, extra?: string, base?: string, shapes?: Record<string, string>, sizes?: Record<string, string> }} opts
 */
export function fieldClasses(opts = {}) {
    const shapes = opts.shapes ?? FIELD_SHAPES;
    const sizes = opts.sizes ?? FIELD_SIZES;
    const shape = shapes[opts.shape ?? 'rounded'] ?? shapes.rounded ?? FIELD_SHAPES.rounded;
    const size = sizes[opts.size ?? 'md'] ?? sizes.md ?? FIELD_SIZES.md;

    return [
        opts.base ?? FIELD_BASE,
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
 * @param {{ shape?: string, size?: string, mono?: boolean, extra?: string, shapes?: Record<string, string>, sizes?: Record<string, string> }} opts
 */
export function textareaClasses(opts = {}) {
    const shapes = opts.shapes ?? FIELD_SHAPES;
    const sizes = opts.sizes ?? TEXTAREA_SIZES;
    const shape = shapes[opts.shape ?? 'rounded'] ?? shapes.rounded ?? FIELD_SHAPES.rounded;
    const size = sizes[opts.size ?? 'md'] ?? sizes.md ?? TEXTAREA_SIZES.md;

    return [
        opts.base ?? FIELD_BASE,
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
