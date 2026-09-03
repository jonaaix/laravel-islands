# Installation

## Composer & npm

```bash
composer require aaix/laravel-islands
npm install vue @vitejs/plugin-vue
```

The service provider is discovered automatically. The frontend ships as plain sources
inside the Composer package; your Vite build compiles them.

## Vite

```js
// vite.config.js
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [laravel({ /* … */ }), vue()],
    resolve: {
        alias: {
            '@aaix/laravel-islands': fileURLToPath(
                new URL('./vendor/aaix/laravel-islands/resources/js', import.meta.url),
            ),
        },
    },
});
```

| Import | Contents |
| --- | --- |
| `@aaix/laravel-islands/vue` | `startVueIslands` and the composables |
| `@aaix/laravel-islands/vue/helpers` | the optional [UI helpers](/helpers) |
| `@aaix/laravel-islands` | the framework-agnostic core |

## App Entry

Register the islands and start the runtime once:

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';

const featureIslands = Object.fromEntries(
    Object.entries(import.meta.glob('../../app/Islands/**/*.island.vue', { eager: true }))
        .map(([path, module]) => [`./islands/${path.split('/').pop()}`, module]),
);

startVueIslands({
    ...import.meta.glob('./islands/**/*.island.vue', { eager: true }),
    ...featureIslands,
});
```

The first glob covers lone components under `resources/js/islands`; the second registers
the feature folders under `app/Islands` by their entry file's basename, so
`<x-island name="Products">` finds `app/Islands/Products/Products.island.vue`. The runtime
mounts again after `livewire:navigated`, so islands work inside Filament.

## Tailwind

Only for the UI helpers. Register the package as a source, or its classes are purged:

```css
/* resources/css/app.css */
@source '../../vendor/aaix/laravel-islands/resources/js/**/*';
```

The helpers use a `primary-*` colour scale and the `dark:` variant, both present in a
Filament panel.
