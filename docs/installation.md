# Installation

## Composer

```bash
composer require aaix/laravel-islands
```

The service provider is discovered automatically. It registers the `<x-island>` Blade
component, the `make:island` command and the per-island route files. There are no
migrations to run.

## npm

The frontend half ships as plain `.vue` and `.js` sources inside the same Composer package —
there is no separate npm release and no build step of its own. Your Vite build compiles
them along with your application. Install Vue and its Vite plugin if you have not yet:

```bash
npm install vue @vitejs/plugin-vue
```

Laravel Echo is only needed for [real-time models](/realtime); the runtime warns once and
carries on when `window.Echo` is missing.

## Vite

Point the import name at the sources under `vendor/`:

```js
// vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        laravel({ input: ['resources/css/app.css', 'resources/js/app.js'], refresh: true }),
        vue(),
    ],
    resolve: {
        alias: {
            '@aaix/laravel-islands': fileURLToPath(
                new URL('./vendor/aaix/laravel-islands/resources/js', import.meta.url),
            ),
        },
    },
});
```

Three entry points hang off that alias:

| Import | Contents |
| --- | --- |
| `@aaix/laravel-islands` | the framework-agnostic core: `startIslands`, `registerAdapter`, `mountIslands`, `createEchoController` |
| `@aaix/laravel-islands/vue` | the Vue adapter: `startVueIslands` and the composables |
| `@aaix/laravel-islands/vue/helpers` | the optional [UI helpers](/helpers/) |

## The App Entry

Register your islands and start the runtime once, in your application's entry file:

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands(import.meta.glob('./islands/**/*.island.vue', { eager: true }));
```

`startVueIslands()` mounts every `[data-island]` element on the page and mounts again
after `livewire:navigated`, so islands keep working across Livewire and Filament
navigation.

### Registering Feature Folders

The glob above covers lone components under `resources/js/islands`. Islands scaffolded by
`make:island` live in `app/Islands/<Island>/` instead, next to their PHP. Add a second glob
and normalise its keys so the entry file's basename becomes the mount name:

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

With that in place `<x-island name="Products">` resolves to
`app/Islands/Products/Products.island.vue`. Two islands must not share an entry file name.
How the lookup works is described under [Mounting Islands](/mounting#resolving-the-component).

## Tailwind

Only needed if you use the [UI helpers](/helpers/). They carry Tailwind utility classes,
and Tailwind only generates classes it can see. Register the package as a source:

```css
/* resources/css/app.css */
@import 'tailwindcss';

@source '../../vendor/aaix/laravel-islands/resources/js/**/*';
```

The helpers use a `primary-*` colour scale and the `dark:` variant. Both exist in a
Filament panel out of the box; in a plain Laravel app, define the scale in your theme.

## Publishing

Both are optional:

```bash
php artisan vendor:publish --tag=laravel-islands-config
php artisan vendor:publish --tag=laravel-islands-stubs
```

The config file is described under [Configuration](/configuration); the stubs under
[Directory Structure](/directory-structure#customising-the-stubs).
