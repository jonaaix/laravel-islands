# Translations

Islands render on the client, so they cannot call `__()`. The package ships the JSON
translation lines for the current locale with every island payload; English source
strings are the keys, as in Laravel's JSON translations.

```vue
<script setup>
import { useTranslations } from '@aaix/laravel-islands/vue';

const { t } = useTranslations();
</script>

<template>
    <p>{{ t('Shipped :count of :total', { count: 2, total: 5 }) }}</p>
</template>
```

`t()` falls back to the key, so an English-only application needs no translation file.
A string that never passes through `t()` can never be translated — that includes
`aria-label`s and the labels you pass to helper components.

## Adding a Language

```json
// lang/de.json
{
    "Shipped :count of :total": ":count von :total versandt"
}
```

## Extracting Keys

```bash
php artisan islands:translations
```

Scans every `.vue` and `.js` file of the islands for `t('…')` and appends the missing
keys to `lang/{app.locale}.json`, key as value, so the interface stays readable until
someone translates the line. Existing lines keep their order; unused keys are listed,
never removed.

| Option | Effect |
| --- | --- |
| `--locale=de` | Write another locale's file. `all` updates every existing `lang/*.json`. |
| `--dry-run` | Report without writing. |

## Disabling

For an English-only application, stop shipping the lines with every payload:

```php
'translations' => ['enabled' => false],
```
