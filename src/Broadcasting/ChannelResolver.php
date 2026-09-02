<?php

namespace Aaix\LaravelIslands\Broadcasting;

use Illuminate\Database\Eloquent\Model;

class ChannelResolver
{
    /**
     * @param  array<string, Model>  $models
     * @return array<string, array{channel: string, events: array<string, string>, keyName: string, key: mixed}>
     */
    public function resolve(array $models): array
    {
        $subscriptions = [];

        foreach ($models as $key => $model) {
            $subscriptions[$key] = [
                'channel' => $this->channelFor($model),
                'events' => $this->eventsFor($model),
                'keyName' => $model->getKeyName(),
                'key' => $model->getKey(),
            ];
        }

        return $subscriptions;
    }

    public function channelFor(Model $model): string
    {
        if (method_exists($model, 'islandChannel')) {
            return $model->islandChannel();
        }

        return str_replace('\\', '.', $model::class).'.'.$model->getKey();
    }

    /**
     * @return array<string, string>
     */
    public function eventsFor(Model $model): array
    {
        $base = class_basename($model);

        return [
            'created' => '.'.$base.'Created',
            'updated' => '.'.$base.'Updated',
            'deleted' => '.'.$base.'Deleted',
        ];
    }
}
