<?php

namespace Aaix\LaravelIslands\Console;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeIslandCmd extends Command
{
    protected $signature = 'make:island
                            {name : The island name in StudlyCase, e.g. ShopOrders}
                            {--force : Overwrite files that already exist}';

    protected $description = 'Scaffold an island: entry component, page view, routes, controller and props';

    /**
     * Stub file, mapped to the generated file name. `{{ class }}` in the target name is
     * replaced along with the placeholders inside the stubs themselves.
     */
    private const FILES = [
        'island.vue.stub' => '{{ class }}.island.vue',
        'Page.blade.php.stub' => 'Page.blade.php',
        'Routes.php.stub' => 'Routes.php',
        'Controller.php.stub' => '{{ class }}IslandController.php',
        'Props.php.stub' => '{{ class }}Props.php',
        'Query.php.stub' => 'Queries/{{ class }}Query.php',
    ];

    /**
     * Where each kind of file belongs. Created empty so the next file lands in the right
     * place instead of at the island's root.
     */
    private const DIRECTORIES = ['Queries', 'Writers', 'Presenters', 'State', 'Support', 'Components'];

    public function handle(): int
    {
        $class = Str::studly((string) $this->argument('name'));

        if ($class === '') {
            $this->components->error('An island needs a name.');

            return self::FAILURE;
        }

        $slug = Str::kebab($class);
        $root = base_path((string) config('laravel-islands.path', 'app/Islands'));
        $core = $root.'/@Shared';
        $directory = $root.'/'.$class;

        if (! is_dir($core) && ! mkdir($core, 0755, true) && ! is_dir($core)) {
            $this->components->error("Could not create {$core}.");

            return self::FAILURE;
        }
        if (! file_exists($core.'/.gitkeep')) {
            touch($core.'/.gitkeep');
        }

        $replacements = [
            '{{ class }}' => $class,
            '{{ island }}' => $class,
            '{{ slug }}' => $slug,
            '{{ title }}' => Str::headline($class),
            '{{ namespace }}' => (string) config('laravel-islands.namespace', 'App\\Islands').'\\'.$class,
            '{{ routeName }}' => (string) config('laravel-islands.routes.name', 'islands.').$slug.'.',
            '{{ routePrefix }}' => trim((string) config('laravel-islands.routes.prefix', 'islands'), '/').'/'.$slug,
        ];

        if (! is_dir($directory) && ! mkdir($directory, 0755, true) && ! is_dir($directory)) {
            $this->components->error("Could not create {$directory}.");

            return self::FAILURE;
        }

        foreach (self::DIRECTORIES as $role) {
            $path = $directory.'/'.$role;

            if (! is_dir($path)) {
                mkdir($path, 0755, true);
            }

            if (! file_exists($path.'/.gitkeep')) {
                touch($path.'/.gitkeep');
            }
        }

        $written = [];

        foreach (self::FILES as $stub => $target) {
            $name = strtr($target, $replacements);
            $path = $directory.'/'.$name;

            if (file_exists($path) && ! $this->option('force')) {
                $this->components->warn("Kept existing {$name}");

                continue;
            }

            $contents = $this->stub($stub);

            if ($contents === null) {
                $this->components->error("Missing stub {$stub}.");

                return self::FAILURE;
            }

            file_put_contents($path, strtr($contents, $replacements));
            $written[] = $name;
        }

        foreach ($written as $name) {
            $this->components->info("Created {$name}");
        }

        $this->newLine();
        $this->components->bulletList([
            "Endpoints answer under {$replacements['{{ routePrefix }}']}, named {$replacements['{{ routeName }}']}*",
            "Fill in {$class}IslandController::authorizeAccess() before exposing any data",
            "Render it from a page with: ['islandProps' => app({$class}Props::class)->build(request())]",
        ]);

        return self::SUCCESS;
    }

    /**
     * A stub published into the application wins, so the house style can be adjusted
     * without changing the package.
     */
    private function stub(string $name): ?string
    {
        foreach ([base_path('stubs/islands/'.$name), __DIR__.'/../../stubs/'.$name] as $candidate) {
            if (is_file($candidate)) {
                return (string) file_get_contents($candidate);
            }
        }

        return null;
    }
}
