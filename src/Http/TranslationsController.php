<?php

declare(strict_types=1);

namespace Aaix\LaravelIslands\Http;

use Aaix\LaravelIslands\Translations\IslandTranslations;
use Illuminate\Http\JsonResponse;

class TranslationsController
{
    public function __construct(private readonly IslandTranslations $translations) {}

    public function __invoke(string $locale, string $hash): JsonResponse
    {
        abort_unless($this->translations->has($locale), 404);

        return response()
            ->json($this->translations->lines($locale))
            ->header('Cache-Control', 'private, max-age=31536000, immutable');
    }
}
