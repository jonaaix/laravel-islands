# Quickstart

One island from scratch: a list of recent orders with a refresh button.

## 1. Scaffold

```bash
php artisan make:island RecentOrders
```

```text
app/Islands/RecentOrders/
├── RecentOrders.island.vue
├── RecentOrdersIslandController.php
├── RecentOrdersProps.php
├── Routes.php
├── Page.blade.php
└── Queries/RecentOrdersQuery.php
```

## 2. Query and Endpoint

The query returns what the component draws; the controller authorizes and delegates.
`Routes.php` already maps `GET data` to it, registered as `islands/recent-orders/data`
with the name `islands.recent-orders.data`.

```php
class RecentOrdersQuery
{
    public function data(Request $request): array
    {
        $rows = ShopOrder::query()->latest()->limit(10)->get()
            ->map(fn (ShopOrder $order) => [
                'id' => $order->id,
                'number' => $order->number,
                'customer' => $order->customer_name,
            ]);

        return ['rows' => $rows->all(), 'meta' => []];
    }
}
```

```php
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

::: warning
The scaffolded `authorizeAccess()` is empty. The endpoint is reachable by anyone until you
fill it in.
:::

## 3. Props

```php
class RecentOrdersProps
{
    public function build(Request $request): array
    {
        return ['dataUrl' => route('islands.recent-orders.data'), 'initial' => []];
    }
}
```

## 4. Component

```vue
<script setup>
import { onMounted, ref } from 'vue';
import { useIsland, useTranslations } from '@aaix/laravel-islands/vue';

const { props } = useIsland();
const { t } = useTranslations();
const rows = ref([]);

async function load() {
    const response = await fetch(props.dataUrl, { headers: { Accept: 'application/json' } });
    rows.value = (await response.json()).data.rows;
}

onMounted(load);
</script>

<template>
    <div>
        <button type="button" @click="load">{{ t('Refresh') }}</button>
        <ul>
            <li v-for="row in rows" :key="row.id">{{ row.number }} — {{ row.customer }}</li>
        </ul>
    </div>
</template>
```

## 5. Mount

```php
Route::get('/orders/recent', fn () => view('islands.recent-orders', [
    'islandProps' => app(RecentOrdersProps::class)->build(request()),
]))->middleware('auth');
```

```blade
<div>
    <x-island name="RecentOrders" :props="$islandProps" />
</div>
```

Open the page: the island mounts, calls its endpoint and draws the rows. For a list with
search, filters and pagination, see
[Laravel Islands Datagrid](https://jonaaix.github.io/laravel-islands-datagrid/).
