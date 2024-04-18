import { logger, type RsbuildPlugin } from '@rsbuild/core';
import moduleAlias from 'module-alias';
import postcssrc from 'postcss-load-config';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

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
    /**
     * Whether to add an empty-loader before postcss-loader
     * @default false
     */
    addEmptyLoader?: boolean;
  } | false;
};

const require = createRequire(import.meta.url);

function setWebpackAlias() {
  const webpackPath = require.resolve('webpack-v5').replace(/(.*[\\/]webpack-v5).*/, '$1');
  moduleAlias.addAlias('webpack', webpackPath);
  const acceptSuffix = ['.js', '.json'];
  const readdir = (dir: string) => {
    for (const dirent of fs.readdirSync(dir, { withFileTypes: true })) {
      if (dirent.name === 'node_modules') continue;
      const filePath = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        readdir(filePath);
      } else if (acceptSuffix.some((suffix) => filePath.endsWith(suffix))) {
        const relativePath = filePath.replace(webpackPath, 'webpack');
        // console.log(relativePath, filePath);
        moduleAlias.addAlias(relativePath, filePath);
        if (relativePath.endsWith('.js')) {
          moduleAlias.addAlias(relativePath.replace(/\.js$/, ''), filePath);
          if (relativePath.endsWith('/index.js')) {
            moduleAlias.addAlias(path.dirname(relativePath), filePath);
          }
        }
      }
    }
  }
  readdir(webpackPath);
}

const pluginName = 'plugin:legacy-deps-compat';

export default function rsbuildPluginLegacyDeps(options: Options = {}): RsbuildPlugin {
  const { webpack = true, postcss = {} } = options;
  if (webpack) setWebpackAlias();
  if (postcss) {
    // https://github.com/web-infra-dev/rsbuild/blob/v0.6.3/packages/shared/src/css.ts#L71-L73
    moduleAlias.addAlias('../compiled/postcss-load-config', require.resolve('../postcss-load-config.cjs'));
  }
  return {
    name: pluginName,
    setup(api) {
      if (postcss) {
        const { configDir = '', clearBuiltinPlugins = true, customPostcssLoaderOptions, addEmptyLoader = false } = postcss;
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
                  postcss(opts, { addPlugins }) {
                    if (!clearBuiltinPlugins) {
                      const { plugins, ...otherOptions } = postcssOptions
                      opts.postcssOptions = { ...opts.postcssOptions, ...otherOptions };
                      addPlugins(plugins);
                    } else {
                      opts.postcssOptions = postcssOptions;
                    }
                  },
                },
              });
            } catch(e: any) {
              logger.warn(`[${pluginName}] ${e.message ?? e}`);
            }
          });
        }
        if (addEmptyLoader) {
          api.modifyBundlerChain((chain, { CHAIN_ID }) => {
            const emptyLoader = require.resolve('../empty-loader.cjs');
            const ruleIds = [
              CHAIN_ID.RULE.CSS,
              CHAIN_ID.RULE.SASS,
              CHAIN_ID.RULE.LESS,
              CHAIN_ID.RULE.STYLUS,
            ];
            for (const ruleId of ruleIds) {
              if (chain.module.rules.has(ruleId)) {
                chain.module.rule(ruleId).use('empty-loader').loader(emptyLoader).before('postcss');
              }
            }
          });
        }
      }
    },
  };
}
