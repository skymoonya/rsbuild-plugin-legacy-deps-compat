import { defineConfig } from "@rsbuild/core";
import { pluginVue } from "@rsbuild/plugin-vue";
import legacyDepsCompat from '../src';

export default defineConfig({
    plugins: [
        pluginVue(),
        legacyDepsCompat({
            postcss: {
                // useBuiltinPostcss: false,
                // configDir: 'compat',
                customPostcssLoaderOptions: { config: { path: 'compat' } }
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
    tools: {
        bundlerChain(chain) {
          chain.module
            .rule('css')
            .use('empty-loader')
            .loader(require.resolve('../empty-loader'))
            .before('postcss');
        },
    },
});
