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
| `align` | `'auto'` | `auto` follows the panel's live height: taller than half the window it is centred, shorter it sits near the top and grows downwards instead of jumping while its content loads. `center` and `top` force either. `FormModal` uses the same default. |
| `closable` | `true` | `false` drops the close button and ignores backdrop and Escape. |
| `closeOnBackdrop`, `closeOnEscape` | `true` | Emit `close`. |
| `closeLabel` | `'Close'` | Accessible label of the close button. |

Event: `close`. Slots: default, `#title`, `#actions` (beside the close button), `#footer`.
Focus stays inside while open and returns to the opener on close; the page behind does not scroll
while any modal is open.

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
| `side` | `'bottom'` | `top`, `bottom`, `left` or `right` of the anchor. |
| `align` | `null` | `start`, `end` or `center` along that side. Unset, a panel under its anchor grows from the third of the window the anchor sits in. |
| `flip` | `true` | Moves to the opposite side when the chosen one has no room. |
| `backdrop` | `true` | The layer that closes the panel on a click beside it. |
| `zIndex` | `60` | |

Event: `close` on a click outside or Escape. Exposes `position()`.

## `Menu` and `MenuItem`

A dropdown of actions. Beyond three actions in a row, this replaces them.

```vue
<Menu :width="220">
    <template #trigger="{ toggle, open }">
        <Button tone="secondary" @click="toggle">{{ t('More') }}</Button>
    </template>
    <MenuItem @click="inbound()">{{ t('Inbound') }}</MenuItem>
    <MenuItem :href="searchUrl">{{ t('Search the web') }}</MenuItem>
    <MenuItem tone="danger" @click="remove()">{{ t('Delete') }}</MenuItem>
</Menu>
```

The menu follows the WAI-ARIA menu button pattern. It marks the first focusable element in
`#trigger` with `aria-haspopup`, `aria-expanded` and `aria-controls`. Enter, Space and ↓ on
the trigger open it on the first item (or the checked one), ↑ on the last. Inside, ↑ ↓ Home
End move, a typed letter jumps to the item it starts, Enter and Space activate, Escape closes
and hands focus back to the trigger, Tab closes and moves on. Activating an item closes the
menu; the default slot still receives `close` for anything else.

| `Menu` prop | Default | Purpose |
| --- | --- | --- |
| `width` | `200` | Pixels, or `'trigger'` to match the trigger and follow it. |
| `minWidth` | `null` | The floor for `width="trigger"`. |
| `maxHeight` | `null` | Scrolls the list beyond this height; the checked item is in view on open. |
| `side`, `align`, `offset` | `'bottom'`, `null`, `4` | As for `Popover`; the menu flips when its side has no room. |
| `trigger` | `'click'` | `context` makes `#trigger` an area that opens the menu at the pointer on right-click and long-press. |
| `label` | `''` | Names the menu for screen readers where no trigger does — a context menu. |
| `zIndex` | `60` | |

Exposes `openAt(event)` — one menu shared by many rows opens beside the row that was
right-clicked — and `close()`.

| `MenuItem` prop | Default | Purpose |
| --- | --- | --- |
| `href`, `target` | `''`, `'_blank'` | A link. `target="_self"` keeps it in the tab; a `click` handler may call `preventDefault()` and hand it to a router. |
| `tone` | theme | `default` · `danger`. |
| `disabled` | `false` | |
| `description` | `''` | A second line under the label. |
| `checked` | `null` | Set, the item is a choice: `menuitemradio`, or `menuitemcheckbox` with `multiple`. A check mark trails it. |
| `multiple` | `false` | A checkbox item; it keeps the menu open. |
| `keepOpen` | `false` | Activating the item leaves the menu open. |

Slots: default (the label), `#leading` (any content, `#icon` still works), `#description`,
`#trailing` (a shortcut, a count; replaces the check mark).

`MenuGroup` gathers items under a `label` (or `#label`), `MenuSeparator` draws the line
between groups. `MenuSub` opens a nested menu beside its item on hover, →, Enter or Space;
← and Escape close it again. It takes `label`, `description`, `disabled`, `width` (`200`)
and `maxHeight`, and the items as its default slot.

```vue
<Menu :width="240" :max-height="320">
    <template #trigger="{ toggle }"><IconButton :label="t('Speed')" @click="toggle">…</IconButton></template>
    <MenuGroup :label="t('Speed')">
        <MenuItem v-for="s in speeds" :key="s" :checked="speed === s" @click="speed = s">{{ s }}×</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuSub :label="t('Move to')">
        <MenuItem v-for="p in projects" :key="p.id" @click="move(p.id)">{{ p.name }}</MenuItem>
    </MenuSub>
</Menu>

<Menu trigger="context" :label="t('Project')">
    <template #trigger><ProjectRow :project="project" /></template>
    <MenuItem @click="rename()">{{ t('Rename') }}</MenuItem>
</Menu>
```

## `Tooltip`

```vue
<Tooltip :text="t('Paid')"><Icon name="m-check-circle" class="h-4 w-4" /></Tooltip>
```

Props: `text` (empty renders nothing), `placement` (`top` · `bottom` · `left` · `right`),
`delay` (`80`). Positioned with fixed coordinates, so a trigger inside a scrolling table
is not clipped. `IconButton` and `EditButton` wrap themselves in one. A `class` or other
attribute lands on the trigger, so `class="shrink-0"` sizes it inside a flex row.

Hover opens it after the delay; focus only when it comes from the keyboard, so a dialog
that focuses its first button does not show a tip. A press on the trigger and Escape close
it, as does a trigger that leaves the page, moves from under the pointer or loses its text.

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
Props: `name` (required), `image`, `avatar` (default `true`; `false` drops the picture and the
initial, for a chip that stands beside a larger avatar of the same person).

## `Tabs`

```vue
<Tabs v-model="state.tab" :items="[
    { key: 'active', label: t('Active'), icon: 'o-bolt', count: counts.active },
    { key: 'all', label: t('All orders'), icon: 'o-archive-box', count: counts.all },
]" />
```

Props: `items` (`{ key, label, icon?, count?, disabled?, mark?: { icon, text? } }[]`),
`modelValue`, `iconOnly` (`false`). Slot `#end` places content at the strip's right edge.

`iconOnly` is for a strip without room for its words: a tab with an icon shows only the
icon and its count or mark, and keeps its label as accessible name and tooltip. While the
pointer rests on a mark, only the mark's tooltip shows. A tab without an icon keeps its label.

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

| Prop | Default | Purpose |
| --- | --- | --- |
| `dividers` | `false` | A 1px line between rows and under the header, none after the last row. |
| `stickyHeader` | `false` | The header cells stay at the top of the nearest scroll container, on an opaque background in light and dark. |
| `keepLineBreaks` | `false` | Cells keep the line breaks of their text and align to the top. |

Header cells align with `text-start`, so a right-to-left page aligns them to the right.

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
