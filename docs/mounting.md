# Mounting

```blade
<x-island
    name="ShopOrders"
    :props="$islandProps"
    :subscribe="$order"
/>
```

| Attribute | Default | Purpose |
| --- | --- | --- |
| `name` | required | The registry key: a feature island's basename (`Products`), or the path of a lone component without the suffix (`product-view/ProductView`). |
| `:props` | `[]` | JSON-serialisable data. Arrives as component props and under `useIsland().props`. |
| `:subscribe` | `null` | A model, or `['key' => $model]`, to keep in sync — see [Real-Time Models](/realtime). |
| `adapter` | `vue` | The frontend adapter that mounts the element. |

The tag renders a `<div data-island="…" data-island-adapter="vue" data-island-payload="…">`.
The payload holds `props` and an `_island` block with subscriptions, translations and the
locale. An unknown `name` logs a console warning and leaves the element empty; the rest
of the page keeps working.

## In Filament

A custom page returns an empty heading and lets the island draw its own:

```php
class ProductsPage extends Page
{
    protected string $view = 'islands.products';

    public function getHeading(): string
    {
        return '';
    }

    protected function getViewData(): array
    {
        return ['islandProps' => app(ProductsProps::class)->build(request())];
    }
}
```

```blade
<x-filament-panels::page>
    <x-island name="Products" :props="$islandProps" />
</x-filament-panels::page>
```

The runtime mounts again after `livewire:navigated`, so nothing else is needed.

## The Setup Hook

Every island is its own Vue application. Plugins, global provides and error handlers are
registered per app through `setup`:

```js
startVueIslands(registry, {
    setup(app, payload) {
        app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' });
    },
});
```

## Other Frameworks

The core is framework-agnostic. `registerAdapter(name, (element, payload) => …)` from
`@aaix/laravel-islands` registers a mount function under a name, and
`<x-island adapter="react">` selects it. `startIslands()` then scans the page.
