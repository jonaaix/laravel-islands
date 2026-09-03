# Endpoints & Props

## Routes

Every island folder may carry a `Routes.php`. The package registers it as a group:

| | For a folder `ShopOrders` |
| --- | --- |
| URL prefix | `/islands/shop-orders` |
| Route name prefix | `islands.shop-orders.` |
| Middleware | `web` |

```php
Route::get('data', [ShopOrdersIslandController::class, 'data'])->name('data');
Route::patch('{order}/note', [ShopOrdersIslandController::class, 'updateNote'])->name('note');
```

Prefix, name and middleware are [configurable](/configuration). Discovery runs at boot;
after `route:cache`, run it again for a new island.

## The Controller

One controller per island. It authorizes, validates and delegates — queries go into
`Queries/`, writes into `Writers/`:

```php
class ShopOrdersIslandController extends Controller
{
    public function __construct(private readonly ShopOrdersQuery $query) {}

    public function data(Request $request): JsonResponse
    {
        $this->authorizeAccess();

        return response()->json(['data' => $this->query->data($request)]);
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
Island routes carry the `web` middleware and nothing else. Fill in `authorizeAccess()`
before the island shows real data.
:::

Endpoints answer with JSON under a `data` key. Values that arrive from the URL — sort
column, page, filters — are user input; whitelist them in the query.

Because the routes run inside `web`, writes need the CSRF token like any other request:
axios reads the `XSRF-TOKEN` cookie; with `fetch`, send `X-CSRF-TOKEN` from the
`csrf-token` meta tag.

## Props

Props are what the island starts with — available before any request, so the first frame
shows real data. The props class returns an array:

```php
class ProductsProps
{
    public function build(Request $request): array
    {
        return [
            'dataUrl' => route('islands.products.data'),
            'productUrl' => route('islands.products.show', ['product' => '__ID__']),
            'brands' => $this->query->brandOptions(),
            'initial' => [
                'q' => (string) $request->query('q', ''),
            ],
        ];
    }
}
```

What belongs there: endpoint URLs generated with `route()` (a placeholder like `__ID__`
is replaced in the component), the initial view state read and validated from the URL,
per-user preferences and small option lists. Large data stays behind an endpoint.

In the component:

```js
const { props } = useIsland();

props.dataUrl;
props.initial.q;
```

Props are a snapshot, not a reactive source — copy what changes into the island's own
refs.
