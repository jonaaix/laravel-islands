# Real-Time Models

An island can keep a model current across every open tab: the model broadcasts its
lifecycle on a private channel, the page hands it to the island, and `useModel()`
reconciles the state when an event arrives.

## Model

```php
use Aaix\LaravelIslands\Concerns\InteractsWithIslands;

class ShopOrder extends Model
{
    use InteractsWithIslands;
}
```

The trait wraps Laravel's `BroadcastsEvents`: `created`, `updated` and `deleted` go out on
the private channel `App.Models.ShopOrder.{id}` — the same name `<x-island>` writes into
the payload. When broadcasting is not configured, events are skipped with a log warning
instead of failing the request.

Authorize the channel as usual:

```php
Broadcast::channel('App.Models.ShopOrder.{id}', fn (User $user, int $id) => $user->can('view', ShopOrder::findOrFail($id)));
```

## Page

```blade
<x-island name="OrderView" :subscribe="$order" />
<x-island name="OrderView" :subscribe="['order' => $order, 'customer' => $order->customer]" />
```

A single model is keyed by its class name in camelCase (`shopOrder`); an array chooses
the keys. The model's array form is added to the props under the same key unless you
passed a prop of that name.

## Component

```vue
<script setup>
import { useModel } from '@aaix/laravel-islands/vue';

const { data: order, isDeleted } = useModel('order');
</script>
```

`data` starts as the prop and is merged with every `updated` payload; `deleted` sets
`isDeleted`. Pass `refetch: () => loadOrder()` to reload from your own endpoint instead
of merging the raw attributes, or `onUpdate(event, data)` for full control. Without
`window.Echo`, the island renders once and stays static.

For channels that are not a model, `useEcho().privateChannel(name)` joins one and leaves
it again on unmount.
