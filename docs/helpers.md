# UI Helpers

Vue components every island project ends up needing, behind their own entry point.
Nothing here is required — the runtime works the same with your own components.

```js
import { Button, Modal, Combobox, provideIcons } from '@aaix/laravel-islands/vue/helpers';
```

## Setup

- **Tailwind:** register the package as a source (see [Installation](/installation#tailwind)),
  or the classes are purged. A `primary-*` scale and the `dark:` variant are expected.
- **Icons:** the package ships none. Provide your set once in the island root:

  ```js
  import { provideIcons } from '@aaix/laravel-islands/vue/helpers';

  provideIcons({
      's-truck': { box: '0 0 24 24', html: '<path d="…"/>' },
      'o-archive-box': { box: '0 0 24 24', stroke: true, html: '<path d="…"/>' },
  });
  ```

  `<Icon name="s-truck" class="h-5 w-5" />` renders it; `stroke: true` marks an outline
  icon. An unknown name renders nothing.
- **Hosts:** confirm dialogs and toasts have one host per island. Mount it at the root and
  provide the store in the same component:

  ```vue
  <script setup>
  import { ConfirmHost, ToastHost, provideConfirm, provideToasts } from '@aaix/laravel-islands/vue/helpers';

  provideConfirm();
  provideToasts();
  </script>

  <template>
      <div>…<ConfirmHost /><ToastHost /></div>
  </template>
  ```

Every visible string is a prop with an English default (`closeLabel`, `cancelLabel`,
`placeholder`, …) — pass translated strings through `t()`. Overlays are controlled: they
take `:open` and emit `close`, never closing themselves.

## Components

| Component | Purpose | Key props / events |
| --- | --- | --- |
| `Button` | The action control | `tone` (`cta` · `primary` · `secondary` · `outlined` · `ghost` · `danger`), `size` (`sm` · `md` · `lg`), `shape`, `loading`, `href`; slots `icon`, `iconRight`, `chip`, `menu` (split button) |
| `ButtonGroup` | Joins buttons into one strip | `shape`, `ariaLabel` |
| `IconButton` | Icon-only button; `label` is aria-label and tooltip | `label`, `size`, `tone`, `href` |
| `EditButton` | The quiet pencil beside an editable value | `label`, `size` |
| `vRipple` | Press feedback as a directive | `v-ripple`, `v-ripple="false"` |
| `TextField`, `TextArea`, `NumberField`, `SelectField`, `FileField` | Fields on one shared 36px frame | `v-model`, `shape`, `size`; `NumberField` adds `prefix`, `suffix`, `stepper` |
| `Checkbox`, `Switch`, `Radio` + `RadioGroup`, `Slider` | Choice controls | `v-model`; `Slider` emits `commit` on release |
| `ColorPicker` | Hex field with a picker behind its swatch | `v-model`, `alpha`, `presets`, `labels` |
| `WysiwygEditor` | TipTap rich text — install `@tiptap/vue-3` and `@tiptap/starter-kit` yourself | `v-model` |
| `Combobox` | Searchable single select, optional `fetchOptions(query)` | `v-model`, `options`, `emptyValue`, `variant` (`field` · `filter`) |
| `MultiSelect` | Several values from one list | `v-model`, `options`, `previewLimit` |
| `TreeSelect` | Hierarchy picker with a searchable path | `v-model`, `options` or `optionsUrl`, `clearable`; slot `trigger` |
| `OptionStrip` | A row of pills or one segmented control | `v-model`, `options`, `variant`, `multiple`, `clearable` |
| `InlineEdit` | Edit a value in place: Enter saves, Escape cancels | `value`, `type`, `parts`, `saving`, `error`; emits `save` |
| `FieldSegment`, `EditSegment`, `ChoiceSegment`, `FieldGroup`, `FieldCaption` | Label-over-value rows for a record page | `label`, `value`, `state` (`ok` · `blocked` · `critical` · `off`); segments emit `save` |
| `Modal` | Dialog with focus trap and backdrop | `open`, `title`, `size` (`sm` … `full`), `closable`; emits `close`; slots `footer`, `actions` |
| `FormModal` | Modal whose content is a `<form>` with Cancel and a primary button | `open`, `submitLabel`, `submitTone`, `submitDisabled`, `busy`; emits `cancel`, `submit` |
| `ConfirmHost` + `useConfirm()` | `await confirm({ title, message, confirmLabel, tone })` resolves `true`/`false` | Escape, Cancel and a click outside mean no |
| `ToastHost` + `useToast()` | `toast.success(message, title?)`, `.info`, `.warning`, `.danger` | `duration: 0` stays until closed |
| `Popover` | Anchored floating panel | `anchor`, `open`, `width`; emits `close` |
| `Menu` + `MenuItem` | Dropdown of actions — beyond three in a row, this replaces them | slot `trigger` receives `{ toggle, open }`, default `{ close }`; `MenuItem` takes `href`, `tone="danger"` |
| `Tooltip` | Label on hover or focus | `text`, `placement`, `delay` |
| `Badge` | One-word status | `tone` (`gray` · `emerald` · `amber` · `red` · `blue` · `violet` · `primary`), `icon`, `numeric` |
| `PersonChip` | Avatar with name, initial fallback | `name`, `image` |
| `Tabs` | Underline tab strip | `items` (`{ key, label, icon?, count? }`), `v-model` |
| `Card`, `CardMedia` | Card surface with a fixed-ratio picture area | `href`, `active`; `ratio` |
| `List`, `ListItem`, `Table` | Hairline list; a `<table>` frame whose cell styles any utility class overrides | `label`, `description` |

## Application-Wide Defaults

Decide shape, size or tone of every button once, in the [setup hook](/mounting#the-setup-hook):

```js
import { BUTTON_DEFAULTS_KEY } from '@aaix/laravel-islands/vue/helpers';

startVueIslands(registry, {
    setup(app) {
        app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' });
    },
});
```

`CARD_DEFAULTS_KEY` does the same for `CardMedia`'s ratio. An explicit prop always wins.

## Stacking Order

Popovers and menus sit at z-index 60, modals at 70, toasts at 80, tooltips at 9999. All are
teleported to `<body>`, so a scrolling ancestor or an `overflow-hidden` card never clips
them.
