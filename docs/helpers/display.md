# Display

Components that show rather than collect: status words, people, tabs, cards, lists and
the table frame.

## `Badge`

A one-word status. Colour carries the verdict, so the same tone should mean the same
thing everywhere in the application.

![Badges in a table: the next step in blue, the payment state in green and amber](/screenshots/badges.webp)

```vue
<Badge tone="emerald">{{ t('Paid') }}</Badge>
<Badge tone="amber" icon="m-clock">{{ t('Await payment') }}</Badge>
<Badge numeric>{{ count }}</Badge>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `tone` | `'gray'` | `gray` · `emerald` · `amber` · `red` · `blue` · `violet` · `primary`. |
| `icon` | `null` | A name from your icon set, drawn before the text. |
| `numeric` | `false` | Tabular figures, so a count does not jitter as it changes. |

## `PersonChip`

An avatar with the name beside it. Without a picture, the initial keeps the shape, so a
column of these never loses its rhythm over a missing image.

```vue
<PersonChip :name="row.updated_by.name" :image="row.updated_by.avatar" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `name` | required | |
| `image` | `null` | URL of the avatar. |

## `Tabs`

An underline tab strip. Each tab may carry an icon, a count and a mark; a disabled tab
stays in place rather than disappearing.

![A tab strip with icons and counts](/screenshots/tabs.webp)

```vue
<Tabs
    v-model="state.tab"
    :items="[
        { key: 'active', label: t('Active'), icon: 'o-bolt', count: counts.active },
        { key: 'unpaid', label: t('Not paid'), icon: 'o-exclamation-triangle', count: counts.unpaid },
        { key: 'all', label: t('All orders'), icon: 'o-archive-box', count: counts.all },
    ]"
>
    <template #end>
        <Button tone="secondary" size="sm">{{ t('Export') }}</Button>
    </template>
</Tabs>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `items` | required | `{ key, label, icon?, count?, disabled?, mark?: { icon, text? } }[]`. `mark` is a small status glyph after the label, with its wording in a tooltip. |
| `modelValue` | `''` | The active key. |

Event: `update:modelValue`. The `#end` slot places content at the strip's right edge.

## `Card` and `CardMedia`

The card surface — `rounded-xl`, a hairline ring, no shadow — optionally a link, with a
picture area that keeps one aspect ratio across a grid.

```vue
<Card :href="productUrl" :active="selected">
    <template #media>
        <CardMedia ratio="3 / 2"><img :src="row.image" alt=""></CardMedia>
    </template>
    <template #header>
        <span class="text-xs font-semibold uppercase text-primary-600">{{ row.brand }}</span>
    </template>
    <h3>{{ row.name }}</h3>
    <template #footer>
        <Badge>{{ row.sku }}</Badge>
    </template>
</Card>
```

| `Card` prop | Default | Purpose |
| --- | --- | --- |
| `href` | `''` | Renders an `<a>`. |
| `active` | `false` | The selected ring. |
| `interactive` | `true` | Hover lift; `false` for a static card. |

| `CardMedia` prop | Default | Purpose |
| --- | --- | --- |
| `ratio` | `''` | A CSS aspect ratio. Falls back to `provideCardDefaults({ mediaRatio })`, then to the content's own size. |

Slots of `Card`: `#media`, `#header`, default, `#footer`.

## `List` and `ListItem`

A hairline-divided list of label-and-description rows, for a summary or a sidebar.

```vue
<List>
    <ListItem :label="t('Created')" :description="formatDate(row.created_at)" />
    <ListItem :label="t('Status')" :description="t('Blocked')" description-tone="danger" />
    <ListItem :label="t('Owner')">
        <PersonChip :name="row.owner" />
    </ListItem>
</List>
```

| `ListItem` prop | Default | Purpose |
| --- | --- | --- |
| `label` | `''` | Also a slot. |
| `description` | `''` | Also a slot. |
| `descriptionTone` | `'muted'` | The description's colour. |

The default slot renders trailing content on the right.

## `Table`

A thin frame around a native `<table>`. It applies the shared look — width, text size,
cell padding, the uppercase header caption — through `:where()`, which carries zero
specificity, so any utility class on a cell wins without `!important`.

```vue
<Table>
    <thead>
        <tr>
            <th>{{ t('Date') }}</th>
            <th>{{ t('Order') }}</th>
            <th class="text-right">{{ t('Amount') }}</th>
        </tr>
    </thead>
    <tbody>
        <tr v-for="row in rows" :key="row.id">
            <td>{{ formatDate(row.date) }}</td>
            <td>{{ row.number }}</td>
            <td class="text-right tabular-nums">{{ formatCurrency(row.total) }}</td>
        </tr>
    </tbody>
</Table>
```

The frame owns `<table>` (`w-full text-sm`), `<th>` (`whitespace-nowrap px-3 py-2 text-left`
plus the caption typography) and `<td>` (`whitespace-nowrap px-3 py-2`). Truncation is
deliberately not applied: a clipped part number is worse than a scrollbar, so let the
region scroll instead. Alignment, tone, tabular numbers and the card around the table are
up to the caller.

For a table with search, filters, sorting, pagination and a toolbar, see
[Laravel Islands Datagrid](https://jonaaix.github.io/laravel-islands-datagrid/).
