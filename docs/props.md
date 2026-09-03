# Props

Props are what an island starts with. They are built on the server, serialised into the
mount element and available the moment the component mounts — before any request. Well
chosen props let an island draw its first frame with real data instead of a spinner.

## The Props Class

`make:island` writes a `<Island>Props` class with a single `build()` method. It is a plain
class — no base class, no interface — that returns an array:

```php
<?php

declare(strict_types=1);

namespace App\Islands\Products;

use App\Islands\Products\Queries\ProductsQuery;
use App\Islands\Products\State\ProductsPreferences;
use Illuminate\Http\Request;

class ProductsProps
{
    public function __construct(
        private readonly ProductsQuery $query,
        private readonly ProductsPreferences $preferences,
    ) {}

    public function build(Request $request): array
    {
        return [
            'dataUrl' => route('islands.products.data'),
            'preferencesUrl' => route('islands.products.preferences'),
            'productUrl' => route('islands.products.show', ['product' => '__ID__']),
            'preferences' => $this->preferences->for($request->user()),
            'brands' => $this->query->brandOptions(),
            'initial' => $this->initialState($request),
        ];
    }

    private function initialState(Request $request): array
    {
        return [
            'q' => (string) $request->query('q', ''),
            'sort' => in_array($request->query('sort'), ['name', 'updated_at'], true) ? $request->query('sort') : 'updated_at',
        ];
    }
}
```

The page resolves it from the container and passes the result to the tag:

```blade
<x-island name="Products" :props="app(\App\Islands\Products\ProductsProps::class)->build(request())" />
```

## What Belongs in Props

**Endpoint URLs.** Generate them with `route()` so a renamed route never breaks
JavaScript. A URL that needs a record id the client only knows later takes a placeholder
the component substitutes:

```js
const url = props.productUrl.replace('__ID__', row.id);
```

**The initial view state.** When the URL carries a query string — a shared link, a
bookmark — the props class reads and validates it, and the island renders that view on its
first frame. Validate here even though the endpoint validates again: props are the
island's second entrance.

**Per-user preferences.** Column choices, view mode, saved filters — anything the server
remembers for the user. Handing them over in props avoids a request that would otherwise
have to finish before the first draw.

**Small option lists.** The brands a filter offers, the statuses a badge can take. Large or
searchable lists stay behind an endpoint.

**The first page of data**, when the view is a list and the first paint matters more than
the payload size.

## Reading Props in the Component

Props arrive twice: as ordinary Vue props on the root component, and on the payload.

```vue
<script setup>
import { useIsland } from '@aaix/laravel-islands/vue';

const { props } = useIsland();

props.dataUrl;
props.initial.sort;
</script>
```

`useIsland()` is the way most islands read them — it needs no `defineProps()` and works
in any component below the root, since the payload is provided through the Vue app. The
root component may declare `defineProps(['dataUrl'])` instead when that reads better.

::: warning Props are a snapshot
The payload is plain data captured at render time, not a reactive source. An island
that changes its state copies what it needs into its own `ref()`s and treats the props
as the starting point.
:::

## Props and Subscriptions

When a model is handed to `:subscribe`, its array form is added to the props under the
subscription key unless a prop of that name already exists. See [Real-Time Models](/realtime).
