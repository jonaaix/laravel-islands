# Theming

The helpers ship one look and four ways to change it, each usable on its own. Nothing changes
until you touch one of them.

| Layer | What it changes | Where it lives |
| --- | --- | --- |
| [Tokens](#tokens) | colours, radii, control heights, motion — for every helper at once | CSS variables |
| [Class hooks](#class-hooks) | any one part of any helper, from CSS | `il-*` classes and `data-*` attributes |
| [Theme object](#the-theme-object) | the defaults a helper falls back to (`shape`, `size`, `tone`) | `startVueIslands({ theme })` |
| [Skins as data](#skins-as-data) | the class tables a helper picks from (`tones`, `sizes`, `skins`) | the same theme object |

Two presets show the range: `defaultTheme` is what you get without doing anything;
`materialTheme` with `themes/material.css` turns everything pill-shaped and rippling.

## Installing the tokens

The Vite plugin writes the package's token stylesheet and its theme presets into your project
on every start and build — by default into `resources/css/islands/` — because Tailwind's
`@import` resolves relative paths, not package aliases. Import the tokens once after
`tailwindcss` in every Tailwind entry that styles islands, and leave the written directory out
of version control:

```css
@import 'tailwindcss';
@import './islands/theme.css';
```

```js
// vite.config.js — another directory, or none at all
islands({ theme: { output: 'resources/css/vendor/islands' } });
islands({ theme: { output: false } });
```

Without the import the `il-*` utilities do not exist and the helpers render unstyled, so this
is the one step every host takes.

## Tokens

`resources/css/theme.css` declares the tokens in a Tailwind `@theme` block. Every helper uses
the utilities generated from them — `bg-il-primary-500`, `rounded-il-control`,
`h-il-control` — and those read the variables at runtime. A theme is a stylesheet loaded after
the tokens that overrides variables, on `:root`, on `.dark`, or on any element to theme a subtree.

| Token | Default | Used for |
| --- | --- | --- |
| `--color-il-primary-{50…950}` | the host's `--color-primary-*`, else Tailwind blue | the accent: CTAs, set filters, focus rings, checked states |
| `--color-il-neutral-{50…950}` | the host's `--color-gray-*`, else Tailwind gray | text, borders, quiet surfaces |
| `--color-il-danger-*`, `-warning-*`, `-success-*`, `-info-*` | Tailwind red, amber, emerald, blue | status: wrong, worth a look, fine, note |
| `--radius-il-control` | `0.375rem` | fields, buttons, select triggers, badges |
| `--radius-il-menu` | `0.5rem` | menus, toasts, icon boxes, field groups |
| `--radius-il-card` | `0.75rem` | cards, modals, popovers |
| `--spacing-il-control-xs`, `-sm`, `il-control`, `-lg` | `1.75rem`, `2rem`, `2.25rem`, `2.5rem` | the heights of small buttons, small fields, fields, large fields |
| `--il-duration-fast`, `-hover`, `-panel`, `-tooltip` | `150ms`, `500ms`, `350ms`, `120ms` | state changes, hover affordances, panels unfolding, tooltips |

```css
/* A calmer, squarer house style */
:root {
    --radius-il-control: 0.25rem;
    --radius-il-card: 0.5rem;
    --color-il-primary-600: oklch(0.45 0.12 250);
}

/* Filament hosts that want the panel's status palette on the helpers too */
@theme {
    --color-il-danger-500: var(--color-danger-500);
    --color-il-success-500: var(--color-success-500);
}
```

Colours: the primary and neutral roles follow the host's palette on purpose — in a Filament
panel the helpers take the panel's colours without any theme. The status roles do not follow
the host, because a panel that maps "danger" to orange should not silently recolour every red
in the helpers; map them yourself when that is what you want.

## Class hooks

Every helper carries a class for itself and one for each of its parts, plus its state as
`data-*` attributes. The names are part of the package's public interface and only change in
a major release.

| Pattern | Example |
| --- | --- |
| `il-<component>` | `il-button`, `il-combobox`, `il-modal` |
| `il-<component>__<part>` | `il-combobox__option`, `il-modal__footer`, `il-switch__handle` |
| `data-variant`, `data-size`, `data-tone`, `data-shape` | `[data-variant="filter"]`, `[data-size="sm"]` |
| `data-state` | `open`, `closed`, `set`, `empty`, `checked`, `on`, `off`, `selected`, `highlighted`, `loading`, `disabled`, `editing`, `saving`, `active`, `invalid` |

```css
.il-button[data-tone="cta"] { letter-spacing: 0.02em; }
.il-combobox__option[data-state="selected"] { font-weight: 600; }
.il-modal__panel { box-shadow: none; }
.dark .il-toast__rail { opacity: 0.8; }
```

The hooks are additive: the Tailwind utilities that draw the default look stay on the element,
so a rule of yours competes with them on specificity. `.il-button[data-tone="cta"]` beats a
single utility class; use the attribute where a bare class does not win.

<details>
<summary>All hooks</summary>

| Component | Root | Parts |
| --- | --- | --- |
| Badge | `il-badge` · `data-tone` | `__icon` |
| Button | `il-button` · `data-tone` `data-size` `data-shape` `data-state` `data-split` | `__icon` `__label` `__chip` `__spinner` `__action` `__divider` `__menu` `__chevron` |
| ButtonGroup | `il-button-group` · `data-shape` | |
| Card | `il-card` · `data-state` `data-interactive` | `__header` `__body` `__footer` |
| CardMedia | `il-card-media` | |
| Checkbox | `il-checkbox` · `data-state` `data-disabled` | `__input` `__halo` `__box` |
| ChoiceSegment | `il-choice-segment` · `data-state` | `__menu` `__option` |
| ColorPicker | `il-color-picker` · `data-state` `data-disabled` | `__swatch` `__plane` `__hue` `__alpha` `__presets` `__preset` `__value` |
| Combobox | `il-combobox` · `data-variant` `data-state` | `__trigger` `__backdrop` `__menu` `__search` `__list` `__loading` `__clear-option` `__option` `__empty` |
| ConfirmHost | | `il-confirm__title` · `data-tone` · `il-confirm__message` |
| DateRangeField | `il-date-range-field` · `data-variant` `data-state` `data-disabled` | `__input` `__open` `__trigger` `__picker` `__shortcuts` `__months` `__calendar` `__days` `__footer` `__draft` |
| DateTimeField | `il-date-time-field` · `data-mode` `data-variant` `data-state` `data-disabled` | `__input` `__open` `__shortcuts` `__picker` `__calendar` `__days` `__clock` `__footer` `__draft` |
| EditButton | `il-edit-button` · `data-size` | `__glyph` |
| EditSegment | `il-edit-segment` · `data-state` | `__editor` |
| FieldCaption | `il-field-caption` | |
| FieldGroup | `il-field-group` · `data-tone` `data-muted` | `__label` `__frame` |
| FieldSegment | `il-field-segment` · `data-state` `data-interactive` `data-saving` `data-error` | `__label` `__value` |
| FileField | `il-file-field` · `data-state` `data-disabled` | `__zone` `__list` `__file` `__remove` |
| FormModal | `il-form-modal` · `data-state` | `__footer` |
| Icon | `il-icon` · `data-icon` | |
| IconButton | `il-icon-button` · `data-tone` `data-size` | `__glyph` |
| InlineEdit | `il-inline-edit` · `data-state` `data-size` `data-error` | `__display` `__pencil` `__input` `__save` `__cancel` `__hint` `__error` |
| List, ListItem | `il-list`, `il-list-item` | `__text` `__label` `__description` · `data-tone` · `__value` |
| Menu, MenuItem | `il-menu` · `data-state`, `il-menu-item` · `data-tone` | `il-menu__panel` |
| Modal | `il-modal` · `data-size` | `__panel` `__header` `__title` `__actions` `__close` `__body` `__footer` |
| MultiCombobox | `il-multi-combobox` · `data-variant` `data-state` `data-count` | `__trigger` `__search` `__list` `__loading` `__heading` `__option` `__empty` `__clear-option` |
| MultiSelect | `il-multi-select` · `data-variant` `data-state` `data-count` | `__trigger` `__list` `__option` `__empty` `__clear-option` |
| NumberField | `il-number-field` · `data-variant` `data-size` `data-shape` `data-disabled` | `__step` `__affix` |
| OptionStrip | `il-option-strip` · `data-variant` `data-size` `data-disabled` | `__surface` `__option` · `data-state` · `__marker` |
| PersonChip | `il-person-chip` | `__image` `__initial` |
| Popover | `il-popover` | `il-popover__backdrop` |
| Radio, RadioGroup | `il-radio` · `data-state` `data-disabled`, `il-radio-group` · `data-orientation` | `__input` `__halo` `__box` `__dot` |
| SelectField, TextField, TextArea | `il-select-field`, `il-text-field`, `il-text-area` · `data-size` `data-shape` | |
| Skeleton | `il-skeleton` · `data-variant` | `__line` |
| Slider | `il-slider` · `data-state` `data-disabled` | `__track` `__rail` `__fill` `__tick` `__handle` `__labels` |
| Switch | `il-switch` · `data-state` `data-tone` `data-disabled` | `__input` `__track` `__halo` `__handle` |
| Table | `il-table` | |
| Tabs | `il-tabs` · `data-variant` | `__tab` · `data-state` · `__icon` `__count` `__mark` |
| ToastHost | `il-toasts`, `il-toast` · `data-tone` | `__rail` `__icon` `__title` `__message` `__close` `__timer` |
| Tooltip | `il-tooltip` · `data-state` | `__tip` · `data-placement` · `__arrow` |
| TreeSelect | `il-tree-select` · `data-state` `data-disabled` | `__trigger` `__clear` `__menu` `__search` `__list` `__heading` `__option` `__footer` |
| WysiwygEditor | `il-wysiwyg` | `__toolbar` `__tool` · `data-state` · `__content` |

</details>

## The theme object

One object, one section per component family. A section holds the defaults a helper falls back
to when a prop is unset and the class tables it draws from. Hand it to `startVueIslands` for
every island, or to `provideTheme()` inside a component for a subtree; both layer over the
package's defaults, so you name only what differs.

```js
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands(islands, {
    theme: {
        button: { shape: 'pill', size: 'md', tone: 'primary', ripple: true },
        iconButton: { size: 'md', tone: 'quiet' },
        field: { shape: 'rounded', size: 'md' },
        badge: { tone: 'gray' },
        card: { mediaRatio: '3 / 2' },
        modal: { size: 'md' },
        optionStrip: { variant: 'pills', size: 'md' },
        tabs: { variant: 'underline' },
        switch: { tone: 'primary' },
        menuItem: { tone: 'default' },
        editButton: { size: 'sm' },
    },
});
```

```vue
<script setup>
import { provideTheme, useTheme } from '@aaix/laravel-islands/vue/helpers';

// Everything inside this component: smaller buttons, sharp fields.
provideTheme({ button: { size: 'sm' }, field: { shape: 'sharp' } });

// What is in effect here, for a component of your own that wants the same tables.
const { tones } = useTheme('button');
</script>
```

An explicit prop always wins over the theme. `provideButtonDefaults()`, `provideCardDefaults()`
and the `BUTTON_DEFAULTS_KEY` / `CARD_DEFAULTS_KEY` symbols from before the theme keep working
and win over the theme where both are set.

## Skins as data

The class tables live in the same sections: `button.tones`, `button.sizes`, `button.shapes`,
`button.split`, `iconButton.tones|boxes|glyphs`, `field.base|frame|frameInvalid|shapes|sizes|textareaSizes`,
`select.skins`, `badge.tones`, `modal.sizes`, `toast.surface|tones`,
`optionStrip.frames|sizes|skins`, `tabs.skins`, `switch.tones`, `fieldGroup.surfaces|tones`,
`listItem.tones`, `menuItem.tones`, `editButton.sizes`. The merge is key by key, so a theme
adds or replaces one entry and keeps the rest.

```js
theme: {
    button: {
        tones: {
            // A new tone, usable as <Button tone="brand">
            brand: 'bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-500 focus-visible:ring-fuchsia-500',
            // The existing CTA, flatter
            cta: 'bg-il-primary-600 text-white font-medium hover:bg-il-primary-500 focus-visible:ring-il-primary-500',
        },
    },
    select: {
        skins: {
            // A fifth trigger look, usable as variant="toolbar"
            toolbar: { base: 'flex h-il-control-sm items-center rounded-il-control px-2 text-xs', on: 'bg-il-primary-500/10 text-il-primary-800', off: 'text-il-neutral-600 hover:bg-il-neutral-100', clear: 'hover:bg-il-primary-200/60' },
        },
    },
}
```

Classes you write into a theme must reach Tailwind's build like any other class: put the
theme file where your `@source` rules already look, or add it.

The tables the package ships are exported as constants (`BUTTON_TONES`, `SELECT_SKINS`,
`MODAL_SIZES`, …) for a theme that wants to derive from them rather than restate them.

## Presets

```js
import { materialTheme } from '@aaix/laravel-islands/vue/themes';

startVueIslands(islands, { theme: materialTheme });
```

```css
@import './islands/theme.css';
@import './islands/themes/material.css';
```

`materialTheme` sets pill buttons and fields, ripples, a raised CTA and segmented option
strips; `material.css` rounds the radius tokens and raises the control heights.

`softTheme` with `themes/soft.css` is the quieter one: fields and select triggers are filled
rather than framed, actions are tinted rather than saturated, tabs sit as pills in a filled
track, corners are generous (`0.75rem` controls, `1.25rem` cards) and the neutral is
Tailwind's cooler slate. It replaces `field.base` — the box every input draws — which is the
knob for any filled-field look — together with `field.frame` and `field.frameInvalid`, the box of
the fields that hold a button beside the text (DateTimeField, DateRangeField).

`themes/soft-filament.css` carries the same look into the Filament panel around the islands:
sidebar, topbar, global search, tabs and badges, drawn with the same tokens through Filament's
`fi-*` classes. Import it into the panel's Tailwind entry after `soft.css`; the Vite plugin
writes it beside the other files.

```css
@import './islands/theme.css';
@import './islands/themes/soft.css';
@import './islands/themes/soft-filament.css';
```

The sidebar items answer a press. `:active` alone is gone before a trackpad tap can be seen,
so `delegatePress()` from the core entry holds an `il-pressed` class for a readable moment,
and the stylesheet paints both:

```js
import { delegatePress } from '@aaix/laravel-islands';

delegatePress(document, '.fi-sidebar-item-btn');
```

`defaultTheme` is exported beside them, for a theme that starts from the package's tables.
