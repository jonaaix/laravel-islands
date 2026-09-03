# Selects & Inline Editing

## `Combobox`

A searchable single select; the list filters as you type and can be fed from the server.

```vue
<Combobox
    v-model="state.brand"
    :options="props.brands"
    :placeholder="t('Brand')"
    :all-label="t('All brands')"
    variant="filter"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `{}` | A `{ value: label }` map, or `{ value, label, depth?, disabled? }[]`. A `disabled` entry is a heading; `depth` indents. |
| `emptyValue` | `0` | The value that means "nothing chosen". Must equal the state's default. |
| `clearOption` | `true` | Offers the `allLabel` row that resets to `emptyValue`. |
| `placeholder`, `searchPlaceholder` | `'Select…'`, `'Search…'` | |
| `allLabel`, `emptyLabel` | `'All'`, `'No match'` | |
| `selectedLabel` | `''` | Overrides the trigger text while a value is set. |
| `searchValues` | `false` | Match against values as well as labels. |
| `maxOptions` | `60` | Rows rendered at once; `0` renders all. |
| `keepAncestors` | `false` | Keep a match's parents visible while filtering. |
| `fetchOptions(query)` | `null` | Async function returning options for a non-empty query; stale responses are discarded. |
| `fetchDelay`, `loadingLabel` | `150`, `''` | Debounce and the line shown while fetching. |
| `variant` | `'field'` | `field` for forms, `filter` for a toolbar, `filter-card` for a tinted card. |
| `menuWidth`, `menuHeight` | `288`, `240` | |

Slots: `#selected` (`{ keyValue, label }`), `#option` (`{ keyValue, label, option }`).

## `MultiSelect`

Several values from one list; the trigger names the first few picks, then trails off.

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `{}` | Map or `{ value, label }[]`. |
| `placeholder`, `allLabel`, `emptyLabel` | `''` | |
| `previewLimit`, `previewChars` | `3`, `14` | How many picks the trigger names, and how long each may be. |
| `variant` | `'filter'` | As for `Combobox`. |
| `menuWidth`, `menuHeight` | `288`, `320` | |

The model is an array. Slot `#option` receives `{ option, label }`.

## `TreeSelect`

A hierarchy picker with a searchable path. Options come inline or from a URL, cached per
URL across instances.

```vue
<TreeSelect v-model="category" :options-url="props.categoriesUrl" :selected-path="row.category_path" clearable :clear-label="t('No category')">
    <template #trigger="{ open }">
        <EditButton :label="t('Edit category')" @click="open" />
    </template>
</TreeSelect>
```

The endpoint answers with the flattened tree:

```json
{ "data": [
    { "id": 1, "name": "Electrical", "path": "Electrical", "depth": 0, "selectable": false },
    { "id": 12, "name": "Sensors", "path": "Electrical » Sensors", "depth": 1, "selectable": true }
] }
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options`, `optionsUrl` | `null`, `''` | The list inline, or fetched on first open. |
| `selectedPath` | `''` | The current value's path, shown before the options loaded. |
| `separator` | `'»'` | |
| `width`, `listHeight`, `resultLimit` | `480`, `'20rem'`, `200` | |
| `clearable`, `clearLabel` | `false`, `''` | Sets the model to `null`. |
| `placeholder`, `searchPlaceholder`, `loadingLabel`, `errorLabel`, `retryLabel`, `emptyLabel`, `hintLabel` | `''` | The strings. |
| `countLabelFor(n)` | `null` | The "n results" line. |

Events: `update:modelValue`, `open`, `close`. Slot `#trigger` receives
`{ open, path, segments, picked }`. Exposes `show()`, `close()`, `loadOptions()`, `refresh()`.

## `OptionStrip`

A row of pills or one segmented control for a few values at a glance — the view mode, a
quick filter.

