# Routes & Controllers

An island that reads or writes talks to endpoints of its own. The package discovers them
per island, registers them under a predictable prefix and leaves everything inside the
controller to you.

## Route Discovery

At boot, the service provider scans one level of directories under `app/Islands` (the
configured `path`). Every directory containing a `Routes.php` is registered as a group:

```php
Route::middleware(['web', 'auth'])
    ->prefix('islands/shop-orders')
    ->name('islands.shop-orders.')
    ->group('app/Islands/ShopOrders/Routes.php');
```

The slug is the folder name in kebab-case. So for a folder `ShopOrders`:

| | |
| --- | --- |
| URL prefix | `/islands/shop-orders` |
| Route name prefix | `islands.shop-orders.` |
| Middleware | `web`, `auth` |

All three are configurable — see [Configuration](/configuration). The file name is fixed
per application and cannot be moved into a subfolder. Discovery runs at boot, so a new
island is picked up on the next request; if you cache routes, run `route:cache` again.

## Guarding an Island

An island endpoint is an HTTP route like any other. Two separate things decide who gets an
answer from it:

**Who may reach it** is the group middleware, and `auth` is in it from the start — see
[Authentication](/configuration#authentication). An island that belongs on a public page
opts out in its own `Routes.php`:

```php
Route::get('data', [PricingIslandController::class, 'data'])->withoutMiddleware('auth');
```

**Who may see this island's data** is the controller's job, and the package leaves it to
you. `make:island` scaffolds `authorizeAccess()` with an empty body — an endpoint whose
guard is still empty answers every user the middleware let through, which on a shared login
is all of them. Fill it in before the island ships; [The Island
Controller](#the-island-controller) shows the shape.

## Registering the Routes Elsewhere

Discovery is one way to get island routes registered, not the only one. An application that
needs them inside a route group of its own turns discovery off and registers the same
groups itself:

```php
// config/laravel-islands.php
'routes' => ['enabled' => false, /* … */],
```

`IslandRoutes::discover()` hands over what discovery found — slug to route file — and
`IslandRoutes::register()` builds the groups the way discovery would, with prefix and name
from the configuration. Neither the directory scan nor the naming has to be reproduced:

```php
use Aaix\LaravelIslands\IslandRoutes;

$islands = IslandRoutes::discover();
$public = array_intersect_key($islands, array_flip(['pricing-form', 'contact-form']));

IslandRoutes::register($public, 'web');
IslandRoutes::register(array_diff_key($islands, $public), ['web', 'auth', 'verified']);
```

Islands inside a Filament panel do not need this — the panel registers them through the
[plugin](#inside-a-filament-panel).

### Inside a Filament Panel

An island inside a panel belongs to the panel's routes: behind the panel's own
authentication and, where the panel has tenancy, inside the tenant segment. Filament
identifies the tenant only on a route that carries the `{tenant}` parameter — on a route
registered outside the panel, `Filament::getTenant()` is `null`, tenant scopes never apply
and a created record gets no tenant id.

The package ships a plugin that registers the islands where they belong:

```php
use Aaix\LaravelIslands\Filament\IslandsPlugin;

$panel->plugin(IslandsPlugin::make());
```

Every discovered island is registered through the panel's `authenticatedTenantRoutes()`
hook — behind the panel's `authMiddleware()`, and inside the tenant group when there is one.
An island the panel takes is left out of discovery, so it answers under the panel's URL
only. `only()` and `except()` narrow the set; what stays out is registered by discovery as
before:

```php
$panel->plugin(IslandsPlugin::make()->except(['pricing-form', 'contact-form']));
```

Inside the panel, three things change for the island:

| | Discovery | Panel |
| --- | --- | --- |
| URL | `/islands/shop-orders/data` | `/admin/{tenant}/islands/shop-orders/data` |
| Route name | `islands.shop-orders.data` | `filament.admin.islands.shop-orders.data` |
| Middleware | `routes.middleware` | the panel's middleware, `authMiddleware()` and tenant middleware |

`routes.prefix` is appended to the panel path. A prefix that repeats the panel path —
`admin/islands` under a panel at `admin` — therefore doubles it; keep the prefix bare
where the panel supplies the path.

Because the name changes, a bare `route('islands.shop-orders.data')` finds nothing inside a
panel. `IslandRoutes::route()` resolves the island wherever its routes are registered —
through the panel with the current tenant filled in, or globally — and is what the
scaffolded [props class](/props) uses:

```php
'dataUrl' => IslandRoutes::route('shop-orders', 'data'),
'orderUrl' => IslandRoutes::route('shop-orders', 'show', ['order' => '__ID__']),
```

## `Routes.php`

Inside the file, routes are relative to the group. The scaffolded version:

```php
<?php

declare(strict_types=1);

use App\Islands\ShopOrders\ShopOrdersIslandController;
use Illuminate\Support\Facades\Route;

Route::get('data', [ShopOrdersIslandController::class, 'data'])->name('data');
```

A grown island adds what it needs:

```php
Route::get('data', [ShopOrdersIslandController::class, 'data'])->name('data');
Route::get('{order}', [ShopOrdersIslandController::class, 'show'])->name('show');
Route::patch('{order}/note', [ShopOrdersIslandController::class, 'updateNote'])->name('note');
Route::put('preferences', [ShopOrdersIslandController::class, 'storePreferences'])->name('preferences');
```

The route names resolve to `islands.shop-orders.data`, `islands.shop-orders.show` and so on,
which is what the [props class](/props) hands to the component.

## The Island Controller

One controller per island, at the folder root. Its job is narrow: authorize, validate,
delegate, respond. Queries go into `Queries/`, writes into `Writers/`:

```php
<?php

declare(strict_types=1);

namespace App\Islands\ShopOrders;

use App\Islands\ShopOrders\Queries\ShopOrdersQuery;
use App\Islands\ShopOrders\Writers\OrderNoteWriter;
use App\Models\ShopOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ShopOrdersIslandController extends Controller
{
    public function __construct(
        private readonly ShopOrdersQuery $query,
        private readonly OrderNoteWriter $notes,
    ) {}

    public function data(Request $request): JsonResponse
    {
        $this->authorizeAccess();

        return response()->json(['data' => $this->query->data($request)]);
    }

    public function updateNote(Request $request, ShopOrder $order): JsonResponse
    {
        $this->authorizeAccess();

        $validated = $request->validate(['note' => ['nullable', 'string', 'max:2000']]);

        return response()->json(['data' => $this->notes->update($order, $validated['note'])]);
    }

    private function authorizeAccess(): void
    {
        if (! auth()->user()?->can('orders.view')) {
            throw new AccessDeniedHttpException();
        }
    }
}
```

::: danger Authorization is yours
The middleware settles who is logged in, never who may see this island. A scaffolded
endpoint answers every signed-in user until `authorizeAccess()` is filled in. Do that before
the island shows real data.
:::

## Response Shape

Island endpoints answer with JSON under a `data` key:

```json
{ "data": { "rows": [], "meta": {} } }
```

The envelope keeps the top level free for anything a response may need later, and the
[datagrid package](https://jonaaix.github.io/laravel-islands-datagrid/) expects the same
shape. Errors follow Laravel's conventions: a validation failure is a 422 with an `errors`
map, a refused access a 403.

## Validating Input From the URL

Sort column, page, filters — everything that arrives in the query string is user input.
Whitelist it in the query class that applies it and fall back rather than fail:

```php
$sort = in_array($request->query('sort'), self::SORTABLE, true) ? $request->query('sort') : 'updated_at';
$dir = $request->query('dir') === 'asc' ? 'asc' : 'desc';
$perPage = min(max((int) $request->query('perPage', 30), 5), 200);
```

## CSRF

The routes run inside `web`, so a `POST`, `PUT`, `PATCH` or `DELETE` needs the CSRF token
like any other request. axios reads the `XSRF-TOKEN` cookie automatically; with `fetch`,
send `X-CSRF-TOKEN` from the `csrf-token` meta tag.
