import { inject, onBeforeUnmount } from 'vue';
import { ISLAND_STATE_KEY } from '../context.js';

/**
 * Hand the runtime a piece of state to keep across a page swap, and get it back on the
 * next mount of this island at the same URL.
 *
 * @template T
 * @param {string} key Unique within the island.
 * @param {() => T} provide Called when the page is left; must return plain data.
 * @returns {T | null} What the last visit stored under the key, or null.
 */
export function useIslandState(key, provide) {
    const islandState = inject(ISLAND_STATE_KEY, null);

    if (!islandState) {
        return null;
    }

    islandState.register(key, provide);
    onBeforeUnmount(() => islandState.unregister(key));

    return islandState.restored?.[key] ?? null;
}
