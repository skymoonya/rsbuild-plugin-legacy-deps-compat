# rsbuild-plugin-legacy-deps-compat

English | [简体中文](./README.zh_CN.md)

Suppose you have an old project that uses `webpack@4.x` and `postcss@7.x`, and you want to use `rsbuild` to improve efficiency for development and building while also retaining the original build method. You might encounter errors at this point, and this plugin attempts to solve this problem, currently supporting solutions for `webpack` and `postcss` related errors.

## Quick start
1. Installation dependencies
```
npm i rsbuild-plugin-legacy-deps-compat -D
```
2. Configure rsbuild
```js
import { defineConfig } from '@rsbuild/core'
import legacyDepsCompat from 'rsbuild-plugin-legacy-deps-compat'

export default defineConfig({
  plugins: [
    // Any version of webpack and postcss@7.x is used in the project.
    legacyDepsCompat(),

    // Any version of webpack and postcss@<7 is used in the project, but want to use postcss@8 in rsbuild.
    legacyDepsCompat({
      postcss: {
        // Place the postcss.config.js file in the "compat" directory.
        configDir: 'compat',
      },
    }),

    // Any version of webpack and want to use custom postcss-loader.
    legacyDepsCompat({
      postcss: {
        customPostcssLoaderOptions: {
          // Fill in the configuration of postcss-loader here.
        },
      },
    }),
  ]
})
```

## Configuration

| Name                              | Type            | Default    | Description                                                    |
| --------------------------------- | --------------- | ---------- | -------------------------------------------------------------- |
| webpack                           | `boolean`       | `true`     | Whether to set an alias for `webpack`                          |
| postcss                           | `false\|object` | `{}`       | `postcss` related configuration, set to `false` for no changes |
| postcss.clearBuiltinPlugins       | `boolean`       | `true`     | Whether to clear built-in `postcss` plugins                    |
| postcss.configDir                 | `string`        | `./`       | The directory where the `postcss` configuration file is located|
| postcss.customPostcssLoaderOptions| `any`           | `undefined`| `postcss-loader` options, setting this will use a custom `postcss-loader`. Make sure you have installed `postcss-loader`|
| postcss.addEmptyLoader            | `boolean`       | `false`    | Whether to add an `empty-loader` before `postcss-loader`|

## Encountered Component Library Style Issues with Custom `postcss-loader`
```js
module.exports = ":root{--van-swipe-indicator-size:0.12rem;}"
```
If the styles of a component library (such as `vant`) become as shown above, although the specific cause is not known, it has been found through testing that adding an empty loader before the `postcss-loader` can resolve the issue. This is already built into the configuration
```js
export default defineConfig({
  plugins: [
    legacyDepsCompat({
      customPostcssLoaderOptions: {},
      addEmptyLoader: true,
    }),
  ],
});
```
