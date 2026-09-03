# Island Structure

A component that is only markup can stay under `resources/js/islands`. As soon as it owns
an endpoint, it earns a feature folder that keeps both halves together:

```bash
php artisan make:island Products
```

```text
app/Islands/Products/
├── Products.island.vue            the island itself
├── ProductsIslandController.php   the only door: authorize, validate, hand over
├── ProductsProps.php              what the island starts with
├── Routes.php                     its endpoints
├── Page.blade.php                 the mount point, if it owns a page
├── Queries/                       reading
├── Writers/                       writing, plus the exceptions it throws
├── Presenters/                    a record turned into what the wire carries
├── State/                         what a user remembers: preferences, saved views
├── Support/                       the rest: endpoint lists, helpers, loose .js
└── Components/                    the island's own Vue components
```

The five files at the root are the wiring. Everything else belongs to a role, from the
first file on — so the tenth file lands where the first one did. Shared components live
in `app/Islands/@Shared/`.

## Rules

- Nothing new at the root; a file that is not one of the five has a role.
- Subfolders are namespace segments: `Queries/ProductsQuery.php` is `App\Islands\Products\Queries\ProductsQuery`.
- `Routes.php` stays at the root under exactly that name.
- One island per folder.

## Naming

The folder decides: `make:island Products` writes `Products.island.vue`,
`ProductsIslandController`, `ProductsProps` — nothing is converted. The URL slug and route
name use the kebab-case of the folder: `ShopOrders` → `islands/shop-orders`,
`islands.shop-orders.`.

## Stubs

```bash
php artisan vendor:publish --tag=laravel-islands-stubs
```

A published stub under `stubs/islands/` wins over the package's own. Placeholders:
`{{ class }}`, `{{ slug }}`, `{{ title }}`, `{{ namespace }}`, `{{ routeName }}`,
`{{ routePrefix }}`.
