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
the sources. Four imports are public:

| Import | Contents |
| --- | --- |
| `@aaix/laravel-islands` | the framework-agnostic core: `startIslands`, `registerAdapter`, `mountIslands`, `createEchoController` |
| `@aaix/laravel-islands/vue` | the Vue adapter: `startVueIslands` and the composables |
| `@aaix/laravel-islands/vue/helpers` | the optional [UI helpers](/helpers/) |
| `@aaix/laravel-islands/islands` | every island in the island directory, ready to hand to `startVueIslands` |

The last one has no file behind it — the plugin builds it while bundling, so it exists only
where the plugin is registered.

### Developing the package locally

When the package is wired in as a Composer path repository, the plugin finds that working
copy through your `composer.json` and uses it instead of the copy under `vendor/`. Nothing
to configure — the same one line covers development and production.

## The App Entry

Register your islands and start the runtime once, in your application's entry file:

```js
// resources/js/app.js
import islands from '@aaix/laravel-islands/islands';
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands(islands);
```

`@aaix/laravel-islands/islands` is built by the Vite plugin, not by a file on disk: it
collects every `*.island.vue` under the island directory and keys each one by its entry
file name, so `<x-island name="Products">` resolves to
`app/Islands/Products/Products.island.vue`. Two islands must not share an entry file name —
the second one is skipped with a warning in the console. How the lookup works is described
under [Mounting Islands](/mounting#resolving-the-component).

`startVueIslands()` mounts every `[data-island]` element on the page and mounts again
after `livewire:navigated`, so islands keep working across Livewire and Filament
navigation.

The registry is lazy: it hands over one loader per island, and only the island a page
actually mounts is fetched. A newly scaffolded island appears without restarting the dev
server.

### A Different Island Directory

The plugin looks under `app/Islands`, the same default as `laravel-islands.path`. An
application that moved its islands passes the new path along:

```js
islands({ path: 'src/Islands' }),
```

### Registering Further Components

An island that lives outside the island directory — a lone component under
`resources/js/islands`, say — is merged in with a glob of its own:

```js
// resources/js/app.js
import islands from '@aaix/laravel-islands/islands';
import { startVueIslands } from '@aaix/laravel-islands/vue';

startVueIslands({
    ...islands,
    ...import.meta.glob('./islands/**/*.island.vue'),
});
```

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
