# Directory Structure

An island can be a single `.island.vue` file under `resources/js/islands`. The moment it
owns an endpoint, it earns a feature folder that keeps both halves together — the Vue
component and the PHP behind it — so the next reader finds everything in one place.

## The Feature Folder

```bash
php artisan make:island Products
```

```text
app/Islands/
├── @Shared/                        components and modules every island may import
└── Products/
    ├── Products.island.vue         the island itself
    ├── ProductsIslandController.php   the only door: authorize, validate, hand over
    ├── ProductsProps.php           what the island starts with
    ├── Routes.php                  its endpoints
    ├── Page.blade.php              the mount point, if it owns a page
    ├── Queries/                    reading
    │   └── ProductsQuery.php
    ├── Writers/                    writing
    ├── Presenters/                 a record turned into what the wire carries
    ├── State/                      what a user remembers: preferences, saved views
    ├── Support/                    the rest: endpoint lists, column definitions, helpers
    └── Components/                 the island's own Vue components
```

The five files at the root are the wiring. Everything else belongs to a role — that is the
whole idea: the tenth file lands where the first one did.

### The Root Files

| File | Role |
| --- | --- |
| `Products.island.vue` | The entry component. Its basename is the mount name. |
| `ProductsIslandController.php` | The single controller for the island's endpoints. It authorizes, validates and delegates — it does not query. |
| `ProductsProps.php` | Builds the initial props: endpoint URLs, the initial view state, static option lists. |
| `Routes.php` | The island's routes. Discovered automatically, see [Routes & Controllers](/routes-and-controllers). |
| `Page.blade.php` | The Blade view that renders `<x-island>`. Omit it when a Filament page or another view hosts the island. |

### The Role Folders

| Folder | Holds | Example |
| --- | --- | --- |
| `Queries/` | Everything that reads, in the shape the frontend draws | `ProductsQuery`, `ProductsSearchIndexQuery` |
| `Writers/` | Everything that writes, plus the exceptions it throws | `ProductWriter`, `SkuTakenException` |
| `Presenters/` | A record turned into a row, a badge, an avatar | `ProductRowPresenter` |
| `State/` | What a user remembers between visits | `ProductsPreferences`, `ProductsViewProfiles` |
| `Support/` | The rest, in both languages — PHP helpers and loose `.js` modules | `ProductEndpoints.php`, `Columns.js` |
| `Components/` | `.vue` only: the island's own components | `ProductRow.vue` |

`make:island` creates every role folder with a `.gitkeep`, so the structure exists as an
example rather than a rule to remember.

### `@Shared`

Components and modules used by more than one island live in `app/Islands/@Shared/`. The
generator creates the folder on first use. Alias it in Vite so imports stay short:

```js
// vite.config.js
alias: {
    '@shared': fileURLToPath(new URL('./app/Islands/@Shared', import.meta.url)),
},
```

```js
import { formatCurrency } from '@shared/format.js';
```

## Rules

- **A folder from the first file on**, not from the second. `Queries/` with one query beats
  a query at the root: the next reader — human or agent — can guess where something is.
- **Nothing new at the root.** If a file is not one of the five, it has a role.
- **Subfolders are namespace segments.** `Queries/ProductsQuery.php` is
  `App\Islands\Products\Queries\ProductsQuery`. Moving a class means editing its
  `namespace` line and its imports.
- **`Routes.php` cannot move.** The package looks for exactly this file at the island root.
  `routes.file` in the config renames it globally, never per island.
- **An exception lives with whoever throws it**, not in a folder of its own.
- **`Support/` is bilingual.** PHP helpers and `.js` modules share it; `Components/` is for
  `.vue` files.
- **One island per folder.** Two entry components in one folder means two features sharing
  a namespace — and both will want the same role folders.

## Naming

The folder decides. `make:island Products` writes `Products.island.vue`,
`ProductsIslandController` and `ProductsProps` — plural stays plural, singular stays
singular, nothing is converted. The `IslandController` suffix keeps an island's door apart
from a plain API controller of the same subject.

Per-record classes keep the singular of the thing they present: `ProductRowPresenter`
presents one row of many.

The URL slug and route name are derived from the folder in kebab-case: `ShopOrders` becomes
`islands/shop-orders` and `islands.shop-orders.`.

## Lone Components

A component that is only markup — no endpoints, no state worth a class — can stay under
`resources/js/islands/`:

```text
resources/js/islands/
└── product-view/
    └── ProductView.island.vue
```

It is mounted by its path without the suffix: `<x-island name="product-view/ProductView">`.
Nesting is allowed as deep as the glob in your app entry reaches.

## The `make:island` Command

```bash
php artisan make:island {name} [--force]
```

| Argument / option | Meaning |
| --- | --- |
| `name` | The island name in StudlyCase, e.g. `ShopOrders`. Other casings are converted. |
| `--force` | Overwrite files that already exist. Without it, existing files are kept and reported. |

The command prints what it wrote and reminds you of the two things it cannot do for you:
fill in `authorizeAccess()` and pass the props into the view.

### Customising the Stubs

Publish the stubs and the generator follows your house style — a published stub wins over
the package's own:

```bash
php artisan vendor:publish --tag=laravel-islands-stubs
```

```text
stubs/islands/
├── Controller.php.stub
├── Page.blade.php.stub
├── Props.php.stub
├── Query.php.stub
├── Routes.php.stub
└── island.vue.stub
```

The placeholders available inside a stub:

| Placeholder | Value for `make:island ShopOrders` |
| --- | --- |
| `{{ class }}`, `{{ island }}` | `ShopOrders` |
| `{{ slug }}` | `shop-orders` |
| `{{ title }}` | `Shop Orders` |
| `{{ namespace }}` | `App\Islands\ShopOrders` |
| `{{ routeName }}` | `islands.shop-orders.` |
| `{{ routePrefix }}` | `islands/shop-orders` |

The same placeholders are replaced in file names, so a stub named `{{ class }}Writer.php.stub`
would be written as `ShopOrdersWriter.php`.
