<?php

namespace Aaix\LaravelIslands\View\Components;

use Aaix\LaravelIslands\Broadcasting\ChannelResolver;
use Aaix\LaravelIslands\Translations\IslandTranslations;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\View\Component;

class Island extends Component
{
    /**
     * @var array<string, Model>
     */
    protected array $subscriptions;

    /**
     * @param  array<string, mixed>  $props
     * @param  array<string, Model>|Model|null  $subscribe
     */
    public function __construct(
        public string $name,
        public array $props = [],
        array|Model|null $subscribe = null,
        public string $adapter = 'vue',
    ) {
        $this->subscriptions = $this->normalizeSubscriptions($subscribe);
    }

    public function render(): View
    {
        $resolver = app(ChannelResolver::class);

        $props = $this->props;

        foreach ($this->subscriptions as $key => $model) {
            $props[$key] ??= $model->toArray();
        }

        $payload = [
            'props' => $props,
            '_island' => [
                'subscriptions' => $resolver->resolve($this->subscriptions),
                ...$this->translations(),
                'locale' => app()->getLocale(),
            ],
        ];

        return view('laravel-islands::components.island', [
            'name' => $this->name,
            'adapter' => $this->adapter,
            'payload' => json_encode($payload, JSON_THROW_ON_ERROR),
        ]);
    }

    /**
     * The island's translation lines, keyed by source string, or the URL of the whole
     * locale file when the manifest cannot tell which lines the island uses.
     *
     * @return array{translations: array<string, string>, translationsUrl?: string}
     */
    protected function translations(): array
    {
        $translations = app(IslandTranslations::class);
        $locale = app()->getLocale();

        if (! $translations->enabled()) {
            return ['translations' => []];
        }

        if ($translations->knows($this->name)) {
            return ['translations' => $translations->forIsland($this->name, $locale)];
        }

        $url = $translations->url($locale);

        return $url
            ? ['translations' => [], 'translationsUrl' => $url]
            : ['translations' => $translations->lines($locale)];
    }

    /**
     * @param  array<string, Model>|Model|null  $subscribe
     * @return array<string, Model>
     */
    protected function normalizeSubscriptions(array|Model|null $subscribe): array
    {
        if ($subscribe === null) {
            return [];
        }

        if ($subscribe instanceof Model) {
            return [Str::camel(class_basename($subscribe)) => $subscribe];
        }

        return $subscribe;
    }
}
