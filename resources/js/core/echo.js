/**
 * Framework-agnostic Echo helper. Tracks the private channels an island has
 * joined so an adapter can leave them all when the island tears down.
 */
export function createEchoController() {
    const echo = window.Echo;
    const joined = new Set();

    if (!echo) {
        console.warn('[islands] window.Echo is not initialised — real-time disabled');
    }

    return {
        echo,
        privateChannel(name) {
            joined.add(name);
            return echo?.private(name);
        },
        leaveAll() {
            joined.forEach((name) => echo?.leave(name));
            joined.clear();
        },
    };
}
