# Helpers

A small set of UI primitives every island project ends up needing. They live
behind their own entry point, so importing the bridge never pulls them in:

```js
import { Tooltip, Icon, Modal, provideIcons } from '@aaix/laravel-islands/vue/helpers';
```

Nothing here is required. Use them, or bring your own — the bridge works either
way.

| Import | What it is |
| --- | --- |
| `Checkbox` | `modelValue`, `indeterminate`, `disabled`, `ariaLabel` → `update:modelValue` |
| `Switch` | as above plus `tone`, for a setting that takes effect at once |
| `Radio` | `value`, `modelValue`, `name`, `disabled`, `ariaLabel` — loose comparison, like the native one |
| `RadioGroup` | wraps `Radio`s, owns `modelValue` and `orientation`, names the group for you |
| `Badge` | `tone`, `icon`, `numeric` — a status word, `numeric` keeps digits from jittering |
| `PersonChip` | `name`, `image` — an avatar with a fallback built from the name |
| `List` / `ListItem` | a hairline-divided list; the item takes `label`, `description`, `descriptionTone` |
| `EditButton` | the quiet pencil beside an editable value: `label`, `size` → `click` |
| `IconButton` | `label`, `size`, `tone`, `tooltip`, `disabled` → `click` — the label is the aria-label and the tooltip |
| `Tabs` | `items` (`{ key, label, icon?, count?, mark?, disabled? }`), `modelValue` → `update:modelValue` |
| `Popover` | anchored layer: `anchor`, `open`, `width`, `offset`, `margin` → `close` |
| `WysiwygEditor` | `modelValue` → `update:modelValue`, for the one field that needs rich text |
| `FieldCaption` | the 10px uppercase caption style, always a `<span>`; the callsite wraps it in the semantic element it belongs to (`<dt>`, `<label>`, `<p>`, …) |
| `ToastHost` + `provideToasts` / `useToast` | short-lived messages in four tones — `info`, `success`, `warning`, `danger`; without a host they go nowhere instead of throwing |
| `Tooltip`, `Icon`, `Modal`, `Table`, `useConfirm` | detailed below |

Every one of them is a plain component: no store, no provider, except where a
host is named.

> [!NOTE]
> The helpers carry Tailwind classes. Register the package with your build or
> they are dropped and the components render unstyled:
> ```css
> @source '../vendor/aaix/laravel-islands/resources/js/**/*';
> ```

## Tooltip

Wraps any trigger and shows a label on hover.

```vue
<Tooltip :text="t('Paid')">
    <Icon name="m-check-circle" class="h-4 w-4" />
</Tooltip>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `text` | `''` | The label. Empty renders no tooltip. |
| `placement` | `'top'` | `top` or `bottom`. |
| `delay` | `80` | Milliseconds before it appears. |

It positions itself with fixed coordinates rather than absolute offsets, so a
trigger inside a scrolling table or a card with `overflow-hidden` is not
clipped, and it flips to the other side when it would leave the viewport.

## Modal

A dialog above the page. The island owns the open state; the component owns the
window around it.

```vue
<Modal :open="editing" :title="t('Edit photo')" size="lg" @close="editing = false">
    <p>…</p>

    <template #footer>
        <button type="button" @click="editing = false">{{ t('Cancel') }}</button>
        <button type="button" @click="save">{{ t('Save') }}</button>
    </template>
</Modal>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `open` | `false` | Renders nothing while false. |
| `title` | `''` | Shown in a header bar. Without one the close button floats over the content. |
| `size` | `'md'` | `sm` · `md` · `lg` for content-height windows, `xl` · `full` for ones that fill the screen. |
| `closable` | `true` | `false` drops the close button and ignores backdrop and Escape. |
| `closeOnBackdrop` | `true` | Click beside the window closes it. |
| `closeOnEscape` | `true` | Escape closes it. |
| `closeLabel` | `'Close'` | Accessible label of the close button — pass a translated string. |

It emits `close`; nothing closes itself, so a dialog can refuse to go away while
a request is in flight. The `footer` slot is optional and only draws its divider
when filled.

