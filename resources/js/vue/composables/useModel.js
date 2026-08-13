import { onMounted, ref } from 'vue';
import { useIsland } from './useIsland.js';
import { useEcho } from './useEcho.js';

/**
 * Reactive model bound to a server-provided subscription.
 *
 * Reads the initial data and broadcast metadata that the island payload
 * carries, auto-subscribes to the model's private channel, and keeps the
 * reactive state in sync. Leaves the channel on unmount.
 *
 * @param {string} key  The subscription key (prop name).
 * @param {{
 *   onUpdate?: (event: object, data: import('vue').Ref) => void,
 *   refetch?: () => Promise<object>,
 * }} [options]
 */
export function useModel(key, options = {}) {
    const island = useIsland();
    const subscription = island._island?.subscriptions?.[key];

    const data = ref(island.props?.[key] ?? null);
    const isDeleted = ref(false);

    const { privateChannel } = useEcho();

    onMounted(() => {
        if (!subscription || !window.Echo) {
            return;
        }

        const channel = privateChannel(subscription.channel);
        const { updated, deleted } = subscription.events;

        if (updated) {
            channel.listen(updated, (event) => {
                if (options.onUpdate) {
                    options.onUpdate(event, data);
                    return;
                }

                if (options.refetch) {
                    options.refetch().then((fresh) => {
                        data.value = fresh;
                    });
                    return;
                }

                data.value = { ...(data.value ?? {}), ...(event.model ?? event) };
            });
        }

        if (deleted) {
            channel.listen(deleted, () => {
                isDeleted.value = true;
            });
        }
    });

    return { data, isDeleted };
}
