# Island Structure

An island can be a lone `.island.vue` under `resources/js/islands`. As soon as it
owns endpoints, it earns a feature folder that holds both halves — the Vue
component and the PHP behind it.

```bash
php artisan make:island Products
```

```text
app/Islands/Products/
├── Products.island.vue            the island itself
├── ProductsIslandController.php   the only door: validate, guard, hand over
├── ProductsProps.php              what it starts up with
├── Routes.php                     its endpoints
├── Page.blade.php                 the mount point, if it owns a page
├── Queries/                       reading
├── Writers/                       writing
├── Presenters/                    a record turned into what the wire carries
├── State/                         what a user remembers: preferences, saved views
├── Support/                       the rest: URL lists, column definitions, helpers
└── Components/                    the island's own Vue components
```

The five files at the root are the wiring. Everything else belongs to a role —
that is the whole idea: the tenth file lands where the first one did.

## The roles

| Folder | Holds | Example |
| --- | --- | --- |
| `Queries/` | everything that reads, in the shape the frontend draws | `ProductsQuery`, `ProductsSearchIndexQuery` |
| `Writers/` | everything that writes, plus the exceptions it throws | `ProductWriter`, `SkuTakenException` |
| `Presenters/` | a record turned into a row, a badge, an avatar | `ProductRowPresenter`, `ProductRowActors` |
| `State/` | what a user remembers between visits | `ProductsPreferences`, `ProductViewProfiles` |
| `Support/` | the rest, in both languages | `ProductEndpoints.php`, `Columns.js` |
| `Components/` | `.vue` only, the island's own components | `ProductRow.vue` |

## Rules

- **A folder from the first file on**, not from the second. `Queries/` with one
  query beats a query at the root: the next reader — human or agent — can guess
  where something is.
- **Nothing new at the root.** If a file is not one of the five, it has a role.
- **Subfolders are namespace segments.** `Queries/ProductsQuery.php` is
  `App\Islands\Products\Queries\ProductsQuery`; moving a class means editing its
  `namespace` line and importing it where it is used.
- **`Routes.php` cannot move.** The package looks for exactly this file in each
  island directory — `routes.file` in the config renames it globally, never per
  island, and it cannot sit in a subfolder.
- **An exception lives with whoever throws it**, not in a folder of its own.
- **`Support/` is bilingual.** PHP helpers and loose `.js` modules share it;
  `Components/` is for `.vue` files.
- **One island per folder.** Two entry components in one folder means two
  features sharing a namespace — and both will want the same role folders.

## Naming

The folder decides. `make:island Products` writes `Products.island.vue`,
`ProductsIslandController`, `ProductsProps` — plural stays plural, singular stays
singular, nothing is converted. `<Island>IslandController` keeps an island's door
apart from a plain API controller of the same subject.

Per-record classes keep the singular of the thing they present:
`ProductRowPresenter` presents one row of many.

## The stubs are yours

Publish them and the generator follows the house style — a published stub wins
over the package's own:

```bash
php artisan vendor:publish --tag=laravel-islands-stubs
```

The generator creates the role folders on every island (a `.gitkeep` keeps them
in Git) and writes `Queries/<Island>Query.php` for the controller to call, so the
structure exists as an example rather than as a rule to remember.
