# Translations

Islands render on the client, so they cannot call `__()` at render time. Instead, the
package ships the application's JSON translation lines for the current locale with every
island payload and exposes them through a composable. English source strings are the keys,
exactly as in Laravel's own JSON translations.

## Usage

```vue
<script setup>
import { useTranslations } from '@aaix/laravel-islands/vue';

const { t } = useTranslations();
</script>

<template>
    <h2>{{ t('Positions') }}</h2>
    <p>{{ t('Shipped :count of :total', { count: 2, total: 5 }) }}</p>
</template>
```

`t(key, replace = {})` looks the key up in the shipped lines and falls back to the key
itself. Laravel-style `:placeholder` tokens are replaced from the second argument.

A string that never passes through `t()` can never be translated. Wrap every user-facing
string — including `aria-label`s, tooltips and the labels you pass to helper components.

## Adding a Language

Add the source strings to `lang/{locale}.json`:

```json
{
    "Positions": "Positionen",
    "Shipped :count of :total": ":count von :total versandt"
}
```

Only JSON lines are shipped; PHP translation files under `lang/{locale}/` are not. An
English-only application needs no translation file at all: every key falls through
unchanged.

## How It Works

The Vite plugin writes a manifest of the keys each island uses: starting at the island's
entry file it follows the imports — shared components, package components — and collects
every `t('…')` literal. On render, `<x-island>` reads the manifest and adds only those keys'
lines for `app()->getLocale()` to the payload under `_island.translations`. A page with
three islands carries three small sets of lines, not the locale file three times.

An island the manifest does not know — one outside the island directory, or a build that
has not run yet — and an island that builds a key at runtime (`t(column.label)`) receive the
whole locale file instead. It is served from a route of its own,
`islands/translations/{locale}/{hash}.json`, behind the island route middleware and with a
content hash in the URL, so the browser caches it for a year and fetches it again only when
the file changes. The payload then carries `_island.translationsUrl`; the runtime loads the
file once per page, shares it between the islands that need it, and mounts each of them
when it has arrived, so no key flashes before its translation.

The route sits behind `routes.middleware`, so a visitor who is not logged in cannot load
the file: a public island renders translated only through the manifest. Keep its keys
literal, or the visitor sees the English source.

The manifest is `islands-translations.json` in Vite's build directory. A build emits it as
part of the bundle, so it survives Vite emptying the directory and lands in a versioned build
directory along with the assets; the dev server writes it into the same place and rewrites
it whenever an island or one of its imports changes, so development runs the same path as
production. Without the manifest every island takes the whole file — the view stays
translated, only the payload grows.

The locale itself travels as `_island.locale`, so a component can format dates and numbers
for it:

```js
const { _island } = useIsland();

new Intl.NumberFormat(_island.locale, { style: 'currency', currency: 'EUR' }).format(value);
```

## Extracting Keys

```bash
php artisan islands:translations
```

Reads the keys of every island from the manifest, adds those of lone components under
`resources/js/islands`, and appends the missing ones to `lang/{app.locale}.json` — key as
value, so the interface stays readable until someone translates the line. Existing lines
keep their order; unused keys are listed, never removed. Islands that build keys at runtime
are named, since their keys cannot be collected.

Without a manifest the command falls back to scanning the island directory, which does not
see the components an island imports from elsewhere.

| Option | Effect |
| --- | --- |
| `--locale=de` | Write another locale's file. `all` updates every existing `lang/*.json`. |
| `--dry-run` | Report without writing. |

Only string literals are collected; a key assembled at runtime cannot be translated anyway.

## Disabling Translations

For an English-only application, or one that translates purely on the client, turn it off
and no island carries lines or a URL:

```php
// config/laravel-islands.php
'translations' => [
    'enabled' => false,
],
```

`t()` keeps working and returns its keys.

## Translating the Helpers

The [UI helpers](/helpers/) ship no wording of their own. Every label they display is a
prop — `closeLabel`, `cancelLabel`, `placeholder` — so the application passes translated
strings and the package never holds a language file. The few defaults that exist
(`'Close'`, `'Cancel'`, `'Confirm'`, `'Save'`) are meant to be overridden.
