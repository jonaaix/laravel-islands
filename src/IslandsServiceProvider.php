<?php

namespace Aaix\LaravelIslands;

use Aaix\LaravelIslands\Broadcasting\ChannelResolver;
use Aaix\LaravelIslands\Console\ExtractTranslationsCmd;
use Aaix\LaravelIslands\Console\MakeIslandCmd;
use Aaix\LaravelIslands\Http\TranslationsController;
use Aaix\LaravelIslands\Translations\IslandTranslations;
use Aaix\LaravelIslands\View\Components\Island;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class IslandsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/laravel-islands.php', 'laravel-islands');

        $this->app->singleton(ChannelResolver::class);
        $this->app->singleton(IslandTranslations::class);
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
            $this->commands([MakeIslandCmd::class, ExtractTranslationsCmd::class]);
        }

        // After every provider has booted, so a Filament panel has claimed its islands before the rest is registered globally.
        $this->app->booted(function (): void {
            $this->registerIslandRoutes();
            $this->registerTranslationsRoute();
        });
    }

    private function registerTranslationsRoute(): void
    {
        if (! config('laravel-islands.translations.enabled', true)) {
            return;
        }

        $config = (array) config('laravel-islands.routes', []);

        Route::middleware((array) ($config['middleware'] ?? ['web', 'auth']))
            ->get(trim((string) ($config['prefix'] ?? 'islands'), '/').'/translations/{locale}/{hash}.json', TranslationsController::class)
            ->where(['locale' => '[A-Za-z_-]+', 'hash' => '[a-f0-9]+'])
            ->name((string) ($config['name'] ?? 'islands.').'translations');
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

        $islands = array_filter(
            IslandRoutes::discover(),
            fn (string $slug): bool => ! IslandRoutes::isServedElsewhere($slug),
            ARRAY_FILTER_USE_KEY,
        );

        IslandRoutes::register($islands, (array) ($config['middleware'] ?? ['web', 'auth']));
    }
}
