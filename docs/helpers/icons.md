# Icons

`Icon` renders an SVG by name from a set the application provides. The package ships no
icons of its own, so you pay only for the glyphs you use and stay free to pick or swap
the icon library.

## Providing the Set

Hand the set over once, in the setup of the component that renders the island. Every
`<Icon>` below it — nested components included — finds it through injection:

```vue
<script setup>
import { Icon, provideIcons } from '@aaix/laravel-islands/vue/helpers';
import { ICONS } from '@shared/icons.js';

provideIcons(ICONS);
</script>

<template>
    <Icon name="o-truck" class="h-5 w-5 text-primary-500" />
</template>
```

To share one set across every island, provide it from the [setup hook](/mounting#the-setup-hook)
instead:

```js
import { ICONS_KEY } from '@aaix/laravel-islands/vue/helpers';

startVueIslands(registry, {
    setup(app) {
        app.provide(ICONS_KEY, ICONS);
    },
});
```

## The Set Format

A plain object of definitions:

```js
// app/Islands/@Shared/icons.js
export const ICONS = {
    's-truck': { box: '0 0 24 24', html: '<path d="…"/>' },
    'o-archive-box': { box: '0 0 24 24', stroke: true, html: '<path stroke-linecap="round" d="…"/>' },
    'm-clock': { box: '0 0 20 20', html: '<path fill-rule="evenodd" d="…" clip-rule="evenodd"/>' },
};
```

| Key | Purpose |
| --- | --- |
| `box` | The `viewBox`. Mixed sizes in one set are fine. |
| `html` | The SVG innards. Several elements are allowed for multi-part glyphs. |
| `stroke` | `true` for outline icons: renders `fill="none"` with `stroke="currentColor"` and width `1.5`. Omit for solid ones. |

## `Icon`

| Prop | Purpose |
| --- | --- |
| `name` | The key in the set. An unknown name renders nothing rather than an empty box. |

Sizing and colour stay with the caller — the component sets no dimensions, so
`class="h-4 w-4 text-gray-400"` does what you expect.

## Naming

A prefix per style keeps a mixed set readable. With Heroicons, for instance: `s-` for
solid 24, `o-` for outline 24, `m-` for mini 20. The renderer does not care; the
convention is yours. Pick one style per strip of controls — a row that mixes outline and
solid glyphs reads as if one of them were faded.

## Icons the Helpers Expect

A few helpers look up names in your set for their own marks. Provide these when you use
the component:

| Component | Names |
| --- | --- |
| `FieldSegment` with `indicator="icon"` | `s-check-circle`, `s-exclamation-triangle`, `s-exclamation-circle` |
| `Badge` with `icon` | whatever name you pass |
| `Tabs` items with `icon` or `mark` | whatever names you pass |
