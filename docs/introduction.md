# Introduction

An **island** is a self-contained Vue component that a Blade or Filament page mounts
through one tag. The page stays server-rendered; the island takes over one region, starts
with data the server hands it, talks to its own endpoints and can keep a model in sync
over Laravel Echo.

```blade
<x-island name="ShopOrders" :props="$islandProps" />
```

Behind that tag, the server serialises the props into the mount element, the runtime
finds the matching `*.island.vue` file and creates a Vue application for it. Every island
on a page is its own app.

## When to Use It

Islands fit a region of a page that needs **its own state, its own server data and its
own lifecycle** — a list with filters and pagination, a record page with in-place editing,
a settings panel. For a toggle or a modal inside a page, Alpine or Livewire is simpler;
for a whole single-page app, Inertia is the better fit.

## What the Package Provides

- `<x-island>` — serialises props, resolves subscriptions and translations, renders the mount element.
- Route discovery — each island folder may carry a `Routes.php`.
- `make:island` — scaffolds component, controller, props class, routes and folders.
- `InteractsWithIslands` — a model trait that broadcasts changes to the island.
- `islands:translations` — collects the `t()` keys into the JSON translation file.
- The runtime: `startVueIslands()` and the composables.
- Optional UI helpers: buttons, fields, modals, comboboxes, toasts.

Your `.island.vue` files, queries, authorization rules and layout stay with you.

## Requirements

| | |
| --- | --- |
| PHP | 8.3 or newer |
| Laravel | 12 or 13 |
| Vue | 3.4 or newer, built with Vite and `@vitejs/plugin-vue` |
| Tailwind CSS 4 | only for the UI helpers |
| Laravel Echo | only for real-time models |
