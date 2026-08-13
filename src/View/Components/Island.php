<?php

namespace Aaix\LaravelIslands\View\Components;

use Aaix\LaravelIslands\Broadcasting\ChannelResolver;
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
                'translations' => $this->loadTranslations(),
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
     * The app's JSON translation lines for the current locale, keyed by source
     * string. Shipped with the payload so islands can translate client-side.
     *
     * @return array<string, string>
     */
    protected function loadTranslations(): array
    {
        if (! config('laravel-islands.translations.enabled', true)) {
            return [];
        }

        $translations = app('translator')->getLoader()->load(app()->getLocale(), '*', '*');

        return is_array($translations) ? $translations : [];
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
