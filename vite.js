import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectTranslationManifest, findIslandEntries, serializeManifest, writeManifest } from './vite/translations.js';

const PACKAGE_NAME = '@aaix/laravel-islands';
const COMPOSER_NAME = 'aaix/laravel-islands';
const REGISTRY_IMPORT = `${PACKAGE_NAME}/islands`;
const REGISTRY_MODULE_ID = `\0${REGISTRY_IMPORT}`;
const DEFAULT_ISLAND_PATH = 'app/Islands';
const MANIFEST_FILE = 'islands-translations.json';

const packageRoot = dirname(fileURLToPath(import.meta.url));

function readJson(path) {
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return null;
    }
}

function expandPathRepository(root, url) {
    if (!url.endsWith('/*')) {
        return [resolve(root, url)];
    }

    const parent = resolve(root, url.slice(0, -2));

    if (!existsSync(parent)) {
        return [];
    }

    return readdirSync(parent, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(parent, entry.name));
}

function findComposerPathSource(root) {
    const composer = readJson(join(root, 'composer.json'));

    if (!composer?.repositories) {
        return null;
    }

    const repositories = Array.isArray(composer.repositories)
        ? composer.repositories
        : Object.values(composer.repositories);

    for (const repository of repositories) {
        if (repository?.type !== 'path' || typeof repository.url !== 'string') {
            continue;
        }

        for (const candidate of expandPathRepository(root, repository.url)) {
            if (readJson(join(candidate, 'composer.json'))?.name === COMPOSER_NAME) {
                return candidate;
            }
        }
    }

    return null;
}

export function resolvePackageSource(root) {
    return findComposerPathSource(root) ?? packageRoot;
}

function aliasEntries(source) {
    const exports = readJson(join(source, 'package.json'))?.exports ?? {};

    return Object.entries(exports)
        .filter(([subpath, target]) => subpath !== './vite' && typeof target === 'string')
        .map(([subpath, target]) => ({
            subpath: subpath === '.' ? '' : subpath.slice(1),
            replacement: resolve(source, target),
        }))
        .sort((a, b) => b.subpath.length - a.subpath.length)
        .map(({ subpath, replacement }) => ({
            find: new RegExp(`^${PACKAGE_NAME}${subpath}$`),
            replacement,
        }));
}

function islandGlob(path) {
    const trimmed = String(path ?? DEFAULT_ISLAND_PATH).replace(/^\/+|\/+$/g, '');

    return `/${trimmed}/**/*.island.vue`;
}

function registryModule(path) {
    return `const modules = import.meta.glob('${islandGlob(path)}');

const registry = {};

for (const [path, loader] of Object.entries(modules)) {
    const file = path.split('/').pop();
    const key = \`./islands/\${file}\`;

    if (key in registry) {
        console.warn(\`[islands] two islands are named "\${file}" — "\${path}" stays unmounted\`);
        continue;
    }

    registry[key] = loader;
}

export default registry;
`;
}

/** @param {{ path?: string, translations?: { manifest?: string } }} [options] */
export default function islands(options = {}) {
    let root = process.cwd();
    let outDir = resolve(root, 'public/build');
    let command = 'serve';
    let logger = console;
    let sources = new Set();
    let builtManifest = null;

    const islandRoot = () => resolve(root, String(options.path ?? DEFAULT_ISLAND_PATH));
    const manifestPath = () => (options.translations?.manifest ? resolve(root, String(options.translations.manifest)) : join(outDir, MANIFEST_FILE));

    function report(manifest) {
        const keys = Object.values(manifest).reduce((sum, island) => sum + island.keys.length, 0);
        logger.info(`[islands] translation manifest: ${Object.keys(manifest).length} islands, ${keys} keys`);
    }

    async function collectManifest(resolveImport) {
        const { manifest, files } = await collectTranslationManifest(findIslandEntries(islandRoot()), resolveImport);
        sources = files;

        return manifest;
    }

    async function refreshManifest(resolveImport) {
        const manifest = await collectManifest(resolveImport);

        if (writeManifest(manifestPath(), manifest)) {
            report(manifest);
        }
    }

    return {
        name: 'aaix:laravel-islands',
        enforce: 'pre',
        config(userConfig) {
            const configRoot = userConfig.root ? resolve(userConfig.root) : process.cwd();

            return {
                resolve: {
                    alias: aliasEntries(resolvePackageSource(configRoot)),
                },
            };
        },
        configResolved(config) {
            root = config.root;
            outDir = resolve(config.root, config.build.outDir);
            command = config.command;
            logger = config.logger;
        },
        async buildStart() {
            if (!existsSync(islandRoot())) {
                const message = `[islands] island directory not found: ${islandRoot()}`;

                if (command === 'build') {
                    this.error(message);
                }

                logger.error(message);

                return;
            }

            const resolveImport = (source, importer) => this.resolve(source, importer);

            // Vite empties the output directory after buildStart, so a build hands the manifest to the bundle instead of writing it now.
            if (command === 'build') {
                builtManifest = await collectManifest(resolveImport);

                return;
            }

            await refreshManifest(resolveImport);
        },
        generateBundle() {
            if (!builtManifest) {
                return;
            }

            const manifest = builtManifest;
            builtManifest = null;
            const inside = relative(outDir, manifestPath());

            if (inside.startsWith('..') || isAbsolute(inside)) {
                writeManifest(manifestPath(), manifest);
            } else {
                this.emitFile({ type: 'asset', fileName: inside, source: serializeManifest(manifest) });
            }

            report(manifest);
        },
        configureServer(server) {
            let pending = null;
            const refresh = () => {
                clearTimeout(pending);
                pending = setTimeout(() => {
                    refreshManifest((source, importer) => server.pluginContainer.resolveId(source, importer)).catch((error) => logger.error(`[islands] ${error.message}`));
                }, 100);
            };
            const concerns = (file) => sources.has(file) || file.startsWith(islandRoot());

            for (const event of ['add', 'change', 'unlink']) {
                server.watcher.on(event, (file) => {
                    if (concerns(file)) {
                        refresh();
                    }
                });
            }
        },
        resolveId(id) {
            return id === REGISTRY_IMPORT ? REGISTRY_MODULE_ID : null;
        },
        load(id) {
            return id === REGISTRY_MODULE_ID ? registryModule(options.path) : null;
        },
    };
}
