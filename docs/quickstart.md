# Quickstart

This page builds one island from scratch: a list of recent orders with a refresh button.
It assumes the [installation](/installation) is done, including the feature-folder glob in
your app entry.

## 1. Scaffold the Island

```bash
php artisan make:island RecentOrders
```

The command writes a feature folder under `app/Islands/`:

```text
app/Islands/RecentOrders/
├── RecentOrders.island.vue
├── RecentOrdersIslandController.php
├── RecentOrdersProps.php
├── Routes.php
├── Page.blade.php
└── Queries/RecentOrdersQuery.php
```

plus the empty role folders `Writers/`, `Presenters/`, `State/`, `Support/` and
`Components/`. Every file is explained under [Directory Structure](/directory-structure).

## 2. Write the Query

The query returns exactly what the component will draw — no Eloquent models cross the wire:

```php
<?php

declare(strict_types=1);

namespace App\Islands\RecentOrders\Queries;

use App\Models\ShopOrder;
use Illuminate\Http\Request;

class RecentOrdersQuery
{
    public function data(Request $request): array
    {
        $rows = ShopOrder::query()
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (ShopOrder $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'customer' => $order->customer_name,
                'total' => $order->total_net,
            ]);

        return ['rows' => $rows->all(), 'meta' => ['count' => $rows->count()]];
    }
}
```

## 3. Guard the Endpoint

The generated controller already calls the query. Fill in the authorization — the package
leaves that decision to you, and the endpoint is public until you do:

```php
<?php

declare(strict_types=1);

namespace App\Islands\RecentOrders;

use App\Islands\RecentOrders\Queries\RecentOrdersQuery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class RecentOrdersIslandController extends Controller
{
    public function __construct(private readonly RecentOrdersQuery $query) {}

    public function data(Request $request): JsonResponse
    {
        $this->authorizeAccess();

        return response()->json(['data' => $this->query->data($request)]);
    }

    private function authorizeAccess(): void
    {
        if (! auth()->user()?->can('orders.view')) {
            throw new AccessDeniedHttpException();
        }
    }
}
```

`Routes.php` already maps `GET data` to this method. Because the island's folder is
`RecentOrders`, the route is registered as `islands/recent-orders/data` with the name
`islands.recent-orders.data` — see [Routes & Controllers](/routes-and-controllers).

## 4. Hand Over the Props

The props class builds what the island starts with. Keep URLs here rather than in the
component, so a route can be renamed without touching JavaScript:

```php
<?php

declare(strict_types=1);

namespace App\Islands\RecentOrders;

use Illuminate\Http\Request;

class RecentOrdersProps
{
    public function build(Request $request): array
    {
        return [
            'dataUrl' => route('islands.recent-orders.data'),
            'initial' => [],
        ];
    }
}
```

## 5. Write the Component

```vue
<!-- app/Islands/RecentOrders/RecentOrders.island.vue -->
<script setup>
import { onMounted, ref } from 'vue';
import { useIsland, useTranslations } from '@aaix/laravel-islands/vue';

const { props } = useIsland();
const { t } = useTranslations();

const rows = ref([]);
const loading = ref(false);

async function load() {
    loading.value = true;
    const response = await fetch(props.dataUrl, { headers: { Accept: 'application/json' } });
    rows.value = (await response.json()).data.rows;
    loading.value = false;
}

onMounted(load);
</script>

<template>
    <div>
        <button type="button" :disabled="loading" @click="load">{{ t('Refresh') }}</button>

        <ul>
            <li v-for="row in rows" :key="row.id">{{ row.number }} — {{ row.customer }}</li>
        </ul>
    </div>
</template>
```

## 6. Mount It

Render the page view from a route or a Filament page and pass the props:

```php
Route::get('/orders/recent', function () {
    return view('islands.recent-orders', [
        'islandProps' => app(\App\Islands\RecentOrders\RecentOrdersProps::class)->build(request()),
    ]);
})->middleware('auth');
```

The generated `Page.blade.php` is the mount point:

```blade
<div>
    <x-island name="RecentOrders" :props="$islandProps" />
</div>
```

Open the page. The island mounts, calls its endpoint and draws the rows.

## Where to Go From Here

- [Mounting](/mounting) — every attribute of `<x-island>`, and islands inside Filament.
- [Real-Time Models](/realtime) — make the list update when an order changes.
- [UI Helpers](/helpers/) — buttons, fields, modals and more.
- [Laravel Islands Datagrid](https://jonaaix.github.io/laravel-islands-datagrid/) — for a
  list with search, filters, sorting and pagination.
