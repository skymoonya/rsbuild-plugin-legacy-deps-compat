import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import legacyDepsCompat from '../src';

export default defineConfig({
    plugins: [
        pluginVue(),
        legacyDepsCompat({
            postcss: {
                // configDir: 'compat',
                customPostcssLoaderOptions: { config: { path: 'compat' } },
                // clearBuiltinPlugins: false,
                addEmptyLoader: true,
            }
        }),
    ],
    source: {
        entry: {
            index: './src/main.js'
        }
    },
    html: {
        mountId: 'app',
        template: 'public/index.html',
        templateParameters: {
            BASE_URL: '/',
            htmlWebpackPlugin: {
                options: {
                    title: 'Rsbuild App'
                }
            }
        }
    },
});
