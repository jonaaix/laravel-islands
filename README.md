<p align="center">
  <a href="https://github.com/jonaaix/laravel-islands">
    <img src="https://raw.githubusercontent.com/jonaaix/laravel-islands/main/laravel-islands.svg" alt="Laravel Islands Logo" width="120">
  </a>
</p>

<h1 align="center">Laravel Islands</h1>

<p align="center">
Elegant frontend islands for Laravel — framework-agnostic core, with server-driven props, real-time model subscriptions and translations.
</p>

<p align="center">
  <a href="https://packagist.org/packages/aaix/laravel-islands"><img src="https://img.shields.io/packagist/v/aaix/laravel-islands.svg?style=flat-square" alt="Latest Version on Packagist"></a>
  <a href="https://packagist.org/packages/aaix/laravel-islands"><img src="https://img.shields.io/packagist/dt/aaix/laravel-islands.svg?style=flat-square" alt="Total Downloads"></a>
  <a href="https://github.com/jonaaix/laravel-islands/actions/workflows/tests.yml"><img src="https://img.shields.io/github/actions/workflow/status/jonaaix/laravel-islands/tests.yml?branch=main&label=tests&style=flat-square" alt="GitHub Actions"></a>
  <a href="https://github.com/jonaaix/laravel-islands/blob/main/LICENSE.md"><img src="https://img.shields.io/packagist/l/aaix/laravel-islands.svg?style=flat-square" alt="License"></a>
</p>

---

Mount self-contained frontend components into any Blade or Filament page,
hydrate them with server-driven props, and get automatic real-time model
subscriptions over Laravel Echo.

## Adapters

The core is framework-agnostic. Today the package ships a Vue adapter — that
is what every example below uses.

| Framework | Status                            | Entry point                   |
| --------- | --------------------------------- | ----------------------------- |
| Vue 3     | ✅ Shipped                        | `@aaix/laravel-islands/vue`   |
| React     | ⬜ Not yet — contributions welcome | —                             |
| Others    | ⬜ Not yet — contributions welcome | —                             |

The adapter surface is small: a runtime that mounts islands into
`[data-island]` elements, and a composable/hook equivalent of `useModel` that
speaks the same broadcast protocol. Open an issue if you want to work on one.

## Concept

- **Engine (this package):** Blade `<x-island>` component, prop serialization,
  broadcast channel resolution, and the JS runtime (`startIslands`, composables).
- **App:** owns the `*.island.vue` components and registers them with a single
  `import.meta.glob` call.

## Rendering an island

```blade
<x-island
    name="product-view/ProductView"
    :subscribe="$product"
    :props="['currency' => 'EUR']"
/>
```

`:subscribe` accepts a model or a `['key' => $model]` map. Subscribed models are
serialized into the island props automatically and their broadcast channel is
resolved for the frontend.

## Consuming it in Vue

```vue
<script setup>
import { useModel } from '@aaix/laravel-vue-islands';

const { data: product, isDeleted } = useModel('product');
</script>

<template>
    <div>{{ product.name }}</div>
</template>
```

`useModel` auto-subscribes to the model's private channel and reconciles the
reactive state on every broadcast event. Pass `{ refetch }` to reload from a
JSON endpoint instead of merging the broadcast payload, or `{ onUpdate }` for
full control.

## Real-time on the model

```php
use Aaix\VueIslands\Concerns\InteractsWithIslands;

class Product extends Model
{
    use InteractsWithIslands;
}
```

This broadcasts `created` / `updated` / `deleted` on the model's private channel
using Laravel's core `BroadcastsEvents`. Authorize the channel in
`routes/channels.php`.

## App wiring

```js
// resources/js/app.js
import { startIslands } from '@aaix/laravel-vue-islands';

startIslands(import.meta.glob('./islands/**/*.island.vue', { eager: true }));
```

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';
// plugins: [vue(), ...]
// resolve.alias: { '@aaix/laravel-vue-islands': '.../resources/js/index.js' }
```

## Scaffolding an island

```bash
php artisan make:island Phones
```

The generated folder names its own responsibilities, so the tenth file lands
where the first one did:

```text
app/Islands/Phones/
├── Phones.island.vue            the island itself
├── PhonesIslandController.php   the only door: validate, guard, hand over
├── PhonesProps.php              what it starts up with
├── Routes.php                   its endpoints (fixed name — the package looks for it)
├── Page.blade.php               the mount point, if it owns a page
├── Queries/                     reading
├── Writers/                     writing
├── Presenters/                  a record turned into what the wire carries
├── State/                       what a user remembers: preferences, saved views
├── Support/                     the rest: URL lists, column definitions, helpers
└── Components/                  the island's own Vue components
```

A folder from the first file on, and nothing new at the root — those five are the
wiring. Publish the stubs to adjust the house style:

```bash
php artisan vendor:publish --tag=laravel-islands-stubs
```

See [installation & usage](docs/installation-and-usage.md) for the details.

## Optional helpers

A `Tooltip` and an icon renderer ship behind their own entry point, so they cost
nothing unless you import them:

```js
import { Tooltip, Icon, provideIcons } from '@aaix/laravel-islands/vue/helpers';
```

The icon renderer ships no icons — hand it your own set with `provideIcons()`.
See [`docs/helpers.md`](docs/helpers.md).
