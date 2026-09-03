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
        'middleware' => ['web'],
    ],
];
```

## Reference

| Key | Default | Meaning |
| --- | --- | --- |
| `translations.enabled` | `true` | Ship the JSON translation lines of the current locale with every island payload. See [Translations](/translations). |
| `path` | `app/Islands` | The directory, relative to the project root, that holds one folder per island. Read by route discovery and `make:island`. |
| `namespace` | `App\Islands` | The namespace the island classes live under. Used by `make:island` for the generated files. Must match the PSR-4 mapping of `path`. |
| `routes.enabled` | `true` | Discover and register each island's route file. See [Routes & Controllers](/routes-and-controllers). |
| `routes.file` | `Routes.php` | The file name looked for at each island root. Global — it cannot vary per island. |
| `routes.prefix` | `islands` | The URL prefix. The island's slug is appended: `islands/shop-orders`. |
| `routes.name` | `islands.` | The route name prefix. The slug and a dot are appended: `islands.shop-orders.`. |
| `routes.middleware` | `['web']` | The middleware applied to every island route group. Add `auth` here to require a session for all islands at once. |
| `broadcast_auth_endpoint` | `/broadcasting/auth` | Reserved for the runtime. Channel authorization is currently handled by your Echo configuration. |

## Moving the Islands Directory

`path` and `namespace` change together. A project that keeps islands inside a module:

```php
'path' => 'modules/Shop/Islands',
'namespace' => 'Modules\\Shop\\Islands',
```

Vite needs to know as well — adjust the feature-folder glob in your
[app entry](/installation#registering-feature-folders).

## Requiring Authentication Everywhere

Most islands live behind a login. Rather than repeating `auth` in every `Routes.php`, put
it in the group middleware:

```php
'routes' => [
    'middleware' => ['web', 'auth'],
],
```

Islands inside a Filament panel usually need the panel's own middleware instead. Point the
group at the panel's stack, or disable discovery and register those islands' routes from
the panel provider.
