<?php

namespace Aaix\LaravelIslands\Concerns;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Database\Eloquent\BroadcastsEvents;

trait InteractsWithIslands
{
    use BroadcastsEvents;

    /**
     * @param  string  $event
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn($event): array
    {
        return [new PrivateChannel($this->islandChannel())];
    }

    public function islandChannel(): string
    {
        return str_replace('\\', '.', static::class) . '.' . $this->getKey();
    }
}
