import { inject } from 'vue';
import { ISLAND_KEY } from '../context.js';

const FALLBACK = { props: {}, _island: { subscriptions: {}, translations: {} } };

export function useIsland() {
    return inject(ISLAND_KEY, FALLBACK);
}
