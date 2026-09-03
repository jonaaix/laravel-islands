# Inline Editing

Editing a value where it is shown, with one contract across the application: Enter
saves, Escape cancels, a spinner takes the value's place while the request runs, and an
error replaces the value rather than sitting beside it.

![A weight edited in place, with the keyboard hint under the field](/screenshots/inline-edit.webp)

## `InlineEdit`

The contract as a component. It shows the value, turns into a field on request, and
emits `save` with the new value — the callsite runs the request and reports back through
`saving` and `error`.

```vue
<InlineEdit
    :value="row.weight_g"
    type="integer"
    suffix="g"
    :label="t('Edit weight')"
    :saving="saving"
    :error="error"
    @save="(value) => update({ weight_g: value })"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `value` | `null` | The current value. An object when `parts` names several keys. |
| `type` | `'text'` | `text` · `textarea` · `decimal` · `integer`. Numeric types refuse to save what they cannot parse. |
| `parts` | `[{ key: '' }]` | Several fields in one edit — `[{ key: 'w' }, { key: 'h' }, { key: 'l' }]` for dimensions. `value` and the emitted object are keyed by part. |
| `separator` | `''` | Drawn between parts: `×`. |
| `prefix`, `suffix` | `''` | A unit around the value. |
| `emptyLabel` | `''` | Shown instead of an empty value. |
| `label` | `''` | Accessible name and tooltip of the pencil. |
| `size` | `'sm'` | |
| `showPrevious` | `false` | Keeps the previous value visible while editing. |
| `saving` | `false` | Shows the spinner in the value's place and blocks input. |
| `error` | `''` | Replaces the value with the message until the next attempt. |
| `autoStart` | `false` | Opens in edit mode on mount. |

Events: `save(value)` — only when the value changed — and `cancel`.

| Slot | Scope | Purpose |
| --- | --- | --- |
| `#display` | `{ value, filled }` | Custom rendering of the value at rest. |
| `#previous` | `{ value }` | Custom rendering of the previous value while editing. |

`textarea` saves on modifier+Enter, so a plain Enter still makes a new line.

## `FieldSegment`

One label-over-value row, the building block of a field group on a record page: a
caption, the value, an optional status indicator, an optional copy button and an
affordance for what clicking does.

![Weight, dimensions and shipping method as three segments of one group](/screenshots/segments.webp)

```vue
<FieldGroup>
    <FieldSegment :label="t('Weight')" :value="`${row.weight_g} g`" affordance="edit" interactive />
    <FieldSegment :label="t('SKU')" :value="row.sku" mono copy />
    <FieldSegment :label="t('Stock')" :value="row.stock" state="ok" indicator="dot" emphasize />
</FieldGroup>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | required | The caption. |
| `value` | `null` | The value text. |
| `state` | `''` | `ok` · `blocked` · `critical` · `off` — drives the indicator and, with `emphasize`, the value colour. |
| `indicator` | `'dot'` | `dot` for a coloured point, `icon` for a glyph from your [icon set](/helpers/icons#icons-the-helpers-expect). |
| `emphasize` | `false` | Colour the value by state. |
| `interactive` | `false` | Hover affordance for a segment that opens something. |
| `affordance` | `''` | `edit` shows a pencil, `menu` a chevron. |
| `copy` | `false` | A copy-to-clipboard button. |
| `mono` | `false` | Monospace value. |
| `saving`, `error` | `false`, `''` | Same contract as `InlineEdit`. |

## `EditSegment`

A `FieldSegment` whose value opens an inline edit in a popover — for a record page where
the value should stay a quiet figure until touched.

```vue
<EditSegment
    :label="t('Weight')"
    :value="row.weight_g"
    :display="formatWeight(row.weight_g)"
    type="integer"
    suffix="g"
    :saving="saving"
    :error="error"
    @save="(value) => update({ weight_g: value })"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | required | |
| `value` | `null` | The raw value handed to the editor. |
| `display` | `''` | The formatted value shown at rest. |
| `type`, `parts`, `separator`, `suffix` | as `InlineEdit` | |
| `saving`, `error` | | |

Event: `save(value)`.

## `ChoiceSegment`

A `FieldSegment` that opens a list of a few options — the shipping method, the condition,
a status that is one of five.

```vue
<ChoiceSegment
    :label="t('Shipping')"
    :model-value="row.shipping_method"
    :options="[
        { value: 'standard', label: t('Standard shipping') },
        { value: 'express', label: t('Express'), hint: t('Next business day') },
        { value: 'freight', label: t('Freight'), state: 'blocked', hint: t('Needs a pallet') },
    ]"
    :saving="saving"
    :error="error"
    @save="(value) => update({ shipping_method: value })"
/>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | required | |
| `modelValue` | `null` | The current choice. |
| `options` | `[]` | `{ value, label, hint?, state? }[]`. |
| `saving`, `error` | | |
| `zIndex` | `60` | Popover layer. |

Event: `save(value)`, emitted only when the choice differs from the current one.
