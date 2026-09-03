# Composables

All exported from `@aaix/laravel-islands/vue`, usable in any component of an island.

## `useIsland()`

The payload the server sent, unchanged: `props`, `_island.locale`, `_island.subscriptions`,
`_island.translations`. A plain snapshot, not reactive.

## `useTranslations()`

`{ t }` — see [Translations](/translations).

## `useModel(key, options)`

A subscribed model that keeps itself current. Returns `{ data, isDeleted }`. Options:
`refetch()` to reload from your own endpoint on every update, `onUpdate(event, data)` for
full control. See [Real-Time Models](/realtime).

## `useEcho()`

`{ echo, privateChannel(name), leaveAll() }`. Every channel joined through it is left when
the component unmounts.

## `useViewWidth(options)`

Gives a full-page island its maximum width and reports the room its parent offers:

```vue
<script setup>
const { root, rootStyle, availableWidth } = useViewWidth();
</script>

<template>
    <div ref="root" :style="rootStyle" class="mx-auto w-full">…</div>
</template>
```

`rootStyle` sets `max-width` to `baseWidth` (1536px by default, plus an optional
`extraWidth` ref) and publishes `--table-toolbar-h`. `availableWidth` is kept current by
a `ResizeObserver` — use it to decide when a layout is narrow. Bind it on every list view
instead of a `max-w-*` class, so all views share one measure.

## `useSortableTiles(options)`

Pointer-driven reordering for a strip or grid of tiles. The tile follows the pointer, the
others open a gap, and the list is reordered in place as the pointer travels.

```js
const tiles = useSortableTiles({
    container,                 // ref of the element holding the tiles
    list: photos,              // ref of the array, reordered in place
    attribute: 'data-tile',    // marks a tile
    onReorder: (ordered) => save(ordered.map((photo) => photo.id)),
    enabled: computed(() => photos.value.length > 1),
});
```

Wire `tiles.grab(index, $event)` to `pointerdown` on each tile, `tiles.move`, `tiles.drop`
and `tiles.cancel` to the container, and `:style="tiles.styleFor(index)"` on each tile.
