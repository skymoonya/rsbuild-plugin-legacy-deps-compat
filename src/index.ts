import { logger, type RsbuildPlugin } from '@rsbuild/core';
import moduleAlias from 'module-alias';
import postcssrc from 'postcss-load-config';
import { createRequire } from 'module';

export type Options = {
  webpack?: boolean;
  postcss?: {
    clearBuiltinPlugins?: boolean;
  } | boolean;
}

export default function rsbuildPluginLegacyDeps(opts: Options = {}): RsbuildPlugin {
  const defaultOptions: Options = {
    webpack: true,
    postcss: { clearBuiltinPlugins: true },
  }
  const options = Object.assign(defaultOptions, opts);
  const require = createRequire(import.meta.url);
  if (options.webpack) {
    moduleAlias.addAlias('webpack', require.resolve('webpack-v5').replace(/(.*[\\/]webpack).*/, '$1'));
  }
  if (options.postcss) {
    moduleAlias.addAlias('../compiled/postcss-load-config', require.resolve('../postcss-load-config.cjs'));
  }
  return {
    name: 'plugin:legacy-deps',
    setup(api) {
      if (options.postcss) {
        api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
          try {
            const postcssOptions = await postcssrc();
            return mergeRsbuildConfig(config, {
              tools: {
                postcss(opts) {
                  if (typeof options.postcss === 'object' && options.postcss.clearBuiltinPlugins === false) {
                    if (postcssOptions.plugins && opts.postcssOptions?.plugins) {
                      postcssOptions.plugins.push(...opts.postcssOptions.plugins as any);
                    }
                  }
                  return Object.assign(config, { postcssOptions });
                },
              },
            });
          } catch(e: any) {
            logger.warn(`[plugin:legacy-deps] ${e.message ?? e}`);
          }
        });
      }
    },
  }
}