```vue
<OptionStrip v-model="state.mode" variant="segmented" :options="[
    { value: 'table', label: t('Table'), icon: 'o-table-cells', hideLabel: true },
    { value: 'cards', label: t('Cards'), icon: 'o-squares-2x2', hideLabel: true },
]" :aria-label="t('View')" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `[]` | `{ value, label, hint?, count?, icon?, hideLabel?, disabled? }[]`. `hideLabel` keeps the label as tooltip only. |
| `multiple` | `false` | The model becomes an array. |
| `clearable` | `false` | Picking the active value again clears it. |
| `variant` | `'pills'` | `pills` or `segmented`. |
| `size` | `'md'` | `md` or `sm`. |
| `marker` | `true` | The dot on the active pill. |
| `disabled`, `ariaLabel` | `false`, `''` | |

## `InlineEdit`

Edit a value where it is shown: Enter saves, Escape cancels, a spinner takes the value's
place while the request runs, an error replaces the value. The callsite runs the request
and reports back through `saving` and `error`.

```vue
<InlineEdit :value="row.weight_g" type="integer" suffix="g" :label="t('Edit weight')" :saving="saving" :error="error" @save="(value) => update({ weight_g: value })" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `value` | `null` | The current value; an object when `parts` names several keys. |
| `type` | `'text'` | `text` · `textarea` · `decimal` · `integer`. Numeric types refuse what they cannot parse; `textarea` saves on modifier+Enter. |
| `parts` | `[{ key: '' }]` | Several fields in one edit, e.g. `[{ key: 'w' }, { key: 'h' }, { key: 'l' }]`. |
| `separator`, `prefix`, `suffix` | `''` | Drawn between and around the parts. |
| `emptyLabel` | `''` | Shown instead of an empty value. |
| `label`, `size` | `''`, `'sm'` | Accessible name of the pencil; its size. |
| `showPrevious` | `false` | Keeps the previous value visible while editing. |
| `saving`, `error` | `false`, `''` | The request state. |
| `autoStart` | `false` | Opens in edit mode on mount. |

Events: `save(value)` (only when changed), `cancel`. Slots: `#display` (`{ value, filled }`),
`#previous` (`{ value }`).

## `FieldSegment`

One label-over-value row — the building block of a field group on a record page.

```vue
<FieldGroup>
    <FieldSegment :label="t('Weight')" :value="`${row.weight_g} g`" affordance="edit" interactive />
    <FieldSegment :label="t('SKU')" :value="row.sku" mono copy />
    <FieldSegment :label="t('Stock')" :value="row.stock" state="ok" emphasize />
</FieldGroup>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label`, `value` | required, `null` | |
| `state` | `''` | `ok` · `blocked` · `critical` · `off` — drives the indicator and, with `emphasize`, the value colour. |
| `indicator` | `'dot'` | `dot`, or `icon` from your [icon set](/helpers/#icons-the-helpers-expect). |
| `interactive`, `affordance` | `false`, `''` | Hover affordance; `edit` shows a pencil, `menu` a chevron. |
| `copy`, `mono`, `emphasize` | `false` | |
| `saving`, `error` | `false`, `''` | Same contract as `InlineEdit`. |

## `EditSegment` and `ChoiceSegment`

Segments whose value opens an editor in a popover — a number or text (`EditSegment`), or
one of a few options (`ChoiceSegment`).

```vue
<EditSegment :label="t('Weight')" :value="row.weight_g" :display="formatWeight(row.weight_g)" type="integer" suffix="g" :saving="saving" :error="error" @save="(value) => update({ weight_g: value })" />

<ChoiceSegment :label="t('Shipping')" :model-value="row.shipping_method" :options="[
    { value: 'standard', label: t('Standard shipping') },
    { value: 'freight', label: t('Freight'), hint: t('Needs a pallet'), state: 'blocked' },
]" :saving="saving" :error="error" @save="(value) => update({ shipping_method: value })" />
```

`EditSegment` takes `label`, `value`, `display` (the formatted value at rest), `type`,
`parts`, `separator`, `suffix`. `ChoiceSegment` takes `label`, `modelValue`, `options`
(`{ value, label, hint?, state? }[]`), `zIndex`. Both take `saving` and `error` and emit
`save(value)` only when the value changed.
