# Translations

Islands render on the client, so they cannot call Laravel's `__()` directly.
Instead, the package ships the app's **JSON translation lines** for the current
locale with every island payload and exposes them through a composable.

The English source string is the translation key (matching Laravel's JSON
translation convention) — untranslated keys fall through unchanged, so an
English-only app needs no translation files at all.

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

`t(key, replace = {})` looks the key up in the shipped translation lines and
falls back to the key itself. Laravel-style `:placeholder` tokens are replaced
from the `replace` map.

## How it works

On render, `<x-island>` loads the JSON translations for `app()->getLocale()`
(from `lang/{locale}.json`) and adds them to the payload under
`_island.translations`. `useTranslations()` reads them via `useIsland()`.

To translate an island into German, add the source strings to `lang/de.json`:

```json
{
    "Positions": "Positionen",
    "Shipped :count of :total": ":count von :total versandt"
}
```

## Configuration

Disable shipping translations (e.g. if you translate purely client-side) via
`config/laravel-islands.php`:

```php
'translations' => [
    'enabled' => false,
],
```
