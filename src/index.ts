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
  postcss?: {
    /**
     * Whether to clear the built-in plugins
     * @default true
     */
    clearBuiltinPlugins?: boolean;
    /**
     * Postcss config directory
     * @default process.cwd()
     */
    configDir?: string;
  } | false;
}

export default function rsbuildPluginLegacyDeps(opts: Options = {}): RsbuildPlugin {
  const options: Options = {
    webpack: opts.webpack ?? true,
    postcss: opts.postcss === false ? false : {
      clearBuiltinPlugins: opts.postcss?.clearBuiltinPlugins ?? true,
      configDir: opts.postcss?.configDir ?? '',
    },
  }
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
      api.modifyRsbuildConfig(async (config, { mergeRsbuildConfig }) => {
        if (options.postcss) {
          try {
            const postcssOptions = await postcssrc({}, path.resolve(options.postcss.configDir!));
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
        }
      });
    },
  }
}
