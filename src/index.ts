import { logger, type RsbuildPlugin } from '@rsbuild/core';
import moduleAlias from 'module-alias';
import postcssrc from 'postcss-load-config';
import { createRequire } from 'module';
import path from 'path';

export type Options = {
  /**
   * Whether to set an alias for webpack
   * @default true
   */
  webpack?: boolean;
  /**
   * postcss config
   * @default
   * {
   *   clearBuiltinPlugins： true,
   *   configDir: './'
   * }
   */
  postcss?: {
    /**
     * Whether to clear the built-in plugins
     * @default true
     */
    clearBuiltinPlugins?: boolean;
    /**
     * Postcss config directory
     * @default './'
     */
    configDir?: string;
    /**
     * This is a custom postcss-loader options, setting this will use a custom postcss-loader.
     * Make sure you have installed postcss-loader and postcss.
     * If this option is set, other postcss options will become invalid.
     * @default undefined
     */
    customPostcssLoaderOptions?: any;
  } | false;
};

const pluginName = 'plugin:legacy-deps-compat';

export default function rsbuildPluginLegacyDeps(options: Options = {}): RsbuildPlugin {
  const require = createRequire(import.meta.url);
  if (options.webpack !== false) {
    moduleAlias.addAlias('webpack', require.resolve('webpack-v5').replace(/(.*[\\/]webpack).*/, '$1'));
  }
  if (options.postcss) {
    // https://github.com/web-infra-dev/rsbuild/blob/v0.5.4/packages/shared/src/css.ts#L71-L73
    moduleAlias.addAlias('../compiled/postcss-load-config', require.resolve('../postcss-load-config.cjs'));
  }
  return {
    name: pluginName,
    setup(api) {
      if (options.postcss) {
        const { configDir = '', clearBuiltinPlugins = true, customPostcssLoaderOptions } = options.postcss;
        if (customPostcssLoaderOptions) {
          const projectRequire = createRequire(path.resolve('index.js'));
          api.modifyBundlerChain((chain, { CHAIN_ID }) => {
            const ruleIds = [
              CHAIN_ID.RULE.CSS,
              CHAIN_ID.RULE.SASS,
              CHAIN_ID.RULE.LESS,
              CHAIN_ID.RULE.STYLUS,
            ];
            const postcssLoaderPath = projectRequire.resolve('postcss-loader');
            for (const ruleId of ruleIds) {
              if (!chain.module.rules.has(ruleId)) continue;
              chain.module.rule(ruleId).use('postcss').loader(postcssLoaderPath).options(customPostcssLoaderOptions);
            }
          });
        } else {
          api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
            try {
              const postcssOptions = await postcssrc({}, path.resolve(configDir!));
              return mergeRsbuildConfig(config, {
                tools: {
                  postcss(opts) {
                    if (!clearBuiltinPlugins && opts.postcssOptions?.plugins) {
                      if (!postcssOptions.plugins) postcssOptions.plugins = [];
                      postcssOptions.plugins.push(...opts.postcssOptions.plugins as any);
                    }
                    opts.postcssOptions = postcssOptions;
                  },
                },
              });
            } catch(e: any) {
              logger.warn(`[${pluginName}] ${e.message ?? e}`);
            }
          });
        }
      }
    },
  };
}
