# UI Helpers

A set of Vue components every island project ends up needing: buttons, fields, selects,
modals, menus, toasts. They live behind their own entry point, so importing the runtime
never pulls them in, and nothing here is required — the runtime works the same with your
own components.

```js
import { Button, Modal, Combobox, provideIcons } from '@aaix/laravel-islands/vue/helpers';
```

![Button tones side by side: a secondary Refresh and a call-to-action](/screenshots/buttons.webp)

## Setup

### Tailwind

The helpers carry Tailwind classes and rely on a `primary-*` colour scale and the `dark:`
variant. Register the package as a source, or the classes are purged and the components
render unstyled:

```css
@source '../../vendor/aaix/laravel-islands/resources/js/**/*';
```

### Icons

The package ships **no icons**. Components that draw a glyph — `Icon`, `IconButton`'s
content, `FieldSegment`'s status marks — take the set from a provider. Hand it over once
in the island root, see [Icons](/helpers/icons).

### Hosts

Three helpers are "ask from anywhere" services with a single host per island. Mount the
host once at the root, provide the store in the same component, and use the composable
below it:

```vue
<script setup>
import { ConfirmHost, ToastHost, provideConfirm, provideToasts } from '@aaix/laravel-islands/vue/helpers';

provideConfirm();
provideToasts();
</script>

<template>
    <div>
        …
        <ConfirmHost />
        <ToastHost />
    </div>
</template>
```

| Host | Provider | Consumer |
| --- | --- | --- |
| `ConfirmHost` | `provideConfirm()` | `useConfirm()` — a promise that resolves to `true` or `false` |
| `ToastHost` | `provideToasts()` | `useToast()` — `toast.success('…')` and friends |

Without a host, `useConfirm()` resolves `false` and `useToast()` swallows messages — an
island never throws for a missing host, but a confirm that cannot be shown must never read
as a yes.

## Conventions

- **Wording is yours.** Every visible string is a prop with a neutral English default:
  `closeLabel`, `cancelLabel`, `confirmLabel`, `placeholder`. Pass translated strings
  through `t()`.
- **Controlled by default.** Overlays take `:open` and emit `close`; they never close
  themselves. That is what lets a callsite refuse to close a dirty form.
- **One height for controls.** Inputs, select triggers, comboboxes and buttons share
  36px at `size="md"`, so a row of mixed controls reads as one line.
- **Tooltips over `title`.** Icon-only controls carry an `aria-label` and show the same
  words in a `Tooltip`; the native `title` attribute is never used.
- **Everything else is a plain component.** No store, no plugin, no global registration —
  import what you use where you use it.

## Index

| Page | Components |
| --- | --- |
| [Icons](/helpers/icons) | `Icon`, `provideIcons` |
| [Buttons](/helpers/buttons) | `Button`, `ButtonGroup`, `IconButton`, `EditButton`, `vRipple`, `provideButtonDefaults` |
| [Form Fields](/helpers/fields) | `TextField`, `NumberField`, `TextArea`, `SelectField`, `FileField`, `Checkbox`, `Switch`, `Radio`, `RadioGroup`, `Slider`, `ColorPicker`, `WysiwygEditor`, `FieldCaption`, `FieldGroup` |
| [Selects](/helpers/selects) | `Combobox`, `MultiSelect`, `TreeSelect`, `OptionStrip` |
| [Inline Editing](/helpers/inline-editing) | `InlineEdit`, `FieldSegment`, `EditSegment`, `ChoiceSegment` |
| [Overlays & Feedback](/helpers/overlays) | `Modal`, `FormModal`, `ConfirmHost`, `ToastHost`, `Popover`, `Menu`, `MenuItem`, `Tooltip` |
| [Display](/helpers/display) | `Badge`, `PersonChip`, `Tabs`, `Card`, `CardMedia`, `List`, `ListItem`, `Table` |
