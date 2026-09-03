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
| `adapter` | string | `vue` | The frontend adapter that mounts this element — see [Custom Adapters](/adapters). |

Every prop must be JSON-serialisable. Pass arrays and scalars; turn a model into an array
first, ideally through a presenter so only the fields the island draws cross the wire.

## The Rendered Element

```html
<div
    data-island="ShopOrders"
    data-island-adapter="vue"
    data-island-payload="{&quot;props&quot;:{…},&quot;_island&quot;:{…}}"
></div>
```

The payload is one JSON object:

```json
{
    "props": { "dataUrl": "/islands/shop-orders/data", "initial": {} },
    "_island": {
        "subscriptions": {
            "order": {
                "channel": "App.Models.ShopOrder.42",
                "events": { "created": ".ShopOrderCreated", "updated": ".ShopOrderUpdated", "deleted": ".ShopOrderDeleted" },
                "keyName": "id",
                "key": 42
            }
        },
        "translations": { "Refresh": "Aktualisieren" },
        "locale": "de"
    }
}
```

`props` is yours. `_island` is the runtime's: it is read by `useModel()` and
`useTranslations()`, and available through `useIsland()` when you need it.

Once mounted, the runtime adds `data-island-mounted` so a second scan skips the element.

## Resolving the Component

`startVueIslands(registry)` receives the object `import.meta.glob()` produces — a map of
file paths to modules. For a `name`, it tries two keys in order:

1. `./islands/<name>.island.vue`
2. `./<name>.island.vue`

With the glob from the [installation](/installation#the-app-entry), a lone component under
`resources/js/islands/product-view/ProductView.island.vue` is therefore mounted as
`name="product-view/ProductView"`, and a feature island whose keys were normalised to the
basename is mounted as `name="Products"`.

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

The runtime listens for `livewire:navigated` and mounts again after every Filament
navigation, so an island placed inside a panel needs nothing more. Livewire morphs around
the mount element rather than through it; keep the `<x-island>` tag inside a plain `<div>`
so Livewire has a stable node to diff.

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

## Payload Size

The props travel inline in the HTML. That is what makes the first paint instant — no
request before the island can draw — and also why a list of ten thousand rows does not
belong in them. Hand over the first page and a URL for the rest. Translations are shipped
in full for the current locale; disable them for an English-only app, see
[Translations](/translations#disabling-translations).
