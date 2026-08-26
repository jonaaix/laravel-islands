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
| `Slider` | snap-value slider: `modelValue`, `options` (`{ value, label? }[]`), `disabled`, `ariaLabel` — picks the nearest option on drag/click |
| `Badge` | `tone`, `icon`, `numeric` — a status word, `numeric` keeps digits from jittering |
| `PersonChip` | `name`, `image` — an avatar with a fallback built from the name |
| `List` / `ListItem` | a hairline-divided list; the item takes `label`, `description`, `descriptionTone` |
| `Button` | `label`, `tone`, `size`, `shape`, `loading`, `disabled`, `fullWidth`, `ripple` + slots `icon` · default · `iconRight` → `click` |
| `EditButton` | the quiet pencil beside an editable value: `label`, `size` → `click` |
| `IconButton` | `label`, `size`, `tone`, `tooltip`, `disabled`, `ripple` → `click` — the label is the aria-label and the tooltip |
| `vRipple` | the press feedback of this package as a directive, so it works on anything a pointer lands on: `<tr v-ripple>`, `<button v-ripple="!disabled">`. Spawns on pointerdown, because the feedback belongs to the press — on release a link has already navigated. The element is made `relative` and clipped if it was not already, and the one CSS rule the circle needs is placed once on first use, so there is still no stylesheet to import |
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

## Button

A standard button with tone, size, shape, loading state, icon slots and a
Material-style ripple on press.

```vue
<Button tone="cta" @click="save">
    <template #icon>
        <Icon name="s-arrow-down-tray" />
    </template>
    {{ t('Save changes') }}
</Button>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | `''` | Fallback text when no default slot is passed. |
| `tone` | `'primary'` | `cta` · `primary` · `secondary` · `outlined` · `ghost` · `danger`. `cta` is the one-off ask, `primary` the persistent action, `outlined` a hairline outline over transparent, `ghost` transparent without any border. `secondary` and the outlined variants are quiet neighbours. |
| `size` | `'md'` | `sm` (h-7 text-xs) · `md` (h-9 text-sm) · `lg` (h-10 text-sm). |
| `shape` | `'rounded'` | `pill` for full-rounded, `rounded` for soft-cornered. The default is `rounded` so the button is safe to drop into any project; opt into `pill` app-wide with `provideButtonDefaults`. |
| `loading` | `false` | Replaces the leading icon with a spinner and disables the button. |
| `disabled` | `false` | Standard disabled state. |
| `fullWidth` | `false` | Stretches to the container width. |
| `type` | `'button'` | For submit buttons inside forms. Ignored when `href` is set. |
| `href` | `null` | Sets the destination and renders the helper as `<a>` instead of `<button>`, so middle-click and right-click "Open in new tab" keep working. |
| `target` | `null` | Anchor `target`. When `'_blank'` and `rel` is unset, `rel="noopener"` is added automatically. |
| `rel` | `null` | Explicit override for the anchor's `rel`. |
| `ripple` | `true` | The pressed ripple. Skipped when disabled or loading. |
| `menuLabel` | `'Open menu'` | Accessible label of the chevron half when the `menu` slot is filled. |
| `menuWidth` | `240` | Width of the popover in pixels — passed through to `Popover`. |

### Slots

- `#icon`: leading glyph.
- default: label text.
- `#chip`: an inline chip after the label — a badge, locale tag or version pill.
- `#iconRight`: trailing glyph (single-mode only, ignored when `#menu` is filled).
- `#menu`: turns the button into a split-button with a chevron half. Receives `{ close }` — call it after picking an option. Each half runs its own ripple.

Slots: `#icon` for a leading glyph, default for the label, `#iconRight` for a
trailing glyph. Each icon slot sizes itself to the button's height — pass raw
SVG or an `<Icon>`; the wrapper does not colour the glyph, so `text-*` on the
button paints it.

### Application-wide defaults

Set once at boot to let every button pick up the same shape, size or default
tone without touching each callsite:

```js
import { startVueIslands } from '@aaix/laravel-islands/vue';
import { BUTTON_DEFAULTS_KEY } from '@aaix/laravel-islands/vue/helpers';

startVueIslands(registry, {
    setup(app) {
        app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' });
    },
});
```

Any explicit prop still wins per callsite. From a component's setup the
equivalent is `provideButtonDefaults({ shape: 'pill' })` — same key, scoped
to that subtree instead of the whole app.

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

Modals are controlled: `closeOnEscape` / `closeOnBackdrop` only emit `close`,
they never close themselves. The callsite owns `:open` — that's what makes a
dirty-check before closing possible. The `footer` slot is optional and only
draws its divider when filled.

The window is teleported to the end of the page, so no scrolling ancestor or
`overflow-hidden` card can clip it. While it is open, focus stays inside it and
Tab wraps around; closing hands focus back to whatever opened it.

## FormModal

The `Modal` wrapper for a Save-form: the fields sit inside a `<form>`, Cancel and
the primary action sit in a shared footer, and both live in the same submit
lifecycle. Use it whenever the modal's job is to collect fields and hand them
back — anything else stays with plain `Modal`.

```vue
<FormModal
    :open="editing"
    size="lg"
    :title="editing ? t('Edit user') : t('New user')"
    :cancel-label="t('Cancel')"
    :submit-label="editing ? t('Save changes') : t('Create user')"
    submit-tone="cta"
    :submit-disabled="!canSubmit"
    :busy="saving"
    @cancel="editing = false"
    @submit="save"
>
    <!-- fields, sections, alerts -->
</FormModal>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `open` | `false` | Same as `Modal`. |
| `title` | `''` | Same as `Modal`. Use the `#title` slot when a badge, subline or counter has to sit beside it. |
| `size` | `'md'` | Passed through to `Modal`. |
| `closeOnBackdrop` | `false` | Defaults to `false` — a stray click beside the window must not drop typed values. Opt in with `true` where safe. |
| `closeOnEscape` | `true` | Passed through. Modal only *emits* on Escape; the callsite decides via `:open` (see the note on the `Modal` section). |
| `cancelLabel` | `'Cancel'` | Doubles as the Modal's `close-label`. |
| `submitLabel` | `'Save'` | The primary button's label. |
| `submitTone` | `'cta'` | `cta` or `danger` for the primary button. |
| `submitDisabled` | `false` | Grays the primary button while the form is not valid — orthogonal to `busy`. |
| `busy` | `false` | Disables both buttons and shows the spinner on the primary one. |

Events: `cancel` fires on Escape, close-icon, Cancel-button or backdrop (when
allowed) — the callsite owns `:open`. `submit` fires when the form submits.

**Two slots, no more:**

- **`#title`** — replaces the `title` prop when set; use it for a badge, counter
  or subline that sits beside the title.
- **`#footer`** — replaces the two default buttons while keeping the footer
  chrome (`border-t border-gray-200 pt-4 dark:border-white/10 flex justify-end
  gap-2`). Use it for a third action or a split-button. Never override the
  chrome — that is what keeps the footer looking the same across every form.

Anatomy is fixed: header comes from `Modal`, content is the default slot inside
a `<form @submit.prevent>`, footer sits at the end of the form so a submit-typed
button posts naturally. The buttons are in `Modal`'s default size (36 px) —
never `size="sm"`; that reads as a confirmation dialog and drifts.

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
