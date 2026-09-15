<?php

declare(strict_types=1);

namespace Aaix\LaravelIslands;

use Closure;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class IslandRoutes
{
    /**
     * @var array<string, Closure(string): string> Island slug, mapped to the closure that qualifies a route name for whoever registers its routes instead of discovery.
     */
    private static array $qualifiers = [];

    /**
     * @var array<string, Closure(array<string, mixed>): array<string, mixed>> Island slug, mapped to the closure that completes the route parameters.
     */
    private static array $parameterDefaults = [];

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

    /**
     * @param  array<string, string>  $islands  Island slug, mapped to the absolute path of its route file.
     * @param  array<int, string>|string  $middleware
     */
    public static function register(array $islands, array|string $middleware = []): void
    {
        foreach ($islands as $slug => $routes) {
            Route::middleware($middleware)
                ->prefix(self::prefix($slug))
                ->name(self::name($slug))
                ->group($routes);
        }
    }

    /**
     * @param  array<int, string>  $islands
     * @param  Closure(string): string  $qualifyName  Turns the discovery route name into the name the routes are registered under.
     * @param  Closure(array<string, mixed>): array<string, mixed>|null  $completeParameters  Adds parameters the route needs but the caller does not know, such as the tenant.
     */
    public static function serve(array $islands, Closure $qualifyName, ?Closure $completeParameters = null): void
    {
        foreach ($islands as $island) {
            $slug = self::slug($island);
            self::$qualifiers[$slug] = $qualifyName;

            if ($completeParameters) {
                self::$parameterDefaults[$slug] = $completeParameters;
            }
        }
    }

    public static function isServedElsewhere(string $island): bool
    {
        return array_key_exists(self::slug($island), self::$qualifiers);
    }

    public static function routeName(string $island, string $route): string
    {
        $slug = self::slug($island);
        $name = self::name($slug).$route;
        $qualify = self::$qualifiers[$slug] ?? null;

        return $qualify ? $qualify($name) : $name;
    }

    /**
     * @param  array<string, mixed>  $parameters
     */
    public static function route(string $island, string $route, array $parameters = []): string
    {
        $complete = self::$parameterDefaults[self::slug($island)] ?? null;

        return route(self::routeName($island, $route), $complete ? $complete($parameters) : $parameters);
    }

    public static function prefix(string $island): string
    {
        return trim((string) config('laravel-islands.routes.prefix', 'islands'), '/').'/'.self::slug($island);
    }

    public static function name(string $island): string
    {
        return (string) config('laravel-islands.routes.name', 'islands.').self::slug($island).'.';
    }

    public static function slug(string $island): string
    {
        return Str::kebab($island);
    }
}
