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

## Extracting Keys

Collecting every `t()` key by hand does not scale past the first island. The package
ships a command that scans the islands and adds what is missing to the JSON file:

```bash
php artisan islands:translations
```

It reads every `.vue` and `.js` file under the islands directory (the configured `path`)
and under `resources/js/islands`, collects the first argument of each `t('…')` call, and
appends the keys the file does not have yet — with the key as its own value, so the
interface stays readable until someone translates the line:

```json
{
    "Positions": "Positionen",
    "Shipped :count of :total": "Shipped :count of :total"
}
```

Existing lines and their order are left alone. The file is created when it does not
exist. Keys that the file has but no island uses any more are listed, never removed.

| Option | Effect |
| --- | --- |
| `--locale=de` | Write `lang/de.json` instead of the file for `app.locale`. |
| `--locale=all` | Update every `lang/*.json` that already exists. |
| `--dry-run` | List the missing and unused keys without writing. |

Only string literals are collected. A key assembled at runtime from a template string
cannot be translated anyway; give each case its own literal.

## How It Works

On render, `<x-island>` loads the JSON lines for `app()->getLocale()` and adds them to the
payload under `_island.translations`. The locale itself travels as `_island.locale`, so a
component can format dates and numbers for it:

```js
const { _island } = useIsland();

new Intl.NumberFormat(_island.locale, { style: 'currency', currency: 'EUR' }).format(value);
```

## Disabling Translations

The full set of lines for the locale is embedded in every island on the page. For an
English-only application, or one that translates purely on the client, turn it off:

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
