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

The package brings its own Vite plugin. Register it, and the import names resolve
themselves:

```js
// vite.config.js
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import islands from './vendor/aaix/laravel-islands/vite.js';

export default defineConfig({
    plugins: [
        laravel({ input: ['resources/css/app.css', 'resources/js/app.js'], refresh: true }),
        vue(),
        islands(),
    ],
});
```

The plugin reads the package's own entry points, so a name can never drift out of step with
the sources. Three of them are public:

| Import | Contents |
| --- | --- |
| `@aaix/laravel-islands` | the framework-agnostic core: `startIslands`, `registerAdapter`, `mountIslands`, `createEchoController` |
| `@aaix/laravel-islands/vue` | the Vue adapter: `startVueIslands` and the composables |
| `@aaix/laravel-islands/vue/helpers` | the optional [UI helpers](/helpers/) |

### Developing the package locally

When the package is wired in as a Composer path repository, the plugin finds that working
copy through your `composer.json` and uses it instead of the copy under `vendor/`. Nothing
to configure — the same one line covers development and production.

## The App Entry

Register your islands and start the runtime once, in your application's entry file:

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands(import.meta.glob('./islands/**/*.island.vue'));
```

`startVueIslands()` mounts every `[data-island]` element on the page and mounts again
after `livewire:navigated`, so islands keep working across Livewire and Filament
navigation.

### Eager or Lazy

The glob above is lazy: it hands over one loader per island, and only the island a page
actually mounts is fetched. With `{ eager: true }` every island becomes part of the entry
bundle instead — the component is there the moment the page is, at the cost of shipping all
of them to every page. An application with a handful of islands can stay eager; from a dozen
on, lazy is what keeps a page from loading the code of every other view.

### Registering Feature Folders

The glob above covers lone components under `resources/js/islands`. Islands scaffolded by
`make:island` live in `app/Islands/<Island>/` instead, next to their PHP. Add a second glob
and normalise its keys so the entry file's basename becomes the mount name:

```js
// resources/js/app.js
import { startVueIslands } from '@aaix/laravel-islands/vue';

const featureIslands = Object.fromEntries(
    Object.entries(import.meta.glob('../../app/Islands/**/*.island.vue'))
        .map(([path, loader]) => [`./islands/${path.split('/').pop()}`, loader]),
);

startVueIslands({
    ...import.meta.glob('./islands/**/*.island.vue'),
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
