<?php

namespace Aaix\LaravelIslands\Concerns;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;
use Illuminate\Support\Facades\Log;
use Throwable;

trait InteractsWithIslands
{
    use BroadcastsEvents;

    /**
     * @param  string  $event
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn($event): array
    {
        if (! $this->broadcastingIsUsable()) {
            return [];
        }

        return [new PrivateChannel($this->islandChannel())];
    }

    public function islandChannel(): string
    {
        return str_replace('\\', '.', static::class) . '.' . $this->getKey();
    }

    protected function broadcastIfBroadcastChannelsExistForEvent($instance, $event, $channels = null)
    {
        try {
            return parent::broadcastIfBroadcastChannelsExistForEvent($instance, $event, $channels);
        } catch (Throwable $e) {
            Log::warning('Island broadcast skipped: ' . $e->getMessage(), [
                'model' => static::class,
                'event' => $event,
            ]);

            return null;
        }
    }

    protected function broadcastingIsUsable(): bool
    {
        $driver = config('broadcasting.default');

        return $driver !== null && $driver !== 'null';
    }
}
