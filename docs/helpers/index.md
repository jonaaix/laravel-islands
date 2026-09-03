# UI Helpers

A set of Vue components every island project ends up needing: buttons, fields, selects,
modals, menus, toasts. They live behind their own entry point, so importing the runtime
never pulls them in, and nothing here is required — the runtime works the same with your
own components.

```js
import { Button, Modal, Combobox, provideIcons } from '@aaix/laravel-islands/vue/helpers';
```

## Setup

### Tailwind

The helpers carry Tailwind classes and rely on a `primary-*` colour scale and the `dark:`
variant. Register the package as a source, or the classes are purged and the components
render unstyled:

```css
@source '../../vendor/aaix/laravel-islands/resources/js/**/*';
```

### Icons

The package ships **no icons**. Components that draw a glyph — `Icon`, `IconButton`'s
content, `FieldSegment`'s status marks — take the set from a provider. Hand it over once
in the island root, see [Icons](/helpers/#icons).

### Hosts

Three helpers are "ask from anywhere" services with a single host per island. Mount the
host once at the root, provide the store in the same component, and use the composable
below it:

```vue
<script setup>
import { ConfirmHost, ToastHost, provideConfirm, provideToasts } from '@aaix/laravel-islands/vue/helpers';

provideConfirm();
provideToasts();
</script>

<template>
    <div>
        …
        <ConfirmHost />
        <ToastHost />
    </div>
</template>
```

| Host | Provider | Consumer |
| --- | --- | --- |
| `ConfirmHost` | `provideConfirm()` | `useConfirm()` — a promise that resolves to `true` or `false` |
| `ToastHost` | `provideToasts()` | `useToast()` — `toast.success('…')` and friends |

Without a host, `useConfirm()` resolves `false` and `useToast()` swallows messages — an
island never throws for a missing host, but a confirm that cannot be shown must never read
as a yes.

## Conventions

- **Wording is yours.** Every visible string is a prop with a neutral English default:
  `closeLabel`, `cancelLabel`, `confirmLabel`, `placeholder`. Pass translated strings
  through `t()`.
- **Controlled by default.** Overlays take `:open` and emit `close`; they never close
  themselves. That is what lets a callsite refuse to close a dirty form.
- **One height for controls.** Inputs, select triggers, comboboxes and buttons share
  36px at `size="md"`, so a row of mixed controls reads as one line.
- **Tooltips over `title`.** Icon-only controls carry an `aria-label` and show the same
  words in a `Tooltip`; the native `title` attribute is never used.
- **Everything else is a plain component.** No store, no plugin, no global registration —
  import what you use where you use it.

## Index

| Page | Components |
| --- | --- |
| [Buttons & Fields](/helpers/buttons-and-fields) | `Button`, `ButtonGroup`, `IconButton`, `EditButton`, `vRipple`, `TextField`, `NumberField`, `TextArea`, `SelectField`, `FileField`, `Checkbox`, `Switch`, `Radio`, `RadioGroup`, `Slider`, `ColorPicker`, `WysiwygEditor`, `FieldCaption`, `FieldGroup` |
| [Selects & Inline Editing](/helpers/selects-and-editing) | `Combobox`, `MultiSelect`, `TreeSelect`, `OptionStrip`, `InlineEdit`, `FieldSegment`, `EditSegment`, `ChoiceSegment` |
| [Overlays & Display](/helpers/overlays-and-display) | `Modal`, `FormModal`, `ConfirmHost`, `ToastHost`, `Popover`, `Menu`, `MenuItem`, `Tooltip`, `Badge`, `PersonChip`, `Tabs`, `Card`, `CardMedia`, `List`, `ListItem`, `Table` |

## Icons

`Icon` renders an SVG by name from a set the application provides. The package ships no
icons of its own, so you pay only for the glyphs you use and stay free to pick or swap
the icon library.

### Providing the Set

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

### The Set Format

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

### `Icon`

| Prop | Purpose |
| --- | --- |
| `name` | The key in the set. An unknown name renders nothing rather than an empty box. |

Sizing and colour stay with the caller — the component sets no dimensions, so
`class="h-4 w-4 text-gray-400"` does what you expect.

### Naming

A prefix per style keeps a mixed set readable. With Heroicons, for instance: `s-` for
solid 24, `o-` for outline 24, `m-` for mini 20. The renderer does not care; the
convention is yours. Pick one style per strip of controls — a row that mixes outline and
solid glyphs reads as if one of them were faded.

### Icons the Helpers Expect

A few helpers look up names in your set for their own marks. Provide these when you use
the component:

| Component | Names |
| --- | --- |
| `FieldSegment` with `indicator="icon"` | `s-check-circle`, `s-exclamation-triangle`, `s-exclamation-circle` |
| `Badge` with `icon` | whatever name you pass |
| `Tabs` items with `icon` or `mark` | whatever names you pass |
