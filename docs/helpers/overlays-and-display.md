# Overlays & Display

Overlays are teleported to `<body>`, so no scrolling ancestor or `overflow-hidden` card
clips them, and they share one [stacking order](/styling#stacking-order). They are
controlled: they take `:open` and emit `close`, never closing themselves — which is what
lets a callsite refuse to close a dirty form.

## `Modal`

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
| `title` | `''` | Header text; without one the close button floats over the content. |
| `size` | `'md'` | `sm` · `md` · `lg` for content-height windows, `xl` · `full` for ones that fill the screen. |
| `closable` | `true` | `false` drops the close button and ignores backdrop and Escape. |
| `closeOnBackdrop`, `closeOnEscape` | `true` | Emit `close`. |
| `closeLabel` | `'Close'` | Accessible label of the close button. |

Event: `close`. Slots: default, `#title`, `#actions` (beside the close button), `#footer`.
Focus stays inside while open and returns to the opener on close.

## `FormModal`

`Modal` for a form: the fields sit in a `<form>`, Cancel and the primary action share the
footer.

```vue
<FormModal :open="creating" :title="t('New user')" :cancel-label="t('Cancel')" :submit-label="t('Create user')" :submit-disabled="!valid" :busy="saving" @cancel="creating = false" @submit="create">
    <TextField v-model="form.name" required />
</FormModal>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `open`, `title`, `size` | as `Modal` | |
| `closeOnBackdrop` | `false` | A stray click must not drop typed values. |
| `closeOnEscape` | `true` | |
| `cancelLabel`, `submitLabel` | `'Cancel'`, `'Save'` | |
| `submitTone` | `'cta'` | `cta` or `danger`. |
| `submitDisabled` | `false` | Greys the primary button while the form is invalid. |
| `busy` | `false` | Disables both buttons, spinner on the primary one. |

Events: `cancel`, `submit`. Slots: default, `#title`, `#footer` (replaces the buttons,
keeps the chrome).

## Confirm

Mount `ConfirmHost` once in the island root with `provideConfirm()`, then ask from
anywhere below:

```js
const confirm = useConfirm();

const yes = await confirm({
    title: t('Delete this photo?'),
    message: t('This cannot be undone.'),
    confirmLabel: t('Delete'),
    cancelLabel: t('Cancel'),
    tone: 'danger',
});
```

Cancel, Escape, a click beside the window, a missing host and a second question while
the first is open all resolve `false`.

## Toasts

Mount `ToastHost` once with `provideToasts()`, then:

```js
const toast = useToast();

toast.success(t('Saved.'));
toast.warning(t(':name cannot be deleted.', { name }), t('Delete refused'));
toast({ tone: 'danger', title: t('Upload failed'), message: error.message, duration: 0 });
```

| Method | Duration | |
| --- | --- | --- |
| `toast.info`, `.success` | 5s | `(message, title?)` |
| `toast.warning` | 8s | |
| `toast.danger` | 10s | |
| `toast(request)` | as given | `{ tone, title, message, duration }`; `0` stays until closed. Returns the id. |
| `toast.dismiss(id)`, `toast.clear()` | | |

`provideToasts()` must live in the component that renders `ToastHost`. A result that has
a place in the view is better shown there than as a toast.

## `Popover`

The anchored panel behind menus, comboboxes and inline editors. Repositions on scroll and
resize, flips at the viewport edge.

| Prop | Default | Purpose |
| --- | --- | --- |
| `anchor` | `null` | A ref or element to position against. |
| `open` | `false` | |
| `width` | `260` | Pixels; `null` leaves sizing to classes. |
| `offset`, `margin` | `4`, `16` | Gap to the anchor; minimum distance to the viewport edge. |
| `zIndex` | `60` | |

Event: `close` on a click outside or Escape. Exposes `position()`.

## `Menu` and `MenuItem`

A dropdown of actions. Beyond three actions in a row, this replaces them.

```vue
<Menu :width="220">
    <template #trigger="{ toggle, open }">
        <Button tone="secondary" :aria-expanded="open" @click="toggle">{{ t('More') }}</Button>
    </template>
    <template #default="{ close }">
        <MenuItem @click="inbound(); close()">{{ t('Inbound') }}</MenuItem>
        <MenuItem :href="searchUrl">{{ t('Search the web') }}</MenuItem>
        <MenuItem tone="danger" @click="remove(); close()">{{ t('Delete') }}</MenuItem>
    </template>
</Menu>
```

`Menu` takes `width` (`200`) and `zIndex` (`60`). `MenuItem` takes `href` (a link in a new
tab), `tone` (`default` · `danger`), `disabled`; emits `click`; slot `#icon`.

## `Tooltip`

```vue
<Tooltip :text="t('Paid')"><Icon name="m-check-circle" class="h-4 w-4" /></Tooltip>
```

