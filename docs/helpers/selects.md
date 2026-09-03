# Selects

Four pickers for four shapes of choice: one of many with search, several of many, one
node of a hierarchy, and one of a few at a glance.

## `Combobox`

A searchable single select. The trigger shows the current label; the list filters as you
type and can be fed lazily from the server.

![A combobox filter opened, its options coloured like the badges they stand for](/screenshots/combobox.webp)

```vue
<Combobox
    v-model="state.brand"
    :options="props.brands"
    :placeholder="t('Brand')"
    :search-placeholder="t('Search brand…')"
    :all-label="t('All brands')"
    :empty-label="t('No match')"
    variant="filter"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `{}` | A `{ value: label }` map, or `{ value, label, depth?, disabled? }[]`. A `disabled` entry renders as a non-pickable heading; `depth` indents. |
| `emptyValue` | `0` | The value that means "nothing chosen". Must equal the state's default, or the filter never reads as cleared. |
| `clearOption` | `true` | Offers the `allLabel` row that resets to `emptyValue`. |
| `placeholder` | `'Select…'` | Trigger text while empty. |
| `searchPlaceholder` | `'Search…'` | |
| `allLabel` | `'All'` | Label of the clear row. |
| `emptyLabel` | `'No match'` | Shown when the search finds nothing. |
| `selectedLabel` | `''` | Overrides the trigger text while a value is set. |
| `searchValues` | `false` | Match the search against values as well as labels. |
| `maxOptions` | `60` | Rows rendered at once; `0` or less renders all. |
| `keepAncestors` | `false` | Keep a match's parents (by `depth`) visible while filtering. |
| `variant` | `'field'` | `field` for forms, `filter` for a toolbar, `filter-card` for a tinted card. |
| `menuWidth`, `menuHeight` | `288`, `240` | Popover size in pixels. |

### Lazy Options

Pass `fetchOptions` to search on the server. It receives the query and returns options in
either shape; results replace the static list while a query is active:

```vue
<Combobox
    v-model="state.vendor"
    :fetch-options="(q) => searchVendors(q)"
    :fetch-delay="200"
    :loading-label="t('Searching…')"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `fetchOptions(query)` | `null` | Async function returning options. Only called for a non-empty query. |
| `fetchDelay` | `150` | Debounce in milliseconds. |
| `loadingLabel` | `''` | Shown while a fetch is in flight. |

Stale responses are discarded, so a fast typist never sees an older result land on top of
a newer one.

### Slots

| Slot | Scope | Purpose |
| --- | --- | --- |
| `#selected` | `{ keyValue, label }` | Custom trigger content — a badge instead of plain text. |
| `#option` | `{ keyValue, label, option }` | Custom row content. |

## `MultiSelect`

Several values from one list. The trigger names the first few picks, then trails off.

```vue
<MultiSelect
    v-model="state.roles"
    :options="props.roles"
    :placeholder="t('Role')"
    :all-label="t('All roles')"
    :empty-label="t('No match')"
    :preview-limit="2"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `{}` | Map or `{ value, label }[]`. |
| `previewLimit` | `3` | How many picks the trigger names before "+n". |
| `previewChars` | `14` | Characters per named pick before it is cut. |
| `variant` | `'filter'` | As for `Combobox`. |
| `menuWidth`, `menuHeight` | `288`, `320` | |

The model is an array. Slot `#option` receives `{ option, label }`.

## `TreeSelect`

A hierarchy picker with a searchable path. Options come from a prop or from a URL, cached
per URL across every instance on the page.

![The tree select opened from a category breadcrumb, searching across the whole path](/screenshots/treeselect.webp)

```vue
<TreeSelect
    v-model="category"
    :options-url="props.categoriesUrl"
    :selected-path="row.category_path"
    clearable
    :placeholder="t('Category')"
    :search-placeholder="t('Search categories…')"
    :clear-label="t('No category')"
    :loading-label="t('Loading…')"
    :error-label="t('Could not load categories')"
    :retry-label="t('Retry')"
    :empty-label="t('No match')"
>
    <template #trigger="{ open, path }">
        <EditButton :label="t('Edit category')" @click="open" />
    </template>
</TreeSelect>
```

The endpoint answers with the flattened tree:

```json
{
    "data": [
        { "id": 1, "name": "Electrical", "path": "Electrical", "depth": 0, "selectable": false },
        { "id": 12, "name": "Sensors", "path": "Electrical » Sensors", "depth": 1, "selectable": true }
    ]
}
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `null` | The list inline, instead of a URL. |
| `optionsUrl` | `''` | Fetched on first open and cached; `refresh()` reloads. |
| `selectedPath` | `''` | The current value's path, shown before the options have loaded. |
| `separator` | `'»'` | Between path segments. |
| `width` | `480` | Popover width. |
| `listHeight` | `'20rem'` | |
| `resultLimit` | `200` | Rows rendered per search. |
| `clearable` | `false` | Offers `clearLabel`, which sets the model to `null`. |
| `countLabelFor(n)` | `null` | A function returning the "n results" line. |
| `hintLabel` | `''` | A line at the bottom of the list — the keyboard hint, for instance. |

Events: `update:modelValue`, `open`, `close`. The `#trigger` slot receives
`{ open, path, segments, picked }` and replaces the default trigger. The component
exposes `show()`, `close()`, `loadOptions()` and `refresh()` on its ref.

## `OptionStrip`

A row of pills or one segmented control for choosing among a few values at a glance —
the view mode, a quick filter, a scope.

```vue
<OptionStrip
    v-model="state.mode"
    variant="segmented"
    :options="[
        { value: 'table', label: t('Table'), icon: 'o-table-cells', hideLabel: true },
        { value: 'cards', label: t('Cards'), icon: 'o-squares-2x2', hideLabel: true },
    ]"
    :aria-label="t('View')"
/>

<OptionStrip v-model="state.quick" :options="quickFilters" clearable />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `[]` | `{ value, label, hint?, count?, icon?, hideLabel?, disabled? }[]`. `hideLabel` keeps the label as tooltip and accessible name only. |
| `multiple` | `false` | The model becomes an array of values. |
| `clearable` | `false` | Picking the active value again clears it. Ignored while `multiple`. |
| `variant` | `'pills'` | `pills` for separate chips, `segmented` for one joined control. |
| `size` | `'md'` | `md` or `sm`. |
| `marker` | `true` | The dot that marks the active pill. |
| `disabled` | `false` | |
| `ariaLabel` | `''` | Names the group. |
