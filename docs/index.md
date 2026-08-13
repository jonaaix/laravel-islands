---
layout: home

hero:
  name: Laravel Islands
  text: Server-driven components, everywhere.
  tagline: Mount self-contained frontend components into any Blade or Filament page, hydrate them with server-driven props, and get real-time model subscriptions over Laravel Echo — framework-agnostic core with a Vue adapter today.
  image:
    src: /logo.svg
    alt: Laravel Islands
  actions:
    - theme: brand
      text: Get Started
      link: /installation-and-usage
    - theme: alt
      text: View on GitHub
      link: https://github.com/jonaaix/laravel-islands
---

```bash
composer require aaix/laravel-islands
```

## Concept

An **island** is a self-contained frontend component that a Blade or Filament
page mounts through a single tag. Its props come from the server, and if you
hand it a model, the runtime subscribes to that model's broadcast channel and
keeps the client in sync — no glue code in the page.

## What the package owns

**`<x-island>`** serializes props, resolves broadcast channels, emits the
markup the runtime looks for.

**The JS runtime** (`startIslands` plus composables) mounts every
`[data-island]` element it finds, hydrates it with the server props, and
opens the subscriptions.

## What stays in your application

The `*.island.vue` files. Domain rules. Page layout. The package supplies the
plumbing every island shares — it does not decide what your island looks like.
