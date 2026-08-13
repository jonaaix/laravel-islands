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

```bash
composer require aaix/laravel-islands
npm install vue @vitejs/plugin-vue
```

The service provider is discovered automatically. The frontend half ships as plain
sources in the same package — no build step of its own.

### Vite

Point the import name at those sources:

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    resolve: {
        alias: {
            '@aaix/laravel-islands': fileURLToPath(
                new URL('./vendor/aaix/laravel-islands/resources/js', import.meta.url),
            ),
        },
    },
    plugins: [laravel({ /* ... */ }), vue()],
});
```

Three entry points hang off that name: `@aaix/laravel-islands` (framework-agnostic
core), `@aaix/laravel-islands/vue` (the adapter and its composables) and
`@aaix/laravel-islands/vue/helpers` (optional UI, see [helpers](helpers.md) — those
carry Tailwind classes and need an `@source` line).

### App entry

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands(import.meta.glob('./islands/**/*.island.vue', { eager: true }));
```

`startVueIslands` scans the DOM for `[data-island][data-island-adapter="vue"]`
elements, resolves the matching component from the registry you handed it and
mounts it. It also re-scans after `livewire:navigated`, so islands work inside
Filament pages.

A registry key is looked up as `./islands/<name>.island.vue` first and as
`./<name>.island.vue` second, so whatever the glob's keys look like decides how
deep a `name` may reach. Feature folders under `app/Islands` are registered by
adding a second glob and normalising its keys:

```js
const featureIslands = Object.fromEntries(
    Object.entries(import.meta.glob('../../app/Islands/**/*.island.vue', { eager: true }))
        .map(([path, module]) => [`./islands/${path.split('/').pop()}`, module]),
);

startVueIslands({ ...import.meta.glob('./islands/**/*.island.vue', { eager: true }), ...featureIslands });
```

With that normalisation the mount name is the entry file's basename —
`<x-island name="Products">` finds `app/Islands/Products/Products.island.vue`,
and two islands must not share an entry file name.

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

### Where island components live

Two homes, both registered in the app entry above:

| Home | Mount name | Good for |
| --- | --- | --- |
| `resources/js/islands/**` | the path without the suffix, e.g. `product-view/ProductView` | a component that is only markup |
| `app/Islands/<Island>/` | the entry file's basename, e.g. `Products` | a feature that owns endpoints, queries and state as well |

Either way the file ends in `.island.vue`. A feature folder is what
`make:island` scaffolds — see [island structure](island-structure.md).

## Next

- [Island structure](island-structure.md) — what `make:island` scaffolds and
  where each kind of file belongs.
- [Composables](composables.md) — `useIsland`, `useModel`, `useEcho`,
  `useSortableTiles`.
- [Helpers](helpers.md) — the optional UI that ships with the package.
- [Translations](translations.md) — how `t()` gets its lines.
