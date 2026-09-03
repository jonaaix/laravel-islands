# Buttons

## `Button`

A standard button with tone, size, shape, loading state, icon slots and a ripple on press.

```vue
<Button tone="cta" :loading="saving" @click="save">
    <template #icon>
        <Icon name="s-arrow-down-tray" />
    </template>
    {{ t('Save changes') }}
</Button>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | `''` | Fallback text when no default slot is passed. |
| `tone` | `'primary'` | `cta` · `primary` · `secondary` · `outlined` · `ghost` · `danger`. `cta` is the one-off ask in saturated brand colour, `primary` the tinted persistent action, `secondary` a quiet neighbour, `outlined` a hairline over transparent, `ghost` transparent without a border, `danger` red. |
| `size` | `'md'` | `sm` (28px, `text-xs`) · `md` (36px, `text-sm`) · `lg` (40px, `text-sm`). |
| `shape` | `'rounded'` | `rounded` for soft corners, `pill` for full rounding. |
| `loading` | `false` | Replaces the leading icon with a spinner and disables the button. |
| `disabled` | `false` | Standard disabled state. |
| `fullWidth` | `false` | Stretches to the container width. |
| `type` | `'button'` | `submit` for form buttons. Ignored when `href` is set. |
| `href` | `null` | Renders an `<a>` instead of a `<button>`, so middle-click and "open in new tab" work. |
| `target` | `null` | Anchor `target`. With `'_blank'` and no `rel`, `rel="noopener"` is added. |
| `rel` | `null` | Explicit override for the anchor's `rel`. |
| `ripple` | `true` | The pressed ripple. Skipped when disabled or loading. |
| `menuLabel` | `'Open menu'` | Accessible label of the chevron half when the `menu` slot is filled. |
| `menuWidth` | `240` | Width of the menu popover in pixels. |

Events: `click`, `menu-open`, `menu-close`.

### Slots

| Slot | Purpose |
| --- | --- |
| default | The label. |
| `#icon` | A leading glyph — raw SVG or an `<Icon>`. It sizes itself to the button's height and takes the button's text colour. |
| `#iconRight` | A trailing glyph. Ignored when `#menu` is filled. |
| `#chip` | An inline chip after the label — a locale tag, a version pill. |
| `#menu` | Turns the button into a split button with a chevron half that opens a menu. Receives `{ close }`. |

![A split button: the label acts, the chevron opens the alternatives](/screenshots/split-button.webp)

```vue
<Button @click="copy(locale)">
    {{ t('Copy') }}
    <template #chip><span class="uppercase">{{ locale }}</span></template>
    <template #menu="{ close }">
        <MenuItem v-for="option in locales" :key="option" @click="locale = option; close()">
            {{ option }}
        </MenuItem>
    </template>
</Button>
```

### Application-Wide Defaults

Decide shape, size or tone once and let every button pick it up:

```js
import { BUTTON_DEFAULTS_KEY } from '@aaix/laravel-islands/vue/helpers';

startVueIslands(registry, {
    setup(app) {
        app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' });
    },
});
```

From inside a component, `provideButtonDefaults({ shape: 'pill' })` does the same for its
subtree. Resolution order is prop, then provided default, then the package default.

## `ButtonGroup`

Joins directly nested buttons into one strip with shared seams.

```vue
<ButtonGroup :aria-label="t('View')">
    <Button tone="secondary" @click="mode = 'table'">{{ t('Table') }}</Button>
    <Button tone="secondary" @click="mode = 'cards'">{{ t('Cards') }}</Button>
</ButtonGroup>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `shape` | button default | `rounded` or `pill`; falls back to the provided button defaults. |
| `ariaLabel` | `''` | Names the group for assistive technology. |

## `IconButton`

An icon-only button. The label is the accessible name **and** the tooltip, so a control
that shows nothing but a glyph still says what it does.

```vue
<IconButton :label="t('Columns')" size="lg" @click="open = !open">
    <IconColumns />
</IconButton>
```

![The label of an icon button shows as its tooltip](/screenshots/tooltip.webp)

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | required | Accessible name and tooltip text. |
| `size` | `'md'` | `sm` · `md` · `lg`. |
| `tone` | `'quiet'` | The default is grey and steps up on hover; other tones follow `Button`. |
| `tooltip` | `true` | Set `false` to suppress the tooltip while keeping the accessible name. |
| `disabled` | `false` | |
| `href` | `''` | Renders an anchor, so an icon that opens a document is the same control as the ones beside it. |
| `target` | `'_blank'` | Anchor target when `href` is set. |
| `ripple` | `true` | |

Event: `click`.

## `EditButton`

The quiet pencil beside an editable value. Same contract as `IconButton`, with the glyph
built in.

```vue
<EditButton :label="t('Edit weight')" @click="editing = true" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | required | Accessible name and tooltip. |
| `size` | `'sm'` | `sm` or `md`. |

## `vRipple`

The press feedback of the buttons as a directive, so it works on anything a pointer lands
on — a table row, a card, a custom control:

```vue
<script setup>
import { vRipple } from '@aaix/laravel-islands/vue/helpers';
</script>

<template>
    <tr v-ripple @click="open(row)">…</tr>
    <button v-ripple="!disabled">…</button>
</template>
```

The ripple spawns on `pointerdown` because the feedback belongs to the press — on release
a link has already navigated. The element is made `relative` and clipped if it was not
already, and the one CSS rule the circle needs is injected once on first use, so there is
still no stylesheet to import. Pass `false` to disable it conditionally.
