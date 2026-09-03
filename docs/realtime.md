# Real-Time Models

An island can keep a model in sync with the server. The model broadcasts its lifecycle
onto a private channel, the page hands the model to the island, and `useModel()` reconciles
the component's state whenever an event arrives — in every open tab, for every user
allowed on the channel.

## Prerequisites

- Broadcasting configured with a driver (`reverb`, `pusher`, `ably`). With the `null` or
  `log` driver, or none at all, the trait below stays quiet and the island renders as a
  static one.
- Laravel Echo initialised on the page and assigned to `window.Echo`, as the default Laravel
  `bootstrap.js` does.

## Preparing the Model

```php
<?php

declare(strict_types=1);

namespace App\Models;

use Aaix\LaravelIslands\Concerns\InteractsWithIslands;
use Illuminate\Database\Eloquent\Model;

class ShopOrder extends Model
{
    use InteractsWithIslands;
}
```

The trait composes Laravel's own `BroadcastsEvents` and adds three things:

- **A channel name.** `islandChannel()` returns the class with backslashes replaced by
  dots plus the key: `App.Models.ShopOrder.42`. `<x-island>` writes the same name into the
  payload, so the two sides never disagree.
- **Automatic events.** `created`, `updated` and `deleted` broadcast on that private
  channel as `ShopOrderCreated`, `ShopOrderUpdated` and `ShopOrderDeleted`, carrying the
  model's array form under `model`.
- **A safety net.** When broadcasting is unusable — no driver, or the driver throws — the
  event is skipped with a warning in the log instead of failing the request that saved the
  model.

Override `islandChannel()` when a model should share a channel with something else, for
example its parent:

```php
public function islandChannel(): string
{
    return 'App.Models.ShopOrder.'.$this->shop_order_id;
}
```

## Authorizing the Channel

The channel is private. Authorize it in `routes/channels.php` as usual:

```php
use App\Models\ShopOrder;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.ShopOrder.{id}', function (User $user, int $id) {
    return $user->can('view', ShopOrder::findOrFail($id));
});
```

## Subscribing From the Page

Hand the model to the tag:

```blade
<x-island name="OrderView" :subscribe="$order" />
```

A single model is stored under its class name in camelCase — `shopOrder` for
`ShopOrder`. Pass an array to choose the keys yourself, or to subscribe to several models:

```blade
<x-island
    name="OrderView"
    :subscribe="['order' => $order, 'customer' => $order->customer]"
/>
```

For each subscription, the array form of the model is added to the props under the same
key — unless you passed a prop of that name, in which case yours wins. That is how an
island starts with the presented shape and still receives updates for it.

## Reading the Model in the Component

```vue
<script setup>
import { useModel } from '@aaix/laravel-islands/vue';

const { data: order, isDeleted } = useModel('order');
</script>

<template>
    <p v-if="isDeleted">{{ t('This order has been deleted.') }}</p>
    <div v-else>{{ order.number }} — {{ order.status }}</div>
</template>
```

`data` starts as the prop under that key. On mount, the composable joins the channel; on
an `updated` event it merges the broadcast payload into `data`; on `deleted` it sets
`isDeleted`. The channel is left when the component unmounts.

### Reloading Instead of Merging

The broadcast carries the model's raw attributes, which is rarely the shape a presenter
produced. Two options change what happens on an update:

```js
const { data: order } = useModel('order', {
    refetch: async () => {
        const response = await fetch(props.orderUrl, { headers: { Accept: 'application/json' } });
        return (await response.json()).data;
    },
});
```

`refetch` ignores the payload and reloads from your own endpoint; whatever it resolves
becomes `data`. For full control, `onUpdate` receives the event and the ref:

```js
useModel('order', {
    onUpdate(event, data) {
        data.value = { ...data.value, status: event.model.status };
    },
});
```

`onUpdate` takes precedence over `refetch`; without either, the payload is merged.

### Listening to Other Events

`useEcho().privateChannel(name)` joins a channel that is not a model — an import's
progress, a print queue — and leaves it again when the component unmounts:

```js
const { privateChannel } = useEcho();

privateChannel('imports.42').listen('ImportProgressed', (event) => progress.value = event.percent);
```

## When Echo Is Absent

`useModel()` and `useEcho()` check for `window.Echo` at mount time. Without it, they log
`[islands] window.Echo is not initialised — real-time disabled` once and return the
initial data unchanged. An island therefore never depends on a websocket to render; it
only gets better with one.
