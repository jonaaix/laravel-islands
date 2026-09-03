# Configuration

```bash
php artisan vendor:publish --tag=laravel-islands-config
```

| Key | Default | Meaning |
| --- | --- | --- |
| `translations.enabled` | `true` | Ship the JSON translation lines with every island payload. |
| `path` | `app/Islands` | The directory holding one folder per island. Read by route discovery and `make:island`. |
| `namespace` | `App\Islands` | The namespace of the island classes. Must match the PSR-4 mapping of `path`. |
| `routes.enabled` | `true` | Discover and register each island's `Routes.php`. |
| `routes.file` | `Routes.php` | The file name looked for at each island root. |
| `routes.prefix` | `islands` | URL prefix; the island slug is appended. |
| `routes.name` | `islands.` | Route name prefix; the slug and a dot are appended. |
| `routes.middleware` | `['web']` | Middleware of every island route group. Add `auth` to require a session everywhere. |

Changing `path` also means changing the feature-folder glob in your
[app entry](/installation#app-entry).
