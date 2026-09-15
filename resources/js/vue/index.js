import { createApp, defineAsyncComponent } from 'vue';
import { registerAdapter, startIslands } from '../core/registry.js';
import { resolveTranslations } from '../core/translations.js';
import { ISLAND_KEY } from './context.js';

/**
 * Register the Vue adapter and boot every Vue island in the DOM.
 *
 * @param {Record<string, { default: import('vue').Component } | (() => Promise<{ default: import('vue').Component }>)>} registry
 *        Result of import.meta.glob('./islands/**\/*.island.vue') — with `{ eager: true }`
 *        every island is part of the entry bundle, without it each one is fetched when a
 *        page actually mounts it.
 * @param {{ setup?: (app: import('vue').App, payload: object) => void }} [options]
 */
export function startVueIslands(registry, options = {}) {
    const resolve = (name) => {
        const entry = registry[`./islands/${name}.island.vue`] ?? registry[`./${name}.island.vue`];

        if (typeof entry === 'function') {
            return defineAsyncComponent(() => entry().then((module) => module.default));
        }

        return entry?.default;
    };

    registerAdapter('vue', async (el, payload) => {
        const component = resolve(el.dataset.island);

        if (!component) {
            console.warn(`[islands] vue component not found: "${el.dataset.island}"`);
            return;
        }

        await resolveTranslations(payload);

        const app = createApp(component, payload.props ?? {});
        app.provide(ISLAND_KEY, payload);
        options.setup?.(app, payload);
        app.mount(el);
    });

    startIslands();
}

export { useIsland } from './composables/useIsland.js';
export { useEcho } from './composables/useEcho.js';
export { useModel } from './composables/useModel.js';
export { useSortableTiles } from './composables/useSortableTiles.js';
export { useTranslations } from './composables/useTranslations.js';
export { useViewWidth, VIEW_BASE_WIDTH, VIEW_TOOLBAR_HEIGHT } from './composables/useViewWidth.js';