The window is teleported to the end of the page, so no scrolling ancestor or
`overflow-hidden` card can clip it. While it is open, focus stays inside it and
Tab wraps around; closing hands focus back to whatever opened it.

## Confirm

The question before something irreversible. Mount the host once in the island
root, then ask from anywhere below it — the call waits for the answer:

```js
// Island root
import { ConfirmHost, provideConfirm } from '@aaix/laravel-islands/vue/helpers';
provideConfirm();
```
```vue
<ConfirmHost />
```
```js
// Anywhere below
const confirm = useConfirm();

async function remove() {
    const yes = await confirm({
        title: t('Delete this photo?'),
        message: t('This cannot be undone.'),
        confirmLabel: t('Delete'),
        tone: 'danger',
    });

    if (yes) { … }
}
```

| Option | Default | Purpose |
| --- | --- | --- |
| `title` | `''` | The question. |
| `message` | `''` | The consequence, one sentence. |
| `confirmLabel` | `'Confirm'` | Name the action, not "OK" — pass a translated string. |
| `cancelLabel` | `'Cancel'` | Same. |
| `tone` | `'primary'` | `danger` paints the confirming button red. |

The package ships no wording of its own: every string comes from the caller, so
translations stay in the application. Cancel, Escape and a click beside the
window all resolve to `false`, and so does a call made without a host — a
missing dialog must never be read as a yes.

## Icon

An SVG renderer. **It ships no icons** — your application supplies the set, so
you pay for the glyphs you use and stay free to swap icon libraries.

Hand it a set once, in the setup of the component that renders the island:

```vue
<script setup>
import { Icon, provideIcons } from '@aaix/laravel-islands/vue/helpers';
import { ICONS } from '@shared/icons.js';

provideIcons(ICONS);
</script>

<template>
    <Icon name="s-truck" class="h-5 w-5 text-primary-500" />
</template>
```

Every `<Icon>` below that component finds the set, nested components included.
An unknown name renders nothing rather than an empty box.

### The icon set

A plain object of definitions:

```js
export const ICONS = {
    's-truck': { box: '0 0 24 24', html: '<path d="…"/>' },
    'o-archive-box': { box: '0 0 24 24', stroke: true, html: '<path stroke-linecap="round" d="…"/>' },
    'm-clock': { box: '0 0 20 20', html: '<path fill-rule="evenodd" d="…" clip-rule="evenodd"/>' },
};
```

| Key | Purpose |
| --- | --- |
| `box` | The `viewBox`. Mixed sizes in one set are fine. |
| `html` | The SVG innards. Several `<path>` elements are allowed for multi-part glyphs. |
| `stroke` | `true` for outline icons: renders `fill="none"` with `stroke="currentColor"` and width `1.5`. Omit for solid ones. |

Sizing and colour stay with the caller — the component sets no dimensions, so
`class="h-4 w-4 text-gray-400"` does what you expect.

A naming prefix per style keeps a mixed set readable. Heroicons, for instance:
`s-` solid 24, `o-` outline 24, `m-` mini 20. The renderer does not care; the
convention is yours.

## Table

A thin wrapper around a native `<table>`. It applies the shared frame — width,
text size, cell padding, header typography — via `:where()`, which carries zero
specificity, so any utility class on an individual cell wins without
`!important`.

```vue
<script setup>
import { Table } from '@aaix/laravel-islands/vue/helpers';
</script>

<template>
    <Table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Order</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>2026-08-01</td>
                <td>#4711</td>
                <td class="text-right tabular-nums">EUR 189.00</td>
            </tr>
        </tbody>
    </Table>
</template>
```

The primitive owns:

- `<table>`: `w-full text-sm`.
- `<th>`: uniform `whitespace-nowrap px-3 py-2 text-left`, plus the 10px uppercase
  caption typography — a header cell needs no wrapper of its own.
- `<td>`: `whitespace-nowrap px-3 py-2`. Truncation is intentionally opt-in:
  never clip a value silently; let the row region scroll instead.

Anything else — alignment, tone, tabular numbers, the card frame around the
table — is up to the caller.
