<?php

declare(strict_types=1);

namespace Aaix\LaravelIslands\Console;

use Illuminate\Console\Command;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

class ExtractTranslationsCmd extends Command
{
    protected $signature = 'islands:translations
                            {--locale= : The locale to write, defaults to app.locale; "all" targets every existing lang/*.json}
                            {--dry-run : Report the missing keys without writing}';

    protected $description = 'Collect the t() keys of every island and add the missing ones to the JSON translation file';

    private const EXTENSIONS = ['vue', 'js'];

    private const PATTERN = '/\bt\(\s*([\'"])((?:\\\\.|(?!\1).)*)\1/s';

    public function handle(): int
    {
        $keys = $this->collectKeys();

        if ($keys === []) {
            $this->components->warn('No t() calls found in any island.');

            return self::SUCCESS;
        }

        $this->components->info(count($keys).' distinct keys found.');

        $locales = $this->targetLocales();

        if ($locales === []) {
            $this->components->error('No lang/*.json exists yet; name a locale with --locale.');

            return self::FAILURE;
        }

        foreach ($locales as $locale) {
            if (! $this->syncLocale($locale, $keys)) {
                return self::FAILURE;
            }
        }

        return self::SUCCESS;
    }

    /**
     * @param  list<string>  $keys
     */
    private function syncLocale(string $locale, array $keys): bool
    {
        $file = lang_path("{$locale}.json");
        $existing = $this->readLines($file);

        if ($existing === null) {
            $this->components->error("{$file} is not a JSON object.");

            return false;
        }

        $missing = array_values(array_diff($keys, array_keys($existing)));
        $unused = array_values(array_diff(array_keys($existing), $keys));

        $this->components->twoColumnDetail("lang/{$locale}.json", count($missing).' missing, '.count($unused).' unused');

        foreach ($unused as $key) {
            $this->components->bulletList(["unused: {$key}"]);
        }

        if ($missing === []) {
            return true;
        }

        if ($this->option('dry-run')) {
            $this->components->bulletList(array_map(fn (string $key) => "missing: {$key}", $missing));

            return true;
        }

        foreach ($missing as $key) {
            $existing[$key] = $key;
        }

        $this->writeLines($file, $existing);
        $this->components->info(count($missing)." keys added to lang/{$locale}.json.");

        return true;
    }

    /**
     * @return list<string>
     */
    private function targetLocales(): array
    {
        $option = (string) $this->option('locale');

        if ($option === 'all') {
            return array_map(fn (string $path) => basename($path, '.json'), glob(lang_path('*.json')) ?: []);
        }

        return [$option !== '' ? $option : (string) config('app.locale', 'en')];
    }

    /**
     * @return list<string>
     */
    private function collectKeys(): array
    {
        $keys = [];

        foreach ($this->sourceDirectories() as $directory) {
            foreach ($this->sourceFiles($directory) as $file) {
                preg_match_all(self::PATTERN, (string) file_get_contents($file->getPathname()), $matches);

                foreach ($matches[2] as $raw) {
                    $keys[stripslashes($raw)] = true;
                }
            }
        }

        return array_keys($keys);
    }

    /**
     * @return list<string>
     */
    private function sourceDirectories(): array
    {
        return array_values(array_filter([
            base_path((string) config('laravel-islands.path', 'app/Islands')),
            resource_path('js/islands'),
        ], 'is_dir'));
    }

    /**
     * @return list<SplFileInfo>
     */
    private function sourceFiles(string $directory): array
    {
        $files = [];
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS));

        foreach ($iterator as $file) {
            if ($file->isFile() && in_array($file->getExtension(), self::EXTENSIONS, true)) {
                $files[] = $file;
            }
        }

        usort($files, fn (SplFileInfo $a, SplFileInfo $b) => strcmp($a->getPathname(), $b->getPathname()));

        return $files;
    }

    /**
     * @return array<string, string>|null
     */
    private function readLines(string $file): ?array
    {
        if (! is_file($file)) {
            return [];
        }

        $lines = json_decode((string) file_get_contents($file), true);

        return is_array($lines) ? $lines : null;
    }

    /**
     * @param  array<string, string>  $lines
     */
    private function writeLines(string $file, array $lines): void
    {
        if (! is_dir(dirname($file))) {
            mkdir(dirname($file), 0755, true);
        }

        file_put_contents(
            $file,
            json_encode($lines, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).PHP_EOL,
        );
    }
}
