# Buttons & Fields

## `Button`

```vue
<Button tone="cta" :loading="saving" @click="save">
    <template #icon><Icon name="s-arrow-down-tray" /></template>
    {{ t('Save changes') }}
</Button>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | `''` | Fallback text when no default slot is passed. |
| `tone` | `'primary'` | `cta` (one-off ask, saturated) · `primary` (tinted, persistent) · `secondary` · `outlined` · `ghost` · `danger`. |
| `size` | `'md'` | `sm` (28px) · `md` (36px) · `lg` (40px). |
| `shape` | `'rounded'` | `rounded` or `pill`. |
| `loading` | `false` | Spinner in place of the leading icon; disables the button. |
| `disabled`, `fullWidth` | `false` | |
| `type` | `'button'` | `submit` for form buttons. |
| `href`, `target`, `rel` | `null` | Renders an `<a>`; `target="_blank"` adds `rel="noopener"`. |
| `ripple` | `true` | Press feedback. |
| `menuLabel`, `menuWidth` | `'Open menu'`, `240` | The chevron half when `#menu` is filled. |

Events: `click`, `menu-open`, `menu-close`. Slots: default, `#icon`, `#iconRight`, `#chip`
(an inline chip after the label), `#menu` (turns the button into a split button; receives
`{ close }`).

### Application-Wide Defaults

```js
import { BUTTON_DEFAULTS_KEY } from '@aaix/laravel-islands/vue/helpers';

startVueIslands(registry, {
    setup(app) {
        app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' });
    },
});
```

`provideButtonDefaults({ shape: 'pill' })` does the same for a subtree. An explicit prop
always wins.

## `ButtonGroup`

Joins directly nested buttons into one strip with shared seams. Props: `shape`,
`ariaLabel`.

## `IconButton`

An icon-only button. `label` is the accessible name **and** the tooltip.

```vue
<IconButton :label="t('Columns')" size="lg" @click="open = !open"><IconColumns /></IconButton>
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | required | Accessible name and tooltip text. |
| `size` | `'md'` | `sm` · `md` · `lg`. |
| `tone` | `'quiet'` | `quiet` (no surface, tint on hover) · `secondary` · `primary` · `outlined` (the `Button` surfaces) · `active` (tinted, for a toggle that is on) · `danger` · `plain` (no colour of its own). |
| `tooltip` | `true` | `false` keeps the accessible name without the tooltip. |
| `disabled`, `ripple` | `false`, `true` | |
| `href`, `target` | `''`, `'_blank'` | Renders an anchor. |

Event: `click`.

## `EditButton`

The quiet pencil beside an editable value. Props: `label` (required), `size` (`sm` · `md`).
Event: `click`.

## `vRipple`

The press feedback as a directive, for anything a pointer lands on:

```vue
<tr v-ripple @click="open(row)">…</tr>
<button v-ripple="!disabled">…</button>
```

The ripple spawns on `pointerdown`; the element is made `relative` and clipped if it was
not already. No stylesheet to import.

## Fields

Every field sits on one shared frame — 36px tall at `size="md"`, `rounded-md`, a hairline
ring that turns primary on focus. All are `v-model` components and forward `class` and
other attributes to the native element.

| Shared prop | Default | Purpose |
| --- | --- | --- |
| `shape` | `'rounded'` | `sharp` · `rounded` · `pill`. |
| `size` | `'md'` | `sm` (32px) · `md` (36px) · `lg` (40px). |
| `disabled`, `readonly`, `required` | `false` | Forwarded. |
| `placeholder` | `''` | |

### `TextField`

```vue
<TextField v-model="form.email" type="email" required />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `type` | `'text'` | `text` · `email` · `url` · `tel` · `password` · `search`. |
| `align` | `'left'` | |
| `mono`, `tabular` | `false` | Monospace for codes; tabular figures for numbers. |

### `NumberField`

