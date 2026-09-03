# Form Fields

Every field sits on one shared frame — 36px tall at `size="md"`, `rounded-md`, a hairline
ring that turns primary on focus — so a form built from mixed fields reads as one thing.
All of them are `v-model` components.

![Number fields with a stepper and a segmented option strip in a settings section](/screenshots/fields.webp)

## Shared Props

| Prop | Default | Purpose |
| --- | --- | --- |
| `shape` | `'rounded'` | `sharp` · `rounded` · `pill`. |
| `size` | `'md'` | `sm` (32px) · `md` (36px) · `lg` (40px). |
| `disabled`, `readonly`, `required` | `false` | Forwarded to the native element. |
| `placeholder` | `''` | |

`class` and any other attribute are forwarded to the native element, so `class="w-32"`
sizes the field and `autocomplete="off"` reaches the input.

## `TextField`

```vue
<TextField v-model="form.name" :placeholder="t('Name')" required />
<TextField v-model="form.sku" mono />
<TextField v-model="form.email" type="email" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `type` | `'text'` | `text` · `email` · `url` · `tel` · `password` · `search`. |
| `align` | `'left'` | Text alignment. |
| `mono` | `false` | Monospace, for codes and identifiers. |
| `tabular` | `false` | Tabular figures, for numbers typed into a text field. |

## `NumberField`

A numeric input with optional unit affixes and a minus/plus stepper.

```vue
<NumberField v-model="goal" :min="0" :step="10" stepper :decrease-label="t('Less')" :increase-label="t('More')" />
<NumberField v-model="threshold" suffix="€" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `align` | `'right'` | Numbers are right-aligned by default. |
| `tabular` | `true` | |
| `min`, `max`, `step` | `null` | Forwarded to the input and respected by the stepper. |
| `prefix`, `suffix` | `''` | A unit or currency sign drawn inside the frame. |
| `stepper` | `false` | Shows the minus/plus pair. |
| `decreaseLabel`, `increaseLabel` | `''` | Accessible names of the stepper buttons. |

The model is a number, or `null` while the field is empty.

## `TextArea`

```vue
<TextArea v-model="form.note" :rows="4" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `rows` | `4` | The starting height. Multi-line fields grow from the shared height rather than starting taller. |
| `mono` | `false` | |

## `SelectField`

A native `<select>` on the shared frame — for a short list where the browser's own picker
is good enough. For search, hierarchy or many options, see [Selects](/helpers/selects).

```vue
<SelectField v-model="form.timezone" :options="timezones" :placeholder="t('Timezone')" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `[]` | `{ value, label }[]`. The default slot may replace it with hand-written `<option>`s. |

## `FileField`

A styled file picker.

```vue
<FileField v-model="upload" accept="image/*" multiple :label="t('Choose photos')" :hint="t('JPEG or PNG, up to 10 MB')" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `accept` | `''` | Forwarded. |
| `multiple` | `false` | The model becomes a `FileList`. |
| `label` | `''` | The button text. |
| `hint` | `''` | One line beside it. |

Events: `update:modelValue`, `change`. Reset the field by setting the model to `null`.

## `Checkbox`

```vue
<Checkbox v-model="selected" :indeterminate="some" :aria-label="t('Select row')" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `indeterminate` | `false` | The "some of them" state. |
| `ariaLabel` | `''` | Required when no visible label sits beside it. |

## `Switch`

For a setting that takes effect at once. The handle carries a glyph as well as a colour,
so the state reads without colour vision.

```vue
<Switch v-model="settings.monitoring" :aria-label="t('Threshold monitoring')" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `tone` | `'primary'` | `primary` · `success` · `danger`. |

## `Radio` and `RadioGroup`

```vue
<RadioGroup v-model="form.scope" orientation="horizontal">
    <label class="flex items-center gap-2"><Radio value="company" /> {{ t('Company goal') }}</label>
    <label class="flex items-center gap-2"><Radio value="personal" /> {{ t('Personal goal') }}</label>
</RadioGroup>
```

`RadioGroup` owns the model, names the group and provides both to nested `Radio`s. A
`Radio` outside a group takes `modelValue`, `value` and `name` itself. Comparison is loose,
like the native control's.

| `RadioGroup` prop | Default | Purpose |
| --- | --- | --- |
| `name` | auto | A generated unique name; pass one when the group posts a real form. |
| `orientation` | `'vertical'` | `vertical` or `horizontal`. |
| `disabled` | `false` | Disables every radio inside. |

## `Slider`

A range input, or a stepped slider with named stops.

```vue
<Slider v-model="opacity" :min="0" :max="100" :step="5" />
<Slider v-model="density" :options="[{ value: 'compact', label: t('Compact') }, { value: 'cozy', label: t('Cozy') }]" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `options` | `null` | `{ value, label }[]` for named stops; the slider snaps to the nearest one. |
| `min`, `max`, `step` | `0`, `100`, `1` | The numeric range when no options are given. |
| `minLabel`, `maxLabel` | `''` | Captions at either end. |

Events: `update:modelValue` on every move, `commit` on release — bind the save to
`commit` so a drag does not fire a request per pixel.

## `ColorPicker`

A hex field with a swatch that opens the picker: saturation plane, hue rail, an optional
alpha rail, presets and a format switch.

![The colour picker opened from its swatch](/screenshots/color-picker.webp)

```vue
<ColorPicker v-model="theme.primary" :labels="{ copy: t('Copy'), presets: t('Presets') }" />
```

| Prop | Default | Purpose |
| --- | --- | --- |
| `alpha` | `false` | Adds the alpha rail; the model becomes `#rrggbbaa` when alpha is below 1. |
| `presets` | 14 colours | A list of hex strings under the plane. `[]` hides the palette. |
| `formats` | `['hex', 'rgb', 'hsl', 'hsv']` | The formats the switch offers for display. The model is always hex. |
| `copyable` | `true` | A copy button beside the value. |
| `labels` | `{}` | Translated labels for the picker's own controls: `open`, `plane`, `hue`, `alpha`, `presets`, `copy`, `copied`. |

The colour utilities behind it — `parseHex`, `toHex`, `formatColour`, `COLOR_PRESETS` —
are exported for code that needs the same conversions.

## `WysiwygEditor`

A TipTap rich-text field for the one form that needs prose.

```vue
<WysiwygEditor v-model="form.description" />
```

The model is HTML; an empty document emits `''` instead of `<p></p>`. TipTap is not a
dependency of the package — install it in the application that uses this component:

```bash
npm install @tiptap/vue-3 @tiptap/starter-kit
```

## `FieldCaption` and `FieldGroup`

`FieldCaption` is the 10px uppercase caption above a value — always a `<span>`, so the
callsite wraps it in the semantic element it belongs to:

```vue
<label class="block">
    <FieldCaption>{{ t('Weekly goal') }}</FieldCaption>
    <NumberField v-model="goal" class="mt-1" />
</label>
```

`FieldGroup` groups fields or segments under an optional caption and can tint the whole
group when its state is the message:

| Prop | Default | Purpose |
| --- | --- | --- |
| `label` | `''` | The caption. |
| `muted` | `false` | Greys the group. |
| `tone` | `''` | A tint for the whole group. |

## Field Class Helpers

Custom inputs that should sit on the same frame can borrow it:

```js
import { fieldClasses, textareaClasses, FIELD_SHAPES, FIELD_SIZES } from '@aaix/laravel-islands/vue/helpers';

const classes = fieldClasses({ shape: 'rounded', size: 'md', mono: true });
```
