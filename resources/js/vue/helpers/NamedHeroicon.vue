<script setup>
import { shallowRef, watch } from 'vue';

const props = defineProps({
    name: { type: String, default: '' },
});

const SETS = {
    o: import.meta.glob('/node_modules/@heroicons/vue/24/outline/esm/*Icon.js'),
    s: import.meta.glob('/node_modules/@heroicons/vue/24/solid/esm/*Icon.js'),
    m: import.meta.glob('/node_modules/@heroicons/vue/20/solid/esm/*Icon.js'),
    c: import.meta.glob('/node_modules/@heroicons/vue/16/solid/esm/*Icon.js'),
};

const component = shallowRef(null);

function loaderFor(name) {
    const match = /^heroicon-([osmc])-([a-z0-9-]+)$/.exec(name ?? '');

    if (!match) {
        return null;
    }

    const [, style, slug] = match;
    const file = `/${slug.replaceAll('-', '')}icon.js`;
    const entry = Object.entries(SETS[style]).find(([path]) => path.toLowerCase().endsWith(file));

    return entry ? entry[1] : null;
}

watch(
    () => props.name,
    async (name) => {
        const load = loaderFor(name);

        if (!load) {
            component.value = null;

            return;
        }

        const module = await load();

        if (props.name === name) {
            component.value = module.default;
        }
    },
    { immediate: true },
);
</script>

<template>
    <component :is="component" v-if="component" aria-hidden="true" />
</template>
