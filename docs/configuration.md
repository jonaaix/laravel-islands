# Configuration

Publish the config file to change any of the defaults:

```bash
php artisan vendor:publish --tag=laravel-islands-config
```

```php
// config/laravel-islands.php
return [
    'broadcast_auth_endpoint' => '/broadcasting/auth',

    'translations' => [
        'enabled' => true,
    ],

    'path' => 'app/Islands',
    'namespace' => 'App\\Islands',

    'routes' => [
        'enabled' => true,
        'file' => 'Routes.php',
        'prefix' => 'islands',
        'name' => 'islands.',
        'middleware' => ['web', 'auth'],
    ],
];
```

## Reference

| Key | Default | Meaning |
| --- | --- | --- |
| `translations.enabled` | `true` | Ship the JSON translation lines of the current locale with every island payload. See [Translations](/translations). |
| `path` | `app/Islands` | The directory, relative to the project root, that holds one folder per island. Read by route discovery and `make:island`. |
| `namespace` | `App\Islands` | The namespace the island classes live under. Used by `make:island` for the generated files. Must match the PSR-4 mapping of `path`. |
| `routes.enabled` | `true` | Discover and register each island's route file. Turn it off to register them from a route group of your own — see [Registering the Routes Elsewhere](/routes-and-controllers#registering-the-routes-elsewhere). |
| `routes.file` | `Routes.php` | The file name looked for at each island root. Global — it cannot vary per island. |
| `routes.prefix` | `islands` | The URL prefix. The island's slug is appended: `islands/shop-orders`. |
| `routes.name` | `islands.` | The route name prefix. The slug and a dot are appended: `islands.shop-orders.`. |
| `routes.middleware` | `['web', 'auth']` | The middleware applied to every island route group. An island starts behind a login; see [Authentication](#authentication). |
| `broadcast_auth_endpoint` | `/broadcasting/auth` | Reserved for the runtime. Channel authorization is currently handled by your Echo configuration. |

## Moving the Islands Directory

`path` and `namespace` change together. A project that keeps islands inside a module:

```php
'path' => 'modules/Shop/Islands',
'namespace' => 'Modules\\Shop\\Islands',
```

Vite needs to know as well — adjust the feature-folder glob in your
[app entry](/installation#registering-feature-folders).

## Authentication

An island endpoint is an HTTP route like any other, so `auth` is in the group middleware
from the start and every island is behind a login.

An island that belongs on a public page opts out on its own route — the exception then sits
where it applies, rather than the rule being invisible:

```php
Route::get('data', [PricingIslandController::class, 'data'])->withoutMiddleware('auth');
```

Dropping `auth` from the group opens every island at once, which is worth doing only in an
application that has no private ones:

```php
'routes' => [
    'middleware' => ['web'],
],
```

Islands inside a Filament panel need the panel's own middleware instead, and a panel with
tenancy needs its routes registered by the panel altogether — see [Inside a Filament
Panel](/routes-and-controllers#inside-a-filament-panel).

Who may reach an island is only half of it. What the island then hands back is the
controller's decision — see [Guarding an Island](/routes-and-controllers#guarding-an-island).
