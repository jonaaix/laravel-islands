# Composables

All from `@aaix/laravel-islands/vue`, all usable inside any island component.

## useIsland

The payload the server sent, unchanged.

```js
import { useIsland } from '@aaix/laravel-islands/vue';

const island = useIsland();

island.props;                 // what <x-island :props="..."> carried
island._island.locale;        // the request's locale
island._island.subscriptions; // channel and events per subscribed model
island._island.translations;  // the lines t() reads
```

Props also arrive as ordinary component props; reach for `useIsland()` when you
need the metadata around them.

## useModel

A subscribed model that keeps itself current.

```js
import { useModel } from '@aaix/laravel-islands/vue';

const { data: product, isDeleted } = useModel('product');
```

`key` is the subscription key: the map key in
`<x-island :subscribe="['product' => $product]">`, or — when a single model was
handed over — its class name in camelCase, so `:subscribe="$shopOrder"` is
`useModel('shopOrder')`. It reads the initial state from the props, joins the
model's private channel on mount, and leaves it again on unmount.

| Option | Effect |
| --- | --- |
| `onUpdate(event, data)` | full control: the broadcast arrives, you decide what `data` becomes |
| `refetch()` | ignore the payload and reload from your own endpoint instead — return the fresh object |

Without either, the broadcast payload is merged into `data`. A `deleted` event
sets `isDeleted`, so a view can say so instead of showing a record that is gone.

Nothing happens when the island was rendered without a subscription, or when
`window.Echo` is absent — the island stays a static one rather than failing.

## useEcho

The connection itself, for events that are not a model.

```js
const { privateChannel } = useEcho();

privateChannel('imports.42').listen('ImportProgressed', (event) => { /* … */ });
```

Every channel joined through it is left when the island unmounts, which is the
reason to prefer it over touching `window.Echo` directly.

## useTranslations

```js
const { t } = useTranslations();

t('Delete :count products', { count: 12 });
```

English source strings are the keys, `:name` placeholders are replaced. The lines
travel in the island payload — see [translations](translations.md).

## useSortableTiles

Pointer-event dragging for a strip or grid of tiles, with a few pixels of
threshold and capture on the container.

```js
const container = ref(null);
const photos = ref([...]);

useSortableTiles({
    container,
    list: photos,
    attribute: 'data-tile',
    onReorder: (ordered) => save(ordered.map((photo) => photo.id)),
    enabled: computed(() => photos.value.length > 1),
});
```

| Argument | Meaning |
| --- | --- |
| `container` | ref of the element the tiles sit in — the capture target |
| `list` | ref of the array to reorder |
| `attribute` | the attribute carrying a tile's id, `data-tile` by default |
| `onReorder` | called with the reordered list once a drag ends |
| `enabled` | ref or getter; dragging is ignored while it is false |

The list is reordered in place before `onReorder` runs, so the strip never snaps
back while the request is in flight.
