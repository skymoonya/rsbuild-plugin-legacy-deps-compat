import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import pluginLegacyDeps from '../src';

export default defineConfig({
    plugins: [pluginVue(), pluginLegacyDeps()],
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
    }
});