Props: `text` (empty renders nothing), `placement` (`top` · `bottom` · `left` · `right`),
`delay` (`80`). Positioned with fixed coordinates, so a trigger inside a scrolling table
is not clipped. `IconButton` and `EditButton` wrap themselves in one.

## `Badge`

```vue
<Badge tone="emerald">{{ t('Paid') }}</Badge>
<Badge tone="amber" icon="m-clock">{{ t('Await payment') }}</Badge>
```

Props: `tone` (`gray` · `emerald` · `amber` · `red` · `blue` · `violet` · `primary`),
`icon` (a name from your set), `numeric` (tabular figures for a count).

## `Skeleton`

The shape of content that has not arrived. It reserves the room, so nothing jumps when the
data lands — a loading view is the finished view drawn in grey, never a spinner on an empty page.

```vue
<Skeleton :height="36" class="mb-3" />
<Skeleton variant="text" :lines="3" width="24rem" />
<Skeleton variant="circle" :width="40" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `variant` | `'block'` | `block` · `text` · `circle`. |
| `width`, `height` | `'100%'`, `'1rem'` | CSS lengths; a number is pixels. A circle takes `width` for both. |
| `lines` | `3` | Rows of a `text` skeleton; the last one stops short like a paragraph. |
| `rounded` | `'rounded-md'` | The rounding of a block. |

## `PersonChip`

An avatar with the name beside it; without a picture the initial keeps the shape.
Props: `name` (required), `image`.

## `Tabs`

```vue
<Tabs v-model="state.tab" :items="[
    { key: 'active', label: t('Active'), icon: 'o-bolt', count: counts.active },
    { key: 'all', label: t('All orders'), icon: 'o-archive-box', count: counts.all },
]" />
```

Props: `items` (`{ key, label, icon?, count?, disabled?, mark?: { icon, text? } }[]`),
`modelValue`. Slot `#end` places content at the strip's right edge.

## `Card` and `CardMedia`

```vue
<Card :href="productUrl" :active="selected">
    <template #media><CardMedia ratio="3 / 2"><img :src="row.image" alt=""></CardMedia></template>
    <h3>{{ row.name }}</h3>
    <template #footer><Badge>{{ row.sku }}</Badge></template>
</Card>
```

`Card` takes `href` (renders an `<a>`), `active`, `interactive` (`true`); slots `#media`,
`#header`, default, `#footer`. `CardMedia` takes `ratio`, falling back to the theme's
`card.mediaRatio` (see [Theming](/theming)); `provideCardDefaults({ mediaRatio })` still works.

## `List` and `ListItem`

A hairline-divided list of label-and-description rows. `ListItem` takes `label`,
`description`, `descriptionTone` (`'muted'`); the default slot renders trailing content.

## `Table`

A thin frame around a native `<table>`: `w-full text-sm`, uniform `<th>` and `<td>`
padding and the uppercase header caption, applied through `:where()` so any utility class
on a cell wins. Truncation is deliberately not applied — let the region scroll instead.

```vue
<Table>
    <thead><tr><th>{{ t('Order') }}</th><th class="text-right">{{ t('Amount') }}</th></tr></thead>
    <tbody><tr v-for="row in rows" :key="row.id"><td>{{ row.number }}</td><td class="text-right tabular-nums">{{ row.total }}</td></tr></tbody>
</Table>
```

For a table with search, filters, sorting and pagination, see
[Laravel Islands Datagrid](https://jonaaix.github.io/laravel-islands-datagrid/).

## `SwipeRow` and `SwipeSlide`

A row a thumb moves through: one slide per view, snapping into place, a dot per slide
underneath, no scrollbar. Below `sm` by default — a pointer scrolls a wide row perfectly
well — and at every width with `always`. The slides bring no look of their own, so the same
row carries stat cards, a photo strip or a set of filter chips.

```vue
<SwipeRow :track-class="'sm:flex-wrap sm:rounded-xl sm:bg-white sm:px-4 sm:py-2 sm:ring-1 sm:ring-gray-200'">
    <SwipeSlide v-for="card in cards" :key="card.key" class="rounded-xl bg-white p-4 ring-1 ring-gray-200">
        …
    </SwipeSlide>
</SwipeRow>
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `always` | `false` | A row at every width instead of below `sm` only. The breakpoint itself is fixed: a Tailwind variant assembled at runtime never reaches the compiled stylesheet. |
| `dots` | `true` | The indicator under the row. It is an indicator, not a control — the thumb is what moves the row, so the dots carry no wording and no focus. |
| `trackClass` | `''` | Classes for the rail itself: the frame it wears above the breakpoint, its own padding. The component's own class goes to the block around rail and dots. |

The rail keeps two pixels of padding, because a `ring` is drawn outside the element and a
slide as wide as the rail would have its outline clipped at both edges. `active` and `slides`
are exposed on the component for a caller that wants to show the position elsewhere.
