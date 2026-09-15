# Mounting Islands

`<x-island>` is the only thing a page needs to know about an island. It renders the mount
element the runtime looks for, and carries everything the island starts with.

```blade
<x-island
    name="ShopOrders"
    :props="$islandProps"
    :subscribe="$order"
/>
```

## Attributes

| Attribute | Type | Default | Purpose |
| --- | --- | --- | --- |
| `name` | string | required | The registry key of the component — see [Resolving the Component](#resolving-the-component). |
| `:props` | array | `[]` | Serialised into the payload. Arrives both as component props and under `useIsland().props`. |
| `:subscribe` | Model, `array<string, Model>` or `null` | `null` | Models the island should keep in sync — see [Real-Time Models](/realtime). |
| `adapter` | string | `vue` | The frontend adapter that mounts this element — see [Custom Adapters](/mounting#other-frameworks). |

Every prop must be JSON-serialisable. Pass arrays and scalars; turn a model into an array
first, ideally through a presenter so only the fields the island draws cross the wire.

## The Rendered Element

```html
<div data-island="ShopOrders" data-island-adapter="vue" data-island-payload="{…}"></div>
```

The payload is one JSON object: `props` is yours; `_island` carries the subscriptions
(channel and event names per model), the translation lines and the locale, and is read by
`useModel()` and `useTranslations()`. Once mounted, the runtime adds `data-island-mounted`.

## Resolving the Component

`startVueIslands(registry)` receives a map of keys to modules, or to loaders when the entry
is lazy — the shape both `@aaix/laravel-islands/islands` and `import.meta.glob()` produce. A
loader is wrapped in `defineAsyncComponent()`, so the island is fetched when the page mounts
it. For a `name`, it tries two keys in order:

1. `./islands/<name>.island.vue`
2. `./<name>.island.vue`

The registry from the [installation](/installation#the-app-entry) keys every island by its
entry file name, so `app/Islands/Products/Products.island.vue` is mounted as
`name="Products"`. A glob added by hand keeps the paths it produces: a lone component under
`resources/js/islands/product-view/ProductView.island.vue` is mounted as
`name="product-view/ProductView"`.

When no key matches, the runtime logs `[islands] vue component not found: "…"` and leaves
the element empty. When the element names an adapter nobody registered, it logs
`[islands] no adapter registered for "…"`. Both are warnings, not errors — the rest of the
page keeps working.

## Islands in Filament

A Filament custom page is a natural host. Return an empty heading, and let the island draw
its own:

```php
<?php

declare(strict_types=1);

namespace App\Filament\Pages;

use App\Islands\Products\ProductsProps;
use Filament\Pages\Page;

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
{{-- resources/views/islands/products.blade.php --}}
<x-filament-panels::page>
    <x-island name="Products" :props="$islandProps" />
</x-filament-panels::page>
```

Livewire morphs around the mount element rather than through it; keep the `<x-island>` tag
inside a plain `<div>` so Livewire has a stable node to diff.

## Navigating Without a Page Load

With Filament's `->spa()` — or any `wire:navigate` link — Livewire swaps the body instead of
loading a page, and the runtime follows along:

- On `livewire:navigating` every island is unmounted before the swap. Composables clean up
  behind it: Echo channels are left, window listeners and history handlers removed. Livewire
  stores the page for the back button right after that point, so the snapshot holds empty
  mount elements rather than a dead copy of the rendered islands.
- On `livewire:navigated` the islands of the new page mount, and an island whose element a
  Livewire morph removed in between is unmounted.
- A back or forward step that Livewire restores from its snapshot mounts the islands again
  from the restored markup.

Nothing has to be configured. Without navigate events the runtime behaves as on a classic
page load. A datagrid's history entries carry Livewire's navigation state as well, so a
back step into a filtered table works from another page, and a step that changes only the
table's own parameters is answered by the table itself — see
[Table State](https://aaix.github.io/laravel-islands-datagrid/table-state#the-url).

::: tip Multiple islands per page
A page may carry any number of islands. Each is its own Vue application — a dashboard
built from four widgets is four islands, and one of them failing to resolve does not affect
the other three.
:::

## The Setup Hook

Because every island is a separate Vue application, plugins, global components and
application-wide provides must be registered per app. `startVueIslands()` accepts a
`setup` callback that runs for each island before it mounts:

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';
import { BUTTON_DEFAULTS_KEY } from '@aaix/laravel-islands/vue/helpers';

startVueIslands(registry, {
    setup(app, payload) {
        app.provide(BUTTON_DEFAULTS_KEY, { shape: 'pill' });
        app.config.errorHandler = (error) => reportToSentry(error, payload);
    },
});
```

`app` is the Vue application instance, `payload` the parsed island payload. Whatever a
Vue plugin would normally do in `main.js` belongs here.

## Other Frameworks

The core is framework-agnostic. `registerAdapter(name, (element, payload) => …)` from
`@aaix/laravel-islands` registers a mount function under a name, `<x-island adapter="react">`
selects it, and `startIslands()` scans the page. The payload shape is the one shown above;
`createEchoController()` gives an adapter the same channel handling the Vue composables use.
