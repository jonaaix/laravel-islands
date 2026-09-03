# Composables

Everything below is exported from `@aaix/laravel-islands/vue` and works inside any
component of an island, not only the root.

```js
import { useIsland, useTranslations, useModel, useEcho, useViewWidth, useSortableTiles } from '@aaix/laravel-islands/vue';
```

## `useIsland()`

The payload the server sent, unchanged.

```js
const island = useIsland();

island.props;                 // what <x-island :props="..."> carried
island._island.locale;        // the request's locale, e.g. 'de'
island._island.subscriptions; // channel and events per subscribed model
island._island.translations;  // the lines t() reads
```

Props also arrive as ordinary component props on the root; reach for `useIsland()` when a
nested component needs them, or when you need the metadata around them. The object is a
plain snapshot, not reactive.

## `useTranslations()`

```js
const { t } = useTranslations();

t('Delete :count products', { count: 12 });
```

Looks the key up in the shipped lines, falls back to the key, and replaces `:token`
placeholders. See [Translations](/translations).

## `useModel(key, options)`

A subscribed model that keeps itself current.

```js
const { data: order, isDeleted } = useModel('order', {
    refetch: () => loadOrder(),
});
```

| Argument | Meaning |
| --- | --- |
| `key` | The subscription key: the array key given to `:subscribe`, or the camelCase class name when a single model was passed. |
| `options.onUpdate(event, data)` | Full control: the broadcast arrives, you decide what `data` becomes. |
| `options.refetch()` | Ignore the payload and reload from your own endpoint; the resolved value becomes `data`. |

| Returns | Meaning |
| --- | --- |
| `data` | A ref starting as `props[key]`, updated on every `updated` event. |
| `isDeleted` | A ref that turns `true` on the `deleted` event. |

Without `onUpdate` or `refetch`, the broadcast payload is merged into `data`. When the
island was rendered without a subscription for the key, or `window.Echo` is absent, `data`
simply keeps its initial value. See [Real-Time Models](/realtime).

## `useEcho()`

The connection itself, for events that are not a model.

```js
const { echo, privateChannel, leaveAll } = useEcho();

privateChannel('imports.42').listen('ImportProgressed', handle);
```

| Returns | Meaning |
| --- | --- |
| `echo` | `window.Echo`, or `null` when it is not initialised. |
| `privateChannel(name)` | Joins a private channel and remembers it. |
| `leaveAll()` | Leaves every remembered channel. Called automatically before the component unmounts. |

## `useViewWidth(options)`

Gives an island a maximum width and tells it how much room its parent offers. Every
full-page island root uses it instead of a `max-w-*` class, so all views share one measure
and a view can widen itself when a side panel docks.

```vue
<script setup>
import { useViewWidth } from '@aaix/laravel-islands/vue';

const { root, rootStyle, availableWidth } = useViewWidth();
</script>

<template>
    <div ref="root" :style="rootStyle" class="island-view products-view">
        …
    </div>
</template>
```

| Option | Default | Meaning |
| --- | --- | --- |
| `baseWidth` | `1536` (`VIEW_BASE_WIDTH`) | The width the view is designed for, in pixels. |
| `extraWidth` | `null` | A ref of extra pixels to add — a docked panel's width, for example. |

| Returns | Meaning |
| --- | --- |
| `root` | Bind it to the view's root element with `ref="root"`. |
| `rootStyle` | `{ maxWidth, '--table-toolbar-h' }` — bind with `:style`. |
| `availableWidth` | A ref with the parent element's current width, kept current by a `ResizeObserver`. Use it to decide when a layout is "narrow" instead of guessing from media queries. |

`VIEW_BASE_WIDTH` and `VIEW_TOOLBAR_HEIGHT` (`'61px'`) are exported alongside for code
that needs the same constants. See [Layout & Styling](/styling).

## `useSortableTiles(options)`

Pointer-driven reordering for a strip or grid of tiles — photos, cards, chips. The tile
follows the pointer, the others open a gap as a preview, and the list is reordered as the
pointer travels rather than once on release.

```vue
<script setup>
import { ref, computed } from 'vue';
import { useSortableTiles } from '@aaix/laravel-islands/vue';

const container = ref(null);
const photos = ref([...]);

const tiles = useSortableTiles({
    container,
    list: photos,
    attribute: 'data-tile',
    onReorder: (ordered) => save(ordered.map((photo) => photo.id)),
    enabled: computed(() => photos.value.length > 1),
});
</script>

<template>
    <div ref="container" class="flex gap-2" @pointermove="tiles.move" @pointerup="tiles.drop" @pointercancel="tiles.cancel">
        <div
            v-for="(photo, index) in photos"
            :key="photo.id"
            :data-tile="photo.id"
            :style="tiles.styleFor(index)"
            @pointerdown="tiles.grab(index, $event)"
        >
            <img :src="photo.thumb" alt="">
        </div>
    </div>
</template>
```

| Option | Default | Meaning |
| --- | --- | --- |
| `container` | required | Ref of the element the tiles sit in. Pointer capture is taken here, because a tile that moves loses its own capture. |
| `list` | required | Ref of the array to reorder. It is reordered **in place** during the drag. |
| `attribute` | `'data-tile'` | The attribute that marks a tile. |
| `onReorder(list)` | `null` | Called with the final order once the drop has settled. |
| `enabled` | `null` (always) | A ref or getter; dragging is ignored while it is false. |

| Returns | Meaning |
| --- | --- |
| `grab(index, event)`, `move(event)`, `drop(event)`, `cancel()` | The handlers to wire to pointer events. |
| `styleFor(index)` | The inline style for a tile: the held one follows the pointer without a transition, the rest may animate. |
| `held(index)`, `settlingAt(index)` | Whether a tile is the one being dragged, or the one settling into place after a drop. |
| `heldIndex`, `heldOffset`, `settling`, `settleIndex` | The underlying refs, for custom rendering. |
| `measureSlots()` | Re-measure the grid, for the rare case where tiles change size mid-drag. |

Because the list is reordered before `onReorder` runs, the strip never snaps back while
the save request is in flight. A drag starts with the primary button only.
