# Overlays & Feedback

Everything that floats above the page: dialogs, menus, popovers, tooltips and toasts.
They are teleported to `<body>`, so no scrolling ancestor or `overflow-hidden` card can
clip them, and they share one [stacking order](/styling#stacking-order).

## `Modal`

A dialog above the page. The island owns the open state; the component owns the window
around it, the focus trap and the close affordances.

```vue
<Modal :open="editing" :title="t('Edit photo')" size="lg" :close-label="t('Close')" @close="editing = false">
    <p>…</p>

    <template #footer>
        <Button tone="secondary" @click="editing = false">{{ t('Cancel') }}</Button>
        <Button tone="cta" @click="save">{{ t('Save') }}</Button>
    </template>
</Modal>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `open` | `false` | Renders nothing while false. |
| `title` | `''` | Shown in the header bar. Without one the close button floats over the content. |
| `size` | `'md'` | `sm` · `md` · `lg` for content-height windows, `xl` · `full` for ones that fill the screen. |
| `closable` | `true` | `false` drops the close button and ignores backdrop and Escape. |
| `closeOnBackdrop` | `true` | A click beside the window emits `close`. |
| `closeOnEscape` | `true` | Escape emits `close`. |
| `closeLabel` | `'Close'` | Accessible label of the close button. |

Event: `close`. Slots: default (content), `#title` (replaces the title text), `#actions`
(beside the close button), `#footer` (draws its divider only when filled).

Modals are controlled: backdrop and Escape only *emit* `close`; the callsite decides by
changing `:open`. That is what makes a dirty check before closing possible. While open,
focus stays inside and Tab wraps around; closing hands focus back to whatever opened it.

## `FormModal`

`Modal` for a form: the fields sit inside a `<form>`, Cancel and the primary action share
the footer, and both live in the submit lifecycle. Use it whenever the modal's job is to
collect fields and hand them back.

![A form modal with two columns of fields and the Cancel / Create footer](/screenshots/form-modal.webp)

```vue
<FormModal
    :open="creating"
    size="lg"
    :title="t('New user')"
    :cancel-label="t('Cancel')"
    :submit-label="t('Create user')"
    :submit-disabled="!valid"
    :busy="saving"
    @cancel="creating = false"
    @submit="create"
>
    <TextField v-model="form.name" required />
    …
</FormModal>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `open`, `title`, `size` | as `Modal` | |
| `closeOnBackdrop` | `false` | A stray click beside a form must not drop typed values. Opt in where safe. |
| `closeOnEscape` | `true` | |
| `cancelLabel` | `'Cancel'` | Doubles as the close button's label. |
| `submitLabel` | `'Save'` | |
| `submitTone` | `'cta'` | `cta` or `danger`. |
| `submitDisabled` | `false` | Greys the primary button while the form is invalid. Orthogonal to `busy`. |
| `busy` | `false` | Disables both buttons and shows the spinner on the primary one. |

Events: `cancel` on Escape, close button, Cancel or backdrop; `submit` when the form
submits — by button or by Enter in a field. Slots: default, `#title`, and `#footer`,
which replaces the two buttons while keeping the footer chrome.

## Confirm

The question before something irreversible. Mount `ConfirmHost` once in the island root,
provide the store there, and ask from anywhere below — the call waits for the answer.

![A confirm dialog in the danger tone](/screenshots/confirm.webp)

```vue
<!-- Island root -->
<script setup>
import { ConfirmHost, provideConfirm } from '@aaix/laravel-islands/vue/helpers';
provideConfirm();
</script>

<template>
    <div>…<ConfirmHost /></div>
</template>
```

```js
// Anywhere below
const confirm = useConfirm();

async function remove() {
    const yes = await confirm({
        title: t('Delete this photo?'),
        message: t('This cannot be undone.'),
        confirmLabel: t('Delete'),
        cancelLabel: t('Cancel'),
        tone: 'danger',
    });

    if (yes) { … }
}
```

| Option | Default | Purpose |
| --- | --- | --- |
| `title` | `''` | The question. |
| `message` | `''` | The consequence, one sentence. |
| `confirmLabel` | `'Confirm'` | Name the action, not "OK". |
| `cancelLabel` | `'Cancel'` | |
| `tone` | `'primary'` | `danger` paints the confirming button red. |

Cancel, Escape and a click beside the window all resolve `false`, and so does a call made
without a host or a second question asked while the first is open. `createConfirm()` is
exported for a host placed somewhere other than the root.

## Toasts

Short-lived messages in four tones. Mount `ToastHost` once, provide the store in the same
component, and call `useToast()` anywhere below.

![A warning toast in the top right corner](/screenshots/toast.webp)

```vue
<script setup>
import { ToastHost, provideToasts } from '@aaix/laravel-islands/vue/helpers';
provideToasts();
</script>

<template>
    <div>…<ToastHost :close-label="t('Close')" /></div>
</template>
```

```js
const toast = useToast();

toast.success(t('Saved.'));
toast.warning(t(':name cannot be deleted.', { name }), t('Delete refused'));
toast({ tone: 'danger', title: t('Upload failed'), message: error.message, duration: 0 });
```

| Method | Duration | Purpose |
| --- | --- | --- |
| `toast.info(message, title?)` | 5s | Neutral information. |
| `toast.success(message, title?)` | 5s | Confirmation. |
| `toast.warning(message, title?)` | 8s | Worth a look. |
| `toast.danger(message, title?)` | 10s | Something failed. |
| `toast(request)` / `toast.show(request)` | as given | `{ tone, title, message, duration }`; `duration: 0` stays until closed. Returns the id. |
| `toast.dismiss(id)`, `toast.clear()` | | |

`provideToasts()` must live in the component that renders `ToastHost`, or the two never
meet. A toast tells the user the outcome of something they cannot see on screen; a
result that has a place in the view is better shown there.

## `Popover`

An anchored floating panel — the primitive behind menus, comboboxes and inline editors.
It repositions on scroll and resize, flips when it would leave the viewport, and exposes
`position()` for content that changes size.

```vue
<button ref="anchor" type="button" @click="open = !open">…</button>

<Popover :anchor="anchor" :open="open" :width="320" @close="open = false">
    …
</Popover>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `anchor` | `null` | A ref or element to position against. |
| `open` | `false` | |
| `width` | `260` | Pixels; `null` leaves sizing to classes. |
| `offset` | `4` | Gap to the anchor. |
| `margin` | `16` | Minimum distance to the viewport edge. |
| `zIndex` | `60` | |

Event: `close` on a click outside or Escape.

## `Menu` and `MenuItem`

A dropdown of actions. Beyond three actions in a row, this is what replaces them.

![A row menu with two actions](/screenshots/menu.webp)

```vue
<Menu :width="220">
    <template #trigger="{ toggle, open }">
        <Button tone="secondary" :aria-expanded="open" @click="toggle">
            {{ t('More') }}
            <template #iconRight><Icon name="m-chevron-down" /></template>
        </Button>
    </template>

    <template #default="{ close }">
        <MenuItem @click="inbound(); close()">
            <template #icon><Icon name="o-arrow-down-tray" /></template>
            {{ t('Inbound') }}
        </MenuItem>
        <MenuItem :href="searchUrl">{{ t('Google Search') }}</MenuItem>
        <MenuItem tone="danger" @click="remove(); close()">{{ t('Delete') }}</MenuItem>
    </template>
</Menu>
```

| `Menu` prop | Default | Purpose |
| --- | --- | --- |
| `width` | `200` | |
| `zIndex` | `60` | |

| `MenuItem` prop | Default | Purpose |
| --- | --- | --- |
| `href` | `''` | Renders a link opening in a new tab. |
| `tone` | `'default'` | `danger` for the destructive row. |
| `disabled` | `false` | |

The trigger slot receives `{ toggle, open }`, the default slot `{ close }`. `MenuItem`
emits `click` and takes an `#icon` slot.

## `Tooltip`

Wraps any trigger and shows a label on hover or focus.

```vue
<Tooltip :text="t('Paid')">
    <Icon name="m-check-circle" class="h-4 w-4 text-emerald-500" />
</Tooltip>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `text` | `''` | The label. Empty renders no tooltip. |
| `placement` | `'top'` | `top` · `bottom` · `left` · `right`. |
| `delay` | `80` | Milliseconds before it appears. |

It positions itself with fixed coordinates, so a trigger inside a scrolling table is not
clipped, and flips to the other side when it would leave the viewport. `IconButton` and
`EditButton` wrap themselves in one, so a bare icon control never needs a second wrapper.
