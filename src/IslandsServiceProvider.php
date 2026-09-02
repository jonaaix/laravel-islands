<?php

namespace Aaix\LaravelIslands;

use Aaix\LaravelIslands\Broadcasting\ChannelResolver;
use Aaix\LaravelIslands\Console\MakeIslandCmd;
use Aaix\LaravelIslands\View\Components\Island;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class IslandsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/laravel-islands.php', 'laravel-islands');

        $this->app->singleton(ChannelResolver::class);
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'laravel-islands');

        Blade::component('island', Island::class);

        $this->publishes([
            __DIR__.'/../config/laravel-islands.php' => config_path('laravel-islands.php'),
        ], 'laravel-islands-config');

        $this->publishes([
            __DIR__.'/../stubs' => base_path('stubs/islands'),
        ], 'laravel-islands-stubs');

        if ($this->app->runningInConsole()) {
            $this->commands([MakeIslandCmd::class]);
        }

        $this->registerIslandRoutes();
    }

    /**
     * Loads every island's own route file into a group scoped to that island. The
     * directory is read at boot; `route:cache` picks the files up while caching, so
     * a cached application never touches the filesystem for this.
     */
    private function registerIslandRoutes(): void
    {
        $config = (array) config('laravel-islands.routes', []);

        if (! ($config['enabled'] ?? false)) {
            return;
        }

        $root = base_path((string) config('laravel-islands.path', 'app/Islands'));

        if (! is_dir($root)) {
            return;
        }

        $file = (string) ($config['file'] ?? 'Routes.php');

        foreach ($this->islandRouteFiles($root, $file) as $island => $routes) {
            Route::middleware((array) ($config['middleware'] ?? ['web']))
                ->prefix(trim((string) ($config['prefix'] ?? 'islands'), '/').'/'.$island)
                ->name((string) ($config['name'] ?? 'islands.').$island.'.')
                ->group($routes);
        }
    }

    /**
     * @return array<string, string> Island slug, mapped to the absolute path of its route file.
     */
    private function islandRouteFiles(string $root, string $file): array
    {
        $found = [];

        foreach ((array) glob($root.'/*', GLOB_ONLYDIR) as $directory) {
            $routes = $directory.'/'.$file;

            if (is_file($routes)) {
                $found[Str::kebab(basename($directory))] = $routes;
            }
        }

        ksort($found);

        return $found;
    }
}
