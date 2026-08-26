import { ref } from 'vue';

const LIFETIME_MS = 400;

/**
 * The press feedback every round control in this package shares: a circle that grows from
 * where the pointer landed and fades out.
 *
 * One caller can host several independent surfaces — a split button's two halves, a row of
 * page numbers — by naming each press. Whether a press is allowed at all stays with the
 * caller, which is the only place that knows about disabled and loading.
 */
export function useRipple() {
    const items = ref([]);
    let lastId = 0;

    function press(event, key = '') {
        const box = event.currentTarget.getBoundingClientRect();
        const id = ++lastId;

        items.value.push({
            id,
            key,
            x: (event.clientX ?? box.left + box.width / 2) - box.left,
            y: (event.clientY ?? box.top + box.height / 2) - box.top,
            size: Math.max(box.width, box.height) * 2,
        });

        setTimeout(() => {
            items.value = items.value.filter((item) => item.id !== id);
        }, LIFETIME_MS);
    }

    function on(key = '') {
        return items.value.filter((item) => item.key === key);
    }

    return { press, on };
}
