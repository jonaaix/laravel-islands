<?php

declare(strict_types=1);

namespace Aaix\LaravelIslands\Filament;

use Aaix\LaravelIslands\IslandRoutes;
use Filament\Contracts\Plugin;
use Filament\Facades\Filament;
use Filament\Panel;

class LaravelIslandsPlugin implements Plugin
{
    /**
     * @var array<int, string>|null
     */
    private ?array $only = null;

    /**
     * @var array<int, string>
     */
    private array $except = [];

    public static function make(): static
    {
        return app(static::class);
    }

    public function getId(): string
    {
        return 'laravel-islands';
    }

    /**
     * @param  array<int, string>  $islands
     */
    public function only(array $islands): static
    {
        $this->only = array_map(IslandRoutes::slug(...), $islands);

        return $this;
    }

    /**
     * @param  array<int, string>  $islands
     */
    public function except(array $islands): static
    {
        $this->except = array_map(IslandRoutes::slug(...), $islands);

        return $this;
    }

    public function register(Panel $panel): void
    {
        $islands = $this->islands();

        IslandRoutes::serve(
            array_keys($islands),
            $panel->generateRouteName(...),
            fn (array $parameters): array => $this->withTenant($panel, $parameters),
        );

        $panel->authenticatedTenantRoutes(fn () => IslandRoutes::register($islands));
    }

    public function boot(Panel $panel): void {}

    /**
     * @return array<string, string>
     */
    private function islands(): array
    {
        $islands = IslandRoutes::discover();

        if ($this->only !== null) {
            $islands = array_intersect_key($islands, array_flip($this->only));
        }

        return array_diff_key($islands, array_flip($this->except));
    }

    /**
     * @param  array<string, mixed>  $parameters
     * @return array<string, mixed>
     */
    private function withTenant(Panel $panel, array $parameters): array
    {
        if ($panel->hasTenancy() && ! array_key_exists('tenant', $parameters)) {
            $parameters['tenant'] = Filament::getTenant();
        }

        return $parameters;
    }
}
