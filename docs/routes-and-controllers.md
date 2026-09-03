# Routes & Controllers

An island that reads or writes talks to endpoints of its own. The package discovers them
per island, registers them under a predictable prefix and leaves everything inside the
controller to you.

## Route Discovery

At boot, the service provider scans one level of directories under `app/Islands` (the
configured `path`). Every directory containing a `Routes.php` is registered as a group:

```php
Route::middleware(['web'])
    ->prefix('islands/shop-orders')
    ->name('islands.shop-orders.')
    ->group('app/Islands/ShopOrders/Routes.php');
```

The slug is the folder name in kebab-case. So for a folder `ShopOrders`:

| | |
| --- | --- |
| URL prefix | `/islands/shop-orders` |
| Route name prefix | `islands.shop-orders.` |
| Middleware | `web` |

All three are configurable — see [Configuration](/configuration). The file name is fixed
per application and cannot be moved into a subfolder. Discovery runs at boot, so a new
island is picked up on the next request; if you cache routes, run `route:cache` again.

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
The package registers island routes with the `web` middleware group and nothing else. A
scaffolded endpoint answers to anyone who can reach the URL until `authorizeAccess()` is
filled in. Do that before the island shows real data.
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