```vue
<NumberField v-model="goal" :min="0" :step="10" stepper :decrease-label="t('Less')" :increase-label="t('More')" />
<NumberField v-model="threshold" suffix="€" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `align`, `tabular` | `'right'`, `true` | |
| `min`, `max`, `step` | `null` | Forwarded and respected by the stepper. |
| `prefix`, `suffix` | `''` | A unit drawn inside the frame. |
| `stepper` | `false` | The minus/plus pair. |
| `decreaseLabel`, `increaseLabel` | `''` | Accessible names of the stepper buttons. |

The model is a number, or `null` while empty.

### `TextArea`

Props: `rows` (`4`), `mono`. Multi-line fields grow from the shared height.

### `SelectField`

A native `<select>` on the shared frame, for a short list. Props: `options`
(`{ value, label }[]`, or hand-written `<option>`s in the default slot).

### `FileField`

```vue
<FileField v-model="upload" accept="image/*" multiple :label="t('Choose photos')" :hint="t('JPEG or PNG, up to 10 MB')" />
```

Props: `accept`, `multiple` (model becomes a `FileList`), `label`, `hint`. Events:
`update:modelValue`, `change`. Reset by setting the model to `null`.

### `Checkbox`

Props: `indeterminate`, `ariaLabel` (required when no visible label sits beside it).

### `Switch`

For a setting that takes effect at once; the handle carries a glyph as well as a colour.
Props: `tone` (`primary` · `success` · `danger`), `ariaLabel`.

### `Radio` and `RadioGroup`

```vue
<RadioGroup v-model="form.scope" orientation="horizontal">
    <label class="flex items-center gap-2"><Radio value="company" /> {{ t('Company goal') }}</label>
    <label class="flex items-center gap-2"><Radio value="personal" /> {{ t('Personal goal') }}</label>
</RadioGroup>
```

`RadioGroup` owns the model, names the group (auto-generated unless `name` is passed) and
takes `orientation` and `disabled`. A `Radio` outside a group takes `modelValue`, `value`
and `name` itself.

### `Slider`

```vue
<Slider v-model="opacity" :min="0" :max="100" :step="5" />
<Slider v-model="density" :options="[{ value: 'compact', label: t('Compact') }, { value: 'cozy', label: t('Cozy') }]" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `null` | `{ value, label }[]` for named stops; the slider snaps to the nearest. |
| `min`, `max`, `step` | `0`, `100`, `1` | The numeric range without options. |
| `minLabel`, `maxLabel` | `''` | Captions at either end. |

Events: `update:modelValue` on every move, `commit` on release — bind the save to `commit`.

### `ColorPicker`

A hex field with a swatch that opens the picker: saturation plane, hue rail, optional
alpha rail, presets and a format switch.

```vue
<ColorPicker v-model="theme.primary" :labels="{ copy: t('Copy'), presets: t('Presets') }" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `alpha` | `false` | Adds the alpha rail; the model becomes `#rrggbbaa` below full opacity. |
| `presets` | 14 colours | Hex strings under the plane; `[]` hides the palette. |
| `formats` | `['hex', 'rgb', 'hsl', 'hsv']` | Display formats. The model is always hex. |
| `copyable` | `true` | A copy button beside the value. |
| `labels` | `{}` | `open`, `plane`, `hue`, `alpha`, `presets`, `copy`, `copied`. |

### `WysiwygEditor`

A TipTap rich-text field. The model is HTML; an empty document emits `''`. Install the
editor in your application: `npm install @tiptap/vue-3 @tiptap/starter-kit`.

### `FieldCaption` and `FieldGroup`

`FieldCaption` is the 10px uppercase caption above a value — always a `<span>`, wrapped by
the callsite in the semantic element it belongs to:

```vue
<label class="block">
    <FieldCaption>{{ t('Weekly goal') }}</FieldCaption>
    <NumberField v-model="goal" class="mt-1" />
</label>
```

`FieldGroup` groups fields or segments under an optional `label`; `muted` greys it,
`tone` tints the whole group when its state is the message.
