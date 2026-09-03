# Layout & Styling

The package ships no stylesheet. Islands are styled with Tailwind utility classes like
the rest of a Laravel application, and the [UI helpers](/helpers/) follow the same
conventions. This page collects what an island root should do so that several islands
feel like one application.

## The Root Element

A full-page island — a list view, a record page, a settings screen — takes its width from
`useViewWidth()` and carries two classes: a shared `island-view` and its own name.

```vue
<script setup>
import { useViewWidth } from '@aaix/laravel-islands/vue';

const { root, rootStyle } = useViewWidth();
</script>

<template>
    <div ref="root" :style="rootStyle" class="island-view products-view mx-auto">
        …
    </div>
</template>
```

`rootStyle` sets `max-width` to the base width (1536px by default) plus whatever a docked
panel asks for, and exposes the toolbar height as `--table-toolbar-h`. Because every view
uses the same helper, they all line up at the same width — and a view that needs more room
asks for it through `extraWidth` instead of overriding a class.

A widget that lives inside a card or a Filament section does not need any of this; it
takes the width its parent gives it.

## Typography Scope

Scope base typography to the view class rather than styling elements globally, and keep
the scope inside `@layer base` wrapped in `:where()`. An unlayered selector would beat
every utility class in the component, and a `text-xl` on one heading would silently stop
working:

```css
/* resources/css/app.css */
@layer base {
    :where(.island-view) {
        @apply text-sm text-gray-700 dark:text-gray-300;
    }

    :where(.island-view) h1 {
        @apply text-2xl font-bold tracking-tight text-gray-900 dark:text-white;
    }
}
```

## Dark Mode

The helpers ship both variants of every colour and expect the application to toggle the
`dark` class on `<html>`, as Filament and Tailwind's `class` strategy do. An island that
adds its own colours should never ship a background, text or ring class without its
`dark:` counterpart.

## The Primary Colour

The helpers reference a `primary-*` scale — `bg-primary-600`, `text-primary-500`,
`ring-primary-500/40`. Filament panels define it from their theme. In a plain application,
define it once:

```css
@theme {
    --color-primary-50: oklch(0.97 0.02 260);
    --color-primary-500: oklch(0.62 0.19 260);
    --color-primary-600: oklch(0.55 0.2 260);
    /* … */
}
```

## Stacking Order

The helpers use a fixed ladder so that a new layer never lands under an old one:

| Layer | z-index |
| --- | --- |
| Popover, Menu, Combobox list | 60 |
| Modal, FormModal, ConfirmHost | 70, stepping by 5 for nested modals |
| ToastHost | 80 |
| Tooltip | 9999 |

Overlays are teleported to `<body>`, so an `overflow-hidden` card or a scrolling table
never clips them. An island that draws its own floating layer should slot it into the same
ladder — a side panel beside content belongs below 20, for example, under a table's
floating toolbar.
