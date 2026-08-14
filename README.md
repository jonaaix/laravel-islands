<p align="center">
  <a href="https://github.com/jonaaix/laravel-islands">
    <img src="https://jonaaix.github.io/laravel-islands/logo.svg" alt="Laravel Islands Logo" width="200">
  </a>
</p>

<h1 align="center">Laravel Islands</h1>

<p align="center">
Elegant frontend islands for <a href="https://laravel.com">Laravel</a>. Server-driven props, real-time model subscriptions, framework-agnostic core with a Vue adapter today.
</p>

<p align="center">
  <a href="https://packagist.org/packages/aaix/laravel-islands"><img src="https://img.shields.io/packagist/v/aaix/laravel-islands.svg?style=flat-square" alt="Latest Version on Packagist"></a>
  <a href="https://packagist.org/packages/aaix/laravel-islands"><img src="https://img.shields.io/packagist/dt/aaix/laravel-islands.svg?style=flat-square" alt="Total Downloads"></a>
  <a href="https://github.com/jonaaix/laravel-islands/blob/main/LICENSE.md"><img src="https://img.shields.io/packagist/l/aaix/laravel-islands.svg?style=flat-square" alt="License"></a>
</p>

---

Mount self-contained frontend components into any Blade or Filament page, hydrate them with server-driven props, and get real-time model subscriptions over Laravel Echo — with zero glue code in the page.

```bash
composer require aaix/laravel-islands
```

```blade
<x-island
    name="product-view/ProductView"
    :subscribe="$product"
    :props="['currency' => 'EUR']"
/>
```

```vue
<script setup>
import { useModel } from '@aaix/laravel-islands/vue';

const { data: product, isDeleted } = useModel('product');
</script>

<template>
    <div>{{ product.name }}</div>
</template>
```

## Documentation

Full guide and API reference: **[jonaaix.github.io/laravel-islands](https://jonaaix.github.io/laravel-islands/)**

## License

[MIT](LICENSE.md)
