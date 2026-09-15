<?php

declare(strict_types=1);

namespace Aaix\LaravelIslands\Translations;

use Illuminate\Support\Facades\Route;

class IslandTranslations
{
    /**
     * @var array{path: string, mtime: int, islands: array<string, array{keys: list<string>, dynamic: bool}>}|null
     */
    private ?array $manifest = null;

    /**
     * @var array<string, array{mtime: int, lines: array<string, string>, hash: string}>
     */
    private array $lines = [];

    public function enabled(): bool
    {
        return (bool) config('laravel-islands.translations.enabled', true);
    }

    public function has(string $locale): bool
    {
        return is_file(lang_path("{$locale}.json"));
    }

    public function url(string $locale): ?string
    {
        $name = (string) config('laravel-islands.routes.name', 'islands.').'translations';

        if (! $this->has($locale) || ! Route::has($name)) {
            return null;
        }

        $this->lines($locale);

        return route($name, ['locale' => $locale, 'hash' => $this->lines[$locale]['hash']]);
    }

    public function knows(string $island): bool
    {
        $entry = $this->manifest()[$island] ?? null;

        return $entry !== null && ! ($entry['dynamic'] ?? false);
    }

    /**
     * @return array<string, string> The island's keys with their lines; a key without a line is left out.
     */
    public function forIsland(string $island, string $locale): array
    {
        $lines = $this->lines($locale);
        $subset = [];

        foreach ($this->manifest()[$island]['keys'] ?? [] as $key) {
            if (isset($lines[$key])) {
                $subset[$key] = $lines[$key];
            }
        }

        return $subset;
    }

    /**
     * @return array<string, string>
     */
    public function lines(string $locale): array
    {
        $mtime = $this->mtime(lang_path("{$locale}.json"));

        if (($this->lines[$locale]['mtime'] ?? null) !== $mtime) {
            $loaded = app('translator')->getLoader()->load($locale, '*', '*');
            $lines = is_array($loaded) ? $loaded : [];

            $this->lines[$locale] = ['mtime' => $mtime, 'lines' => $lines, 'hash' => sha1(json_encode($lines, JSON_THROW_ON_ERROR))];
        }

        return $this->lines[$locale]['lines'];
    }

    /**
     * @return array<string, array{keys: list<string>, dynamic: bool}>
     */
    private function manifest(): array
    {
        $path = base_path((string) config('laravel-islands.translations.manifest', 'public/build/islands-translations.json'));
        $mtime = $this->mtime($path);

        if ($this->manifest === null || $this->manifest['path'] !== $path || $this->manifest['mtime'] !== $mtime) {
            $decoded = $mtime > 0 ? json_decode((string) file_get_contents($path), true) : null;

            $this->manifest = ['path' => $path, 'mtime' => $mtime, 'islands' => is_array($decoded) ? $decoded : []];
        }

        return $this->manifest['islands'];
    }

    private function mtime(string $path): int
    {
        return is_file($path) ? (int) filemtime($path) : 0;
    }
}
