import { defineTheme } from '../helpers/theme.js';

/**
 * A Material-leaning look: pill-shaped buttons and fields, ripples on press, filled CTAs.
 * Pair it with `themes/material.css`, which rounds the radius tokens to match; this object
 * covers what CSS cannot reach — the shapes and defaults the helpers pick from their tables.
 *
 *     import { materialTheme } from '@aaix/laravel-islands/vue/themes';
 *     startVueIslands(islands, { theme: materialTheme });
 */
export const materialTheme = defineTheme({
    button: {
        shape: 'pill',
        ripple: true,
        tones: {
            cta: 'bg-il-primary-600 text-white font-medium shadow-md hover:bg-il-primary-500 hover:shadow-lg focus-visible:ring-il-primary-500',
        },
    },
    iconButton: {
        ripple: true,
    },
    field: {
        shape: 'pill',
    },
    optionStrip: {
        variant: 'segmented',
    },
});
