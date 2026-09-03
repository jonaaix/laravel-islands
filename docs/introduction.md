# Introduction

Laravel Islands lets you drop self-contained Vue components — *islands* — into any Blade or
Filament page. The page stays server-rendered; the island takes over one region of it,
starts with data the server hands it, talks to its own endpoints, and can keep a model in
sync over Laravel Echo. Nothing in the surrounding page needs to know how the island works.

## What Is an Island?

An island is a Vue component that a page mounts through a single Blade tag:

```blade
<x-island name="ShopOrders" :props="$islandProps" />
```

Three things happen behind that tag:

1. **The server serialises a payload.** Your props, the broadcast channels of any model you
   hand over, the current locale and the JSON translation lines are encoded into the mount
   element's `data-*` attributes.
2. **The runtime mounts the component.** `startVueIslands()` scans the DOM for mount
   elements, finds the matching `*.island.vue` file in your registry and creates a Vue
   application for each one.
3. **The island runs on its own.** It reads the props, calls the endpoints those props
   point at, subscribes to its models, and never reloads the page.

Every island is its own Vue application. Two islands on one page do not share state,
providers or plugins unless you give them the same [setup hook](/mounting#the-setup-hook).

![A settings page built as a single island: sections, fields and inline save state](/screenshots/free-view.webp)

## When to Reach for an Island

Laravel has more than one way to put interactivity on a page. Islands fit best when a
region of a page needs **its own state, its own server data and its own lifecycle**:

- A list view with search, filters, sorting and pagination, where the URL should carry the
  view and the toolbar should stay responsive while rows load.
- A record page whose values are edited in place and whose stock figure should update the
  moment another user books a movement.
- A settings panel that saves each field as it changes and reports the result inline.

Where a toggle, a modal or a bit of local UI state is all you need, Alpine or Livewire
inside the page is simpler. Where the whole page is the app, Inertia is the better fit.
Islands sit between those two: full Vue where it pays off, plain Blade everywhere else —
including inside Filament panels, where a custom page is often just one island.

![A record view built from several islands and helpers inside a Filament page](/screenshots/product-view.webp)

## What the Package Owns

- **`<x-island>`** — the Blade component that serialises props, resolves subscriptions and
  translations, and renders the mount element.
- **Route discovery** — every island folder may carry a `Routes.php`, and the package
  registers it under a prefix and name of its own.
- **`make:island`** — the scaffolder that writes the component, controller, props class,
  routes and role folders in one go.
- **`islands:translations`** — the extractor that collects every `t()` key and adds the
  missing ones to the JSON translation file.
- **`InteractsWithIslands`** — a model trait that broadcasts lifecycle events on a channel
  the runtime can find.
- **The runtime** — `startVueIslands()` and the composables `useIsland`, `useModel`,
  `useEcho`, `useTranslations`, `useViewWidth` and `useSortableTiles`.
- **Optional UI helpers** — a set of Vue components behind a separate entry point.

## What Stays With You

The `*.island.vue` files, the queries behind the endpoints, the authorization rules, the
page layout and the icon set. The package supplies the plumbing every island shares. It
does not decide what an island looks like or what it may show.

## Requirements

| | |
| --- | --- |
| PHP | 8.3 or newer |
| Laravel | 12 or 13 |
| Vue | 3.4 or newer |
| Build | Vite with `@vitejs/plugin-vue` |
| Tailwind CSS | 4 — only for the [UI helpers](/helpers/) |
| Laravel Echo | 1.16 or 2 — only for [real-time models](/realtime) |

## Next Steps

- [Installation](/installation) — Composer, npm, Vite and the app entry.
- [Quickstart](/quickstart) — a working island in five minutes.
- [Directory Structure](/directory-structure) — what `make:island` scaffolds and why.
