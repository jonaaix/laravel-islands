const PACKAGES = {
    o: () => import('@heroicons/vue/24/outline'),
    s: () => import('@heroicons/vue/24/solid'),
    m: () => import('@heroicons/vue/20/solid'),
    c: () => import('@heroicons/vue/16/solid'),
};

export function heroiconSlug(componentName) {
    return componentName
        .replace(/Icon$/, '')
        .replace(/([a-z])([0-9])/g, '$1-$2')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/([0-9])([A-Z][a-z])/g, '$1-$2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
        .toLowerCase();
}

function heroiconSet(style, label) {
    const prefix = `heroicon-${style}-`;

    return {
        value: style,
        label,
        owns: (name) => typeof name === 'string' && name.startsWith(prefix),
        load: async () => Object.entries(await PACKAGES[style]())
            .filter(([componentName]) => componentName.endsWith('Icon'))
            .map(([componentName, component]) => {
                const slug = heroiconSlug(componentName);

                return { value: `${prefix}${slug}`, label: slug, component };
            }),
    };
}

export function heroiconSets(styles = ['o', 's'], labels = {}) {
    const words = { outline: 'Outline', solid: 'Solid', mini: 'Mini', micro: 'Micro', ...labels };
    const names = { o: words.outline, s: words.solid, m: words.mini, c: words.micro };

    return styles.map((style) => heroiconSet(style, names[style]));
}
