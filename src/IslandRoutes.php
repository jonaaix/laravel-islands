<?php

declare(strict_types=1);

namespace Aaix\LaravelIslands;

use Illuminate\Support\Str;

class IslandRoutes
{
    /**
     * @return array<string, string> Island slug, mapped to the absolute path of its route file.
     */
    public static function discover(?string $path = null, ?string $file = null): array
    {
        $root = base_path($path ?? (string) config('laravel-islands.path', 'app/Islands'));

        if (! is_dir($root)) {
            return [];
        }

        $file ??= (string) config('laravel-islands.routes.file', 'Routes.php');
        $found = [];

        foreach ((array) glob($root.'/*', GLOB_ONLYDIR) as $directory) {
            $routes = $directory.'/'.$file;

            if (is_file($routes)) {
                $found[self::slug(basename($directory))] = $routes;
            }
        }

        ksort($found);

        return $found;
    }

    public static function slug(string $island): string
    {
        return Str::kebab($island);
    }
}
