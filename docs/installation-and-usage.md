<img src="../laravel-islands.svg" alt="" width="88" height="88">

# Installation & Usage

`aaix/laravel-islands` mounts self-contained frontend components ("islands")
into any Blade or Filament page, hydrated with server-driven props. The core is
framework-agnostic; a Vue adapter ships today (a React adapter is planned).

## Requirements

- PHP >= 8.3, Laravel 12 or 13
- A working Vite build with the Vue plugin
- `window.Echo` initialised (only needed for real-time islands)

## Installation

The package is a local path package in this repository, so it is already wired.
For a fresh project:

```jsonc
// composer.json — repositories
{
    "type": "path",
    "url": "packages/Aaix/*",
    "options": { "symlink": true }
}
```

```bash
composer require aaix/laravel-islands:@dev
npm install vue @vitejs/plugin-vue
```

### Vite

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@aaix/laravel-islands': fileURLToPath(
                new URL('./packages/Aaix/laravel-islands/resources/js', import.meta.url),
            ),
        },
    },
    plugins: [laravel({ /* ... */ }), vue(), tailwindcss()],
});
```

### App entry

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands(import.meta.glob('./islands/**/*.island.vue', { eager: true }));
```

`startVueIslands` scans the DOM for `[data-island][data-island-adapter="vue"]`
elements, resolves the matching component from the glob and mounts it. It also
re-scans after `livewire:navigated`, so islands work inside Filament pages.

## Usage

### 1. Render a mount point

```blade
<x-island
    name="product-view/ProductView"
    :props="['product' => $product->toArray()]"
/>
```

- `name` — path of the island component under `resources/js/islands/`, without
  the `.island.vue` suffix (`product-view/ProductView` → `resources/js/islands/product-view/ProductView.island.vue`).
- `:props` — data serialized into the island as initial props.
- `adapter` — the frontend adapter, defaults to `vue`.

### 2. Write the island component

```vue
<!-- resources/js/islands/product-view/ProductView.island.vue -->
<script setup>
defineProps(['product']);
</script>

<template>
    <div>{{ product.name }}</div>
</template>
```

Props passed to `<x-island :props="...">` arrive as component props. For access
to the full island payload (metadata, subscriptions) use `useIsland()`:

```vue
<script setup>
import { useIsland } from '@aaix/laravel-islands/vue';

const { props } = useIsland();
</script>
```

### File conventions

- Island components live in `resources/js/islands/**` and end in `.island.vue`.
- The Blade `name` is the path relative to `resources/js/islands/` without the
  suffix.

## Inside an island

`php artisan make:island Phones` scaffolds a feature folder that names its own
responsibilities, so the tenth file lands where the first one did:

```text
app/Islands/Phones/
├── Phones.island.vue            the island itself
├── PhonesIslandController.php   the only door: validate, guard, hand over
├── PhonesProps.php              what it starts up with
├── Routes.php                   its endpoints (this name is fixed — see below)
├── Page.blade.php               the mount point, if it owns a page
├── Queries/                     reading
├── Writers/                     writing
├── Presenters/                  a record turned into what the wire carries
├── State/                       what a user remembers: preferences, saved views
├── Support/                     the rest: URL lists, column definitions, helpers
└── Components/                  the island's own Vue components
```

Rules of thumb:

- **A folder from the first file on**, not from the second. The point is that the
  next reader — human or agent — can guess where something is.
- **Nothing new at the root.** The five files above are the island's wiring; every
  addition belongs to a role.
- **`Routes.php` cannot move.** The package looks for exactly this file in each
  island directory (`routes.file` in the config renames it globally, not per
  island).
- **An exception lives with whoever throws it**, not in a folder of its own.
- **`Support/` holds both languages.** PHP helpers and loose `.js` modules —
  `Components/` is only for `.vue` files.
- Subfolders are namespace segments: `Queries/PhonesQuery.php` is
  `App\Islands\Phones\Queries\PhonesQuery`.

Translations are covered in [translations](translations.md).
