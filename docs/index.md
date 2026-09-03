---
layout: home

hero:
  name: Laravel Islands
  text: Server-driven components, everywhere.
  tagline: Mount self-contained Vue components into any Blade or Filament page, hydrate them with server-driven props and keep them in sync over Laravel Echo — with zero glue code in the page.
  image:
    src: /logo.svg
    alt: Laravel Islands
  actions:
    - theme: brand
      text: Get Started
      link: /introduction
    - theme: alt
      text: Quickstart
      link: /quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/jonaaix/laravel-islands

features:
  - icon: 🏝️
    title: One tag per island
    details: <code>&lt;x-island name="Products" :props="$props" /&gt;</code> serialises the props, resolves the broadcast channels and renders the mount point. The runtime does the rest.
  - icon: 📁
    title: A home for every file
    details: <code>make:island</code> scaffolds the component, its controller, props class, routes and a folder per role — so the tenth file lands where the first one did.
  - icon: ⚡
    title: Real-time by trait
    details: Add <code>InteractsWithIslands</code> to a model, hand it to the tag, and <code>useModel()</code> keeps the record current across every open tab.
  - icon: 🧩
    title: Batteries included, never required
    details: Forty-odd Tailwind-styled Vue helpers — buttons, fields, modals, comboboxes, toasts — behind their own entry point. Use them, or bring your own.
---

<div style="max-width: 640px; margin: 3rem auto 0;">

```bash
composer require aaix/laravel-islands
```

</div>
