# Custom Adapters

The core of the package knows nothing about Vue. It finds mount elements, parses their
payload and hands both to whichever adapter the element names. The Vue adapter is one
implementation of that contract; a page may mix adapters, and a project may register its
own.

## The Core API

```js
import { registerAdapter, mountIslands, startIslands, createEchoController } from '@aaix/laravel-islands';
```

| Export | Meaning |
| --- | --- |
| `registerAdapter(name, mount)` | Registers `mount(element, payload)` under an adapter name. |
| `mountIslands()` | Scans for `[data-island]` elements not yet mounted, and mounts each with the adapter its `data-island-adapter` names. |
| `startIslands()` | Calls `mountIslands()` once and again after every `livewire:navigated` event. |
| `createEchoController()` | Wraps `window.Echo`: `privateChannel(name)` joins and remembers a channel, `leaveAll()` leaves every remembered one. |

## Writing an Adapter

An adapter is a function that receives the mount element and the parsed payload:

```js
// resources/js/islands/react-adapter.js
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { registerAdapter, startIslands } from '@aaix/laravel-islands';

export function startReactIslands(registry) {
    registerAdapter('react', (element, payload) => {
        const component = registry[`./islands/${element.dataset.island}.island.jsx`]?.default;

        if (!component) {
            console.warn(`[islands] react component not found: "${element.dataset.island}"`);
            return;
        }

        createRoot(element).render(createElement(component, { ...payload.props, island: payload }));
    });

    startIslands();
}
```

Mount points choose the adapter by name:

```blade
<x-island name="Chart" adapter="react" :props="$props" />
```

The payload shape is the one described under [Mounting Islands](/mounting#the-rendered-element):
`props` is the application's, `_island` carries subscriptions, translations and the
locale. An adapter that wants real-time behaviour uses `createEchoController()` and the
`_island.subscriptions` map the same way the Vue composables do.

## How the Vue Adapter Works

For reference, `startVueIslands(registry, options)` does exactly this:

1. Registers an adapter named `vue`.
2. For each element, resolves the component from the registry, creates a Vue app with
   `payload.props` as root props, provides the payload under an internal key that
   `useIsland()` reads, runs `options.setup(app, payload)`, and mounts.
3. Calls `startIslands()`.

Nothing in it is private in spirit — a project that needs a different mount strategy can
copy the twenty lines and register its own `vue` adapter before calling `startIslands()`.
